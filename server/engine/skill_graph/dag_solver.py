#
# Skill Graph DAG Solver
# [OWNED BY MEMBER 2 - ENGINE & MATH LEAD]
#

from __future__ import annotations

from typing import List, Dict, Set, Tuple, Optional

try:
    from schemas.skill_graph import SkillNode, SkillEdge, CompetencyMap, DAGValidationResult
    from engine.mastery.config import DAG_THRESHOLDS
except ImportError:
    from ...schemas.skill_graph import SkillNode, SkillEdge, CompetencyMap, DAGValidationResult
    from ..mastery.config import DAG_THRESHOLDS


class DAGSolver:
    @staticmethod
    def validate_graph(competency_map: CompetencyMap) -> DAGValidationResult:
        node_map = {n.id: n for n in competency_map.nodes}
        in_degree = {n.id: 0 for n in competency_map.nodes}
        adjacency_list: Dict[str, List[str]] = {n.id: [] for n in competency_map.nodes}

        # Build edges from explicit edges and node.prerequisites
        all_edges: List[Tuple[str, str]] = [(e.source, e.target) for e in competency_map.edges]
        for node in competency_map.nodes:
            for prereq in node.prerequisites:
                if (prereq, node.id) not in all_edges:
                    all_edges.append((prereq, node.id))

        for src, tgt in all_edges:
            if src in node_map and tgt in node_map:
                adjacency_list[src].append(tgt)
                in_degree[tgt] += 1

        # Kahn's algorithm
        queue = [n_id for n_id, deg in in_degree.items() if deg == 0]
        topological_order: List[str] = []

        while queue:
            curr = queue.pop(0)
            topological_order.append(curr)
            for neighbor in adjacency_list.get(curr, []):
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

        has_cycles = len(topological_order) < len(competency_map.nodes)
        cycle_nodes = (
            [n.id for n in competency_map.nodes if n.id not in topological_order]
            if has_cycles
            else None
        )

        isolated_nodes = [
            n.id
            for n in competency_map.nodes
            if not n.prerequisites and not adjacency_list.get(n.id)
        ]

        return DAGValidationResult(
            is_valid=not has_cycles,
            has_cycles=has_cycles,
            cycle_nodes=cycle_nodes,
            topological_order=topological_order,
            isolated_nodes=isolated_nodes,
            total_nodes=len(competency_map.nodes)
        )

    @staticmethod
    def are_prerequisites_met(
        node: SkillNode,
        mastery_map: Dict[str, float],
        threshold: float = DAG_THRESHOLDS["PREREQUISITE_UNLOCK_MASTERY"]
    ) -> Tuple[bool, List[str]]:
        missing: List[str] = []
        for prereq in node.prerequisites:
            m = mastery_map.get(prereq, 0.0)
            if m < threshold:
                missing.append(prereq)
        return len(missing) == 0, missing

    @staticmethod
    def get_unlocked_topics(
        competency_map: CompetencyMap,
        mastery_map: Dict[str, float],
        mastery_cap: float = 0.85
    ) -> List[SkillNode]:
        unlocked: List[SkillNode] = []
        for node in competency_map.nodes:
            curr_m = mastery_map.get(node.id, 0.0)
            if curr_m >= mastery_cap:
                continue
            is_met, _ = DAGSolver.are_prerequisites_met(node, mastery_map)
            if is_met:
                unlocked.append(node)
        return unlocked

    @staticmethod
    def calculate_node_depths(competency_map: CompetencyMap) -> Dict[str, int]:
        depths: Dict[str, int] = {}
        val = DAGSolver.validate_graph(competency_map)
        node_map = {n.id: n for n in competency_map.nodes}

        for n_id in val.topological_order:
            node = node_map.get(n_id)
            if not node or not node.prerequisites:
                depths[n_id] = 0
            else:
                max_prereq_depth = max(depths.get(p, 0) for p in node.prerequisites)
                depths[n_id] = max_prereq_depth + 1

        return depths
