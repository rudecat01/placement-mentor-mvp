"""Placement Mentor 2.0 - Multi-Factor Bayesian Knowledge Tracing (BKT) Engine.

Mathematical Formulation (Section 3.3 of PRD/Workflow):
- Standard Parameters: Slip (s) = 0.10, Guess (g) = 0.20
- Multi-factor Evidence Multiplier = Diff * Attempts * Hints * Complexity * Time
- Base Gain = 0.12 * EvidenceMultiplier
- If Correct: NewMastery = Posterior + BaseGain * (1 - Posterior)
- If Incorrect: NewMastery = Posterior - 0.08 * (1 - EvidenceMultiplier) - 0.02 * (1 - Posterior)
- Strictly bounded between [0.00, 1.00].
"""

from typing import Tuple
from backend.app.config import BKT_SETTINGS
from backend.app.models.schemas import AttemptEvidence


class BKTEngine:
    def __init__(
        self,
        p_slip: float = BKT_SETTINGS.p_slip,
        p_guess: float = BKT_SETTINGS.p_guess,
        base_gain: float = BKT_SETTINGS.base_gain
    ):
        self.p_slip = p_slip
        self.p_guess = p_guess
        self.base_gain = base_gain

    def compute_evidence_multiplier(self, evidence: AttemptEvidence) -> float:
        # 1. Difficulty Weight (1: 0.90, 2: 1.00, 3: 1.15, 4: 1.25)
        diff_weights = {1: 0.90, 2: 1.00, 3: 1.15, 4: 1.25}
        w_diff = diff_weights.get(evidence.difficulty, 1.00)

        # 2. Attempt Penalty (1: 1.00, 2: 0.85, 3: 0.70, 4+: 0.55)
        if evidence.attempts_count <= 1:
            w_attempts = 1.00
        elif evidence.attempts_count == 2:
            w_attempts = 0.85
        elif evidence.attempts_count == 3:
            w_attempts = 0.70
        else:
            w_attempts = 0.55

        # 3. Hint Penalty (0: 1.00, 1: 0.88, 2: 0.75, 3: 0.60)
        hint_weights = {0: 1.00, 1: 0.88, 2: 0.75, 3: 0.60}
        w_hints = hint_weights.get(min(3, evidence.hints_requested), 0.60)

        # 4. Complexity & Test cases pass ratio
        pass_ratio = evidence.test_cases_passed / max(1, evidence.test_cases_total) if evidence.test_cases_total > 0 else (1.0 if evidence.verdict == "Accepted" else 0.0)
        w_complexity = 1.00 if (evidence.verdict == "Accepted" and pass_ratio >= 1.0) else (0.40 * pass_ratio)

        # 5. Time Multiplier (pacing efficiency)
        est = max(60.0, evidence.estimated_seconds)
        spent = max(1.0, evidence.time_spent_seconds)
        ratio = spent / est
        if ratio <= 0.80:
            w_time = 1.05
        elif ratio <= 1.20:
            w_time = 1.00
        elif ratio <= 1.80:
            w_time = 0.85
        else:
            w_time = 0.70

        multiplier = w_diff * w_attempts * w_hints * w_complexity * w_time
        return max(0.05, min(1.50, multiplier))

    def calculate_posterior(self, prior_mastery: float, is_correct: bool) -> float:
        l = max(0.001, min(0.999, prior_mastery))
        s = self.p_slip
        g = self.p_guess

        if is_correct:
            numerator = l * (1.0 - s)
            denominator = numerator + (1.0 - l) * g
        else:
            numerator = l * s
            denominator = numerator + (1.0 - l) * (1.0 - g)

        return numerator / denominator if denominator > 0 else l

    def update_mastery(self, prior_mastery: float, evidence: AttemptEvidence) -> Tuple[float, float, float]:
        is_correct = (evidence.verdict == "Accepted")
        posterior = self.calculate_posterior(prior_mastery, is_correct)
        multiplier = self.compute_evidence_multiplier(evidence)
        gain = self.base_gain * multiplier

        if is_correct:
            new_mastery = posterior + gain * (1.0 - posterior)
        else:
            new_mastery = posterior - 0.08 * (1.0 - multiplier) - 0.02 * (1.0 - posterior)

        clamped_mastery = max(BKT_SETTINGS.min_mastery, min(BKT_SETTINGS.max_mastery, new_mastery))
        return clamped_mastery, posterior, multiplier

    def update_practice_score(self, current_practice_score: float, evidence: AttemptEvidence) -> float:
        is_correct = (evidence.verdict == "Accepted")
        multiplier = self.compute_evidence_multiplier(evidence)
        delta = 0.10 * multiplier if is_correct else -0.06 * (1.0 - multiplier + 0.2)
        new_score = current_practice_score + delta
        return max(0.0, min(1.0, new_score))
