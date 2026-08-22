"""Placement Mentor 2.0 - Gemini LLM Integration Engine.

Connects to Google Gemini API (gemini-1.5-flash / gemini-2.0-flash) for live multi-agent cognitive reasoning:
1. Live Socratic Debugging Assistant
2. Dual-Agent Interview Panel (Interviewer + Shadow Critic)
3. Google XYZ Resume Doctor AI Rewriter
4. JD Semantic Entity Decomposer

Gracefully falls back to deterministic logic if no API key is provided or if network fails.
"""

import json
import os
import re
from typing import Any, Dict, List, Optional
from dotenv import load_dotenv

load_dotenv()


class GeminiAgentEngine:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "").strip()
        self._model = None
        self._init_gemini()

    def _init_gemini(self):
        if not self.api_key:
            return
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            self._model = genai.GenerativeModel("gemini-1.5-flash")
        except Exception as e:
            print(f"Warning: Gemini init failed: {e}")
            self._model = None

    def set_api_key(self, key: str):
        self.api_key = key.strip()
        self._init_gemini()

    def is_connected(self) -> bool:
        return bool(self.api_key and self._model)

    def generate_socratic_debug(
        self,
        problem_title: str,
        problem_topic: str,
        problem_statement: str,
        user_code: str,
        failed_test_input: Optional[str] = None,
        expected_output: Optional[str] = None,
        actual_output: Optional[str] = None,
        compiler_error: Optional[str] = None
    ) -> Dict[str, Any]:
        if not self.is_connected():
            return None

        prompt = f"""
You are the Socratic Debugging Assistant for a software engineering placement candidate.
Problem: {problem_title} ({problem_topic})
Statement: {problem_statement}

Candidate's Submitted Code:
```python
{user_code}
```

Error / Failure Context:
- Compiler/Runtime Error: {compiler_error or 'None'}
- Failed Test Input: {failed_test_input or 'N/A'}
- Expected Output: {expected_output or 'N/A'}
- Candidate Actual Output: {actual_output or 'N/A'}

TASK:
Do NOT provide the answer or code solution.
Act Socratically: Ask 1-2 sharp, targeted guiding questions that lead the candidate to spot their own bug.

Respond strictly in valid JSON:
{{
  "socratic_question": "...",
  "investigation_focus": "...",
  "suggested_micro_test": "..."
}}
"""
        try:
            resp = self._model.generate_content(prompt)
            raw = resp.text.strip()
            match = re.search(r'\{.*\}', raw, re.DOTALL)
            if match:
                return json.loads(match.group(0))
        except Exception as e:
            print(f"Gemini Socratic debug error: {e}")
        return None

    def generate_interview_turn(
        self,
        stage: str,
        topic: str,
        question: str,
        candidate_answer: str,
        resume_text: Optional[str] = None,
        turn_number: int = 1
    ) -> Dict[str, Any]:
        if not self.is_connected():
            return None

        prompt = f"""
You are simulating a Dual-Agent Technical Interview Panel for a top-tier software company.
Interview Stage: {stage}
Topic: {topic}
Interviewer Question: "{question}"
Candidate Answer: "{candidate_answer}"
Candidate's Resume Snippet: "{resume_text or 'N/A'}"
Turn Number: {turn_number} of 3

TASK:
1. SHADOW CRITIC: Silently score the candidate answer across 4 dimensions from 0 to 10:
   - technical_accuracy (0-10)
   - problem_solving_depth (0-10)
   - communication_clarity (0-10)
   - confidence_presence (0-10)
   Provide hidden critic notes and a dynamic follow-up prompt.
2. INTERVIEWER: Formulate the conversational hiring manager's next spoken response.

Respond strictly in valid JSON:
{{
  "interviewer_dialogue": "...",
  "shadow_critic": {{
    "technical_accuracy": 8.0,
    "problem_solving_depth": 7.5,
    "communication_clarity": 8.5,
    "confidence_presence": 8.0,
    "hidden_critic_notes": "...",
    "suggested_follow_up_prompt": "..."
  }},
  "contradiction_flag": null,
  "is_round_complete": false
}}
"""
        try:
            resp = self._model.generate_content(prompt)
            raw = resp.text.strip()
            match = re.search(r'\{.*\}', raw, re.DOTALL)
            if match:
                return json.loads(match.group(0))
        except Exception as e:
            print(f"Gemini Interview Turn error: {e}")
        return None

    def generate_xyz_rewrite(self, bullet_text: str) -> Dict[str, Any]:
        if not self.is_connected():
            return None

        prompt = f"""
You are the Google XYZ Resume Doctor.
Original Bullet Point: "{bullet_text}"

TASK:
Rewrite this bullet point strictly following the Google XYZ Formula:
"Accomplished [X], as measured by [Y], by doing [Z]"
Make it high-impact with strong active verbs and quantified engineering metrics.

Respond strictly in valid JSON:
{{
  "original_bullet": "{bullet_text}",
  "is_weak": true,
  "critique_reason": "...",
  "suggested_xyz_rewrite": "...",
  "improved_metrics": ["35% latency reduction", "500k+ daily queries", "99.9% uptime"]
}}
"""
        try:
            resp = self._model.generate_content(prompt)
            raw = resp.text.strip()
            match = re.search(r'\{.*\}', raw, re.DOTALL)
            if match:
                return json.loads(match.group(0))
        except Exception as e:
            print(f"Gemini Resume rewrite error: {e}")
        return None


# Global instance
gemini_engine = GeminiAgentEngine()
