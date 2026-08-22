#
# Curated Competency Map for Web Development Role
# [OWNED BY MEMBER 2 - ENGINE & MATH LEAD]
#

from __future__ import annotations

try:
    from schemas.skill_graph import CompetencyMap, SkillNode, SkillEdge
except ImportError:
    from ...schemas.skill_graph import CompetencyMap, SkillNode, SkillEdge

WEB_DEV_COMPETENCY_MAP = CompetencyMap(
    role="WEB_DEVELOPMENT",
    display_name="Full Stack Web Development",
    description="Comprehensive curriculum spanning modern frontend, TypeScript, backend architectures, databases, and deployment.",
    version="2.0.0",
    nodes=[
        SkillNode(
            id="html-css-basics",
            name="HTML5 & Modern CSS Layouts",
            category="FRONTEND",
            description="Semantic HTML5, CSS Box Model, Flexbox, CSS Grid, and responsive media queries.",
            prerequisites=[],
            is_core=True,
            weight=1.0,
            estimated_hours=8,
            difficulty_tier="BEGINNER"
        ),
        SkillNode(
            id="javascript-fundamentals",
            name="JavaScript & Asynchronous Runtime",
            category="LANGUAGES",
            description="ES6+ syntax, Closures, Prototypes, Event Loop, Microtask queue, Promises, and Async/Await.",
            prerequisites=["html-css-basics"],
            is_core=True,
            weight=1.5,
            estimated_hours=18,
            difficulty_tier="BEGINNER"
        ),
        SkillNode(
            id="typescript-core",
            name="TypeScript & Type Systems",
            category="LANGUAGES",
            description="Static typing, Generics, Type Narrowing, Discriminated Unions, and Utility Types.",
            prerequisites=["javascript-fundamentals"],
            is_core=True,
            weight=1.2,
            estimated_hours=12,
            difficulty_tier="INTERMEDIATE"
        ),
        SkillNode(
            id="http-rest-apis",
            name="HTTP Protocol & RESTful APIs",
            category="BACKEND",
            description="HTTP/1.1 vs HTTP/2, Request/Response headers, Status codes, REST architectural constraints, CORS, and caching.",
            prerequisites=["javascript-fundamentals"],
            is_core=True,
            weight=1.2,
            estimated_hours=10,
            difficulty_tier="INTERMEDIATE"
        ),
        SkillNode(
            id="react-fundamentals",
            name="React 19 & Component Architecture",
            category="FRONTEND",
            description="Component lifecycle, JSX, Hooks (useState, useEffect, useMemo, useCallback), Context API, and state managers.",
            prerequisites=["javascript-fundamentals"],
            is_core=True,
            weight=1.5,
            estimated_hours=20,
            difficulty_tier="INTERMEDIATE"
        ),
        SkillNode(
            id="node-express-backend",
            name="Node.js & Express API Services",
            category="BACKEND",
            description="Node runtime internals, Event-driven I/O, Express routing, Middleware pipeline, and Structured error handling.",
            prerequisites=["javascript-fundamentals", "http-rest-apis"],
            is_core=True,
            weight=1.4,
            estimated_hours=15,
            difficulty_tier="INTERMEDIATE"
        ),
        SkillNode(
            id="database-sql-prisma",
            name="PostgreSQL & Prisma ORM",
            category="DATABASE",
            description="Relational database schema modeling, Indexes, Foreign keys, ACID transactions, and Prisma ORM migrations.",
            prerequisites=["node-express-backend"],
            is_core=True,
            weight=1.3,
            estimated_hours=14,
            difficulty_tier="INTERMEDIATE"
        ),
        SkillNode(
            id="auth-security",
            name="Authentication & Web Security",
            category="BACKEND",
            description="JWT tokens, HttpOnly session cookies, OAuth 2.0 / OIDC, Password hashing (Argon2/bcrypt), and OWASP Top 10 defenses.",
            prerequisites=["node-express-backend", "database-sql-prisma"],
            is_core=True,
            weight=1.2,
            estimated_hours=10,
            difficulty_tier="ADVANCED"
        ),
        SkillNode(
            id="nextjs-fullstack",
            name="Next.js App Router & SSR",
            category="FRONTEND",
            description="Server Components vs Client Components, Streaming SSR, Server Actions, Dynamic routing, and Edge caching.",
            prerequisites=["react-fundamentals", "typescript-core", "node-express-backend"],
            is_core=True,
            weight=1.4,
            estimated_hours=16,
            difficulty_tier="ADVANCED"
        ),
        SkillNode(
            id="testing-cicd",
            name="Automated Testing & CI/CD Pipelines",
            category="DEVOPS",
            description="Unit testing with Vitest/Jest, E2E testing with Playwright, Docker containerization, and GitHub Actions CI pipelines.",
            prerequisites=["nextjs-fullstack"],
            is_core=False,
            weight=1.0,
            estimated_hours=10,
            difficulty_tier="ADVANCED"
        )
    ],
    edges=[
        SkillEdge(source="html-css-basics", target="javascript-fundamentals"),
        SkillEdge(source="javascript-fundamentals", target="typescript-core"),
        SkillEdge(source="javascript-fundamentals", target="http-rest-apis"),
        SkillEdge(source="javascript-fundamentals", target="react-fundamentals"),
        SkillEdge(source="javascript-fundamentals", target="node-express-backend"),
        SkillEdge(source="http-rest-apis", target="node-express-backend"),
        SkillEdge(source="node-express-backend", target="database-sql-prisma"),
        SkillEdge(source="node-express-backend", target="auth-security"),
        SkillEdge(source="database-sql-prisma", target="auth-security"),
        SkillEdge(source="react-fundamentals", target="nextjs-fullstack"),
        SkillEdge(source="typescript-core", target="nextjs-fullstack"),
        SkillEdge(source="node-express-backend", target="nextjs-fullstack"),
        SkillEdge(source="nextjs-fullstack", target="testing-cicd")
    ]
)
