"""
Placement Mentor 2.0 - Master Interview Question Bank Loader, Self-Updating & Fast Retrieval Engine
[OWNED BY MEMBER 3 - AI & AGENTS]

Features:
1. Candidate question retrieval and stage filtering for LLM semantic evaluation.
2. Semantic similarity & repetition prevention across session history.
3. Self-updating continuous learning: Dynamically persists validated LLM questions to disk.
4. Thread-safe singleton with mirrored synchronization across backend and shared constants.
"""

from __future__ import annotations
import json
import os
import re
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

SERVER_DATA_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "interview_questions.json"
SHARED_CONSTANTS_PATH = Path(__file__).resolve().parent.parent.parent.parent / "shared" / "constants" / "interview_questions.json"

STOP_WORDS: Set[str] = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", 
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", 
    "by", "can", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for", 
    "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", 
    "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "just", 
    "me", "more", "most", "my", "myself", "no", "nor", "not", "now", "of", "off", "on", "once", 
    "only", "or", "other", "our", "ours", "ourselves", "out", "over", "own", "s", "same", "she", 
    "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves", 
    "then", "there", "these", "they", "this", "those", "through", "to", "too", "under", "until", 
    "up", "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", 
    "why", "will", "with", "would", "you", "your", "yours", "yourself", "yourselves", "tell", 
    "walk", "mention", "mentioned", "describe", "explain", "worked", "built", "project", "system",
    "one", "recently", "specific", "problem", "solving"
}


def normalize_question_text(text: str) -> str:
    """Normalize question text for comparison by lowercasing and stripping punctuation."""
    return re.sub(r"[^\w\s]", "", text.lower()).strip()


def tokenize_text(text: str) -> Set[str]:
    """Extract clean content tokens excluding stop words."""
    words = re.findall(r"\b[a-zA-Z0-9_+#.-]+\b", text.lower())
    return {w for w in words if w not in STOP_WORDS and len(w) > 2}


def compute_similarity(text1: str, text2: str) -> float:
    """
    Computes Jaccard token similarity between two questions.
    Returns value between 0.0 and 1.0.
    """
    norm1 = normalize_question_text(text1)
    norm2 = normalize_question_text(text2)
    if norm1 == norm2 and norm1:
        return 1.0

    tokens1 = tokenize_text(text1)
    tokens2 = tokenize_text(text2)
    if not tokens1 or not tokens2:
        return 0.0
    intersection = tokens1.intersection(tokens2)
    union = tokens1.union(tokens2)
    return len(intersection) / len(union)


class QuestionBank:
    _instance: Optional['QuestionBank'] = None
    _lock: threading.RLock = threading.RLock()

    def __init__(self, filepath: Optional[Path] = None):
        self.filepath = filepath or SERVER_DATA_PATH
        self.shared_path = SHARED_CONSTANTS_PATH
        self.data: Dict[str, Any] = {}
        self.stages: List[Dict[str, Any]] = []
        self.questions_by_id: Dict[str, Dict[str, Any]] = {}
        self.questions_by_stage: Dict[str, List[Dict[str, Any]]] = {}
        self.load_questions()

    @classmethod
    def get_instance(cls) -> QuestionBank:
        with cls._lock:
            if cls._instance is None:
                cls._instance = QuestionBank()
            return cls._instance

    def load_questions(self) -> None:
        """Loads JSON question bank from file into in-memory indices."""
        with self._lock:
            if not self.filepath.exists():
                print(f"[QuestionBank] Warning: {self.filepath} not found.")
                return

            try:
                with open(self.filepath, "r", encoding="utf-8") as f:
                    self.data = json.load(f)
            except Exception as e:
                print(f"[QuestionBank] Error reading question bank: {e}")
                return

            self.stages = self.data.get("stages", [])
            self.questions_by_id.clear()
            self.questions_by_stage.clear()

            for stage in self.stages:
                stage_id = stage.get("stage_id", "")
                self.questions_by_stage[stage_id] = []
                for q in stage.get("questions", []):
                    q_id = q.get("id")
                    q["stage_id"] = stage_id
                    q["stage_number"] = stage.get("stage_number")
                    q["stage_name"] = stage.get("name")
                    self.questions_by_id[q_id] = q
                    self.questions_by_stage[stage_id].append(q)

    def _persist_to_disk(self) -> None:
        """Persists self.data to both server data path and shared constants."""
        try:
            # 1. Write server JSON
            self.filepath.parent.mkdir(parents=True, exist_ok=True)
            with open(self.filepath, "w", encoding="utf-8") as f:
                json.dump(self.data, f, indent=2, ensure_ascii=False)

            # 2. Write shared constants JSON
            if self.shared_path.parent.exists():
                with open(self.shared_path, "w", encoding="utf-8") as f:
                    json.dump(self.data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"[QuestionBank] Error persisting updated question bank: {e}")

    def get_all_stages(self) -> List[Dict[str, Any]]:
        """Returns all interview stages with their metadata."""
        return self.stages

    def get_stage_questions(self, stage_id: str) -> List[Dict[str, Any]]:
        """Returns all predefined questions for a specific stage."""
        aliases = {
            "BEHAVIORAL_LP": "STAGE_8_BEHAVIORAL",
            "RESUME_DEEP_DIVE": "STAGE_2_PROJECT_DEEP_DIVE",
            "LIVE_DSA": "STAGE_4_DSA",
            "CS_CORE": "STAGE_3_PROGRAMMING_FUNDAMENTALS",
            "HR_CULTURE_FIT": "STAGE_9_ROLE_FIT",
            "SYSTEM_DESIGN": "STAGE_7_SYSTEM_DESIGN",
            "STAGE_1": "STAGE_1_INTRO",
            "STAGE_2": "STAGE_2_PROJECT_DEEP_DIVE",
            "STAGE_3": "STAGE_3_PROGRAMMING_FUNDAMENTALS",
            "STAGE_4": "STAGE_4_DSA",
            "STAGE_5": "STAGE_5_CODING_FOLLOWUPS",
            "STAGE_6": "STAGE_6_CS_ENGINEERING",
            "STAGE_7": "STAGE_7_SYSTEM_DESIGN",
            "STAGE_8": "STAGE_8_BEHAVIORAL",
            "STAGE_9": "STAGE_9_ROLE_FIT",
        }
        resolved_stage = aliases.get(stage_id, stage_id)
        return self.questions_by_stage.get(resolved_stage, [])

    def get_question_by_id(self, question_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a single question by its unique ID."""
        return self.questions_by_id.get(question_id)

    def is_similar_to_existing(self, new_question_text: str, stage_id: str, threshold: float = 0.60) -> Tuple[bool, Optional[Dict[str, Any]]]:
        """
        Checks if a question is semantically identical/similar to an existing question in the bank.
        Returns (is_similar, matched_existing_question).
        """
        stage_questions = self.get_stage_questions(stage_id)
        for q in stage_questions:
            existing_text = q.get("question", "")
            sim = compute_similarity(new_question_text, existing_text)
            if sim >= threshold:
                return True, q
        return False, None

    def is_too_similar_to_history(self, candidate_question_text: str, asked_questions: List[str], threshold: float = 0.55) -> bool:
        """
        Checks if a candidate question has already been asked or is too similar to any previous question in the session.
        """
        if not asked_questions:
            return False
        for prev in asked_questions:
            sim = compute_similarity(candidate_question_text, prev)
            if sim >= threshold:
                return True
        return False

    def get_candidate_questions(
        self,
        stage_id: str,
        asked_question_ids: Optional[List[str]] = None,
        asked_question_texts: Optional[List[str]] = None,
        max_candidates: int = 8
    ) -> List[Dict[str, Any]]:
        """
        Retrieves unasked candidate questions from the current stage and adjacent stages
        for the LLM semantic evaluator to analyze and score.
        """
        asked_id_set = set(asked_question_ids or [])
        asked_texts = list(asked_question_texts or [])
        
        # Primary stage questions
        primary_questions = self.get_stage_questions(stage_id)
        candidates = []
        
        for q in primary_questions:
            q_id = q.get("id", "")
            q_text = q.get("question", "")
            if q_id not in asked_id_set and not self.is_too_similar_to_history(q_text, asked_texts):
                candidates.append(q)

        # If primary stage has fewer than max_candidates, pull from adjacent stage (e.g. STAGE_2 for project deep dive)
        if len(candidates) < max_candidates:
            adjacent_stages = ["STAGE_2_PROJECT_DEEP_DIVE", "STAGE_1_INTRO", "STAGE_6_CS_ENGINEERING"]
            for adj in adjacent_stages:
                if adj != stage_id:
                    for q in self.get_stage_questions(adj):
                        q_id = q.get("id", "")
                        q_text = q.get("question", "")
                        if q_id not in asked_id_set and not self.is_too_similar_to_history(q_text, asked_texts):
                            if q not in candidates:
                                candidates.append(q)
                        if len(candidates) >= max_candidates:
                            break
                if len(candidates) >= max_candidates:
                    break

        return candidates[:max_candidates]

    def add_generated_question(
        self,
        stage_id: str,
        question_text: str,
        topic: str = "Technical Deep Dive",
        subtopic: str = "Project Implementation",
        difficulty: str = "Medium",
        keywords: Optional[List[str]] = None,
        context_hint: str = "",
        parent_question_id: Optional[str] = None,
        target_companies: Optional[List[str]] = None,
        eval_criteria: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Dynamically adds a validated LLM-generated question to the Question Bank and persists to disk.
        Returns the created question dictionary.
        """
        with self._lock:
            # 1. Check for near-duplicate before adding
            is_sim, existing = self.is_similar_to_existing(question_text, stage_id, threshold=0.65)
            if is_sim and existing:
                return existing

            stage_questions = self.get_stage_questions(stage_id)
            count = len(stage_questions) + 1
            new_id = f"Q_{stage_id}_AUTO_{count:03d}_{datetime.now(timezone.utc).strftime('%H%M%S')}"

            if not keywords:
                extracted_kw = list(tokenize_text(question_text))[:6]
                keywords = extracted_kw or ["engineering", "architecture", "implementation"]

            new_q_obj: Dict[str, Any] = {
                "id": new_id,
                "topic": topic,
                "subtopic": subtopic,
                "difficulty": difficulty,
                "question": question_text.strip(),
                "context_hint": context_hint or f"Targeted follow-up probing {topic}.",
                "follow_ups": [
                    "What quantitative metrics did you observe after this choice?",
                    "What alternative approaches did you consider?"
                ],
                "eval_criteria": eval_criteria or ["Technical depth", "Architectural clarity", "Problem solving"],
                "target_companies": target_companies or ["Google", "Meta", "Amazon", "Microsoft"],
                "keywords": keywords,
                "source": "LLM-generated",
                "parent_question_id": parent_question_id,
                "times_asked": 1,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "last_asked": datetime.now(timezone.utc).isoformat()
            }

            # Add to stages list
            target_stage = None
            for s in self.stages:
                if s.get("stage_id") == stage_id:
                    target_stage = s
                    break

            if target_stage:
                target_stage.setdefault("questions", []).append(new_q_obj)
            else:
                self.stages.append({
                    "stage_id": stage_id,
                    "stage_number": len(self.stages) + 1,
                    "name": stage_id.replace("_", " ").title(),
                    "description": "Dynamic stage questions",
                    "questions": [new_q_obj]
                })

            # Update indices
            new_q_obj["stage_id"] = stage_id
            self.questions_by_id[new_id] = new_q_obj
            self.questions_by_stage.setdefault(stage_id, []).append(new_q_obj)

            # Persist to disk safely
            self._persist_to_disk()
            return new_q_obj

    def record_question_asked(self, question_id: str) -> None:
        """Updates question usage frequency."""
        with self._lock:
            q = self.questions_by_id.get(question_id)
            if q:
                q["times_asked"] = q.get("times_asked", 0) + 1
                q["last_asked"] = datetime.now(timezone.utc).isoformat()


# Global singleton helper
question_bank = QuestionBank.get_instance()
