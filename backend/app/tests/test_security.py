"""
Auti AIgnosis - Security & Access Control Tests
Verifies RBAC protection, privilege escalation prevention, and audit tracking.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_patient_cannot_access_admin_dashboard():
    # Login as patient
    patient_auth = client.post("/api/auth/demo-login/patient").json()
    patient_token = patient_auth["access_token"]
    
    # Attempt to request admin statistics with patient token
    resp = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {patient_token}"})
    assert resp.status_code == 403
    assert "Access forbidden" in resp.json()["detail"]

def test_clinician_cannot_access_admin_user_management():
    # Login as clinician
    clinician_auth = client.post("/api/auth/demo-login/clinician").json()
    clinician_token = clinician_auth["access_token"]
    
    # Attempt to request admin user management
    resp = client.get("/api/admin/users", headers={"Authorization": f"Bearer {clinician_token}"})
    assert resp.status_code == 403

def test_admin_can_access_audit_logs():
    # Login as admin
    admin_auth = client.post("/api/auth/demo-login/admin").json()
    admin_token = admin_auth["access_token"]
    
    resp = client.get("/api/admin/audit-logs", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200
    logs = resp.json()
    assert isinstance(logs, list)
    assert len(logs) > 0

def test_clinician_cannot_access_unassigned_patient_record():
    # Login as Clinician 2 (Dr. Rajesh Kulkarni, who has no appointment with Patient 1)
    login_resp = client.post("/api/auth/login", json={
        "email": "rajesh.kulkarni@autiaignosis.org",
        "password": "Password@123"
    })
    assert login_resp.status_code == 200
    c2_token = login_resp.json()["access_token"]
    
    # Attempt to view patient 1's detailed clinical file without an active booking
    resp = client.get("/api/clinicians/me/patient/1", headers={"Authorization": f"Bearer {c2_token}"})
    assert resp.status_code == 403
    assert "access denied" in resp.json()["detail"].lower()

def test_clinician_cannot_tamper_other_clinician_notes():
    # Login as Clinician 2
    login_resp = client.post("/api/auth/login", json={
        "email": "rajesh.kulkarni@autiaignosis.org",
        "password": "Password@123"
    })
    c2_token = login_resp.json()["access_token"]
    
    # Appointment 1 belongs to Clinician 1 (Dr. Ananya Sharma)
    tamper_payload = {
        "appointment_id": 1,
        "consultation_notes": "Unauthorized forged note by Dr. Kulkarni",
        "follow_up_recommendations": "Unverified recommendation",
        "observation_summary": "Tampered observation"
    }
    resp = client.post("/api/clinical-notes/", json=tamper_payload, headers={"Authorization": f"Bearer {c2_token}"})
    assert resp.status_code == 403
    assert "only record clinical notes for appointments assigned to you" in resp.json()["detail"].lower()

def test_patient_cannot_tamper_appointment_status():
    # Login as Patient
    patient_auth = client.post("/api/auth/demo-login/patient").json()
    p_token = patient_auth["access_token"]
    
    # Attempt to mark an appointment as "Confirmed" (patients can only cancel their own)
    resp = client.patch("/api/appointments/1/status", json={"status": "Confirmed"}, headers={"Authorization": f"Bearer {p_token}"})
    assert resp.status_code == 403
    assert "only authorized to cancel" in resp.json()["detail"].lower()

def test_sql_injection_resilience():
    # Pass classic SQL injection payload to query parameters
    sql_payload = "1' OR '1'='1"
    resp = client.get(f"/api/clinicians/slots?clinician_id=1&date={sql_payload}")
    # Should either return standard 200 with empty slots or 422, but NEVER leak a 500 database traceback
    assert resp.status_code in [200, 422, 400]
    if resp.status_code == 200:
        assert "booked_slots" in resp.json()

