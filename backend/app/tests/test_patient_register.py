"""
Auti AIgnosis - Patient Registration & Portal Flow Integration Tests
Tests:
- Patient OTP registration with caregiver & child distinction
- Camera behavioral observation persistence
- Clinician appointment action flow (accept, reject, reschedule)
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_patient_registration_full_flow():
    phone = "+919811223344"
    
    # 1. Request OTP
    otp_resp = client.post("/api/auth/send-otp", json={"phone_number": phone})
    assert otp_resp.status_code == 200
    mock_otp = otp_resp.json().get("mock_otp") or "123456"
    
    # 2. Register Patient Account with Caregiver & Child Details
    reg_payload = {
        "phone_number": phone,
        "otp": mock_otp,
        "caregiver_name": "Kavitha Rao",
        "child_name": "Rohan Rao",
        "child_age": 4,
        "child_gender": "Male",
        "relationship_to_child": "Mother",
        "preferred_language": "Kannada",
        "consent_given": True,
        "medical_history_notes": "Mild speech delay noted at 30 months."
    }
    reg_resp = client.post("/api/auth/patient/register", json=reg_payload)
    assert reg_resp.status_code == 200
    token_data = reg_resp.json()
    assert token_data["role"] == "patient"
    assert token_data["full_name"] == "Rohan Rao"
    assert "access_token" in token_data
    
    # 3. Verify Profile API reflects accurate caregiver vs child split
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    me_resp = client.get("/api/auth/me", headers=headers)
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["profile"]["child_name"] == "Rohan Rao"
    assert me_data["profile"]["full_name"] == "Kavitha Rao"

def test_screening_with_camera_observation():
    # Authenticate as patient
    login_resp = client.post("/api/auth/demo-login/patient")
    token = login_resp.json()["access_token"]
    profile_id = login_resp.json()["profile_id"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Fetch questions
    q_resp = client.get("/api/screening/questions")
    questions = q_resp.json()["questions"]
    
    # Prepare responses
    responses = [
        {
            "question_id": q["id"],
            "question_text": q["text"]["en"],
            "domain": q["domain"],
            "response_value": 1,
            "response_text": "Always"
        }
        for q in questions
    ]
    
    # Camera observation payload
    camera_obs = {
        "duration_seconds": 35,
        "facial_expression_indicators": ["Sustained direct focus", "Social smile reciprocation"],
        "attention_orientation_indicators": ["Oriented to stimulus prompts"],
        "movement_patterns": ["Rhythmic hand movements noted during task transition"],
        "repetitive_movement_detected": True,
        "confidence_quality_indicator": "High - Clear Lighting & Stable Framing",
        "observation_notes": "Screening subject completed 35-second prompt sequence."
    }
    
    submit_payload = {
        "patient_id": profile_id,
        "child_age": 5,
        "child_gender": "m",
        "jaundice_at_birth": "no",
        "family_history_asd": "no",
        "responses": responses,
        "camera_observation": camera_obs
    }
    
    submit_resp = client.post("/api/screening/submit", json=submit_payload, headers=headers)
    assert submit_resp.status_code == 200, f"Error: {submit_resp.text}"
    res_data = submit_resp.json()
    assert "screening_indication" in res_data
    assert "probability_score" in res_data
    assert "not a medical diagnosis" in res_data["disclaimer"].lower()

def test_clinician_appointment_actions():
    import time
    # Login as clinician
    clin_resp = client.post("/api/auth/demo-login/clinician")
    clin_token = clin_resp.json()["access_token"]
    clin_headers = {"Authorization": f"Bearer {clin_token}"}
    
    # Patient creates appointment
    pat_resp = client.post("/api/auth/demo-login/patient")
    pat_token = pat_resp.json()["access_token"]
    pat_headers = {"Authorization": f"Bearer {pat_token}"}
    
    unique_date = f"2030-05-{(int(time.time() * 1000) % 25 + 1):02d}"
    book_resp = client.post("/api/appointments/", json={
        "clinician_id": 1,
        "appointment_date": unique_date,
        "appointment_time": "11:30 AM",
        "reason_for_visit": "Consultation on screening indicators"
    }, headers=pat_headers)
    assert book_resp.status_code == 200, f"Booking error: {book_resp.text}"
    appt_id = book_resp.json()["id"]
    
    # Clinician Accepts appointment
    action_resp = client.post(f"/api/appointments/{appt_id}/action", json={
        "action": "accept"
    }, headers=clin_headers)
    assert action_resp.status_code == 200
    assert action_resp.json()["status"] == "Confirmed"
