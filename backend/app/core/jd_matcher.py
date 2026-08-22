"""Placement Mentor 2.0 - Job Description Decomposer & Skill Delta Matcher.

Extracts tech stack, cloud infrastructure, and core competencies from JD text,
and computes candidate Skill Delta gaps against active DAG mastery.
"""

import re
from typing import Dict, List
from backend.app.models.schemas import SkillNode


class JDMatcher:
    def __init__(self):
        self.catalog = {
            "python": "Python", "java": "Java", "c++": "C++", "golang": "Go",
            "react": "React", "next.js": "Next.js", "node.js": "Node.js", "typescript": "TypeScript",
            "docker": "Docker", "kubernetes": "Kubernetes", "aws": "AWS", "azure": "Azure",
            "sql": "Databases & System Architecture", "postgresql": "Databases & System Architecture",
            "redis": "Redis / In-Memory Caching", "kafka": "Event Streaming (Kafka)",
            "algorithms": "DSA Core", "data structures": "DSA Core", "dynamic programming": "Dynamic Programming",
            "graphs": "Graphs (BFS/DFS)", "sliding window": "Sliding Window"
        }

    def decompose_and_match(
        self,
        jd_text: str,
        candidate_skills: List[SkillNode],
        job_title: str = "Software Engineer",
        company: str = "Generic"
    ) -> Dict[str, any]:
        lower_jd = jd_text.lower()
        detected_skills = []

        for pattern, canon_name in self.catalog.items():
            if re.search(r'\b' + re.escape(pattern) + r'\b', lower_jd):
                if canon_name not in detected_skills:
                    detected_skills.append(canon_name)

        # Match against candidate skill nodes
        skill_map = {s.name.lower(): s for s in candidate_skills}
        matched = []
        gaps = []

        for skill in detected_skills:
            cand_node = skill_map.get(skill.lower())
            if cand_node and cand_node.mastery >= 0.65:
                matched.append({
                    "skill": skill,
                    "mastery": cand_node.mastery,
                    "status": "Ready"
                })
            else:
                current_val = cand_node.mastery if cand_node else 0.20
                gaps.append({
                    "skill": skill,
                    "current_mastery": current_val,
                    "target_mastery": 0.75,
                    "delta": round(0.75 - current_val, 2)
                })

        # Sort gaps: prioritize skills present in candidate DAG first, then by delta
        gaps.sort(key=lambda x: (x["skill"].lower() in skill_map, x["delta"]), reverse=True)

        total_req = max(1, len(detected_skills))
        match_pct = round((len(matched) / total_req) * 100)


        return {
            "job_title": job_title,
            "company_name": company,
            "detected_skills_count": len(detected_skills),
            "overall_match_percentage": match_pct,
            "matched_competencies": matched,
            "top_priority_gap_skills": [g["skill"] for g in gaps[:4]],
            "skill_deltas": gaps
        }

