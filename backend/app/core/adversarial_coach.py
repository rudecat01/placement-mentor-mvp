"""Placement Mentor 2.0 - Adversarial Red Team vs Blue Team Coaching Engine.

Behaviors:
- Red Team (Adversary): Injected when PTG > 0.25. High-pressure 15-minute speed drills, sudden constraint shifts, and curveball edge cases.
- Blue Team (Coach): Concept scaffolding, think-aloud guided templates, and positive reinforcement.
"""

from typing import Dict, List


class AdversarialCoachEngine:
    def generate_red_team_drill(self, topic: str, current_problem_title: str) -> Dict[str, any]:
        """Generates an adversarial scenario with dynamic constraint shifts and time pressure."""
        return {
            "drill_type": "red_team_pressure",
            "topic": topic,
            "target_problem": current_problem_title,
            "time_limit_minutes": 15,
            "adversarial_twist": "Live Constraint Shift: The input array is now a continuous infinite real-time data stream arriving via WebSockets. You can no longer store all elements in memory.",
            "pressure_prompt": "Explain how your algorithm maintains O(1) space auxiliary guarantees while outputting running answers within a strict 15-minute countdown.",
            "evaluation_criteria": ["Space complexity strictly O(1)", "Mental agility under surprise constraint change", "Fluid verbalization"]
        }

    def generate_blue_team_guide(self, topic: str) -> Dict[str, any]:
        """Generates a supportive step-by-step think-aloud framework."""
        return {
            "drill_type": "blue_team_think_aloud",
            "topic": topic,
            "think_aloud_template": [
                "1. State the input format, output format, and constraints aloud.",
                "2. State a brute-force approach and explain why its time complexity is suboptimal.",
                "3. Introduce the optimized pattern (e.g. Sliding Window / Two Pointers / Hash Map).",
                "4. Trace with an example test case before writing code.",
                "5. Walk through edge cases (empty input, negative numbers, duplicates)."
            ],
            "confidence_booster": "Take a deep breath. Focus on communicating your thought process clearly rather than jumping directly to syntax."
        }
