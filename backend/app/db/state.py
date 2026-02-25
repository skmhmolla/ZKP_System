import uuid
import hashlib
import random
import string
import logging
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional

logger = logging.getLogger("privaseal.db")

# ── IN-MEMORY DATABASE ────────────────────────────────────────────────────────
# Shared across all API modules to ensure consistency.

users:        Dict[str, Dict] = {
    "admin-root": {
        "id": "admin-root",
        "email": "admin@privaseal.com",
        "full_name": "PrivaSeal Root Admin",
        "role": "issuer_admin",
        "status": "active",
        "created_at": "2024-01-01T00:00:00Z",
        "docs_uploaded": True
    },
    "sk-admin": {
        "id": "sk-admin",
        "email": "skmahmudulhasanmolla@gmail.com",
        "full_name": "SK Mahmudul Hasan",
        "role": "issuer_admin",
        "status": "active",
        "created_at": "2024-01-01T00:00:00Z",
        "docs_uploaded": True
    },
    "verifier-demo": {
        "id": "verifier-demo",
        "email": "verifier@privaseal.com",
        "full_name": "Demo Verifier",
        "role": "verifier_org",
        "status": "active",
        "created_at": "2024-01-01T00:00:00Z",
        "docs_uploaded": True,
        "approved": True
    }
}

fb_uid_index: Dict[str, str]  = {}   # firebase_uid → user_id
doc_uploads:  Dict[str, Dict] = {}   # user_id → doc data
requests:     Dict[str, Dict] = {}   # request_id → ZK verification check requests
identity_requests: Dict[str, Dict] = {} # request_id → identity issuance requests
credentials:  Dict[str, Dict] = {}   # privaseal_id → credential (internal vault)
audit_log:    List[Dict]      = []   # system-wide audit trail

# ── HELPERS ───────────────────────────────────────────────────────────────────

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def generate_uid() -> str:
    return str(uuid.uuid4())

def generate_privaseal_id() -> str:
    chars = string.ascii_uppercase + string.digits
    p1 = "".join(random.choices(chars, k=4))
    p2 = "".join(random.choices(chars, k=4))
    return f"PS-{p1}-{p2}"

def hash_data(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()[:16]

def log_audit(action: str, actor: str, target: str, detail: str = ""):
    entry = {
        "id":        generate_uid(),
        "timestamp": now_iso(),
        "action":    action,
        "actor":     actor,
        "target":    target,
        "detail":    detail,
    }
    audit_log.append(entry)
    logger.info(f"Audit: {action} | Actor: {actor} | Target: {target}")

def get_user_by_email(email: str) -> Optional[Dict]:
    return next((u for u in users.values() if u["email"] == email), None)

def get_user_by_fb_uid(fb_uid: str) -> Optional[Dict]:
    user_id = fb_uid_index.get(fb_uid)
    if user_id:
        return users.get(user_id)
    return None
