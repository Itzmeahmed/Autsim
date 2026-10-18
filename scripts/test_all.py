#!/usr/bin/env python3
"""
Auti AIgnosis — Unified Platform Test & Audit Runner (test_all)
Executes dataset validation, security audit, ML model safety validation,
and backend pytest test suite in sequence.
"""

import os
import sys
import subprocess
import time

def run_step(step_name: str, command: list) -> bool:
    print("\n" + "#" * 70)
    print(f"RUNNING STEP: {step_name}")
    print("#" * 70)
    start_time = time.time()
    res = subprocess.run(command)
    elapsed = time.time() - start_time
    if res.returncode == 0:
        print(f"\n>>> [PASS] {step_name} completed successfully in {elapsed:.2f}s.")
        return True
    else:
        print(f"\n>>> [FAIL] {step_name} failed with return code {res.returncode} in {elapsed:.2f}s.")
        return False

def main():
    print("=" * 70)
    print("AUTI AIGNOSIS — UNIFIED PLATFORM VERIFICATION (TEST ALL)")
    print("=" * 70)
    
    py_exe = os.path.join("venv", "Scripts", "python.exe") if os.path.exists(os.path.join("venv", "Scripts", "python.exe")) else sys.executable
    pytest_exe = os.path.join("venv", "Scripts", "pytest.exe") if os.path.exists(os.path.join("venv", "Scripts", "pytest.exe")) else "pytest"
    
    steps = [
        ("Dataset Integrity & Privacy Validation", [py_exe, "scripts/dataset_validate.py"]),
        ("System Security & Audit Scan", [py_exe, "scripts/security_check.py"]),
        ("Machine Learning Safety & Model Validation", [py_exe, "scripts/ml_validate.py"]),
        ("Backend Pytest Test Suite", [pytest_exe, "-v", "backend/app/tests"])
    ]
    
    results = {}
    overall_success = True
    
    for name, cmd in steps:
        success = run_step(name, cmd)
        results[name] = success
        if not success:
            overall_success = False

    print("\n" + "=" * 70)
    print("AUTI AIGNOSIS — PLATFORM VERIFICATION REPORT")
    print("=" * 70)
    for name, passed in results.items():
        status = "[PASS]" if passed else "[FAIL]"
        print(f"  {status} {name}")
    print("=" * 70)
    
    if overall_success:
        print("RESULT: ALL PLATFORM TESTS & AUDITS PASSED CLEANLY (READY FOR EVALUATION)")
        print("=" * 70)
        sys.exit(0)
    else:
        print("RESULT: ONE OR MORE VERIFICATION STEPS FAILED.")
        print("=" * 70)
        sys.exit(1)

if __name__ == "__main__":
    main()
