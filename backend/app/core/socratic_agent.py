"""Placement Mentor 2.0 - 3-Tier Progressive Hint & Socratic Debugging Assistant.

Provides:
- Tiered Progressive Hints (Tier 1: Intuition/Pattern -> Tier 2: Structure/Data Structure -> Tier 3: Edge Cases).
- Socratic Debugger: Inspects user code and test failure verdicts, asking guided questions without disclosing solutions.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from backend.app.models.schemas import Problem



class SocraticHintResponse(BaseModel):
    problem_id: str
    hint_tier: int  # 1, 2, or 3
    tier_title: str
    hint_content: str
    remaining_tiers: int


class SocraticDebugResponse(BaseModel):
    socratic_question: str
    investigation_focus: str
    suggested_micro_test: Optional[str] = None


class SocraticAgent:
    def get_tiered_hint(self, problem: Problem, requested_tier: int) -> SocraticHintResponse:
        """Returns the appropriate tier hint from the problem specification."""
        tier = max(1, min(3, requested_tier))
        tier_key = str(tier)

        tier_titles = {
            1: "Tier 1: Algorithmic Pattern & Intuition",
            2: "Tier 2: Data Structure & Structural Logic",
            3: "Tier 3: Edge Cases & Computational Complexity"
        }

        default_hints = {
            1: f"Look closely at the constraints for '{problem.title}'. Can you reformulate this problem as an instance of {problem.topic}?",
            2: f"Consider which auxiliary data structure gives you O(1) lookups or maintenance while traversing elements.",
            3: f"Check boundary limits: what happens when inputs are empty, zero, negative, or single-element?"
        }

        content = problem.hints.get(tier_key, default_hints[tier])

        return SocraticHintResponse(
            problem_id=problem.id,
            hint_tier=tier,
            tier_title=tier_titles[tier],
            hint_content=content,
            remaining_tiers=3 - tier
        )

    def generate_socratic_debug_guidance(
        self,
        problem: Problem,
        user_code: str,
        failed_test_input: Optional[Any] = None,
        expected_output: Optional[Any] = None,
        actual_output: Optional[Any] = None,
        compiler_error: Optional[str] = None
    ) -> SocraticDebugResponse:
        """Generates a targeted Socratic coaching question based on failure mode."""
        # Case 1: Compiler / Syntax / Runtime Error
        if compiler_error:
            if "IndexError" in compiler_error or "out of range" in compiler_error:
                return SocraticDebugResponse(
                    socratic_question="Trace your array index boundaries. When your loop reaches its final iteration, does your pointer exceed `len(nums) - 1`?",
                    investigation_focus="Loop boundary condition",
                    suggested_micro_test="Test with an array of length 1 or 2 to see the exact loop bounds."
                )
            elif "ZeroDivisionError" in compiler_error or "division by zero" in compiler_error:
                return SocraticDebugResponse(
                    socratic_question="What happens when an incoming or outgoing element in your window equals zero? How can you track zeros without dividing?",
                    investigation_focus="Zero divisor handling",
                    suggested_micro_test="Try a test case containing zeros: `[0, 5, 2]`."
                )
            else:
                return SocraticDebugResponse(
                    socratic_question=f"Your submission raised a `{compiler_error.split(':')[0]}`. Which line or variable state is triggering this unexpected condition?",
                    investigation_focus="Runtime exception investigation",
                    suggested_micro_test=None
                )

        # Case 2: Wrong Answer on Test Case
        if failed_test_input:
            if "0" in str(failed_test_input) or "-" in str(failed_test_input):
                return SocraticDebugResponse(
                    socratic_question=f"On input `{failed_test_input}`, your code returned `{actual_output}` instead of `{expected_output}`. How does your algorithm handle negative values or zeros?",
                    investigation_focus="Signed & zero boundary logic",
                    suggested_micro_test=f"Simulate your step-by-step loop on `{failed_test_input}` with pen and paper."
                )
            else:
                return SocraticDebugResponse(
                    socratic_question=f"For input `{failed_test_input}`, you produced `{actual_output}` whereas the optimal output is `{expected_output}`. Are you updating your sliding window state before or after adjusting your left pointer?",
                    investigation_focus="Window contraction sequencing",
                    suggested_micro_test=f"Print the window state at each iteration for `{failed_test_input}`."
                )

        return SocraticDebugResponse(
            socratic_question="What invariant must hold true across all iterations of your algorithm?",
            investigation_focus="Algorithmic invariant verification",
            suggested_micro_test="Walk through a basic 3-element example by hand."
        )
