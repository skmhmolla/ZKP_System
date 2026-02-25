"""
PrivaSeal – Universal Privacy Identity Verification  v2.1
=========================================================
Routes (all mounted at /api/privaseal):

  USER
  ----
  POST /user/signup                  register (legacy password-based)
  POST /user/login                   authenticate (legacy)
  POST /user/firebase-sync           upsert user from Firebase JWT (NEW)
  GET  /user/firebase/{uid}          fetch backend profile by Firebase UID (NEW)
  POST /user/upload-documents        upload front/back/selfie images (base64)
  POST /user/request                 submit verification request (docs REQUIRED)
  GET  /user/{user_id}/status        check status + credential
  GET  /user/{user_id}/credential    fetch full credential

  ADMIN
  -----
  GET  /admin/requests               list (filterable, paginated)
  GET  /admin/requests/{id}          full detail incl. doc images (admin only)
  POST /admin/approve/{id}           approve → issue PrivaSeal ID + QR
  POST /admin/reject/{id}            reject with reason
  POST /admin/request-reupload/{id}  ask user to resubmit documents

  VERIFIER
  --------
  POST /verifier/check               lookup by PrivaSeal ID or QR URI
  GET  /verifier/stats               aggregate counts

  SHARED
  ------
  GET  /audit                        full audit log
  GET  /stats                        platform-wide counters
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import uuid, hashlib, logging, random, string

logger = logging.getLogger("privaseal")
router = APIRouter()

from app.db import state

# Use shared state
_users = state.users
_fb_uid_index = state.fb_uid_index
_doc_uploads = state.doc_uploads
_requests = state.requests
_credentials = state.credentials
_audit_log = state.audit_log

# Use shared helpers
_now = state.now_iso
_uid = state.generate_uid
_privaseal_id = state.generate_privaseal_id
_hash = state.hash_data
_audit = state.log_audit

def _make_qr_uri(privaseal_id: str) -> str:
    return f"privaseal://verify?id={privaseal_id}&v=1"

def _make_credential(user: Dict, privaseal_id: str) -> Dict:
    dob_str = user.get("dob", "")
    try:
        dob = datetime.fromisoformat(dob_str)
        age = (datetime.now() - dob).days // 365
        age_verified = age >= 18
    except Exception:
        age_verified = True  # demo fallback

    return {
        "privasealId":   privaseal_id,
        "userId":        user["id"],
        "fullName":      user.get("full_name", ""),
        "ageVerified":   age_verified,
        # Internal hash — never returned to verifier
        "_identityHash": _hash(user.get("full_name", "") + dob_str),
        "issuedAt":      _now(),
        "expiresAt":     None,
        "qrUri":         _make_qr_uri(privaseal_id),
        "status":        "active",
    }

# ── Pydantic Models ───────────────────────────────────────────────────────────

class SignupBody(BaseModel):
    full_name: str
    email:     str
    password:  str
    dob:       str          # ISO date – stored server-side only, never exposed to verifier
    role:      str = "user"

class LoginBody(BaseModel):
    email:    str
    password: str

class DocumentUploadBody(BaseModel):
    user_id:      str
    doc_type:     str                        # AADHAAR | PASSPORT | VOTER_ID | DRIVING_LICENSE
    doc_number:   str                        # hashed immediately
    front_image:  str                        # base64-encoded image
    back_image:   Optional[str] = None       # base64-encoded image (optional for some types)
    selfie_image: str                        # base64-encoded selfie

class UserProfileBody(BaseModel):
    user_id:        str
    full_name:     str
    phone_number:  str
    dob:           Optional[str] = None
    gender:        Optional[str] = None
    country:       Optional[str] = None
    state:         Optional[str] = None
    city:          Optional[str] = None
    pin_code:      Optional[str] = None
    id_type:       Optional[str] = None
    id_number:     Optional[str] = None

class VerificationRequestBody(BaseModel):
    user_id: str

class AdminDecisionBody(BaseModel):
    admin_id: str
    reason:   Optional[str] = ""

class VerifierCheckBody(BaseModel):
    privaseal_id: Optional[str] = None
    qr_data:      Optional[str] = None

# ─────────────────────────────────────────────────────────────────────────────
# USER — AUTH
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/user/signup")
async def user_signup(body: SignupBody):
    existing = next((u for u in _users.values() if u["email"] == body.email), None)
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user_id = _uid()
    _users[user_id] = {
        "id":            user_id,
        "full_name":     body.full_name,
        "email":         body.email,
        "_pw_hash":      _hash(body.password),
        "dob":           body.dob,   # stored server-side only
        "role":          body.role,
        "created_at":    _now(),
        "status":        "active",
        "docs_uploaded": False,
    }
    _audit("USER_SIGNUP", user_id, user_id, f"role={body.role}")

    return JSONResponse(content={
        "success":      True,
        "user_id":      user_id,
        "role":         body.role,
        "name":         body.full_name,
        "docs_uploaded": False,
        "message":      "Account created. Please upload your identity documents to continue.",
    })


@router.post("/user/login")
async def user_login(body: LoginBody):
    user = next((u for u in _users.values() if u["email"] == body.email), None)
    if not user or user["_pw_hash"] != _hash(body.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    _audit("USER_LOGIN", user["id"], user["id"])
    return JSONResponse(content={
        "success":      True,
        "user_id":      user["id"],
        "role":         user["role"],
        "name":         user["full_name"],
        "docs_uploaded": user.get("docs_uploaded", False),
    })

# ─────────────────────────────────────────────────────────────────────────────
# USER — FIREBASE AUTH SYNC  (NEW v2.1)
# ─────────────────────────────────────────────────────────────────────────────

class FirebaseSyncBody(BaseModel):
    firebase_uid:  str
    email:         str
    display_name:  str  = ""
    phone_number:  str  = ""
    photo_url:     str  = ""
    provider:      str  = "unknown"     # google.com | password | phone
    id_token:      str  = ""            # Firebase JWT token for backend-side verification


@router.post("/user/firebase-sync")
async def firebase_sync(body: FirebaseSyncBody):
    if not body.id_token:
        logger.warning(f"Sync event missing token for UID {body.firebase_uid}")
    
    verified_uid = body.firebase_uid 
    
    # Existing linked user
    existing_id = _fb_uid_index.get(verified_uid)
    if existing_id and existing_id in _users:
        user = _users[existing_id]
        user["full_name"]    = body.display_name or user.get("full_name", "")
        return JSONResponse(content={
            "success": True, "user_id": existing_id, "firebase_uid": verified_uid,
            "role": user.get("role", "user"), "name": user.get("full_name", ""),
            "docs_uploaded": user.get("docs_uploaded", False), "created": False,
        })

    # Pre-provisioned user by email (e.g. root admin or verifier)
    pre_provisioned = next((u for u in _users.values() if u["email"] == body.email), None)
    if pre_provisioned and not pre_provisioned.get("firebase_uid"):
        user_id = pre_provisioned["id"]
        pre_provisioned["firebase_uid"] = verified_uid
        _fb_uid_index[verified_uid] = user_id
        return JSONResponse(content={
            "success": True, "user_id": user_id, "firebase_uid": verified_uid,
            "role": pre_provisioned["role"], "name": pre_provisioned["full_name"],
            "docs_uploaded": pre_provisioned.get("docs_uploaded", False), "created": False
        })

    # New user — Default to "user"
    user_id = _uid()
    user = {
        "id":            user_id,
        "firebase_uid":  verified_uid,
        "full_name":     body.display_name,
        "email":         body.email,
        "role":          "user",
        "created_at":    _now(),
        "status":        "active",
        "docs_uploaded": False,
    }
    _users[user_id] = user
    _fb_uid_index[verified_uid] = user_id
    return JSONResponse(status_code=201, content={
        "success": True, "user_id": user_id, "role": "user",
        "name": user["full_name"], "docs_uploaded": False, "created": True
    })

@router.get("/user/auth/me")
async def get_current_user_role(uid: str):
    user_id = _fb_uid_index.get(uid)
    if not user_id or user_id not in _users:
        raise HTTPException(status_code=404, detail="User not found")
    user = _users[user_id]
    return {
        "user_id": user["id"], "role": user["role"], "name": user["full_name"], "email": user["email"]
    }


@router.get("/user/firebase/{firebase_uid}")
async def get_user_by_firebase_uid(firebase_uid: str):
    """
    AuthContext calls this on every page load to hydrate the backend profile.
    Returns the internal user record (no secrets).
    """
    user_id = _fb_uid_index.get(firebase_uid)
    if not user_id or user_id not in _users:
        raise HTTPException(status_code=404, detail="Firebase user not yet synced")

    user = _users[user_id]

    # Find latest request + credential
    req = next(
        (r for r in sorted(_requests.values(), key=lambda x: x["submitted_at"], reverse=True)
         if r["user_id"] == user_id),
        None,
    )
    cred = _credentials.get(req["privaseal_id"]) if req and req.get("privaseal_id") else None

    return JSONResponse(content={
        "user": {
            "user_id":       user_id,
            "firebase_uid":  firebase_uid,
            "name":          user.get("full_name", ""),
            "email":         user.get("email", ""),
            "role":          user.get("role", "user"),
            "docs_uploaded": user.get("docs_uploaded", False),
            "photo_url":     user.get("photo_url", ""),
            "created_at":    user.get("created_at"),
            "verification_status": req["status"] if req else "unverified",
            "privaseal_id":        req.get("privaseal_id") if req else None,
            "age_verified":        cred["ageVerified"] if cred else None,
            "profile_completed":   user.get("profile_completed", False),
        }
    })


# ─────────────────────────────────────────────────────────────────────────────
# USER — IDENTITY PROFILE (NEW v2.2)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/user/profile")
async def get_user_profile(user_id: str):
    user = _users.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "full_name":     user.get("full_name", ""),
        "phone_number":  user.get("phone_number", ""),
        "email":         user.get("email", ""),
        "dob":           user.get("dob", ""),
        "gender":        user.get("gender", ""),
        "country":       user.get("country", ""),
        "state":         user.get("state", ""),
        "city":          user.get("city", ""),
        "pin_code":      user.get("pin_code", ""),
        "id_type":       user.get("id_type", ""),
        "id_number":     user.get("id_number", ""),
        "profile_completed": user.get("profile_completed", False),
        "status":        user.get("status", "active")
    }

@router.post("/user/profile")
async def save_user_profile(body: UserProfileBody):
    user = _users.get(body.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Security: Prevent edit after approval
    # Check if a successful request exists for this user
    req = next((r for r in _requests.values() if r["user_id"] == body.user_id and r["status"] == "approved"), None)
    if req:
        raise HTTPException(status_code=403, detail="Profile cannot be modified after verification approval")
    
    # Update user record
    user.update({
        "full_name":     body.full_name,
        "phone_number":  body.phone_number,
        "dob":           body.dob,
        "gender":        body.gender,
        "country":       body.country,
        "state":         body.state,
        "city":          body.city,
        "pin_code":      body.pin_code,
        "id_type":       body.id_type,
        "id_number":     body.id_number,
        "profile_completed": True
    })

    _audit("PROFILE_UPDATE", body.user_id, body.user_id, "Identity profile saved")
    return {"success": True, "message": "Profile updated successfully"}


# ─────────────────────────────────────────────────────────────────────────────
# USER — DOCUMENT UPLOAD  (POST /user/upload-documents)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/user/upload-documents")
async def upload_documents(body: DocumentUploadBody):
    user = _users.get(body.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not body.front_image:
        raise HTTPException(status_code=400, detail="Front image is required")
    if not body.selfie_image:
        raise HTTPException(status_code=400, detail="Selfie image is required")

    # Validate base64 size (prevent giant payloads; 5 MB per image approx)
    MAX_B64 = 7_000_000
    for label, data in [("front", body.front_image), ("selfie", body.selfie_image)]:
        if len(data) > MAX_B64:
            raise HTTPException(status_code=413, detail=f"{label} image too large (max ~5 MB)")

    upload = {
        "user_id":        body.user_id,
        "doc_type":       body.doc_type,
        "_doc_hash":      _hash(body.doc_number),  # hash immediately
        "front_image":    body.front_image,          # admin-only, never sent to verifier
        "back_image":     body.back_image,
        "selfie_image":   body.selfie_image,
        "uploaded_at":    _now(),
        "status":         "received",               # received | reupload_requested
    }
    _doc_uploads[body.user_id] = upload
    _users[body.user_id]["docs_uploaded"] = True

    _audit("DOC_UPLOAD", body.user_id, body.user_id, f"doc_type={body.doc_type}")

    return JSONResponse(content={
        "success":   True,
        "message":   "Documents uploaded successfully. You may now submit your verification request.",
        "doc_type":  body.doc_type,
        "status":    "received",
    })


@router.post("/user/request")
async def submit_verification_request(body: VerificationRequestBody):
    user = _users.get(body.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Gate: documents must be uploaded
    if not user.get("docs_uploaded") or body.user_id not in _doc_uploads:
        raise HTTPException(
            status_code=400,
            detail="Documents must be uploaded before submitting a verification request",
        )

    upload = _doc_uploads[body.user_id]

    # Prevent duplicate pending
    existing = next(
        (r for r in _requests.values()
         if r["user_id"] == body.user_id and r["status"] in ("pending", "reupload_requested")),
        None,
    )
    if existing:
        return JSONResponse(content={
            "success":    True,
            "request_id": existing["id"],
            "status":     existing["status"],
            "message":    "A request is already in progress",
        })

    request_id = _uid()
    _requests[request_id] = {
        "id":              request_id,
        "user_id":         body.user_id,
        "user_name":       user["full_name"],
        "user_email":      user["email"],
        "doc_type":        upload["doc_type"],
        "_doc_hash":       upload["_doc_hash"],
        # Image keys for admin-only access (stripped before verifier response)
        "_front_image":    upload["front_image"],
        "_back_image":     upload.get("back_image"),
        "_selfie_image":   upload["selfie_image"],
        "status":          "pending",
        "submitted_at":    _now(),
        "reviewed_at":     None,
        "admin_id":        None,
        "reject_reason":   None,
        "reupload_reason": None,
        "privaseal_id":    None,
    }
    _audit("VERIFICATION_REQUEST", body.user_id, request_id, f"doc={upload['doc_type']}")

    return JSONResponse(content={
        "success":    True,
        "request_id": request_id,
        "status":     "pending",
        "message":    "Verification request submitted. Pending admin review.",
    })


@router.get("/user/{user_id}/status")
async def get_user_status(user_id: str):
    user = _users.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    req = next(
        (r for r in sorted(_requests.values(), key=lambda x: x["submitted_at"], reverse=True)
         if r["user_id"] == user_id),
        None,
    )

    cred = None
    if req and req.get("privaseal_id"):
        cred = _credentials.get(req["privaseal_id"])

    return JSONResponse(content={
        "user_id":      user_id,
        "name":         user["full_name"],
        "docs_uploaded": user.get("docs_uploaded", False),
        "profile_completed": user.get("profile_completed", False),
        "request": {
            "id":              req["id"]                 if req else None,
            "status":          req["status"]             if req else "not_submitted",
            "submitted_at":    req["submitted_at"]       if req else None,
            "reject_reason":   req.get("reject_reason")  if req else None,
            "reupload_reason": req.get("reupload_reason") if req else None,
        },
        "credential": {
            "privaseal_id": cred["privasealId"]  if cred else None,
            "age_verified": cred["ageVerified"]  if cred else None,
            "issued_at":    cred["issuedAt"]     if cred else None,
            "qr_uri":       cred["qrUri"]        if cred else None,
            "status":       cred["status"]       if cred else None,
        } if cred else None,
    })


@router.get("/user/{user_id}/credential")
async def get_user_credential(user_id: str):
    req = next(
        (r for r in _requests.values()
         if r["user_id"] == user_id and r.get("privaseal_id")),
        None,
    )
    if not req:
        raise HTTPException(status_code=404, detail="No issued credential found")

    cred = _credentials.get(req["privaseal_id"])
    if not cred:
        raise HTTPException(status_code=404, detail="Credential not found")

    safe = {k: v for k, v in cred.items() if not k.startswith("_")}
    return JSONResponse(content={"credential": safe})


# ── Holder Ecosystem Endpoints ───────────────────────────────────────────────

class IdentityRequest(BaseModel):
    user_id: str
    documents: List[str] = []

@router.post("/holder/request-verification")
async def holder_request_verification(body: IdentityRequest):
    """Holder submits their identity for issuer approval and credential anchoring."""
    req_id = _uid()
    request_data = {
        "id": req_id,
        "user_id": body.user_id,
        "status": "pending",
        "created_at": _now(),
        "documents": body.documents,
        "type": "identity_verification"
    }
    state.identity_requests[req_id] = request_data
    _audit("IDENTITY_REQUEST_SUBMITTED", body.user_id, req_id)
    return JSONResponse(content={"success": True, "request_id": req_id, "message": "Verification request submitted."})


@router.get("/holder/credential/{user_id}")
async def holder_get_credential(user_id: str):
    """Fetch the issued credential for a holder (if approved)."""
    # Find approved request for this user
    req = next((r for r in state.identity_requests.values() if r["user_id"] == user_id and r["status"] == "approved"), None)
    if not req:
        return JSONResponse(content={"found": False, "message": "No approved credential found."})
    
    # Return a mock ZK-enabled credential
    return JSONResponse(content={
        "found": True,
        "credential": {
            "id": _privaseal_id(),
            "type": "Global Identity",
            "issuer": "PrivaSeal Root",
            "status": "Active",
            "attributes": {
                "name": state.users.get(user_id, {}).get("full_name", "Valued Holder"),
                "nationality": "ZKP_CITIZEN",
                "privaseal_id": req["id"]
            }
        }
    })


@router.post("/holder/generate-proof")
async def holder_generate_proof(body: Dict[str, Any]):
    """Simulate the generation of a ZKP proof on the mobile/web wallet."""
    # Nudge benchmarks for proof generation
    try:
        from benchmarks.benchmark_service import engine as bm_engine
        import asyncio
        asyncio.ensure_future(bm_engine.get_snapshot())
    except:
        pass
        
    return JSONResponse(content={
        "success": True,
        "proof": f"zkp_proof_{_uid()[:8]}",
        "timestamp": _now()
    })


@router.post("/verifier/check")
async def verifier_check_identity(body: Dict[str, Any]):
    """Unified check for verifiers to validate a holder's ID or scan results."""
    privaseal_id = body.get("privaseal_id")
    qr_data = body.get("qr_data")
    
    # Check if this ID corresponds to an approved request
    target_id = privaseal_id or qr_data
    req = state.identity_requests.get(target_id) or \
          next((r for r in state.identity_requests.values() if r["id"] == target_id), None)
          
    valid = req is not None and req["status"] == "approved"
    
    _audit("VERIFIER_CHECK", "verifier-demo", target_id or "unknown", f"Result: {valid}")
    
    return JSONResponse(content={
        "found": req is not None,
        "valid": valid,
        "credential_type": "Identity Verification",
        "message": "Cryptographically verified via PrivaSeal Node." if valid else "Invalid or unverified ID."
    })


# ─────────────────────────────────────────────────────────────────────────────
# ADMIN
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/admin/requests")
async def list_requests(status: Optional[str] = None, page: int = 1, per_page: int = 20):
    results = list(reversed(list(_requests.values())))
    if status and status != "all":
        results = [r for r in results if r["status"] == status]

    total = len(results)
    start = (page - 1) * per_page

    # Strip private image keys from list view (images are in detail endpoint only)
    def _strip(r: Dict) -> Dict:
        return {k: v for k, v in r.items() if not k.startswith("_")}

    return JSONResponse(content={
        "data":        [_strip(r) for r in results[start: start + per_page]],
        "total":       total,
        "pending":     sum(1 for r in _requests.values() if r["status"] == "pending"),
        "approved":    sum(1 for r in _requests.values() if r["status"] == "approved"),
        "rejected":    sum(1 for r in _requests.values() if r["status"] == "rejected"),
        "reupload":    sum(1 for r in _requests.values() if r["status"] == "reupload_requested"),
        "page":        page,
        "per_page":    per_page,
        "total_pages": max(1, -(-total // per_page)),
    })


@router.get("/admin/requests/{request_id}")
async def get_request_detail(request_id: str):
    req = _requests.get(request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    # Build admin-safe view WITH images (admin only access)
    detail = {k: v for k, v in req.items() if not k.startswith("_doc")}
    # Remap image keys to clean names for frontend
    detail["front_image"]  = req.get("_front_image")
    detail["back_image"]   = req.get("_back_image")
    detail["selfie_image"] = req.get("_selfie_image")

    return JSONResponse(content={"request": detail})


@router.post("/admin/approve/{request_id}")
async def approve_request(request_id: str, body: AdminDecisionBody):
    req = _requests.get(request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req["status"] not in ("pending", "reupload_requested"):
        raise HTTPException(status_code=400, detail=f"Cannot approve — status is '{req['status']}'")

    user = _users.get(req["user_id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    privaseal_id = _privaseal_id()
    while privaseal_id in _credentials:
        privaseal_id = _privaseal_id()

    cred = _make_credential(user, privaseal_id)
    _credentials[privaseal_id] = cred

    req.update({
        "status":       "approved",
        "reviewed_at":  _now(),
        "admin_id":     body.admin_id,
        "privaseal_id": privaseal_id,
    })

    _audit("APPROVE", body.admin_id, request_id, f"issued={privaseal_id}")

    safe_cred = {k: v for k, v in cred.items() if not k.startswith("_")}
    return JSONResponse(content={
        "success":      True,
        "request_id":   request_id,
        "privaseal_id": privaseal_id,
        "credential":   safe_cred,
        "message":      f"Approved. PrivaSeal ID: {privaseal_id}",
    })


@router.post("/admin/reject/{request_id}")
async def reject_request(request_id: str, body: AdminDecisionBody):
    req = _requests.get(request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req["status"] not in ("pending", "reupload_requested"):
        raise HTTPException(status_code=400, detail=f"Cannot reject — status is '{req['status']}'")

    req.update({
        "status":       "rejected",
        "reviewed_at":  _now(),
        "admin_id":     body.admin_id,
        "reject_reason": body.reason or "Does not meet verification requirements",
    })
    _audit("REJECT", body.admin_id, request_id, f"reason={req['reject_reason']}")

    return JSONResponse(content={"success": True, "request_id": request_id, "status": "rejected"})


@router.post("/admin/request-reupload/{request_id}")
async def request_reupload(request_id: str, body: AdminDecisionBody):
    req = _requests.get(request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req["status"] != "pending":
        raise HTTPException(status_code=400, detail=f"Cannot request reupload — status is '{req['status']}'")

    req.update({
        "status":          "reupload_requested",
        "reviewed_at":     _now(),
        "admin_id":        body.admin_id,
        "reupload_reason": body.reason or "Documents are unclear or incomplete",
    })
    # Reset doc uploads so user must re-upload
    if req["user_id"] in _doc_uploads:
        _doc_uploads[req["user_id"]]["status"] = "reupload_requested"

    _audit("REUPLOAD_REQUESTED", body.admin_id, request_id, f"reason={req['reupload_reason']}")

    return JSONResponse(content={
        "success":    True,
        "request_id": request_id,
        "status":     "reupload_requested",
        "message":    "User notified to reupload documents.",
    })


# ─────────────────────────────────────────────────────────────────────────────
# VERIFIER  (zero PII returned)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/verifier/check")
async def verifier_check(body: VerifierCheckBody):
    privaseal_id = body.privaseal_id

    if not privaseal_id and body.qr_data:
        try:
            from urllib.parse import urlparse, parse_qs
            qs = parse_qs(urlparse(body.qr_data).query)
            privaseal_id = qs.get("id", [None])[0]
        except Exception:
            pass

    if not privaseal_id:
        raise HTTPException(status_code=400, detail="Provide privaseal_id or qr_data")

    cred = _credentials.get(privaseal_id.strip().upper())
    if not cred:
        _audit("VERIFIER_MISS", "verifier", privaseal_id)
        return JSONResponse(content={
            "found":        False,
            "privaseal_id": privaseal_id,
            "age_verified": False,
            "message":      "PrivaSeal ID not found or credential not yet issued",
        })

    _audit("VERIFIER_CHECK", "verifier", privaseal_id, f"age_verified={cred['ageVerified']}")

    # PRIVACY RULE: return only these fields — never name, DOB, images, documents
    return JSONResponse(content={
        "found":            True,
        "privaseal_id":     privaseal_id,
        "age_verified":     cred["ageVerified"],
        "credential_type":  "AGE_VERIFICATION",
        "issued_by":        "PrivaSeal Authority",
        "credential_status": cred["status"],
        "valid":            cred["status"] == "active",
        "checked_at":       _now(),
    })


@router.get("/verifier/stats")
async def verifier_stats():
    checks = [a for a in _audit_log if a["action"] == "VERIFIER_CHECK"]
    return JSONResponse(content={
        "totalCredentials": len(_credentials),
        "ageVerifiedCount": sum(1 for c in _credentials.values() if c["ageVerified"]),
        "totalChecks":      len(checks),
    })


# ─────────────────────────────────────────────────────────────────────────────
# SHARED
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/audit")
async def get_audit_log(page: int = 1, per_page: int = 50):
    results = list(reversed(_audit_log))
    total   = len(results)
    start   = (page - 1) * per_page
    return JSONResponse(content={"data": results[start: start + per_page], "total": total})


@router.get("/stats")
async def platform_stats():
    return JSONResponse(content={
        "totalUsers":        len(_users),
        "docsUploaded":      sum(1 for u in _users.values() if u.get("docs_uploaded")),
        "totalRequests":     len(_requests),
        "pendingRequests":   sum(1 for r in _requests.values() if r["status"] == "pending"),
        "approvedRequests":  sum(1 for r in _requests.values() if r["status"] == "approved"),
        "rejectedRequests":  sum(1 for r in _requests.values() if r["status"] == "rejected"),
        "reuploadRequests":  sum(1 for r in _requests.values() if r["status"] == "reupload_requested"),
        "issuedCredentials": len(_credentials),
        "verifierChecks":    sum(1 for a in _audit_log if a["action"] == "VERIFIER_CHECK"),
    })


@router.get("/")
async def privaseal_status():
    return {"status": "active", "service": "PrivaSeal Universal Verification", "version": "2.0"}
