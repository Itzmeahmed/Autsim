"""
Auti AIgnosis - Audit Logging Service
Tracks clinical actions, logins, screenings, and administrative operations.
"""

from typing import Optional
from sqlalchemy.orm import Session
from backend.app.models.models import AuditLog

def record_audit_event(
    db: Session,
    action: str,
    resource: str,
    user_id: Optional[int] = None,
    ip_address: Optional[str] = "127.0.0.1",
    status: str = "SUCCESS",
    details: Optional[str] = None
):
    """Inserts a structured audit log entry."""
    try:
        log_entry = AuditLog(
            user_id=user_id,
            action=action,
            resource=resource,
            ip_address=ip_address,
            status=status,
            details=details
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Warning: Audit event logging failed: {e}")
