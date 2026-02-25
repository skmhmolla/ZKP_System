from sqlalchemy import Column, String, Integer, Boolean, DateTime, JSON, ForeignKey, Text
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    firebase_uid = Column(String, unique=True, index=True, nullable=True)
    full_name = Column(String)
    email = Column(String, unique=True, index=True)
    pw_hash = Column(String, nullable=True)
    dob = Column(String, nullable=True)
    role = Column(String, default="user")
    status = Column(String, default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    docs_uploaded = Column(Boolean, default=False)
    profile_completed = Column(Boolean, default=False)
    phone_number = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    country = Column(String, nullable=True)
    state = Column(String, nullable=True)
    city = Column(String, nullable=True)
    pin_code = Column(String, nullable=True)
    id_type = Column(String, nullable=True)
    id_number = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)

class Credential(Base):
    __tablename__ = "credentials"
    id = Column(String, primary_key=True) # For issuer-based, matches UUID. For PrivaSeal, matches PS-ID
    type = Column(String)
    type_label = Column(String)
    issuer_id = Column(String)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    name = Column(String) # Display name
    dob = Column(String)
    attributes = Column(JSON) # Store all raw attributes
    metadata_json = Column(JSON) # Store other display fields
    issued_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="Active")
    attr_hash = Column(String)
    qr_uri = Column(String, nullable=True)
    age_verified = Column(Boolean, nullable=True)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    revoke_reason = Column(String, nullable=True)

class VerificationRequest(Base):
    __tablename__ = "verification_requests"
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    user_name = Column(String, nullable=True)
    user_email = Column(String, nullable=True)
    doc_type = Column(String, nullable=True)
    doc_hash = Column(String, nullable=True)
    front_image = Column(Text, nullable=True) # Base64
    back_image = Column(Text, nullable=True)
    selfie_image = Column(Text, nullable=True)
    status = Column(String, default="pending")
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    admin_id = Column(String, nullable=True)
    reject_reason = Column(String, nullable=True)
    reupload_reason = Column(String, nullable=True)
    privaseal_id = Column(String, nullable=True)

class VerifierRequest(Base):
    __tablename__ = "verifier_requests"
    id = Column(String, primary_key=True)
    predicate_key = Column(String)
    predicate_label = Column(String)
    predicate_desc = Column(String)
    predicate_icon = Column(String)
    credential_type = Column(String)
    verifier_id = Column(String)
    verifier_name = Column(String)
    verifier_type = Column(String)
    status = Column(String, default="waiting_proof")
    status_label = Column(String)
    qr_uri = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True))
    verified_at = Column(DateTime(timezone=True), nullable=True)
    proof_hash = Column(String, nullable=True)
    revealed_attrs = Column(JSON, nullable=True)
    error_msg = Column(String, nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String, primary_key=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    action = Column(String)
    actor = Column(String)
    target = Column(String)
    detail = Column(Text, nullable=True)
