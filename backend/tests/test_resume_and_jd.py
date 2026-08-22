"""Placement Mentor 2.0 - Resume Doctor, ATS & JD Matcher Tests."""

import pytest
from backend.app.core.ats_scorer import ATSScorer
from backend.app.core.jd_matcher import JDMatcher
from backend.app.core.resume_doctor import ResumeDoctor
from backend.app.models.schemas import SkillNode


def test_ats_scorer_evaluation():
    scorer = ATSScorer()
    sample_resume = """
Aryan Sharma - Software Engineer
EXPERIENCE
Software Engineer at Acme Labs
• Architected scalable backend APIs and microservices in Python and SQL, reducing latency by 35%.
• Deployed Docker containers in CI/CD pipeline across 50,000+ daily requests.

PROJECTS
• Real-time Data Filter: Built task queue using Redis and Git.

SKILLS
Python, Java, Data Structures, Algorithms, SQL, Git, Docker, System Design

EDUCATION
B.Tech Computer Science 2024
"""
    result = scorer.score_resume(sample_resume, target_role="SDE")
    assert result["overall_score"] >= 75
    assert result["keyword_match_score"] > 20
    assert result["section_hierarchy_score"] == 25
    assert len(result["matched_keywords"]) >= 5


def test_resume_doctor_xyz_rewrite():
    doctor = ResumeDoctor()
    weak_bullet = "Responsible for backend API development and bug fixes."
    res = doctor.analyze_and_rewrite_bullet(weak_bullet)

    assert res["is_weak"] is True
    assert "Accomplished" in res["suggested_xyz_rewrite"] or "Engineered" in res["suggested_xyz_rewrite"]
    assert len(res["improved_metrics"]) > 0


def test_resume_doctor_dynamic_topic_ingestion():
    doctor = ResumeDoctor()
    suggestions = doctor.generate_dynamic_skill_ingestion(["Sliding Window", "Graphs (BFS/DFS)"])

    assert len(suggestions) == 2
    assert "Sliding Window" in suggestions[0]["topic"]
    assert "streaming" in suggestions[0]["recommended_bullet"].lower()


def test_jd_matcher_skill_delta():
    matcher = JDMatcher()
    sample_jd = """
Amazon SDE 2:
Requirements:
- 3+ years experience with Python, Golang, and Docker.
- Deep knowledge of Algorithms, Dynamic Programming, and Graph Algorithms.
- AWS cloud infrastructure experience.
"""
    skills = [
        SkillNode(id="s1", name="Python", category="dsa", mastery=0.85),
        SkillNode(id="s2", name="Dynamic Programming", category="dsa", mastery=0.35),
        SkillNode(id="s3", name="Graphs (BFS/DFS)", category="dsa", mastery=0.40),
    ]

    res = matcher.decompose_and_match(sample_jd, skills, job_title="SDE 2", company="Amazon")
    assert res["overall_match_percentage"] > 0
    assert len(res["skill_deltas"]) > 0
    assert "Dynamic Programming" in res["top_priority_gap_skills"] or "Graphs (BFS/DFS)" in res["top_priority_gap_skills"]
