"""
Auti AIgnosis - Appointment Double-Booking & Scheduling Tests
"""

import time
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_prevent_double_booking():
    # Login as patient
    auth_resp = client.post("/api/auth/demo-login/patient")
    token = auth_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    unique_date = f"2027-01-{(int(time.time()) % 25 + 1):02d}"
    booking_payload = {
        "clinician_id": 1,
        "appointment_date": unique_date,
        "appointment_time": "10:30 AM",
        "reason_for_visit": "Screening review consultation"
    }
    
    # 1. First booking should succeed
    first_resp = client.post("/api/appointments/", json=booking_payload, headers=headers)
    assert first_resp.status_code == 200
    appt_id = first_resp.json()["id"]
    
    # 2. Second booking with exact same clinician, date, and time must be REJECTED (409 Conflict)
    duplicate_resp = client.post("/api/appointments/", json=booking_payload, headers=headers)
    assert duplicate_resp.status_code == 409
    assert "no longer available" in duplicate_resp.json()["detail"].lower()
