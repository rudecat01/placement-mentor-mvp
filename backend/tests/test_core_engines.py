"""Placement Mentor 2.0 - Core Engine Unit & Integration Tests.

Validates:
1. Exact BKT formulas and worked example from Section 3.3 of the PRD/Workflow.
2. PTG calculation, transfer categorization, and Blue/Red adversarial interventions.
3. Interview Eligibility Gates (Immediate vs Later vs Gated).
4. Skill DAG prerequisite validation and root-cause backtracking.
5. Memory Decay and Spaced Repetition triggers.
6. Roadmap Planner strict fixed daily time budget conservation.
"""

from datetime import datetime, timedelta
import pytest

from backend.app.core.bkt_engine import BKTEngine
from backend.app.core.decay_engine import MemoryDecayEngine
from backend.app.core.eligibility_gate import EligibilityGate, GateStatus
from backend.app.core.ptg_engine import PTGEngine, PTGTransferCategory
from backend.app.core.roadmap_planner import RoadmapPlanner
from backend.app.core.skill_dag import build_default_skill_dag, SkillDAG
from backend.app.models.schemas import (
    AttemptEvidence,
    MemoryDecayState,
    Problem,
    SkillNode,
    StudentProfile,
)


@pytest.fixture
def bkt_engine():
    return BKTEngine(p_slip=0.10, p_guess=0.20, base_gain=0.12)


@pytest.fixture
def ptg_engine():
    return PTGEngine(good_threshold=0.10, high_threshold=0.25)


@pytest.fixture
def gate_evaluator():
    return EligibilityGate()


@pytest.fixture
def sample_problem():
    return Problem(
        id="arr_023",
        title="Product Window",
        topic="Sliding Window",
        difficulty=2,
        estimated_minutes=30,
        statement="Test statement"
    )


# -------------------------------------------------------------
# 1. BKT FORMULAS & WORKED EXAMPLE (Section 3.3)
# -------------------------------------------------------------

def test_bkt_worked_example_from_workflow_spec(bkt_engine):
    prior_mastery = 0.60
    evidence = AttemptEvidence(
        id="att_test_1",
        problem_id="arr_023",
        topic="Sliding Window",
        submitted_code="def productWindow(): pass",
        language="python",
        verdict="Accepted",
        difficulty=2,
        attempts_count=1,
        hints_requested=0,
        time_spent_seconds=1500.0,
        estimated_seconds=1800.0,
        test_cases_passed=4,
        test_cases_total=4
    )

    new_mastery, posterior, multiplier = bkt_engine.update_mastery(prior_mastery, evidence)

    assert abs(posterior - 0.871) < 0.01
    assert multiplier >= 0.95
    assert new_mastery > 0.87
    assert new_mastery <= 1.0


def test_bkt_incorrect_attempt_and_bounds(bkt_engine):
    prior_mastery = 0.70
    evidence = AttemptEvidence(
        id="att_test_2",
        problem_id="arr_023",
        topic="Sliding Window",
        submitted_code="def productWindow(): fail",
        language="python",
        verdict="Wrong Answer",
        difficulty=2,
        attempts_count=2,
        hints_requested=1,
        time_spent_seconds=2400.0,
        estimated_seconds=1800.0,
        test_cases_passed=1,
        test_cases_total=4
    )

    new_mastery, posterior, multiplier = bkt_engine.update_mastery(prior_mastery, evidence)
    assert new_mastery < prior_mastery
    assert new_mastery >= 0.0


# -------------------------------------------------------------
# 2. PTG & COACHING CLASSIFICATION
# -------------------------------------------------------------

def test_ptg_calculation_and_categories(ptg_engine):
    assert ptg_engine.calculate_ptg(0.85, 0.80) == 0.05
    assert ptg_engine.categorize_transfer(0.05) == PTGTransferCategory.GOOD_TRANSFER

    assert ptg_engine.calculate_ptg(0.85, 0.70) == 0.15
    assert ptg_engine.categorize_transfer(0.15) == PTGTransferCategory.MODERATE_WEAKNESS

    assert ptg_engine.calculate_ptg(0.85, 0.50) == 0.35
    assert ptg_engine.categorize_transfer(0.35) == PTGTransferCategory.HIGH_TRANSFER_GAP

    strat = ptg_engine.recommend_coaching_strategy(0.35, "Sliding Window")
    assert strat["strategy"] == "red_team_adversary"


# -------------------------------------------------------------
# 3. INTERVIEW ELIGIBILITY GATES
# -------------------------------------------------------------

def test_interview_eligibility_gates(gate_evaluator):
    ready_skills = [
        SkillNode(id="s1", name="Arrays", category="dsa", mastery=0.80, practice_score=0.75, is_critical_for_role=True),
        SkillNode(id="s2", name="Trees", category="dsa", mastery=0.78, practice_score=0.72, is_critical_for_role=True),
        SkillNode(id="s3", name="APIs", category="development", mastery=0.85, practice_score=0.80, is_critical_for_role=True),
    ]
    res = gate_evaluator.evaluate_readiness(ready_skills)
    assert res["status"] == GateStatus.UNLOCKED_IMMEDIATE
    assert res["is_eligible"] is True

    unready_skills = [
        SkillNode(id="s1", name="Arrays", category="dsa", mastery=0.45, practice_score=0.40, is_critical_for_role=True),
        SkillNode(id="s2", name="Trees", category="dsa", mastery=0.50, practice_score=0.45, is_critical_for_role=True),
    ]
    gated_res = gate_evaluator.evaluate_readiness(unready_skills)
    assert gated_res["status"] == GateStatus.GATED
    assert gated_res["is_eligible"] is False


# -------------------------------------------------------------
# 4. SKILL DAG & CAUSAL ROOT-CAUSE BACKTRACKING
# -------------------------------------------------------------

def test_skill_dag_root_cause_backtracking():
    skills = [
        SkillNode(id="arrays", name="Arrays & Hashing", category="dsa", mastery=0.45),
        SkillNode(id="sliding_window", name="Sliding Window", category="dsa", prerequisites=["arrays"], mastery=0.30),
    ]
    dag = SkillDAG(skills)
    root_cause = dag.backtrack_root_cause_deficit("sliding_window", deficit_threshold=0.60)
    assert root_cause is not None
    assert root_cause.id == "arrays"


def test_topological_sort_order():
    skills = build_default_skill_dag()
    dag = SkillDAG(skills)
    ordered = dag.get_topological_order()
    ordered_ids = [s.id for s in ordered]

    assert ordered_ids.index("arrays_hashing") < ordered_ids.index("two_pointers")
    assert ordered_ids.index("two_pointers") < ordered_ids.index("sliding_window")


# -------------------------------------------------------------
# 5. MEMORY DECAY & FORGETTING CURVE
# -------------------------------------------------------------

def test_memory_decay_lifecycle():
    engine = MemoryDecayEngine()
    now = datetime.utcnow()

    recent_node = SkillNode(
        id="s1", name="Arrays", category="dsa", mastery=0.85,
        last_practiced_at=now - timedelta(days=1), stability_days=14.0
    )
    mastery, state, needs_rev = engine.calculate_decayed_mastery(recent_node, now)
    assert mastery > 0.78
    assert state == MemoryDecayState.MASTERED
    assert needs_rev is False

    decayed_node = SkillNode(
        id="s2", name="DP", category="dsa", mastery=0.75,
        last_practiced_at=now - timedelta(days=30), stability_days=7.0
    )
    d_mastery, d_state, d_needs_rev = engine.calculate_decayed_mastery(decayed_node, now)
    assert d_mastery < 0.35
    assert d_state == MemoryDecayState.WEAK
    assert d_needs_rev is True


# -------------------------------------------------------------
# 6. ROADMAP PLANNER STRICT BUDGET CONSERVATION
# -------------------------------------------------------------

def test_roadmap_planner_fixed_daily_budget_invariant():
    planner = RoadmapPlanner()
    profile = StudentProfile(daily_time_budget_minutes=120)
    skills = build_default_skill_dag()
    problems = [
        Problem(id="p1", title="Prob 1", topic="Arrays & Hashing", statement="..."),
        Problem(id="p2", title="Prob 2", topic="Two Pointers", statement="...")
    ]

    plan, audits = planner.generate_daily_plan(profile, skills, problems, day_number=1)

    assert plan.total_allocated_minutes == 120
    assert sum(t.estimated_minutes for t in plan.tasks) == 120
    assert len(audits) > 0


def test_roadmap_planner_ptg_red_team_drill_injection():
    planner = RoadmapPlanner()
    profile = StudentProfile(daily_time_budget_minutes=120)
    skills = build_default_skill_dag()

    # Artificially assign high PTG to Sliding Window
    for s in skills:
        if s.id == "sliding_window":
            s.practice_score = 0.85
            s.interview_score = 0.50
            s.ptg = 0.35

    plan, audits = planner.generate_daily_plan(profile, skills, [], day_number=1)
    task_types = [t.task_type for t in plan.tasks]

    assert "red_team_pressure" in task_types
    assert plan.total_allocated_minutes == 120
