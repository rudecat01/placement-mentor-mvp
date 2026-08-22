"""
Comprehensive Automated Unit Test Suite for Member 2 (Engine & Math) in Python
"""

import sys
import os
import unittest

# Ensure server package is on python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from server.schemas.mastery import PracticeAttemptEvidence, BKTParameters
from server.engine.mastery.bkt_formula import BKTMasteryEngine
from server.engine.mastery.evidence import EvidenceCalculator
from server.engine.scores.practice_score import PracticeScoreCalculator
from server.engine.scores.interview_score import InterviewScoreCalculator
from server.engine.scores.ptg_calculator import PTGCalculator
from server.engine.skill_graph.dag_solver import DAGSolver
from server.engine.skill_graph.root_cause import RootCauseAnalyzer
from server.engine.eligibility.gate_checker import InterviewGateChecker
from server.engine.resources.web_dev_map import WEB_DEV_COMPETENCY_MAP
from server.engine.resources.sde_map import SDE_COMPETENCY_MAP
from server.engine.resources.resource_catalog import ResourceCatalogService


class TestMember2EngineAndMath(unittest.TestCase):

    # -------------------------------------------------------------
    # 1. BKT MASTERY ENGINE & WORKED EXAMPLE (PRD SECTION 3.3)
    # -------------------------------------------------------------
    def test_prd_section_3_3_worked_example(self):
        """Validates the exact worked example in PRD Section 3.3: M=0.60 -> ~0.883"""
        evidence = PracticeAttemptEvidence(
            topic_id="graphs-traversal",
            is_correct=True,
            difficulty="MEDIUM",
            hints_used=2,
            attempt_count=2,
            complexity_match="OPTIMAL",
            time_efficiency="OPTIMAL"
        )

        result = BKTMasteryEngine.update_mastery(0.60, evidence)

        # P(correct) = 0.60 * 0.90 + 0.40 * 0.20 = 0.62
        self.assertEqual(result.p_correct, 0.62)

        # Posterior = 0.54 / 0.62 = 0.8710
        self.assertEqual(result.posterior, 0.871)

        # EvidenceMultiplier = 1.00 * 0.90 * 0.84 * 1.00 * 1.00 = 0.756
        self.assertEqual(result.evidence_multiplier, 0.756)

        # BaseGain = 0.12 * 0.756 = 0.09072 -> 0.0907
        self.assertEqual(result.base_gain, 0.0907)

        # NewMastery = 0.871 + 0.0907 * (1 - 0.871) = 0.8827 -> ~0.883
        self.assertAlmostEqual(result.new_mastery, 0.8827, places=3)
        self.assertGreater(result.delta, 0)

    def test_bkt_difficulty_sensitivity(self):
        """Hard problem should yield higher new mastery than Easy problem"""
        hard_ev = PracticeAttemptEvidence(topic_id="dp", is_correct=True, difficulty="HARD")
        easy_ev = PracticeAttemptEvidence(topic_id="dp", is_correct=True, difficulty="EASY")

        hard_res = BKTMasteryEngine.update_mastery(0.50, hard_ev)
        easy_res = BKTMasteryEngine.update_mastery(0.50, easy_ev)

        self.assertGreater(hard_res.new_mastery, easy_res.new_mastery)

    def test_bkt_incorrect_attempt_penalizes_mastery(self):
        """Incorrect attempt reduces mastery"""
        ev = PracticeAttemptEvidence(
            topic_id="trees",
            is_correct=False,
            difficulty="MEDIUM",
            hints_used=3,
            attempt_count=4,
            complexity_match="POOR",
            time_efficiency="SLOW"
        )
        res = BKTMasteryEngine.update_mastery(0.70, ev)
        self.assertLess(res.new_mastery, 0.70)
        self.assertLess(res.delta, 0)

    def test_bkt_bounds_clamping(self):
        """Mastery strictly bounded to [0.00, 1.00]"""
        high_ev = PracticeAttemptEvidence(topic_id="arrays", is_correct=True, difficulty="HARD")
        high_res = BKTMasteryEngine.update_mastery(0.98, high_ev)
        self.assertLessEqual(high_res.new_mastery, 1.00)

        low_ev = PracticeAttemptEvidence(topic_id="arrays", is_correct=False, difficulty="EASY", hints_used=3, attempt_count=4)
        low_res = BKTMasteryEngine.update_mastery(0.02, low_ev)
        self.assertGreaterEqual(low_res.new_mastery, 0.00)

    def test_bkt_batch_sequential_update(self):
        """Batch sequential attempts raise mastery above 0.85"""
        attempts = [
            PracticeAttemptEvidence(topic_id="pointers", is_correct=True, difficulty="EASY"),
            PracticeAttemptEvidence(topic_id="pointers", is_correct=True, difficulty="MEDIUM", hints_used=1),
            PracticeAttemptEvidence(topic_id="pointers", is_correct=True, difficulty="HARD")
        ]
        final_m, history = BKTMasteryEngine.batch_update(0.30, attempts)
        self.assertEqual(len(history), 3)
        self.assertGreater(final_m, 0.85)

    # -------------------------------------------------------------
    # 2. SCORES & PERFORMANCE TRANSFER GAP (PTG) TESTS
    # -------------------------------------------------------------
    def test_practice_score_recency_weighting(self):
        attempts = [
            PracticeAttemptEvidence(topic_id="window", is_correct=False, difficulty="MEDIUM", hints_used=2, attempt_count=3),
            PracticeAttemptEvidence(topic_id="window", is_correct=True, difficulty="MEDIUM"),
            PracticeAttemptEvidence(topic_id="window", is_correct=True, difficulty="HARD")
        ]
        score = PracticeScoreCalculator.calculate_topic_practice_score(attempts)
        self.assertGreaterEqual(score, 0.75)

    def test_ptg_good_transfer(self):
        eval_res = PTGCalculator.evaluate_ptg("arrays", "Arrays & Hashing", 0.85, 0.80)
        self.assertEqual(eval_res.ptg, 0.05)
        self.assertEqual(eval_res.severity, "GOOD_TRANSFER")
        self.assertEqual(eval_res.intervention_type, "STANDARD_PROGRESSION")

    def test_ptg_moderate_gap(self):
        eval_res = PTGCalculator.evaluate_ptg("trees", "Trees & BST", 0.82, 0.65)
        self.assertEqual(eval_res.ptg, 0.17)
        self.assertEqual(eval_res.severity, "MODERATE_GAP")
        self.assertEqual(eval_res.intervention_type, "TARGETED_PRACTICE")

    def test_ptg_high_gap_triggers_red_team(self):
        eval_res = PTGCalculator.evaluate_ptg("graphs", "Graphs Traversal", 0.82, 0.42)
        self.assertEqual(eval_res.ptg, 0.40)
        self.assertEqual(eval_res.severity, "HIGH_GAP")
        self.assertEqual(eval_res.intervention_type, "RED_TEAM_PRESSURE")
        self.assertIn("Red Team", eval_res.actionable_drill)

    # -------------------------------------------------------------
    # 3. SKILL GRAPH DAG SOLVER TESTS
    # -------------------------------------------------------------
    def test_web_dev_map_dag_validity(self):
        val = DAGSolver.validate_graph(WEB_DEV_COMPETENCY_MAP)
        self.assertTrue(val.is_valid)
        self.assertFalse(val.has_cycles)
        self.assertEqual(len(val.topological_order), len(WEB_DEV_COMPETENCY_MAP.nodes))

    def test_sde_map_dag_validity(self):
        val = DAGSolver.validate_graph(SDE_COMPETENCY_MAP)
        self.assertTrue(val.is_valid)
        self.assertFalse(val.has_cycles)
        self.assertEqual(len(val.topological_order), len(SDE_COMPETENCY_MAP.nodes))

    def test_prerequisite_fulfillment_logic(self):
        sw_node = next(n for n in SDE_COMPETENCY_MAP.nodes if n.id == "sliding-window")
        is_met, missing = DAGSolver.are_prerequisites_met(sw_node, {"two-pointers": 0.50})
        self.assertFalse(is_met)
        self.assertEqual(missing, ["two-pointers"])

        is_met, missing = DAGSolver.are_prerequisites_met(sw_node, {"two-pointers": 0.75})
        self.assertTrue(is_met)
        self.assertEqual(missing, [])

    def test_get_unlocked_topics(self):
        mastery = {"arrays-hashing": 0.80, "two-pointers": 0.40}
        unlocked = DAGSolver.get_unlocked_topics(SDE_COMPETENCY_MAP, mastery)
        unlocked_ids = [u.id for u in unlocked]
        self.assertIn("two-pointers", unlocked_ids)
        self.assertIn("stacks-queues", unlocked_ids)
        self.assertIn("binary-search", unlocked_ids)
        self.assertNotIn("trees-binary-search-tree", unlocked_ids)

    # -------------------------------------------------------------
    # 4. CAUSAL ROOT CAUSE ANALYZER TESTS
    # -------------------------------------------------------------
    def test_diagnoses_prerequisite_bottleneck(self):
        mastery = {
            "arrays-hashing": 0.85,
            "two-pointers": 0.35,
            "sliding-window": 0.30
        }
        diag = RootCauseAnalyzer.diagnose(SDE_COMPETENCY_MAP, "sliding-window", mastery)
        self.assertIsNotNone(diag)
        self.assertEqual(diag.failed_topic_id, "sliding-window")
        self.assertEqual(diag.root_cause_node_id, "two-pointers")
        self.assertEqual(diag.current_mastery, 0.35)
        self.assertIn("Two Pointers", diag.explanation)

    def test_diagnoses_localized_failure(self):
        mastery = {
            "arrays-hashing": 0.90,
            "two-pointers": 0.85,
            "sliding-window": 0.40
        }
        diag = RootCauseAnalyzer.diagnose(SDE_COMPETENCY_MAP, "sliding-window", mastery)
        self.assertIsNotNone(diag)
        self.assertEqual(diag.root_cause_node_id, "sliding-window")
        self.assertIn("localized", diag.explanation)

    # -------------------------------------------------------------
    # 5. INTERVIEW READINESS GATE EVALUATOR TESTS
    # -------------------------------------------------------------
    def test_immediate_gate_unlock(self):
        mastery = {n.id: 0.78 for n in SDE_COMPETENCY_MAP.nodes}
        res = InterviewGateChecker.evaluate_gate(SDE_COMPETENCY_MAP, mastery, 0.75)
        self.assertEqual(res.status, "IMMEDIATE_UNLOCK")
        self.assertTrue(res.is_unlocked)

    def test_later_gate_unlock(self):
        mastery = {n.id: 0.71 for n in SDE_COMPETENCY_MAP.nodes}
        res = InterviewGateChecker.evaluate_gate(SDE_COMPETENCY_MAP, mastery, 0.66)
        self.assertEqual(res.status, "LATER_UNLOCK")
        self.assertTrue(res.is_unlocked)

    def test_gated_with_missing_criteria(self):
        mastery = {"arrays-hashing": 0.70, "two-pointers": 0.45}
        res = InterviewGateChecker.evaluate_gate(SDE_COMPETENCY_MAP, mastery, 0.50)
        self.assertEqual(res.status, "GATED")
        self.assertFalse(res.is_unlocked)
        self.assertGreater(len(res.missing_criteria), 0)
        self.assertGreater(len(res.recommendations), 0)

    # -------------------------------------------------------------
    # 6. RESOURCE CATALOG TESTS
    # -------------------------------------------------------------
    def test_curated_resource_catalog(self):
        all_res = ResourceCatalogService.get_all_resources()
        self.assertGreaterEqual(len(all_res), 15)

        react_res = ResourceCatalogService.get_resources_by_topic("react-fundamentals")
        self.assertGreater(len(react_res), 0)
        self.assertTrue(react_res[0].is_verified)
        self.assertTrue(react_res[0].url.startswith("https://"))


if __name__ == "__main__":
    unittest.main(verbosity=2)
