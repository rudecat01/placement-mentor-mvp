#
# Curated Competency Map for Software Development Engineer (SDE / DSA / Core CS) Role
# [OWNED BY MEMBER 2 - ENGINE & MATH LEAD]
#

from __future__ import annotations

try:
    from schemas.skill_graph import CompetencyMap, SkillNode, SkillEdge
except ImportError:
    from ...schemas.skill_graph import CompetencyMap, SkillNode, SkillEdge

SDE_COMPETENCY_MAP = CompetencyMap(
    role="SDE",
    display_name="Software Development Engineer (DSA & Core CS)",
    description="Rigorous computer science curriculum covering Data Structures, Algorithms, Operating Systems, DBMS, and System Design.",
    version="2.0.0",
    nodes=[
        SkillNode(
            id="arrays-hashing",
            name="Arrays & Hashing",
            category="DATA_STRUCTURES",
            description="Fixed and dynamic arrays, prefix sums, hash tables, collision resolution, and hash sets.",
            prerequisites=[],
            is_core=True,
            weight=1.2,
            estimated_hours=12,
            difficulty_tier="BEGINNER"
        ),
        SkillNode(
            id="two-pointers",
            name="Two Pointers Technique",
            category="ALGORITHMS",
            description="Opposite-direction pointers, same-direction pointers, and fast/slow pointer cycle detection.",
            prerequisites=["arrays-hashing"],
            is_core=True,
            weight=1.0,
            estimated_hours=10,
            difficulty_tier="BEGINNER"
        ),
        SkillNode(
            id="sliding-window",
            name="Sliding Window",
            category="ALGORITHMS",
            description="Fixed-size window calculations, dynamic-size window expansion/contraction, and substring optimization.",
            prerequisites=["two-pointers"],
            is_core=True,
            weight=1.2,
            estimated_hours=12,
            difficulty_tier="INTERMEDIATE"
        ),
        SkillNode(
            id="stacks-queues",
            name="Stacks, Queues & Monotonic Sequences",
            category="DATA_STRUCTURES",
            description="LIFO stack operations, FIFO queue, circular buffers, monotonic stack, and monotonic queue.",
            prerequisites=["arrays-hashing"],
            is_core=True,
            weight=1.2,
            estimated_hours=14,
            difficulty_tier="INTERMEDIATE"
        ),
        SkillNode(
            id="linked-lists",
            name="Linked Lists & Pointer Manipulation",
            category="DATA_STRUCTURES",
            description="Singly and doubly linked lists, list reversal, merge sort on lists, and cycle detection.",
            prerequisites=["two-pointers"],
            is_core=True,
            weight=1.0,
            estimated_hours=10,
            difficulty_tier="INTERMEDIATE"
        ),
        SkillNode(
            id="binary-search",
            name="Binary Search & Search on Answer",
            category="ALGORITHMS",
            description="Logarithmic search space pruning, search in rotated sorted arrays, and binary search on monotonic answer spaces.",
            prerequisites=["arrays-hashing"],
            is_core=True,
            weight=1.3,
            estimated_hours=12,
            difficulty_tier="INTERMEDIATE"
        ),
        SkillNode(
            id="trees-binary-search-tree",
            name="Trees & Binary Search Trees",
            category="DATA_STRUCTURES",
            description="Binary trees, DFS traversals (Pre/In/Post), BFS level-order traversal, BST validation, and lowest common ancestor (LCA).",
            prerequisites=["stacks-queues"],
            is_core=True,
            weight=1.5,
            estimated_hours=18,
            difficulty_tier="INTERMEDIATE"
        ),
        SkillNode(
            id="heaps-priority-queues",
            name="Heaps & Priority Queues",
            category="DATA_STRUCTURES",
            description="Binary heap invariant, heapify, Top-K elements, streaming median with dual heaps, and Dijkstra foundations.",
            prerequisites=["trees-binary-search-tree"],
            is_core=True,
            weight=1.2,
            estimated_hours=12,
            difficulty_tier="INTERMEDIATE"
        ),
        SkillNode(
            id="graphs-traversal",
            name="Graphs: BFS, DFS & Shortest Paths",
            category="ALGORITHMS",
            description="Adjacency list representations, BFS/DFS traversal, Topological Sort (Kahn), Cycle detection, Dijkstra, and Union-Find.",
            prerequisites=["trees-binary-search-tree", "heaps-priority-queues"],
            is_core=True,
            weight=1.6,
            estimated_hours=22,
            difficulty_tier="ADVANCED"
        ),
        SkillNode(
            id="dynamic-programming",
            name="Dynamic Programming",
            category="ALGORITHMS",
            description="Overlapping subproblems, optimal substructure, memoization vs tabulation, 0/1 Knapsack, Longest Common Subsequence, and Interval DP.",
            prerequisites=["trees-binary-search-tree"],
            is_core=True,
            weight=1.8,
            estimated_hours=25,
            difficulty_tier="ADVANCED"
        ),
        SkillNode(
            id="operating-systems",
            name="Operating Systems & Concurrency",
            category="CS_CORE",
            description="Processes vs Threads, Context switching, Mutex/Semaphores, Virtual Memory & Paging, and Deadlock conditions.",
            prerequisites=[],
            is_core=True,
            weight=1.3,
            estimated_hours=15,
            difficulty_tier="INTERMEDIATE"
        ),
        SkillNode(
            id="dbms-fundamentals",
            name="Database Management Systems & Indexing",
            category="CS_CORE",
            description="B-Tree/B+ Tree indexes, Query optimization, ACID properties, Isolation levels, and Concurrency anomaly prevention.",
            prerequisites=[],
            is_core=True,
            weight=1.3,
            estimated_hours=15,
            difficulty_tier="INTERMEDIATE"
        ),
        SkillNode(
            id="system-design",
            name="High-Level System Design & Scalability",
            category="SYSTEM_DESIGN",
            description="Horizontal vs Vertical scaling, Load balancers, Caching strategies (Redis), Consistent Hashing, Message Queues (Kafka), and CAP theorem.",
            prerequisites=["operating-systems", "dbms-fundamentals"],
            is_core=False,
            weight=1.4,
            estimated_hours=18,
            difficulty_tier="ADVANCED"
        )
    ],
    edges=[
        SkillEdge(source="arrays-hashing", target="two-pointers"),
        SkillEdge(source="arrays-hashing", target="stacks-queues"),
        SkillEdge(source="arrays-hashing", target="binary-search"),
        SkillEdge(source="two-pointers", target="sliding-window"),
        SkillEdge(source="two-pointers", target="linked-lists"),
        SkillEdge(source="stacks-queues", target="trees-binary-search-tree"),
        SkillEdge(source="trees-binary-search-tree", target="heaps-priority-queues"),
        SkillEdge(source="trees-binary-search-tree", target="graphs-traversal"),
        SkillEdge(source="heaps-priority-queues", target="graphs-traversal"),
        SkillEdge(source="trees-binary-search-tree", target="dynamic-programming"),
        SkillEdge(source="operating-systems", target="system-design"),
        SkillEdge(source="dbms-fundamentals", target="system-design")
    ]
)
