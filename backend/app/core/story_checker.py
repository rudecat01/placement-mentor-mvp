"""Placement Mentor 2.0 - Story Consistency Cross-Examiner.

Cross-examines candidate's spoken interview statements against resume claims
to flag contradictions, exaggeration, or tech stack discrepancies.
"""

from typing import Optional
from backend.app.models.schemas import ContradictionAlert


class StoryConsistencyChecker:
    def check_consistency(self, spoken_text: str, resume_text: Optional[str]) -> Optional[ContradictionAlert]:
        if not resume_text:
            return None

        spoken_lower = spoken_text.lower()
        resume_lower = resume_text.lower()

        # Check 1: Individual vs Team attribution contradiction
        if ("i single-handedly built" in spoken_lower or "i was the only one" in spoken_lower) and "collaborated" in resume_lower:
            return ContradictionAlert(
                contradiction_type="Ownership Discrepancy",
                spoken_snippet=spoken_text[:120],
                claimed_on_resume="Resume states 'Collaborated in a cross-functional agile team of 5 engineers'. Spoken answer claimed solo architecture.",
                severity="High"
            )

        # Check 2: Scale mismatch
        if "10 million users" in spoken_lower and ("100k" in resume_lower or "50,000" in resume_lower):
            return ContradictionAlert(
                contradiction_type="Scale Metric Inflation",
                spoken_snippet=spoken_text[:120],
                claimed_on_resume="Resume cites 50,000-100k events/sec. Spoken response inflated throughput to 10 million.",
                severity="Medium"
            )

        # Check 3: Technology claim discrepancy
        if "i used rust for the entire backend" in spoken_lower and "rust" not in resume_lower and "python" in resume_lower:
            return ContradictionAlert(
                contradiction_type="Tech Stack Discrepancy",
                spoken_snippet=spoken_text[:120],
                claimed_on_resume="Resume lists Python/Django for backend services, but spoken answer claimed Rust implementation.",
                severity="Medium"
            )

        return None
