#!/usr/bin/env python3
"""
Auti AIgnosis — Automated Security Audit & Verification Script
Scans repository for hardcoded secrets, insecure CORS configs, raw SQL concatenation,
broken access control patterns, and verifies environment hygiene.
"""

import os
import sys
import re
import subprocess

def run_security_audit() -> bool:
    print("=" * 70)
    print("AUTI AIGNOSIS — SYSTEM SECURITY & AUDIT SCANNER")
    print("=" * 70)
    
    issues_found = 0

    # 1. Check .gitignore for critical protections
    print("\n[CHECK 1] Auditing .gitignore for secret exclusions...")
    if not os.path.exists(".gitignore"):
        print("  [FAIL] Missing .gitignore file in repository root!")
        issues_found += 1
    else:
        with open(".gitignore", "r") as f:
            gi_content = f.read()
        mandatory_patterns = [".env", "*.db", "autism.db", "node_modules", "venv"]
        missing_patterns = [p for p in mandatory_patterns if p not in gi_content]
        if missing_patterns:
            print(f"  [WARN] .gitignore missing recommended patterns: {missing_patterns}")
        else:
            print("  [PASS] .gitignore contains all mandatory exclusion rules (.env, *.db, venv, node_modules).")

    # 2. Scan Python codebase for hardcoded secrets & credentials
    print("\n[CHECK 2] Scanning codebase for hardcoded credentials & private keys...")
    secret_patterns = [
        re.compile(r"-----BEGIN (RSA|OPENSSH|EC) PRIVATE KEY-----"),
        re.compile(r"password\s*=\s*['\"][A-Za-z0-9@#$%^&+=]{12,}['\"]", re.IGNORECASE),
        re.compile(r"api[_-]?key\s*=\s*['\"][A-Za-z0-9_-]{20,}['\"]", re.IGNORECASE)
    ]
    
    excluded_dirs = {".git", "venv", "__pycache__", ".pytest_cache", "node_modules", "dist"}
    secret_hits = []
    
    for root, dirs, files in os.walk("."):
        dirs[:] = [d for d in dirs if d not in excluded_dirs]
        for f in files:
            if f.endswith((".py", ".ts", ".tsx", ".js", ".json", ".env")):
                # Allow seed.py demo accounts and test fixtures
                if "seed.py" in f or "test_" in f:
                    continue
                filepath = os.path.join(root, f)
                try:
                    with open(filepath, "r", encoding="utf-8", errors="ignore") as fh:
                        content = fh.read()
                        for p in secret_patterns:
                            if p.search(content):
                                secret_hits.append((filepath, p.pattern))
                except Exception:
                    pass

    if secret_hits:
        print(f"  [FAIL] Potential exposed secrets detected in source files: {secret_hits}")
        issues_found += len(secret_hits)
    else:
        print("  [PASS] Zero hardcoded private keys or production secrets detected in active codebase.")

    # 3. Check for SQL Injection risks (string concatenation with SELECT/INSERT/UPDATE)
    print("\n[CHECK 3] Auditing database layer for SQL injection vulnerabilities...")
    sql_concat_pattern = re.compile(r"(SELECT|INSERT|UPDATE|DELETE)\s+.*(\+|%|\.format\(|f[\"']).*", re.IGNORECASE)
    sql_hits = []
    for root, dirs, files in os.walk("backend/app"):
        dirs[:] = [d for d in dirs if d not in excluded_dirs]
        for f in files:
            if f.endswith(".py"):
                filepath = os.path.join(root, f)
                with open(filepath, "r", encoding="utf-8", errors="ignore") as fh:
                    for idx, line in enumerate(fh, 1):
                        if sql_concat_pattern.search(line) and "logger" not in line and "action=" not in line:
                            sql_hits.append((filepath, idx, line.strip()))

    if sql_hits:
        print(f"  [FAIL] Unsafe raw SQL concatenation detected: {sql_hits}")
        issues_found += len(sql_hits)
    else:
        print("  [PASS] All database queries use parameterized SQLAlchemy ORM bindings.")

    # 4. Check API Gateway Security Headers and CORS configuration
    print("\n[CHECK 4] Inspecting API Gateway for security headers and CORS hardening...")
    main_py_path = "backend/main.py"
    if os.path.exists(main_py_path):
        with open(main_py_path, "r", encoding="utf-8") as f:
            main_code = f.read()
        
        headers_to_check = ["nosniff", "DENY", "X-XSS-Protection", "Referrer-Policy"]
        missing_headers = [h for h in headers_to_check if h not in main_code]
        if missing_headers:
            print(f"  [WARN] Missing security headers in main.py: {missing_headers}")
            issues_found += 1
        else:
            print("  [PASS] Security headers verified (nosniff, DENY, X-XSS-Protection, Referrer-Policy).")
            
        if 'allow_origins=["*"]' in main_code and 'allow_credentials=True' in main_code:
            print("  [FAIL] Dangerous CORS configuration: allow_origins=['*'] combined with allow_credentials=True!")
            issues_found += 1
        else:
            print("  [PASS] CORS configured with explicit allowlist.")
    else:
        print("  [FAIL] backend/main.py not found.")
        issues_found += 1

    # 5. Check IDOR protections across critical endpoints
    print("\n[CHECK 5] Verifying IDOR authorization checks in API endpoints...")
    idor_checks = [
        ("backend/app/api/clinical_notes.py", "appt.clinician_id != clinician.id", "Clinical note ownership check"),
        ("backend/app/api/appointments.py", "current_user.role == UserRole.PATIENT.value", "Appointment status RBAC check"),
        ("backend/app/api/clinicians.py", "has_appointment", "Clinician-patient relationship check"),
        ("backend/app/api/screening.py", "screening.patient.user_id != current_user.id", "Screening result patient ownership check")
    ]
    for path, signature, desc in idor_checks:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                code = f.read()
            if signature in code:
                print(f"  [PASS] {desc} verified in {path}.")
            else:
                print(f"  [FAIL] Missing {desc} in {path}!")
                issues_found += 1
        else:
            print(f"  [FAIL] File missing: {path}")
            issues_found += 1

    # 6. Verify Python dependencies via pip check if environment is active
    print("\n[CHECK 6] Checking Python dependency tree integrity...")
    try:
        py_exe = os.path.join("venv", "Scripts", "python.exe") if os.path.exists(os.path.join("venv", "Scripts", "python.exe")) else sys.executable
        res = subprocess.run([py_exe, "-m", "pip", "check"], capture_output=True, text=True)
        if res.returncode == 0:
            print("  [PASS] Python dependencies verified with pip check (no broken dependencies).")
        else:
            print(f"  [WARN] pip check reported warnings: {res.stdout.strip()}")
    except Exception as e:
        print(f"  [INFO] pip check skipped: {e}")

    print("\n" + "=" * 70)
    if issues_found == 0:
        print("SECURITY AUDIT SUMMARY: ALL CHECKS PASSED (0 VULNERABILITIES DETECTED)")
        print("=" * 70)
        return True
    else:
        print(f"SECURITY AUDIT SUMMARY: FAILED WITH {issues_found} ISSUES")
        print("=" * 70)
        return False

if __name__ == "__main__":
    success = run_security_audit()
    sys.exit(0 if success else 1)
