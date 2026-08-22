"""Placement Mentor 2.0 - Skill Graph (DAG) & Prerequisite Causal Backtracking.

Manages:
- Topological skill ordering
- Prerequisite validation
- Causal Root-Cause Backtracking (if a student fails an advanced concept, traverse parents to locate root deficiency)
"""

from collections import defaultdict, deque
from typing import Dict, List, Optional
from backend.app.models.schemas import SkillNode


class SkillDAG:
    def __init__(self, skills: List[SkillNode]):
        self.skills: Dict[str, SkillNode] = {s.id: s for s in skills}
        self.adj_list: Dict[str, List[str]] = defaultdict(list)
        self.rev_adj_list: Dict[str, List[str]] = defaultdict(list)
        self._build_graph()

    def _build_graph(self):
        for s in self.skills.values():
            for prereq in s.prerequisites:
                self.adj_list[prereq].append(s.id)
                self.rev_adj_list[s.id].append(prereq)

    def get_prerequisites(self, skill_id: str) -> List[SkillNode]:
        prereq_ids = self.rev_adj_list.get(skill_id, [])
        return [self.skills[pid] for pid in prereq_ids if pid in self.skills]

    def are_prerequisites_met(self, skill_id: str, threshold: float = 0.60) -> bool:
        prereqs = self.get_prerequisites(skill_id)
        if not prereqs:
            return True
        return all(p.mastery >= threshold for p in prereqs)

    def backtrack_root_cause_deficit(self, failed_skill_id: str, deficit_threshold: float = 0.60) -> Optional[SkillNode]:
        """Traverses up the prerequisite tree to find the earliest unmastered ancestor."""
        queue = deque([failed_skill_id])
        visited = set()
        lowest_ancestor = None
        min_mastery = 1.0

        while queue:
            curr_id = queue.popleft()
            if curr_id in visited:
                continue
            visited.add(curr_id)

            prereqs = self.get_prerequisites(curr_id)
            for p in prereqs:
                if p.mastery < deficit_threshold and p.mastery < min_mastery:
                    min_mastery = p.mastery
                    lowest_ancestor = p
                queue.append(p.id)

        return lowest_ancestor

    def get_topological_order(self) -> List[SkillNode]:
        in_degree = {sid: 0 for sid in self.skills}
        for sid, neighbors in self.adj_list.items():
            for n in neighbors:
                if n in in_degree:
                    in_degree[n] += 1

        queue = deque([sid for sid, deg in in_degree.items() if deg == 0])
        ordered = []

        while queue:
            curr_id = queue.popleft()
            if curr_id in self.skills:
                ordered.append(self.skills[curr_id])

            for neighbor in self.adj_list.get(curr_id, []):
                if neighbor in in_degree:
                    in_degree[neighbor] -= 1
                    if in_degree[neighbor] == 0:
                        queue.append(neighbor)

        # Fallback for any leftover nodes
        if len(ordered) < len(self.skills):
            for s in self.skills.values():
                if s not in ordered:
                    ordered.append(s)

        return ordered


def build_default_skill_dag() -> List[SkillNode]:
    """Builds the 10-node core placement curriculum graph."""
    nodes = [
        SkillNode(id="arrays_hashing", name="Arrays & Hashing", category="dsa", prerequisites=[], mastery=0.75, practice_score=0.75, is_critical_for_role=True),
        SkillNode(id="two_pointers", name="Two Pointers", category="dsa", prerequisites=["arrays_hashing"], mastery=0.70, practice_score=0.70, is_critical_for_role=True),
        SkillNode(id="sliding_window", name="Sliding Window", category="dsa", prerequisites=["arrays_hashing", "two_pointers"], mastery=0.60, practice_score=0.60, is_critical_for_role=True),
        SkillNode(id="stack_queues", name="Stacks & Queues", category="dsa", prerequisites=["arrays_hashing"], mastery=0.55, practice_score=0.55, is_critical_for_role=False),
        SkillNode(id="binary_search", name="Binary Search", category="dsa", prerequisites=["arrays_hashing", "two_pointers"], mastery=0.65, practice_score=0.65, is_critical_for_role=True),
        SkillNode(id="trees_bst", name="Trees & BST", category="dsa", prerequisites=["stack_queues"], mastery=0.50, practice_score=0.50, is_critical_for_role=True),
        SkillNode(id="graphs", name="Graphs (BFS/DFS)", category="dsa", prerequisites=["trees_bst"], mastery=0.45, practice_score=0.45, is_critical_for_role=True),
        SkillNode(id="dynamic_programming", name="Dynamic Programming", category="dsa", prerequisites=["trees_bst"], mastery=0.35, practice_score=0.35, is_critical_for_role=False),
        SkillNode(id="rest_apis_http", name="REST APIs & HTTP", category="development", prerequisites=[], mastery=0.75, practice_score=0.75, is_critical_for_role=True),
        SkillNode(id="sql_dbms", name="Databases & System Architecture", category="core_cs", prerequisites=[], mastery=0.65, practice_score=0.65, is_critical_for_role=True),
    ]
    return nodes
