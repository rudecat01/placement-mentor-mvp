"""Placement Mentor 2.0 - Standalone Algorithmic ATS Resume Scorer.

Evaluates resume text on a 0-100 scale across:
1. Keyword Density & Role Alignment (35 pts)
2. Section Structure & Hierarchy (25 pts)
3. Google XYZ Quantification & Action Verbs (25 pts)
4. Readability & Formatting Cleanliness (15 pts)
"""

import re
from typing import Dict, List


class ATSScorer:
    def __init__(self):
        self.role_keywords = {
            "sde": ["python", "java", "c++", "data structures", "algorithms", "system design", "distributed", "api", "database", "sql", "git", "ci/cd", "microservices", "docker"],
            "web development": ["javascript", "typescript", "react", "next.js", "node.js", "html", "css", "tailwind", "rest api", "graphql", "redux", "mongodb", "postgresql"],
            "backend": ["golang", "python", "java", "postgresql", "redis", "kafka", "grpc", "docker", "kubernetes", "aws", "scalable", "microservices", "sql", "nosql"],
            "machine learning": ["python", "pytorch", "tensorflow", "scikit-learn", "nlp", "computer vision", "pandas", "numpy", "transformers", "llm", "deep learning", "model deployment"]
        }

        self.action_verbs = [
            "architected", "engineered", "developed", "spearheaded", "optimized",
            "reduced", "scaled", "deployed", "implemented", "designed", "streamlined",
            "accelerated", "built", "refactored", "orchestrated", "automated"
        ]

    def score_resume(self, resume_text: str, target_role: str = "sde") -> Dict[str, any]:
        text_lower = resume_text.lower()
        role_key = target_role.lower()
        keywords = self.role_keywords.get(role_key, self.role_keywords["sde"])

        # 1. Keyword Matching (35 pts)
        matched_keywords = [kw for kw in keywords if re.search(r'\b' + re.escape(kw) + r'\b', text_lower)]
        keyword_score = min(35, round((len(matched_keywords) / max(1, len(keywords) * 0.70)) * 35))

        # 2. Section Structure & Hierarchy (25 pts)
        standard_sections = ["experience", "education", "skills", "projects"]
        present_sections = [sec for sec in standard_sections if sec in text_lower]
        section_score = round((len(present_sections) / len(standard_sections)) * 25)

        # 3. Google XYZ Quantification & Action Verbs (25 pts)
        quant_matches = len(re.findall(r'(\d+[\%kKmMbB]?|\$\d+)', resume_text))
        verb_matches = len([v for v in self.action_verbs if re.search(r'\b' + v + r'\b', text_lower)])
        quant_score = min(25, round((min(8, quant_matches) / 8.0) * 15 + (min(6, verb_matches) / 6.0) * 10))

        # 4. Readability & Bullet Count (15 pts)
        lines = [l.strip() for l in resume_text.split('\n') if l.strip()]
        bullet_lines = [l for l in lines if l.startswith(('•', '-', '*', '1.', '2.', '3.'))]
        readability_score = 15 if (len(lines) >= 8 and len(bullet_lines) >= 3) else 8

        total_score = min(100, keyword_score + section_score + quant_score + readability_score)

        # Recommendations
        recommendations = {"critical": [], "suggested": []}
        if len(present_sections) < len(standard_sections):
            missing = [s.capitalize() for s in standard_sections if s not in text_lower]
            recommendations["critical"].append(f"Missing essential resume sections: {', '.join(missing)}")
        if quant_matches < 4:
            recommendations["critical"].append("Low quantification: Add measurable metrics (e.g. 'reduced latency by 35%', 'scaled to 100k users').")
        if keyword_score < 25:
            missing_kw = [kw.capitalize() for kw in keywords if kw not in matched_keywords][:5]
            recommendations["suggested"].append(f"Incorporate target tech keywords: {', '.join(missing_kw)}")

        return {
            "overall_score": total_score,
            "keyword_match_score": keyword_score,
            "section_hierarchy_score": section_score,
            "quantification_score": quant_score,
            "readability_score": readability_score,
            "matched_keywords": matched_keywords,
            "missing_keywords": [kw for kw in keywords if kw not in matched_keywords],
            "recommendations": recommendations
        }
