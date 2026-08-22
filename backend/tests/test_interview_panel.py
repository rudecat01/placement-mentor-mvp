"""Placement Mentor 2.0 - Dual-Agent Mock Interview & Adversarial Coach Tests."""

import pytest
from backend.app.core.adversarial_coach import AdversarialCoachEngine
from backend.app.core.interview_panel import InterviewPanelEngine
from backend.app.core.story_checker import StoryConsistencyChecker
from backend.app.models.schemas import InterviewRoundStage


def test_story_consistency_contradiction_detection():
    checker = StoryConsistencyChecker()
    resume_text = "Collaborated in an agile team of 5 engineers to build microservices."
    spoken_answer = "I single-handedly built the entire microservice architecture myself without anyone else."

    alert = checker.check_consistency(spoken_answer, resume_text)
    assert alert is not None
    assert alert.contradiction_type == "Ownership Discrepancy"


def test_speech_biometrics_analysis():
    engine = InterviewPanelEngine()
    candidate_answer = "Umm basically like we can use umm a hash map to look up keys in O(1) time."
    biometrics = engine.analyze_speech_biometrics(candidate_answer, duration_seconds=15.0)

    assert biometrics.filler_words_count >= 2
    assert biometrics.confidence_score < 0.95
    assert biometrics.words_per_minute > 0


def test_interview_panel_dual_agent_turn():
    engine = InterviewPanelEngine()
    turn_res = engine.process_turn(
        stage=InterviewRoundStage.CS_CORE,
        current_question="How does indexing improve SQL queries?",
        candidate_answer="B-Tree indexes reduce disk I/O from O(N) linear scan to O(log N) logarithmic search, though they introduce write overhead on inserts.",
        turn_number=1,
        topic="Databases"
    )

    assert turn_res.shadow_critic_evaluation.technical_accuracy >= 8.0
    assert turn_res.shadow_critic_evaluation.hidden_critic_notes is not None
    assert "scaling" in turn_res.interviewer_dialogue.lower() or "scale" in turn_res.interviewer_dialogue.lower()


def test_adversarial_coach_red_vs_blue_teams():
    coach = AdversarialCoachEngine()
    red_drill = coach.generate_red_team_drill("Sliding Window", "Product Window")
    assert red_drill["time_limit_minutes"] == 15
    assert "Live Constraint Shift" in red_drill["adversarial_twist"]

    blue_guide = coach.generate_blue_team_guide("Dynamic Programming")
    assert len(blue_guide["think_aloud_template"]) == 5
