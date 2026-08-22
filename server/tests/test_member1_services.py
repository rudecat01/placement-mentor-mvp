"""
Placement Mentor 2.0 - Member 1 Test Suite
[OWNED BY MEMBER 1 - DB & USER STATE ARCHITECT]

Tests:
1. Database thread-safe store and CRUD operations
2. Auth token encoding, decoding, and FastAPI security middleware
3. Resume parser, skill extractor, and ATS score calculator
4. GitHub & LeetCode telemetry fetchers
5. Student state synthesis and onboarding pipeline
6. FastAPI endpoints (Auth, Onboarding, Student, Settings)
"""

import unittest
import asyncio
from fastapi.testclient import TestClient
from server.main import app
from server.db.database import db
from server.services.auth.auth_middleware import create_access_token, decode_access_token
from server.services.ingestion.resume_parser import resume_parser
from server.services.ingestion.github_fetcher import github_fetcher
from server.services.ingestion.leetcode_fetcher import leetcode_fetcher
from server.services.student_state.student_state_service import student_state_service
from server.schemas.student import OnboardingSubmissionPayload


class TestMember1PlatformServices(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_database_user_crud(self):
        test_email = "test_user_m1@placement.ai"
        user = db.create_user(test_email, "securepass123", "Test Student")
        self.assertIsNotNone(user.id)
        self.assertEqual(user.email, test_email)

        # Duplicate email prevention
        with self.assertRaises(ValueError):
            db.create_user(test_email, "anotherpass", "Test Student 2")

        # Password verification
        verified = db.verify_password(test_email, "securepass123")
        self.assertIsNotNone(verified)
        self.assertEqual(verified.id, user.id)

        failed = db.verify_password(test_email, "wrongpass")
        self.assertIsNone(failed)

    def test_02_auth_token_lifecycle(self):
        token = create_access_token("usr_12345", "test@test.com", expires_delta_seconds=3600)
        self.assertIsInstance(token, str)

        payload = decode_access_token(token)
        self.assertIsNotNone(payload)
        self.assertEqual(payload["sub"], "usr_12345")
        self.assertEqual(payload["email"], "test@test.com")

        # Invalid token
        invalid = decode_access_token("invalid.token.signature")
        self.assertIsNone(invalid)

    def test_03_resume_parser_skills_and_ats(self):
        sample_resume = """
        Aryan Sharma
        Email: aryan@example.com | Phone: +1-555-0192

        EDUCATION
        B.Tech in Computer Science and Engineering, 2024

        SKILLS
        Languages: Python, TypeScript, SQL, C++, Java
        Web & APIs: FastAPI, React, Next.js, Docker, PostgreSQL, Redis, Tailwind
        CS Core: Data Structures, Algorithms, System Design, Operating Systems

        PROJECTS
        - Distributed Rate Limiter: Built a Redis-backed sliding window rate limiter reducing latency by 45% across 500k daily requests.
        - Placement Prep Platform: Architected Next.js and FastAPI real-time multi-agent mock interview simulation with automated telemetry.

        EXPERIENCE
        Software Engineering Intern (1.5 years experience)
        - Optimized database indexing in PostgreSQL improving query throughput by 35%.
        """

        result = asyncio.run(resume_parser.parse_text(sample_resume, target_role="SDE"))
        self.assertGreaterEqual(len(result.extracted_skills), 8)
        self.assertIn("Python", result.extracted_skills)
        self.assertIn("FastAPI", result.extracted_skills)
        self.assertIn("React", result.extracted_skills)
        self.assertIn("PostgreSQL", result.extracted_skills)
        self.assertGreater(result.ats_score, 70.0)
        self.assertEqual(result.experience_years, 1.5)
        self.assertGreaterEqual(len(result.extracted_projects), 2)

    def test_04_github_telemetry_fetcher(self):
        signals = github_fetcher.fetch_signals("testdeveloper")
        self.assertEqual(signals.username, "testdeveloper")
        self.assertGreaterEqual(signals.public_repos_count, 1)
        self.assertGreater(len(signals.top_languages), 0)
        self.assertIsNotNone(signals.primary_stack)

    def test_05_leetcode_telemetry_fetcher(self):
        signals = leetcode_fetcher.fetch_signals("testcoder")
        self.assertEqual(signals.username, "testcoder")
        self.assertGreater(signals.total_solved, 0)
        self.assertGreaterEqual(signals.easy_solved + signals.medium_solved + signals.hard_solved, signals.total_solved - 5)
        self.assertIsNotNone(signals.contest_rating)

    def test_06_student_state_onboarding_synthesis(self):
        payload = OnboardingSubmissionPayload(
            full_name="Priya Patel",
            email="priya@test.com",
            target_role="SDE",
            target_companies=["Google", "Meta"],
            daily_time_budget_minutes=120,
            target_deadline_days=30,
            preferred_language="python",
            resume_text="Experienced in Python, FastAPI, Docker, and Data Structures. Built microservices with 99.9% uptime.",
            github_username="priyapatel",
            leetcode_username="priyacodes",
            self_assessment_sliders={"arrays": 0.8, "dp": 0.4}
        )

        state = asyncio.run(student_state_service.process_onboarding(payload, user_id="usr_priya"))
        self.assertIsNotNone(state)
        self.assertEqual(state.profile.name, "Priya Patel")
        self.assertGreaterEqual(len(state.topic_states), 5)
        self.assertIn("arrays", state.topic_states)
        self.assertGreaterEqual(state.topic_states["arrays"].mastery, 0.40)
        self.assertGreater(state.overall_practice_score, 0.30)

        # Verify persisted state retrieval
        retrieved = student_state_service.get_state("usr_priya")
        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved.profile.email, "priya@test.com")

    def test_07_api_health_endpoint(self):
        res = self.client.get("/health")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "healthy")

    def test_08_api_auth_endpoints(self):
        reg_payload = {
            "email": "api_student@placement.ai",
            "password": "mypassword456",
            "name": "API Student"
        }
        res = self.client.post("/api/auth/register", json=reg_payload)
        self.assertEqual(res.status_code, 200)
        token = res.json()["access_token"]

        # Login
        login_res = self.client.post("/api/auth/login", json={
            "email": "api_student@placement.ai",
            "password": "mypassword456"
        })
        self.assertEqual(login_res.status_code, 200)

        # Protected /me
        me_res = self.client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(me_res.json()["email"], "api_student@placement.ai")

    def test_09_api_settings_endpoints(self):
        update_res = self.client.post("/api/settings/api-key", json={"gemini_api_key": "AIzaSyTestKey123"})
        self.assertEqual(update_res.status_code, 200)
        self.assertTrue(update_res.json()["gemini_connected"])

        status_res = self.client.get("/api/settings/api-status")
        self.assertEqual(status_res.status_code, 200)
        self.assertTrue(status_res.json()["has_key"])

    def test_10_api_onboarding_and_student_endpoints(self):
        onboarding_data = {
            "full_name": "Dev Sharma",
            "email": "dev@placement.ai",
            "target_role": "SDE",
            "target_companies": ["Amazon", "Uber"],
            "daily_time_budget_minutes": 90,
            "target_deadline_days": 60,
            "preferred_language": "python",
            "resume_text": "Skills: Python, TypeScript, React, SQL, Algorithms. Built distributed caching platform.",
            "github_username": "devsharma",
            "leetcode_username": "devcoder",
            "self_assessment_sliders": {"arrays": 0.75, "trees": 0.60}
        }

        # Submit onboarding
        res = self.client.post("/api/onboarding/submit", json=onboarding_data)
        self.assertEqual(res.status_code, 200)
        state_data = res.json()
        self.assertEqual(state_data["profile"]["name"], "Dev Sharma")

        # Standalone resume parse
        res_parse = self.client.post("/api/onboarding/parse-resume", json={
            "resume_text": "Python, Django, PostgreSQL, Docker, AWS, Data Structures",
            "target_role": "SDE"
        })
        self.assertEqual(res_parse.status_code, 200)
        self.assertIn("Python", res_parse.json()["extracted_skills"])

        # Fetch student profile
        res_prof = self.client.get("/api/student/profile")
        self.assertEqual(res_prof.status_code, 200)

        # Update profile
        res_upd = self.client.put("/api/student/profile", json={"daily_time_budget_minutes": 150})
        self.assertEqual(res_upd.status_code, 200)
        self.assertEqual(res_upd.json()["daily_time_budget_minutes"], 150)

        # Fetch telemetry
        res_telem = self.client.get("/api/student/telemetry")
        self.assertEqual(res_telem.status_code, 200)

        # Fetch audit logs
        res_audit = self.client.get("/api/student/audit-logs")
        self.assertEqual(res_audit.status_code, 200)


if __name__ == "__main__":
    unittest.main()
