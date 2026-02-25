"""
Issuer API Routes
POST /api/issuer/issue  — issue a new credential and persist it
GET  /api/issuer/issued — return all issued credentials (newest first)
GET  /api/issuer/issued/{credential_id} — return one credential
DELETE /api/issuer/issued/{credential_id} — revoke a credential
GET  /api/issuer/stats  — aggregate stats for the dashboard
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
import uuid
import hashlib
import json
import logging
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import Credential

logger = logging.getLogger("issuer")
router = APIRouter()

# ---------------------------------------------------------------------------
# Database-backed credential store
# ---------------------------------------------------------------------------


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------

class IssueCredentialRequest(BaseModel):
    credential_type: str          # vaccination | prescription | age_verification
    issuer_id:       Optional[str] = "privaseal-hospital-001"
    attributes:      Dict[str, Any] = {}


class RevokeRequest(BaseModel):
    reason: Optional[str] = "Revoked by issuer"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

CREDENTIAL_TYPE_LABELS = {
    "vaccination":       "Vaccination Record",
    "prescription":      "Medical Prescription",
    "age_verification":  "Age Verification ID",
}


def _make_credential(req: IssueCredentialRequest) -> Dict[str, Any]:
    """Build a full credential record from an issue request."""
    cred_id   = str(uuid.uuid4())
    attrs     = req.attributes
    now       = datetime.now(timezone.utc).isoformat()

    # Privacy-preserving hash (no PII in the log — only the hash)
    attr_hash = hashlib.sha256(
        json.dumps(attrs, sort_keys=True).encode()
    ).hexdigest()[:16]

    # Derive display-friendly fields from attrs with sensible fallbacks
    name = (
        attrs.get("patient_name")
        or attrs.get("full_name")
        or attrs.get("name")
        or "—"
    )
    dob = (
        attrs.get("date_of_birth")
        or attrs.get("dob")
        or "—"
    )

    return {
        "id":              cred_id,
        "type":            req.credential_type,
        "typeLabel":       CREDENTIAL_TYPE_LABELS.get(req.credential_type, req.credential_type),
        "issuerId":        req.issuer_id,
        # Display fields (derived from attributes)
        "name":            name,
        "dob":             dob,
        "aadhaar":         attrs.get("aadhaar_number", "—"),
        "state":           attrs.get("state", "—"),
        "gender":          attrs.get("gender", "—"),
        # Vaccination-specific
        "vaccineType":     attrs.get("vaccine_type", "—"),
        "manufacturer":    attrs.get("manufacturer", "—"),
        "dateAdministered":attrs.get("date_administered", "—"),
        "doseNumber":      attrs.get("dose_number", "—"),
        # Prescription-specific
        "medication":      attrs.get("medication", "—"),
        "dosageInstructions": attrs.get("dosage_instructions", "—"),
        "prescribedBy":    attrs.get("prescribing_doctor", "—"),
        # Metadata
        "issuedAt":        now,
        "status":          "Active",
        "attrHash":        attr_hash,
        "attributeCount":  len(attrs),
    }


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("/")
async def get_issuer_status(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(func.count(Credential.id)))
    count = result.scalar() or 0
    return {
        "status":  "active",
        "type":    "issuer",
        "issued":  count,
    }


@router.post("/init")
async def init_issuer():
    return {"message": "Issuer Initialized", "public_key": f"pk_{uuid.uuid4()}"}


@router.post("/issue")
async def issue_credential(req: IssueCredentialRequest, db: AsyncSession = Depends(get_db)):
    """
    Issue a new credential and save it to the database.
    Always returns HTTP 200 with the created credential.
    """
    try:
        cred_dict = _make_credential(req)
        
        # Convert dict to model
        db_cred = Credential(
            id=cred_dict["id"],
            type=cred_dict["type"],
            type_label=cred_dict["typeLabel"],
            issuer_id=cred_dict["issuerId"],
            name=cred_dict["name"],
            dob=cred_dict["dob"],
            attributes=req.attributes,
            metadata_json={k: v for k, v in cred_dict.items() if k not in ["id", "type", "typeLabel", "issuerId", "name", "dob"]},
            issued_at=datetime.fromisoformat(cred_dict["issuedAt"]),
            status=cred_dict["status"],
            attr_hash=cred_dict["attrHash"]
        )
        
        db.add(db_cred)
        await db.commit()
        await db.refresh(db_cred)
        
        logger.info(f"Credential issued and saved: {db_cred.id} type={db_cred.type}")
        return JSONResponse(content={
            "success":    True,
            "credential": cred_dict,
            "message":    f"{cred_dict['typeLabel']} issued successfully.",
        })
    except Exception as exc:
        await db.rollback()
        logger.error(f"Issue failed: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/issued")
async def get_issued_credentials(
    page:     int = 1,
    per_page: int = 20,
    search:   Optional[str] = None,
    type_filter: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Return all issued credentials from DB, newest first.
    Supports optional search (by name) and type filter.
    """
    query = select(Credential).order_by(desc(Credential.issued_at))

    # Filter by type
    if type_filter and type_filter != "all":
        query = query.where(Credential.type == type_filter)

    # Search by name or ID (case-insensitive)
    if search:
        q = f"%{search.lower()}%"
        query = query.where(
            (func.lower(Credential.name).like(q)) |
            (func.lower(Credential.id).like(q))
        )

    # Get total count for pagination
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginate
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    creds = result.scalars().all()

    # Convert to dict format expected by frontend
    page_data = []
    for c in creds:
        d = {
            "id": c.id,
            "type": c.type,
            "typeLabel": c.type_label,
            "issuerId": c.issuer_id,
            "name": c.name,
            "dob": c.dob,
            "issuedAt": c.issued_at.isoformat() if c.issued_at else None,
            "status": c.status,
            "attrHash": c.attr_hash,
        }
        if c.metadata_json:
            d.update(c.metadata_json)
        page_data.append(d)

    return JSONResponse(content={
        "data":       page_data,
        "total":      total,
        "page":       page,
        "per_page":   per_page,
        "total_pages": max(1, -(-total // per_page)),  # ceiling division
    })


@router.get("/issued/{credential_id}")
async def get_single_credential(credential_id: str, db: AsyncSession = Depends(get_db)):
    """Fetch a single credential from DB by its UUID."""
    result = await db.execute(select(Credential).where(Credential.id == credential_id))
    c = result.scalar_one_or_none()
    if not c:
        raise HTTPException(status_code=404, detail="Credential not found")
    
    d = {
        "id": c.id,
        "type": c.type,
        "typeLabel": c.type_label,
        "issuerId": c.issuer_id,
        "name": c.name,
        "dob": c.dob,
        "issuedAt": c.issued_at.isoformat() if c.issued_at else None,
        "status": c.status,
        "attrHash": c.attr_hash,
    }
    if c.metadata_json:
        d.update(c.metadata_json)
        
    return JSONResponse(content={"credential": d})


@router.delete("/issued/{credential_id}")
async def revoke_credential(credential_id: str, db: AsyncSession = Depends(get_db), body: RevokeRequest = RevokeRequest()):
    """Revoke (soft-delete) a credential in DB by setting its status to Revoked."""
    result = await db.execute(select(Credential).where(Credential.id == credential_id))
    c = result.scalar_one_or_none()
    
    if not c:
        raise HTTPException(status_code=404, detail="Credential not found")
    
    if c.status == "Revoked":
        raise HTTPException(status_code=409, detail="Already revoked")
        
    c.status = "Revoked"
    c.revoked_at = datetime.now(timezone.utc)
    c.revoke_reason = body.reason
    
    await db.commit()
    logger.info(f"Credential revoked in DB: {credential_id}")
    
    d = {
        "id": c.id,
        "status": c.status,
        "revokedAt": c.revoked_at.isoformat(),
        "revokeReason": c.revoke_reason
    }
    return JSONResponse(content={"success": True, "credential": d})


@router.get("/stats")
async def get_issuer_stats(db: AsyncSession = Depends(get_db)):
    """Aggregate stats from DB for the dashboard cards."""
    total_res = await db.execute(select(func.count(Credential.id)))
    total = total_res.scalar() or 0
    
    active_res = await db.execute(select(func.count(Credential.id)).where(Credential.status == "Active"))
    active = active_res.scalar() or 0
    
    types_res = await db.execute(select(func.count(func.distinct(Credential.type))))
    types = types_res.scalar() or 0
    
    return JSONResponse(content={
        "totalIssued":       total,
        "activeCredentials": active,
        "activePercent":     round((active / total * 100) if total else 0, 1),
        "typesSupported":    max(types, 3),
    })
