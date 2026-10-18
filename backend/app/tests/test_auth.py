"""
Auti AIgnosis - Authentication & Security Tests
Tests OTP generation, verification, and Role-Based Access Control.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "model_version" in data

def test_patient_otp_flow_and_login():
    # 1. Request OTP
    phone = "+919876543210"
    resp = client.post("/api/auth/send-otp", json={"phone_number": phone})
    assert resp.status_code == 200
    data = resp.json()
    assert "expires_in_seconds" in data
    mock_otp = data.get("mock_otp") or "123456"
    
    # 2. Verify with invalid OTP
    bad_resp = client.post("/api/auth/verify-otp", json={"phone_number": phone, "otp": "000000"})
    assert bad_resp.status_code == 400
    
    # 3. Verify with correct OTP
    good_resp = client.post("/api/auth/verify-otp", json={"phone_number": phone, "otp": mock_otp})
    assert good_resp.status_code == 200
    token_data = good_resp.json()
    assert "access_token" in token_data
    assert token_data["role"] == "patient"

def test_clinician_and_admin_password_auth():
    # Clinician valid login
    resp = client.post("/api/auth/login", json={
        "email": "ananya.sharma@autiaignosis.org",
        "password": "Password@123"
    })
    assert resp.status_code == 200
    assert resp.json()["role"] == "clinician"
    
    # Admin valid login
    admin_resp = client.post("/api/auth/login", json={
        "email": "admin@autiaignosis.org",
        "password": "Admin@12345"
    })
    assert admin_resp.status_code == 200
    assert admin_resp.json()["role"] == "admin"
    
    # Invalid password test
    bad_login = client.post("/api/auth/login", json={
        "email": "admin@autiaignosis.org",
        "password": "WrongPassword999"
    })
    assert bad_login.status_code == 401
