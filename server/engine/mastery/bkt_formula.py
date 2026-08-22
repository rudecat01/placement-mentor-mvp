#
# Bayesian Knowledge Tracing (BKT) Mastery Update Engine
# [OWNED BY MEMBER 2 - ENGINE & MATH LEAD]
#

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional, List, Tuple

try:
    from schemas.mastery import PracticeAttemptEvidence, BKTParameters, BKTUpdateResult
    from engine.mastery.config import DEFAULT_BKT_PARAMS, clamp_mastery
    from engine.mastery.evidence import EvidenceCalculator
except ImportError:
    from ...schemas.mastery import PracticeAttemptEvidence, BKTParameters, BKTUpdateResult
    from .config import DEFAULT_BKT_PARAMS, clamp_mastery
    from .evidence import EvidenceCalculator


class BKTMasteryEngine:
    @staticmethod
    def update_mastery(
        current_mastery: float,
        evidence: PracticeAttemptEvidence,
        custom_params: Optional[BKTParameters] = None
    ) -> BKTUpdateResult:
        params = custom_params or DEFAULT_BKT_PARAMS
        clamped_current = clamp_mastery(current_mastery)

        slip = params.slip
        guess = params.guess

        # 1. P(correct) = M * (1 - Slip) + (1 - M) * Guess
        p_correct = clamped_current * (1.0 - slip) + (1.0 - clamped_current) * guess

        # 2. Posterior calculation
        if evidence.is_correct:
            posterior = (clamped_current * (1.0 - slip)) / p_correct if p_correct > 0 else clamped_current
        else:
            p_incorrect = 1.0 - p_correct
            posterior = (clamped_current * slip) / p_incorrect if p_incorrect > 0 else clamped_current

        posterior = clamp_mastery(posterior)

        # 3. Evidence Multiplier
        factors = EvidenceCalculator.calculate_factors(evidence)
        evidence_multiplier = EvidenceCalculator.calculate_composite_multiplier(factors)

        # 4. Base Gain
        base_gain = round(params.base_gain_scale * evidence_multiplier, 4)

        # 5. New Mastery Transition
        if evidence.is_correct:
            raw_new = posterior + base_gain * (1.0 - posterior)
        else:
            raw_new = (
                posterior
                - params.incorrect_multiplier_loss * (1.0 - evidence_multiplier)
                - params.incorrect_posterior_loss * (1.0 - posterior)
            )

        final_mastery = clamp_mastery(raw_new)
        delta = round(final_mastery - clamped_current, 4)

        return BKTUpdateResult(
            topic_id=evidence.topic_id,
            previous_mastery=clamped_current,
            p_correct=round(p_correct, 4),
            posterior=round(posterior, 4),
            multipliers=factors,
            evidence_multiplier=evidence_multiplier,
            base_gain=base_gain,
            new_mastery=final_mastery,
            delta=delta,
            is_correct=evidence.is_correct,
            calculated_at=datetime.now(timezone.utc).isoformat()
        )

    @staticmethod
    def batch_update(
        initial_mastery: float,
        attempts: List[PracticeAttemptEvidence],
        custom_params: Optional[BKTParameters] = None
    ) -> Tuple[float, List[BKTUpdateResult]]:
        current = initial_mastery
        history: List[BKTUpdateResult] = []

        for attempt in attempts:
            res = BKTMasteryEngine.update_mastery(current, attempt, custom_params)
            history.append(res)
            current = res.new_mastery

        return current, history
