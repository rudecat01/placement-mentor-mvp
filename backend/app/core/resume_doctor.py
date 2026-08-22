"""Placement Mentor 2.0 - Standalone Resume Doctor & Google XYZ Formula Engine.

Core Functions:
1. Live red-lining of weak/passive resume bullets.
2. Google XYZ Formula Rewriter: 'Accomplished [X], as measured by [Y], by doing [Z]'.
3. Dynamic Topic Ingestion: Suggests integrating newly mastered topics from practice roadmap into project bullets.
"""

from typing import Dict, List


class ResumeDoctor:
    def __init__(self):
        self.weak_phrases = [
            "responsible for", "worked on", "helped with", "assisted in",
            "handled", "participated in", "did bug fixes", "contributed to"
        ]

    def analyze_and_rewrite_bullet(self, bullet_text: str) -> Dict[str, any]:
        lower_bullet = bullet_text.lower().strip()
        is_weak = any(phrase in lower_bullet for phrase in self.weak_phrases)

        # Template-based transformation into Google XYZ Formula
        if "backend api" in lower_bullet or "api development" in lower_bullet:
            xyz_rewrite = "Engineered high-throughput RESTful microservices, reducing API p99 latency by 38% across 200,000+ daily requests by implementing asynchronous Redis caching and query indexing."
            critique = "Original bullet lacks quantification and active ownership. Replaced passive phrasing with specific scale metrics."
        elif "database" in lower_bullet or "sql" in lower_bullet:
            xyz_rewrite = "Optimized relational PostgreSQL schema and query execution plans, slashing query latency by 45% on 5M+ record tables by introducing compound B-Tree indexes and connection pooling."
            critique = "Demonstrates concrete database architecture depth and quantifiable performance gains."
        elif "frontend" in lower_bullet or "react" in lower_bullet:
            xyz_rewrite = "Architected responsive real-time analytics dashboard in React & Next.js, elevating Lighthouse performance score from 62 to 96 by applying code-splitting and dynamic memoization."
            critique = "Highlights measurable user-experience metrics and modern frontend optimization techniques."
        else:
            xyz_rewrite = f"Spearheaded technical refactor of {bullet_text.replace('Responsible for', '').replace('Worked on', '').strip()}, boosting execution throughput by 32% and reducing bug regression rate by doing structured unit test automation."
            critique = "Restructured bullet into the Google XYZ formula: Accomplished [X], as measured by [Y], by doing [Z]."

        return {
            "original_bullet": bullet_text,
            "is_weak": is_weak,
            "critique_reason": critique,
            "suggested_xyz_rewrite": xyz_rewrite,
            "improved_metrics": ["35-45% latency reduction", "200k+ daily transactions", "Zero regression deploys"]
        }

    def generate_dynamic_skill_ingestion(self, newly_mastered_topics: List[str]) -> List[Dict[str, str]]:
        """Generates resume project bullet suggestions for newly mastered roadmap topics."""
        suggestions = []
        for topic in newly_mastered_topics:
            t_lower = topic.lower()
            if "sliding window" in t_lower:
                suggestions.append({
                    "topic": topic,
                    "recommended_bullet": "Implemented real-time Sliding Window algorithmic streaming filter, enabling O(1) rolling calculation across 50,000+ telemetry events per second."
                })
            elif "graph" in t_lower:
                suggestions.append({
                    "topic": topic,
                    "recommended_bullet": "Designed Directed Acyclic Graph (DAG) task dependency scheduler utilizing Topological Sort, resolving 1,000+ pipeline nodes in <15ms."
                })
            elif "tree" in t_lower or "bst" in t_lower:
                suggestions.append({
                    "topic": topic,
                    "recommended_bullet": "Constructed self-balancing AVL/BST index structure to enable logarithmic time lookups across multi-tenant catalog items."
                })
            else:
                suggestions.append({
                    "topic": topic,
                    "recommended_bullet": f"Engineered optimized algorithmic module leveraging {topic} paradigms, achieving O(N) linear time complexity and 60% memory savings."
                })
        return suggestions
