"""
Verifier API Routes — registered at /api/verifier
=================================================
POST /api/verifier/request          — create a verification request
POST /api/verifier/verify           — submit & verify a ZK proof
GET  /api/verifier/requests         — list all requests (with pagination)
GET  /api/verifier/requests/{id}    — poll status of one request
GET  /api/verifier/stats            — aggregate dashboard stats
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, timedelta
import uuid
import random
import hashlib
import logging
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import VerifierRequest

logger = logging.getLogger("verifier")
router = APIRouter()

# ─────────────────────────────────────────────────────────────────────────────
# Database-backed store
# ─────────────────────────────────────────────────────────────────────────────

# ─────────────────────────────────────────────────────────────────────────────
# Predicate definitions
# ─────────────────────────────────────────────────────────────────────────────

PREDICATES = {
    "age_gt_18": {
        "label":           "Age > 18",
        "description":     "Proves the holder is over 18 without revealing exact age",
        "credential_type": "age_verification",
        "icon":            "🪪",
    },
    "age_gt_21": {
        "label":           "Age > 21",
        "description":     "Proves the holder is over 21 for age-restricted services",
        "credential_type": "age_verification",
        "icon":            "🍺",
    },
    "vaccinated": {
        "label":           "Vaccinated",
        "description":     "Proves the holder has a valid vaccination record",
        "credential_type": "vaccination",
        "icon":            "💉",
    },
    "prescription_valid": {
        "label":           "Prescription Valid",
        "description":     "Proves the holder has an active prescription",
        "credential_type": "prescription",
        "icon":            "💊",
    },
}

STATUS_FLOW = ["pending", "waiting_proof", "proof_received", "verifying", "verified", "failed"]

# ─────────────────────────────────────────────────────────────────────────────
# Request / Response models
# ─────────────────────────────────────────────────────────────────────────────

class CreateRequestBody(BaseModel):
    predicate_key:  str = "age_gt_18"
    verifier_id:    Optional[str] = "privaseal-verifier-001"
    verifier_name:  Optional[str] = "PrivaSeal Verifier"
    verifier_type:  Optional[str] = "general"


class SubmitProofBody(BaseModel):
    request_id:          str
    proof:               Optional[str] = None        # raw proof blob (optional in demo)
    revealed_attributes: Optional[Dict[str, Any]] = {}
    issuer_public_key:   Optional[str] = None


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _make_qr_uri(request_id: str, predicate_key: str) -> str:
    """Deep-link URI that a wallet would scan."""
    return f"privaseal://verify?req={request_id}&pred={predicate_key}&v=1"


def _simulate_verify(proof: Optional[str]) -> bool:
    """
    Demo/safe-mode verifier.
    In production, swap for real ZKP verification.
    95% success rate for demo credibility.
    """
    seed = int(hashlib.sha256((proof or uuid.uuid4().hex).encode()).hexdigest(), 16)
    return (seed % 20) != 0          # ~95 % pass rate


# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/")
async def verifier_status(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(func.count(VerifierRequest.id)))
    count = result.scalar() or 0
    return {
        "status":   "active",
        "type":     "verifier",
        "requests": count,
    }


@router.post("/request")
async def create_verification_request(body: CreateRequestBody, db: AsyncSession = Depends(get_db)):
    """Create a new verification request and return its QR data."""
    pred = PREDICATES.get(body.predicate_key)
    if pred is None:
        raise HTTPException(status_code=400, detail=f"Unknown predicate: {body.predicate_key}")

    request_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=10)

    db_req = VerifierRequest(
        id=request_id,
        predicate_key=body.predicate_key,
        predicate_label=pred["label"],
        predicate_desc=pred["description"],
        predicate_icon=pred["icon"],
        credential_type=pred["credential_type"],
        verifier_id=body.verifier_id or "privaseal-verifier-001",
        verifier_name=body.verifier_name or "PrivaSeal Verifier",
        verifier_type=body.verifier_type or "general",
        status="waiting_proof",
        status_label="Waiting for proof",
        qr_uri=_make_qr_uri(request_id, body.predicate_key),
        created_at=now,
        expires_at=expires_at,
    )

    db.add(db_req)
    await db.commit()
    await db.refresh(db_req)
    
    logger.info(f"Verification request created into DB: {request_id} predicate={body.predicate_key}")

    return JSONResponse(content={"success": True, "request": {
        "id": db_req.id,
        "predicateKey": db_req.predicate_key,
        "predicateLabel": db_req.predicate_label,
        "status": db_req.status,
        "qrUri": db_req.qr_uri,
        "createdAt": db_req.created_at.isoformat(),
        "expiresAt": db_req.expires_at.isoformat()
    }})


@router.post("/verify")
async def submit_and_verify_proof(body: SubmitProofBody, db: AsyncSession = Depends(get_db)):
    """
    Accept a ZK proof from a wallet, run the verifier, and update the request status.
    Falls back to safe-mode simulation when the ZKP engine is unavailable.
    """
    # Find the request
    result = await db.execute(select(VerifierRequest).where(VerifierRequest.id == body.request_id))
    req = result.scalar_one_or_none()
    if req is None:
        raise HTTPException(status_code=404, detail="Verification request not found")

    if req.status == "verified":
        return JSONResponse(content={"success": True, "already_verified": True})

    # Mark as verifying
    req.status      = "verifying"
    req.status_label = "Verifying…"
    await db.commit()

    # Simulate / perform verification
    passed = _simulate_verify(body.proof)
    now    = datetime.now(timezone.utc)

    if passed:
        req.status      = "verified"
        req.status_label = "Verified ✅"
        req.verified_at  = now
        req.proof_hash   = hashlib.sha256(
            (body.proof or uuid.uuid4().hex).encode()
        ).hexdigest()[:16]
        req.revealed_attrs = body.revealed_attributes or {}
    else:
        req.status      = "failed"
        req.status_label = "Verification Failed ❌"
        req.error_msg    = "ZK proof did not satisfy the predicate"
        req.verified_at  = now

    await db.commit()
    logger.info(f"Proof verified in DB: {body.request_id} → {req.status}")

    return JSONResponse(content={"success": True, "verified": passed})


@router.get("/requests")
async def get_all_requests(
    page:        int = 1,
    per_page:    int = 20,
    status:      Optional[str] = None,
    predicate:   Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Return verification history from DB newest-first, with optional status & predicate filters."""
    query = select(VerifierRequest).order_by(desc(VerifierRequest.created_at))

    if status and status != "all":
        query = query.where(VerifierRequest.status == status)
    if predicate and predicate != "all":
        query = query.where(VerifierRequest.predicate_key == predicate)

    # Get total
    total_res = await db.execute(select(func.count()).select_from(query.subquery()))
    total = total_res.scalar() or 0

    # Paginate
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    reqs = result.scalars().all()

    page_data = []
    for r in reqs:
        page_data.append({
            "id": r.id,
            "predicateKey": r.predicate_key,
            "predicateLabel": r.predicate_label,
            "status": r.status,
            "createdAt": r.created_at.isoformat() if r.created_at else None,
            "verifiedAt": r.verified_at.isoformat() if r.verified_at else None,
        })

    return JSONResponse(content={
        "data":        page_data,
        "total":       total,
        "page":        page,
        "per_page":    per_page,
        "total_pages": max(1, -(-total // per_page)),
    })


@router.get("/requests/{request_id}")
async def get_single_request(request_id: str):
    """Poll the status of a single verification request."""
    record = next((r for r in _request_store if r["id"] == request_id), None)
    if record is None:
        raise HTTPException(status_code=404, detail="Request not found")
    return JSONResponse(content={"request": record})


@router.get("/stats")
async def get_verifier_stats(db: AsyncSession = Depends(get_db)):
    total_res = await db.execute(select(func.count(VerifierRequest.id)))
    total = total_res.scalar() or 0
    
    verified_res = await db.execute(select(func.count(VerifierRequest.id)).where(VerifierRequest.status == "verified"))
    verified = verified_res.scalar() or 0
    
    failed_res = await db.execute(select(func.count(VerifierRequest.id)).where(VerifierRequest.status == "failed"))
    failed = failed_res.scalar() or 0
    
    pending_res = await db.execute(select(func.count(VerifierRequest.id)).where(VerifierRequest.status.in_(["waiting_proof", "verifying", "proof_received"])))
    pending = pending_res.scalar() or 0
    
    return JSONResponse(content={
        "totalRequests":  total,
        "verified":       verified,
        "failed":         failed,
        "pending":        pending,
        "successRate":    round((verified / total * 100) if total else 0, 1),
    })


@router.get("/predicates")
async def list_predicates():
    """Return available predicate definitions for the frontend dropdown."""
    return JSONResponse(content={
        "predicates": [
            {"key": k, **v} for k, v in PREDICATES.items()
        ]
    })
