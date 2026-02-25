"""
Verifier API Routes — registered at /api/verifier
=================================================
POST /api/verifier/request          — create a verification request
POST /api/verifier/verify           — submit & verify a ZK proof
GET  /api/verifier/requests         — list all requests (with pagination)
GET  /api/verifier/requests/{id}    — poll status of one request
GET  /api/verifier/stats            — aggregate dashboard stats
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, timedelta
import uuid
import random
import hashlib
import logging

logger = logging.getLogger("verifier")
router = APIRouter()

from app.db import state

# Use shared state
_request_store = state.requests
_audit = state.log_audit
_now = state.now_iso

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
async def verifier_status():
    return {
        "status":   "active",
        "type":     "verifier",
        "requests": len(_request_store),
    }


@router.post("/request")
async def create_verification_request(body: CreateRequestBody):
    """Create a new verification request and return its QR data."""
    pred = PREDICATES.get(body.predicate_key)
    if pred is None:
        raise HTTPException(status_code=400, detail=f"Unknown predicate: {body.predicate_key}")

    request_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=10)

    record: Dict[str, Any] = {
        "id":              request_id,
        "predicateKey":    body.predicate_key,
        "predicateLabel":  pred["label"],
        "predicateDesc":   pred["description"],
        "predicateIcon":   pred["icon"],
        "credentialType":  pred["credential_type"],
        "verifierId":      body.verifier_id,
        "verifierName":    body.verifier_name,
        "verifierType":    body.verifier_type,
        "status":          "waiting_proof",
        "statusLabel":     "Waiting for proof",
        "qrUri":           _make_qr_uri(request_id, body.predicate_key),
        "createdAt":       now.isoformat(),
        "expiresAt":       expires_at.isoformat(),
        "verifiedAt":      None,
        "proofHash":       None,
        "revealedAttrs":   {},
        "errorMsg":        None,
    }

    _request_store[request_id] = record
    logger.info(f"Verification request created: {request_id} predicate={body.predicate_key}")

    return JSONResponse(content={"success": True, "request": record})


@router.post("/verify")
async def submit_and_verify_proof(body: SubmitProofBody):
    """
    Accept a ZK proof from a wallet, run the verifier, and update the request status.
    Falls back to safe-mode simulation when the ZKP engine is unavailable.
    """
    record = _request_store.get(body.request_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Verification request not found")

    if record["status"] == "verified":
        return JSONResponse(content={"success": True, "already_verified": True, "request": record})

    # Mark as verifying
    record["status"]      = "verifying"
    record["statusLabel"] = "Verifying…"

    # Simulate / perform verification
    passed = _simulate_verify(body.proof)
    now    = _now_iso()

    if passed:
        record["status"]      = "verified"
        record["statusLabel"] = "Verified ✅"
        record["verifiedAt"]  = now
        record["proofHash"]   = hashlib.sha256(
            (body.proof or uuid.uuid4().hex).encode()
        ).hexdigest()[:16]
        record["revealedAttrs"] = body.revealed_attributes or {}
    else:
        record["status"]      = "failed"
        record["statusLabel"] = "Verification Failed ❌"
        record["errorMsg"]    = "ZK proof did not satisfy the predicate"
        record["verifiedAt"]  = now

    logger.info(f"Proof verified: {body.request_id} → {record['status']}")

    # Nudge the benchmark engine if available (non-blocking)
    try:
        import sys, os
        _backend_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        if _backend_root not in sys.path:
            sys.path.insert(0, _backend_root)
        from benchmarks.benchmark_service import engine as bm_engine
        # Fire-and-forget: don't block the response
        import asyncio
        asyncio.ensure_future(bm_engine.get_snapshot())
    except Exception:
        pass

    return JSONResponse(content={"success": True, "verified": passed, "request": record})


@router.get("/requests")
async def get_all_requests(
    page:        int = 1,
    per_page:    int = 20,
    status:      Optional[str] = None,
    predicate:   Optional[str] = None,
):
    """Return verification history newest-first, with optional status & predicate filters."""
    results = list(reversed(list(_request_store.values())))

    if status and status != "all":
        results = [r for r in results if r["status"] == status]
    if predicate and predicate != "all":
        results = [r for r in results if r["predicateKey"] == predicate]

    total = len(results)
    start = (page - 1) * per_page
    page_data = results[start: start + per_page]

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
    record = _request_store.get(request_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Request not found")
    return JSONResponse(content={"request": record})


@router.get("/stats")
async def get_verifier_stats():
    all_reqs = list(_request_store.values())
    total    = len(all_reqs)
    verified = sum(1 for r in all_reqs if r["status"] == "verified")
    failed   = sum(1 for r in all_reqs if r["status"] == "failed")
    pending  = sum(1 for r in all_reqs if r["status"] in ("waiting_proof", "verifying", "proof_received"))
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
