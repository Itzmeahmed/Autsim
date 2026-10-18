"""
Auti AIgnosis - Screening & ML Pipeline Integration Tests
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_questions_endpoint():
    resp = client.get("/api/screening/questions")
    assert resp.status_code == 200
    data = resp.json()
    assert "questions" in data
    assert data["total"] == 20
    
    # Check multilingual structure
    first_q = data["questions"][0]
    assert "en" in first_q["text"]
    assert "kn" in first_q["text"]
    assert "hi" in first_q["text"]

def test_screening_submission_and_clinical_disclaimer():
    # Login as demo patient
    auth_resp = client.post("/api/auth/demo-login/patient")
    assert auth_resp.status_code == 200
    token = auth_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Prepare 20 responses
    responses = []
    for i in range(20):
        domain = "Communication" if i < 4 else (
            "Social Interaction" if i < 8 else (
                "Sensory Responses" if i < 12 else (
                    "Repetitive Behaviors" if i < 16 else "Daily-Life Skills"
                )
            )
        )
        responses.append({
            "question_id": f"Q{i+1}",
            "question_text": f"Sample screening question {i+1}",
            "domain": domain,
            "response_value": 1 if i % 2 == 0 else 0,
            "response_text": "Option Selected"
        })
        
    submission_payload = {
        "patient_id": 1,
        "child_age": 5,
        "child_gender": "m",
        "jaundice_at_birth": "no",
        "family_history_asd": "no",
        "responses": responses
    }
    
    resp = client.post("/api/screening/submit", json=submission_payload, headers=headers)
    assert resp.status_code == 200
    res_data = resp.json()
    
    # Crucial Clinical Safety Checks
    assert "screening_indication" in res_data
    assert res_data["screening_indication"] in ["Higher Indication", "Lower Indication"]
    assert "developmental_profile" in res_data
    assert "Communication" in res_data["developmental_profile"]
    assert "Social Interaction" in res_data["developmental_profile"]
    assert "Sensory Responses" in res_data["developmental_profile"]
    assert "Repetitive Behaviors" in res_data["developmental_profile"]
    assert "Daily-Life Skills" in res_data["developmental_profile"]
    
    # Verify non-diagnostic statutory disclaimer
    assert "It is not a medical diagnosis" in res_data["disclaimer"]
    assert "Please consult a qualified clinician" in res_data["disclaimer"]

def test_screening_rejects_missing_questions():
    auth_resp = client.post("/api/auth/demo-login/patient")
    token = auth_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Send only 5 responses instead of required 20
    incomplete_responses = [{
        "question_id": f"Q{i+1}",
        "question_text": f"Question {i+1}",
        "domain": "Communication",
        "response_value": 0
    } for i in range(5)]
    
    payload = {
        "patient_id": 1,
        "child_age": 6,
        "child_gender": "m",
        "jaundice_at_birth": "no",
        "family_history_asd": "no",
        "responses": incomplete_responses
    }
    resp = client.post("/api/screening/submit", json=payload, headers=headers)
    assert resp.status_code == 422

def test_screening_rejects_invalid_response_values():
    auth_resp = client.post("/api/auth/demo-login/patient")
    token = auth_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    responses = [{
        "question_id": f"Q{i+1}",
        "question_text": f"Question {i+1}",
        "domain": "Communication",
        "response_value": 5 if i == 0 else 0  # Invalid non-binary value 5
    } for i in range(20)]
    
    payload = {
        "patient_id": 1,
        "child_age": 6,
        "child_gender": "m",
        "jaundice_at_birth": "no",
        "family_history_asd": "no",
        "responses": responses
    }
    resp = client.post("/api/screening/submit", json=payload, headers=headers)
    assert resp.status_code == 422

def test_screening_rejects_out_of_range_age():
    auth_resp = client.post("/api/auth/demo-login/patient")
    token = auth_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    responses = [{
        "question_id": f"Q{i+1}",
        "question_text": f"Question {i+1}",
        "domain": "Communication",
        "response_value": 0
    } for i in range(20)]
    
    # Age 1 (below minimum 2)
    payload = {
        "patient_id": 1,
        "child_age": 1,
        "child_gender": "m",
        "jaundice_at_birth": "no",
        "family_history_asd": "no",
        "responses": responses
    }
    resp = client.post("/api/screening/submit", json=payload, headers=headers)
    assert resp.status_code == 422

