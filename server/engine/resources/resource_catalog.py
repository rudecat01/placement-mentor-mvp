#
# Curated Verified Resource Catalog
# [OWNED BY MEMBER 2 - ENGINE & MATH LEAD]
# Maps verified external references (MDN, React Docs, NeetCode, CS50, MIT OCW, YouTube) to Skill Graph topics.
#

from __future__ import annotations

from typing import List, Optional

try:
    from schemas.skill_graph import CuratedResource, CompetencyMap, RoleType
    from engine.resources.web_dev_map import WEB_DEV_COMPETENCY_MAP
    from engine.resources.sde_map import SDE_COMPETENCY_MAP
except ImportError:
    from ...schemas.skill_graph import CuratedResource, CompetencyMap, RoleType
    from .web_dev_map import WEB_DEV_COMPETENCY_MAP
    from .sde_map import SDE_COMPETENCY_MAP

RESOURCE_CATALOG: List[CuratedResource] = [
    # --- Web Development Resources ---
    CuratedResource(
        id="res-html-mdn",
        topic_id="html-css-basics",
        title="MDN Web Docs: HTML & CSS Core Fundamentals",
        url="https://developer.mozilla.org/en-US/docs/Learn_web_development",
        type="DOCUMENTATION",
        platform="MDN Web Docs",
        author="Mozilla Developer Network",
        duration_minutes=120,
        difficulty="EASY",
        is_verified=True,
        description="Comprehensive official guide on semantic HTML5 structure, CSS box model, and modern layout algorithms."
    ),
    CuratedResource(
        id="res-flexbox-grid-yt",
        topic_id="html-css-basics",
        title="Flexbox and Grid Deep Dive",
        url="https://www.youtube.com/watch?v=rg7Fvvl3taU",
        type="YOUTUBE_VIDEO",
        platform="YouTube",
        author="Kevin Powell",
        duration_minutes=45,
        difficulty="EASY",
        is_verified=True,
        description="Practical visual masterclass explaining flex-grow, flex-shrink, and CSS grid templates."
    ),
    CuratedResource(
        id="res-js-event-loop",
        topic_id="javascript-fundamentals",
        title="What the heck is the event loop anyway?",
        url="https://www.youtube.com/watch?v=8aGhZQkoFbQ",
        type="YOUTUBE_VIDEO",
        platform="YouTube",
        author="Philip Roberts",
        duration_minutes=26,
        difficulty="MEDIUM",
        is_verified=True,
        description="The definitive visual explanation of the JavaScript call stack, event loop, task queue, and web APIs."
    ),
    CuratedResource(
        id="res-js-javascript-info",
        topic_id="javascript-fundamentals",
        title="The Modern JavaScript Tutorial: Closures & Promises",
        url="https://javascript.info",
        type="TUTORIAL",
        platform="JavaScript.info",
        author="Ilya Kantor",
        duration_minutes=180,
        difficulty="MEDIUM",
        is_verified=True,
        description="In-depth reference covering execution context, lexical environments, prototypes, and asynchronous flows."
    ),
    CuratedResource(
        id="res-ts-handbook",
        topic_id="typescript-core",
        title="TypeScript Official Handbook: Generics & Type Manipulation",
        url="https://www.typescriptlang.org/docs/handbook/intro.html",
        type="DOCUMENTATION",
        platform="TypeScript Official",
        author="Microsoft",
        duration_minutes=90,
        difficulty="MEDIUM",
        is_verified=True,
        description="Official handbook guide to creating generic types, conditional types, and mapped utility types."
    ),
    CuratedResource(
        id="res-react-dev",
        topic_id="react-fundamentals",
        title="React 19 Official Documentation & Interactive Hooks Guide",
        url="https://react.dev/learn",
        type="DOCUMENTATION",
        platform="React Official Docs",
        author="Meta / React Team",
        duration_minutes=150,
        difficulty="MEDIUM",
        is_verified=True,
        description="Official interactive documentation covering component lifecycles, hooks mental models, and state management."
    ),
    CuratedResource(
        id="res-node-internals",
        topic_id="node-express-backend",
        title="Node.js Event-Driven Architecture & libuv Internals",
        url="https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick",
        type="DOCUMENTATION",
        platform="Node.js Official",
        author="Node.js Foundation",
        duration_minutes=60,
        difficulty="HARD",
        is_verified=True,
        description="Official guide exploring the libuv event loop phases, process.nextTick(), and setImmediate() timing."
    ),
    CuratedResource(
        id="res-prisma-docs",
        topic_id="database-sql-prisma",
        title="Prisma ORM Relations, Transactions & Schema Modeling",
        url="https://www.prisma.io/docs/concepts/components/prisma-schema",
        type="DOCUMENTATION",
        platform="Prisma Docs",
        author="Prisma",
        duration_minutes=75,
        difficulty="MEDIUM",
        is_verified=True,
        description="Schema modeling guide for 1-to-many, many-to-many relations, and ACID interactive transactions in PostgreSQL."
    ),
    CuratedResource(
        id="res-owasp-top10",
        topic_id="auth-security",
        title="OWASP Top 10 Web Application Security Vulnerabilities",
        url="https://owasp.org/www-project-top-ten/",
        type="ARTICLE",
        platform="OWASP",
        author="OWASP Foundation",
        duration_minutes=60,
        difficulty="HARD",
        is_verified=True,
        description="Essential security audit covering Injection, Broken Access Control, Cryptographic Failures, and SSRF."
    ),
    CuratedResource(
        id="res-nextjs-learn",
        topic_id="nextjs-fullstack",
        title="Next.js App Router Architecture & Server Actions Course",
        url="https://nextjs.org/learn",
        type="COURSE",
        platform="Vercel / Next.js",
        author="Vercel Team",
        duration_minutes=120,
        difficulty="HARD",
        is_verified=True,
        description="Interactive course on React Server Components, streaming suspense boundaries, and server mutations."
    ),

    # --- SDE / DSA & Core CS Resources ---
    CuratedResource(
        id="res-arrays-neetcode",
        topic_id="arrays-hashing",
        title="Arrays & Hashing Visual Guide (NeetCode 150)",
        url="https://neetcode.io/roadmap",
        type="TUTORIAL",
        platform="NeetCode",
        author="NeetCode",
        duration_minutes=45,
        difficulty="EASY",
        is_verified=True,
        description="Step-by-step algorithmic patterns for prefix sums, two-sum variations, and frequency hashing."
    ),
    CuratedResource(
        id="res-two-pointers-yt",
        topic_id="two-pointers",
        title="Two Pointers Technique Masterclass",
        url="https://www.youtube.com/watch?v=On03HWe2tZM",
        type="YOUTUBE_VIDEO",
        platform="YouTube",
        author="NeetCode",
        duration_minutes=30,
        difficulty="EASY",
        is_verified=True,
        description="Solving 3Sum, Container With Most Water, and palindrome verification with optimal O(1) extra space."
    ),
    CuratedResource(
        id="res-sliding-window-guide",
        topic_id="sliding-window",
        title="Sliding Window Pattern & Substring Optimization",
        url="https://www.youtube.com/watch?v=jM2dhDPYMQM",
        type="YOUTUBE_VIDEO",
        platform="YouTube",
        author="NeetCode",
        duration_minutes=35,
        difficulty="MEDIUM",
        is_verified=True,
        description="Dynamic window expansion/contraction logic for Longest Substring Without Repeating Characters."
    ),
    CuratedResource(
        id="res-monotonic-stack-guide",
        topic_id="stacks-queues",
        title="Monotonic Stack & Queue: Next Greater Element & Sliding Window Maximum",
        url="https://neetcode.io/courses/advanced-algorithms/0",
        type="TUTORIAL",
        platform="NeetCode",
        author="NeetCode",
        duration_minutes=50,
        difficulty="MEDIUM",
        is_verified=True,
        description="Linear time O(N) evaluations for Daily Temperatures, Largest Rectangle in Histogram, and sliding maxima."
    ),
    CuratedResource(
        id="res-binary-search-errichto",
        topic_id="binary-search",
        title="Binary Search Tutorial & Search on Monotonic Answer Space",
        url="https://www.youtube.com/watch?v=GU7DpgHINWQ",
        type="YOUTUBE_VIDEO",
        platform="YouTube",
        author="Errichto",
        duration_minutes=40,
        difficulty="MEDIUM",
        is_verified=True,
        description="Eliminating off-by-one errors with clean invariant boundaries, and binary searching on monotonic answers."
    ),
    CuratedResource(
        id="res-tree-traversals",
        topic_id="trees-binary-search-tree",
        title="Tree Traversals (Pre/In/Post/BFS) & Lowest Common Ancestor",
        url="https://www.youtube.com/watch?v=fAAZixBzIAI",
        type="YOUTUBE_VIDEO",
        platform="YouTube",
        author="William Fiset",
        duration_minutes=60,
        difficulty="MEDIUM",
        is_verified=True,
        description="Visual recursive DFS and iterative queue-based BFS traversals on binary search trees."
    ),
    CuratedResource(
        id="res-graph-algorithms",
        topic_id="graphs-traversal",
        title="Graph Algorithms Full Course: BFS, DFS, Dijkstra, Kahn Topological Sort",
        url="https://www.youtube.com/watch?v=09_LlHjoEiY",
        type="YOUTUBE_VIDEO",
        platform="freeCodeCamp",
        author="William Fiset",
        duration_minutes=120,
        difficulty="HARD",
        is_verified=True,
        description="Complete graph theory crash course including cycle detection, shortest paths, and topological ordering."
    ),
    CuratedResource(
        id="res-dp-freecodecamp",
        topic_id="dynamic-programming",
        title="Dynamic Programming: 0/1 Knapsack, LCS & Interval DP Patterns",
        url="https://www.youtube.com/watch?v=oBt53YbR9Kk",
        type="YOUTUBE_VIDEO",
        platform="freeCodeCamp",
        author="freeCodeCamp",
        duration_minutes=180,
        difficulty="HARD",
        is_verified=True,
        description="Comprehensive breakdown of recursive memoization and iterative bottom-up 2D tabulation techniques."
    ),
    CuratedResource(
        id="res-os-three-easy-pieces",
        topic_id="operating-systems",
        title="Operating Systems: Three Easy Pieces (Virtualization & Concurrency)",
        url="https://pages.cs.wisc.edu/~remzi/OSTEP/",
        type="DOCUMENTATION",
        platform="University of Wisconsin-Madison",
        author="Remzi H. Arpaci-Dusseau",
        duration_minutes=180,
        difficulty="MEDIUM",
        is_verified=True,
        description="Acclaimed university textbook on virtual memory, process scheduling, mutexes, and deadlock avoidance."
    ),
    CuratedResource(
        id="res-system-design-primer",
        topic_id="system-design",
        title="The System Design Primer (Scalability, Caching, Sharding & CAP)",
        url="https://github.com/donnemartin/system-design-primer",
        type="TUTORIAL",
        platform="GitHub",
        author="Donne Martin",
        duration_minutes=240,
        difficulty="HARD",
        is_verified=True,
        description="Industry-standard open-source guide to building high-concurrency, fault-tolerant distributed web architectures."
    )
]


class ResourceCatalogService:
    @staticmethod
    def get_all_resources() -> List[CuratedResource]:
        return list(RESOURCE_CATALOG)

    @staticmethod
    def get_resources_by_topic(topic_id: str) -> List[CuratedResource]:
        return [r for r in RESOURCE_CATALOG if r.topic_id == topic_id]

    @staticmethod
    def get_competency_map_by_role(role: RoleType) -> CompetencyMap:
        if role == "WEB_DEVELOPMENT":
            return WEB_DEV_COMPETENCY_MAP
        if role == "SDE":
            return SDE_COMPETENCY_MAP
        return SDE_COMPETENCY_MAP
