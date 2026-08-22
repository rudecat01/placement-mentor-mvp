"""
Unit & Integration Tests for Resume Doctor Fixes:
1. Section Header & Standalone Keyword Filtering (e.g. 'Achievements', 'Certifications')
2. Anti-Hallucination Metric Validation (Placeholders for ungrounded numbers)
3. Company-Specific Track Grading (Google vs Amazon vs Meta vs Microsoft)
4. Dynamic Resource Completion Resume Bullet Point Suggestions
5. Router Endpoints Integration
"""

import pytest
from fastapi.testclient import TestClient
from server.main import app
from server.agents.resume_doctor.resume_doctor_agent import (
    resume_doctor_agent,
    COMPANY_RUBRICS,
)


client = TestClient(app)


SAMPLE_RESUME_WITH_HEADERS = """
Aryan Sharma
Email: aryan@example.com | GitHub: github.com/aryansharma | Phone: +1 555-0199

SKILLS
Programming Languages: Python, C++, JavaScript, TypeScript, SQL
Frameworks & Tools: FastAPI, React, Docker, PostgreSQL, Redis, Git

WORK EXPERIENCE
Software Engineer Intern — Acme Corp (May 2023 - Aug 2023)
• Built REST API microservices using FastAPI and PostgreSQL to handle user authentications and order processing.
• Optimized backend database queries and implemented Redis caching to speed up read latencies.
• Collaborated with senior engineers in daily standups and code reviews.

TECHNICAL PROJECTS
Distributed Task Queue (Python, Redis, Docker)
• Engineered asynchronous distributed task executor supporting background job processing and retries.
• Containerized the entire multi-service workflow with Docker Compose for local development.

ACHIEVEMENTS
• 1st Place in National College Hackathon among 120 teams.
• Dean's List for Academic Excellence (2022, 2023).
• Solved 350+ problems on LeetCode with top 15% contest rating.

CERTIFICATIONS
• AWS Certified Cloud Practitioner
• Meta Front-End Developer Professional Certificate

EDUCATION
B.Tech in Computer Science and Engineering — Tech Institute (2020 - 2024)
CGPA: 8.9 / 10.0
"""


def test_section_header_detection():
    """Verify that all standard section headers are identified and not treated as bullet points."""
    assert resume_doctor_agent._is_section_header("ACHIEVEMENTS") == "ACHIEVEMENTS"
    assert resume_doctor_agent._is_section_header("Key Achievements") == "ACHIEVEMENTS"
    assert resume_doctor_agent._is_section_header("Certifications") == "CERTIFICATIONS"
    assert resume_doctor_agent._is_section_header("Licenses & Certifications") == "CERTIFICATIONS"
    assert resume_doctor_agent._is_section_header("Technical Skills") == "SKILLS"
    assert resume_doctor_agent._is_section_header("Work Experience") == "EXPERIENCE"
    assert resume_doctor_agent._is_section_header("Projects") == "PROJECTS"
    assert resume_doctor_agent._is_section_header("Education") == "EDUCATION"
    assert resume_doctor_agent._is_section_header("Leadership Experience") == "LEADERSHIP"


def test_bullet_extraction_excludes_achievements_skills_and_headers():
    """Verify that candidate bullets only contain narrative experience/project lines and zero headers."""
    bullets = resume_doctor_agent._extract_candidate_bullet_points(SAMPLE_RESUME_WITH_HEADERS)

    # Must extract genuine experience & project narrative bullets
    assert len(bullets) >= 4

    # None of the extracted bullets should be section headers or standalone words
    for b in bullets:
        assert b.lower() != "achievements"
        assert b.lower() != "certifications"
        assert b.lower() != "skills"
        assert b.lower() != "education"
        assert "dean's list" not in b.lower()
        assert "aws certified" not in b.lower()
        assert not b.endswith(":")
        assert len(b.split()) >= 4


def test_metric_anti_hallucination_validation():
    """Verify that ungrounded newly invented numbers are converted to validation placeholders."""
    original = "Built REST API microservices using FastAPI and PostgreSQL to handle user authentications."
    hallucinated_rewrite = "Architected RESTful microservices with FastAPI and PostgreSQL, reducing latency by 42% across 10,000 daily active users."

    validated = resume_doctor_agent._enforce_metric_validation(original, hallucinated_rewrite)

    # 42% was NOT in original, so it must be replaced by [Insert %] placeholder
    assert "[Insert %]" in validated
    assert "42%" not in validated

    # Valid placeholders already present are preserved
    valid_placeholder_rewrite = "Architected RESTful microservices with FastAPI, cutting latency by [Insert %] for [Insert # of users]."
    val2 = resume_doctor_agent._enforce_metric_validation(original, valid_placeholder_rewrite)
    assert "[Insert %]" in val2
    assert "[Insert # of users]" in val2


def test_metric_preservation_when_present_in_original():
    """Verify that numbers present in original text are preserved without brackets."""
    original = "Optimized API query latency by 50ms across 5000 users."
    rewrite = "Engineered optimized index reducing query latency by 50ms across 5000 users."
    validated = resume_doctor_agent._enforce_metric_validation(original, rewrite)
    assert "50ms" in validated
    assert "5000" in validated


def test_company_specific_track_rubrics():
    """Verify that company tracks resolve distinct rubric criteria and keywords."""
    google_rubric = resume_doctor_agent.get_company_rubric("Google")
    amazon_rubric = resume_doctor_agent.get_company_rubric("Amazon")
    meta_rubric = resume_doctor_agent.get_company_rubric("Meta")
    msft_rubric = resume_doctor_agent.get_company_rubric("Microsoft")

    assert "Algorithmic" in google_rubric["focus"] or "Google" in google_rubric["display_name"]
    assert "Leadership" in amazon_rubric["display_name"] or "Customer Obsession" in amazon_rubric["focus"]
    assert "Move Fast" in meta_rubric["focus"] or "A/B Testing" in meta_rubric["priority_keywords"]
    assert "Azure" in msft_rubric["priority_keywords"] or "Enterprise" in msft_rubric["focus"]


@pytest.mark.asyncio
async def test_diagnose_resume_company_track_integration():
    """Verify diagnose_resume incorporates company track insights and metric validation."""
    result = await resume_doctor_agent.diagnose_resume(
        resume_content=SAMPLE_RESUME_WITH_HEADERS,
        job_description="Looking for SDE with Python, FastAPI, Docker, and Distributed Systems.",
        target_role="SDE",
        target_company="Amazon"
    )

    assert result["success"] is True
    assert "company_track" in result
    assert result["company_track"]["target_company"] == "Amazon"
    assert "bar_raiser_tip" in result["company_track"]
    assert "scores" in result
    assert "weak_bullets" in result
    assert "resource_bullet_suggestions" in result

    # Check weak bullets are from resume and have valid metric placeholders
    for wb in result["weak_bullets"]:
        assert wb["original_text"].lower() != "achievements"
        assert wb["original_text"].lower() != "certifications"
        # Check improved rewrite has placeholders if metrics are used
        if "improved_rewrite" in wb:
            rewrite = wb["improved_rewrite"]
            # No ungrounded raw percentages without brackets
            raw_pcts = [p for p in rewrite.split() if "%" in p and not ("[" in p or "]" in p)]
            assert len(raw_pcts) == 0


def test_dynamic_resource_bullet_suggestions():
    """Verify dynamic bullet suggestions generated from completed topics."""
    react_suggs = resume_doctor_agent.generate_resource_bullet_suggestions("react-fundamentals", "WEB_DEV")
    assert len(react_suggs) >= 1
    assert any("React" in s["suggested_bullet"] for s in react_suggs)
    assert any("[Insert %]" in s["suggested_bullet"] for s in react_suggs)

    sql_suggs = resume_doctor_agent.generate_resource_bullet_suggestions("databases-sql", "SDE")
    assert len(sql_suggs) >= 1
    assert any("PostgreSQL" in s["suggested_bullet"] or "database" in s["suggested_bullet"].lower() for s in sql_suggs)


def test_api_resource_completed_endpoint():
    """Verify the /api/resume/resource-completed-suggestions endpoint."""
    resp = client.post("/api/resume/resource-completed-suggestions", json={
        "topic_id": "react-fundamentals",
        "target_role": "WEB_DEVELOPMENT"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert len(data["suggestions"]) >= 1


def test_api_completed_resource_suggestions_endpoint():
    """Verify the /api/resume/completed-resource-suggestions endpoint."""
    resp = client.get("/api/resume/completed-resource-suggestions?user_id=usr_demo123&target_role=SDE")
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert len(data["suggestions"]) >= 1
