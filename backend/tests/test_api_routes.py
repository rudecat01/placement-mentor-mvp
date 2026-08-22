"""Placement Mentor 2.0 - Full API Route Integration Tests."""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_api_health():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"


def test_api_profile_and_onboarding():
    onboard_payload = {
        "full_name": "Aryan Sharma",
        "target_role": "SDE",
        "daily_time_budget_minutes": 120,
        "preparation_duration_days": 45,
        "resume_text": "Sample resume with Python and SQL",
        "self_assessment_sliders": {"arrays_hashing": 0.80, "sliding_window": 0.65}
    }
    response = client.post("/api/onboard", json=onboard_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["profile"]["daily_time_budget_minutes"] == 120
    assert data["day_1_plan"]["total_allocated_minutes"] == 120


def test_api_readiness_score():
    response = client.get("/api/readiness-score")
    assert response.status_code == 200
    data = response.json()
    assert "readiness_score" in data
    assert 0 <= data["readiness_score"] <= 100


def test_api_practice_submission_and_hint():
    # 1. Request Hint
    hint_res = client.post("/api/practice/hint", json={"problem_id": "arr_023", "requested_tier": 1})
    assert hint_res.status_code == 200
    assert hint_res.json()["hint_tier"] == 1

    # 2. Submit Solution
    sub_payload = {
        "problem_id": "arr_023",
        "language": "python",
        "submitted_code": "def productWindow(nums, k): return 12",
        "time_spent_seconds": 1200.0,
        "hints_requested_count": 1
    }
    sub_res = client.post("/api/practice/submit", json=sub_payload)
    assert sub_res.status_code == 200
    data = sub_res.json()
    assert "verdict" in data


def test_api_resume_doctor_and_ats():
    # 1. ATS Score
    ats_res = client.post("/api/resume/ats-score", json={"resume_text": "Python SQL developer", "target_role": "SDE"})
    assert ats_res.status_code == 200
    assert "overall_score" in ats_res.json()

    # 2. Doctor Rewrite
    doc_res = client.post("/api/resume/doctor-rewrite", json={"bullet_text": "Responsible for backend API development."})
    assert doc_res.status_code == 200
    assert "suggested_xyz_rewrite" in doc_res.json()


def test_api_interview_and_freemium():
    # 1. Eligibility Check
    elig_res = client.get("/api/interview/eligibility")
    assert elig_res.status_code == 200

    # 2. Interview Turn
    turn_payload = {
        "stage": "cs_core",
        "question": "How does B-Tree indexing work?",
        "candidate_answer": "B-Tree indexes reduce search time from O(N) to O(log N) by maintaining sorted balanced tree nodes.",
        "duration_seconds": 25.0,
        "turn_number": 1,
        "topic": "Databases"
    }
    turn_res = client.post("/api/interview/turn", json=turn_payload)
    assert turn_res.status_code == 200
    assert "shadow_critic_evaluation" in turn_res.json()

    # 3. Company Hub Freemium
    hub_res = client.get("/api/company-hub/amazon")
    assert hub_res.status_code == 200
    hub_data = hub_res.json()
    assert hub_data["company"] == "Amazon"
    assert len(hub_data["unlocked_preview_problems"]) <= 2
