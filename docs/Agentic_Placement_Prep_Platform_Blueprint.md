# Agentic Placement Preparation Platform — Engineering Blueprint

**Author role assumed:** Senior AI Architect / Staff Engineer / Technical Mentor
**Target:** A production-grade, multi-agent AI mentor for SDE placement prep, buildable over ~2-3 months of focused part-time work.

---

## 1. Product Vision

### 1.1 Problem Statement

Placement prep today is a collection of disconnected tools: LeetCode for DSA, a separate mock-interview platform, ChatGPT for doubt-solving, a spreadsheet for tracking topics, and YouTube for CS fundamentals. None of these tools share state. A student's "weak topic list" lives in their head, their progress is self-reported, and there is no system that **remembers** what happened last week, **adapts** the plan based on it, and **proactively** tells the student what to do next.

The core problem this platform solves is **closing the loop**: diagnose → plan → practice → evaluate → re-plan → remind, continuously, with persistent memory of the individual student, for months at a time.

### 1.2 Users

- **Primary:** Final-year B.Tech/B.E. CS/IT students preparing for SDE-1/SDE-2 placements (3-12 month horizon).
- **Secondary:** Working professionals preparing for a switch (less time, need high-efficiency targeting).
- **Tertiary:** College Training & Placement Officers (TPOs) who want cohort-level dashboards (aggregate mastery heatmaps, at-risk student flags).
- **Implicit user:** The system itself acts as a "mentor persona" — a single, continuous relationship across sessions, not a stateless Q&A bot.

### 1.3 Differentiation vs. Existing Platforms

| Dimension | LeetCode / Codeforces | InterviewBit / AlgoExpert | Pramp / Generic AI chatbot | **This Platform** |
|---|---|---|---|---|
| Personalization | None (everyone sees same problem sets) | Static tracks | Stateless, per-conversation | Per-user skill graph + adaptive curriculum |
| Memory across sessions | Submission history only | Course progress only | None | Episodic + semantic + profile memory layers |
| Mock interviews | None | Pre-recorded/canned | Peer-based or single LLM call | Multi-turn agentic interview with rubric scoring + reflection |
| Plan adaptation | Manual | Manual | None | Closed-loop: progress agent triggers re-planning agent |
| Multi-domain coverage | DSA only | DSA + some CS fundamentals | Conversational only | DSA + Resume + CS Fundamentals + Behavioral, unified |
| Architecture | Monolithic web app | Monolithic web app | Single LLM call | True multi-agent orchestration with explicit state machine |
| Explainability | N/A | N/A | Black box | Decision traces surfaced to user ("why this problem today") |

### 1.4 Core Product Loop

```
 Onboarding (resume + self-assessment + target role/companies)
        │
        ▼
 Diagnostic phase (CS Fundamentals + DSA Agent run baseline assessment)
        │
        ▼
 Roadmap generation (Planning Agent builds week-by-week plan)
        │
        ▼
 Daily/weekly practice (DSA Agent serves adaptive problems,
                         CS Fundamentals Agent serves quizzes)
        │
        ▼
 Evaluation (DSA Agent grades code, Interview Agent grades mock interviews)
        │
        ▼
 Progress Tracking Agent updates skill graph / mastery scores
        │
        ▼
 Planning Agent re-plans (spaced repetition + new weak areas)
        │
        └──► loop continues, reminders sent via notification tools
```

---

## 2. Agentic Design — Multi-Agent Architecture

The system is a **supervisor (Manager) + specialist workers** architecture, implemented as a LangGraph state machine (Section 4). Every agent is a node (or subgraph) that reads from and writes to a shared `PlatformState`. Agents do **not** call each other directly — all communication is mediated through the Manager and the shared state object, which keeps the system debuggable and avoids agent-to-agent infinite loops.

> **Note on multi-track support:** Sections 2.2-2.7 describe the "core" agents assuming a DSA/SDE-generalist focus. Section 2.9 generalizes this into a **Track abstraction** so the same architecture serves Web Dev, ML, Data, and other role-specific preparation, without proliferating one-off agents per domain. Read 2.2 (DSA Agent) as the *reference implementation* of the generalized "Practice Agent" pattern described in 2.9.

### 2.1 Manager Agent (Orchestrator / Supervisor)

- **Responsibilities:** Classify user intent, decide which specialist agent(s) to invoke (single-shot or sequential chain), maintain conversation-level context, aggregate multi-agent outputs into one coherent response, enforce guardrails (e.g., refuse to "just give the answer" during a mock interview).
- **Inputs:** Raw user message, current `PlatformState` (profile, skill snapshot, session history), retrieved memory context.
- **Outputs:** `intent` classification, `routing_decision` (which node(s) to call next), final synthesized response to user.
- **Tools used:** Lightweight intent-classification LLM call (can use a smaller/cheaper model than the specialist agents), conversation summarizer.
- **Memory requirements:** Short-term (current session buffer) only — it is stateless across sessions except for what's loaded from long-term memory at session start.
- **Communication:** Hub-and-spoke — every specialist agent's output returns to the Manager before being shown to the user or before the graph proceeds to the next node.

### 2.2 DSA Agent (reference implementation of the "Practice Agent" pattern — see 2.9)

- **Responsibilities:** Maintain the DSA topic taxonomy (arrays, trees, graphs, DP, etc.), select/generate problems matched to the student's current mastery level and roadmap stage, evaluate submitted code (correctness via test execution + complexity analysis via LLM), update per-topic mastery scores, generate hints (not solutions) on request.
- **Inputs:** User's current skill snapshot (per-topic mastery scores 0-1), roadmap stage, submitted code/solution, problem-bank metadata.
- **Outputs:** Recommended problem(s) with difficulty + topic tags, code evaluation result (pass/fail per test case, time/space complexity estimate, code-quality feedback), updated mastery delta for the relevant topic(s).
- **Tools used:** Code execution sandbox (Judge0/Piston) against the **native problem bank**, problem vector store (semantic search "find me a problem similar to X but on graphs"), unofficial LeetCode/Codeforces stats APIs for *passive* tracking of the user's external submission history. See **2.12** for the full two-tier model — the agent does not submit code to LeetCode on the user's behalf.
- **Memory requirements:** Reads `user_skill_mastery` table (long-term), reads/writes `dsa_attempts` table, queries problem embeddings in vector DB.
- **Communication:** Receives routing from Manager; writes mastery deltas to shared state, consumed by the Progress Tracking Agent on the same turn or in a nightly batch.

### 2.3 Resume Agent

- **Responsibilities:** Parse uploaded resume (PDF/DOCX) into structured fields (skills, projects, experience, education), score against target job description (ATS-style keyword + semantic match), generate specific line-edit suggestions, extract a "claimed skills" list that feeds the CS Fundamentals and DSA agents (e.g., "candidate claims React + Node — should be quizzed on those too").
- **Inputs:** Resume file, optional target job description text, target companies (from user profile).
- **Outputs:** Structured resume JSON, ATS match score, list of improvement suggestions (bullet-level), extracted skill list (feeds skill graph as "claimed, unverified" nodes).
- **Tools used:** Resume parser (PDF text + layout extraction), embedding model for semantic JD-resume matching, LLM for suggestion generation.
- **Memory requirements:** Writes to `resumes` and `resume_analyses` tables; resume embedding stored in vector DB for later "tailor resume for company X" queries.
- **Communication:** Sends "claimed skills" list to Manager, which can route a follow-up to CS Fundamentals Agent to verify those skills via quiz.

### 2.4 CS Fundamentals Agent

- **Responsibilities:** Maintain question banks for OS, DBMS, Computer Networks, OOP, System Design basics; run topic-wise quizzes/diagnostics; answer conceptual doubts using RAG over a curated knowledge base (textbooks, notes); identify conceptual gaps.
- **Inputs:** Topic to quiz/explain, user's prior CS-fundamentals mastery scores, free-text doubt question.
- **Outputs:** Quiz questions with model answers and rubric, RAG-grounded explanations (with citations to source notes), updated mastery deltas per CS subject area.
- **Tools used:** RAG retrieval over `cs_fundamentals_kb` vector collection, LLM for question generation and explanation, quiz-grading LLM call (rubric-based).
- **Memory requirements:** `user_skill_mastery` table (subject = CS fundamentals categories), vector KB for RAG (read-only, pre-populated).
- **Communication:** Mastery deltas → Progress Tracking Agent. Can be invoked directly by Manager for doubt-solving, or by Planning Agent for scheduled diagnostics.

### 2.5 Interview Agent

- **Responsibilities:** Conduct multi-turn mock interviews — technical (DSA/system design) and behavioral (HR/STAR-format). Maintain interview persona/state across turns (interviewer doesn't reveal hints unless asked; tracks what's been covered). After the interview, run an **evaluation pass**: score per-question on correctness, communication, problem-solving approach (technical) or STAR structure, specificity, impact (behavioral). Optionally supports voice mode (STT/TTS).
- **Inputs:** Interview type + difficulty (from Planning Agent or user choice), target company persona (optional, e.g., "interview style similar to a fintech company"), live user responses (text or transcribed audio).
- **Outputs:** Next interview question/follow-up, end-of-interview structured evaluation report (per-question scores + overall feedback + specific improvement actions), mastery deltas for "communication", "behavioral", and topic-specific technical mastery.
- **Tools used:** LLM (interviewer persona + evaluator persona — run as two separate prompts/roles to reduce bias), code execution sandbox (if candidate writes code live), Whisper (STT) and TTS engine for voice mode, web search for "recent interview experiences at company X" (used to tailor question style).
- **Memory requirements:** Writes full transcript to `mock_interviews`/`interview_turns` tables; writes evaluation summary as an episodic memory entry (vector DB) for later retrieval ("how did I do in my last 3 mocks for company X?").
- **Communication:** Evaluation summary → Progress Tracking Agent → may trigger Planning Agent re-plan if a recurring weakness is detected (e.g., three interviews in a row with weak DP performance).

### 2.6 Progress Tracking Agent

- **Responsibilities:** The "central nervous system." Aggregates mastery deltas from all other agents, updates the persistent skill graph (per-topic mastery scores using a tracking model — see 2.6.1), computes derived metrics (overall readiness score, weak-topic ranking, streaks), detects regression (forgetting curve) and triggers spaced-repetition scheduling, decides whether the current roadmap needs adjustment and signals the Planning Agent.
- **2.6.1 Mastery model:** Use a simple **Bayesian Knowledge Tracing (BKT)**-style update or an **Elo-like rating** per (user, topic) pair — update on every attempt: `new_mastery = old_mastery + K * (outcome - expected_outcome)`. This is simple enough to implement from scratch (good interview talking point) but principled.
- **Inputs:** Mastery deltas/events from DSA, CS Fundamentals, Interview, Resume agents (each event = `{topic, outcome, difficulty, timestamp}`).
- **Outputs:** Updated `user_skill_mastery` rows, a `replan_signal` boolean + reason (consumed by Planning Agent), analytics payloads for the dashboard.
- **Tools used:** SQL analytics queries, no LLM call required for the core update (rule-based/statistical) — though it can use an LLM to generate a natural-language progress summary for the user.
- **Memory requirements:** Owns the `user_skill_mastery`, `study_sessions` aggregation, and writes daily snapshots for trend charts.
- **Communication:** Sits between all "doing" agents and the Planning Agent. Every graph execution that produces a mastery-relevant event passes through this agent before the turn ends.

### 2.7 Planning Agent

- **Responsibilities:** Generate the initial roadmap (topic sequence + timeline based on target date and current mastery), generate daily/weekly study plans, integrate spaced-repetition scheduling (using FSRS or SM-2 algorithm) for previously-attempted topics, re-plan when the Progress Tracking Agent signals drift (falling behind schedule, recurring weakness, faster-than-expected progress), push schedule items to calendar integration and notification system.
- **Inputs:** User profile (target date, target companies/roles, hours/day available), current skill graph snapshot, `replan_signal` from Progress Tracking Agent, spaced-repetition due-items list.
- **Outputs:** `roadmap` + `roadmap_items` (topic, target date, status), today's/this-week's task list, calendar events, notification triggers.
- **Tools used:** Spaced-repetition algorithm (FSRS implementation), calendar API (Google Calendar), LLM for generating human-readable plan summaries and rationale ("why we moved DP earlier this week").
- **Memory requirements:** Reads/writes `roadmaps` and `roadmap_items` tables; reads skill graph (from Progress Tracking Agent's output / `user_skill_mastery`).
- **Communication:** Receives `replan_signal` from Progress Tracking Agent (the only agent-to-agent "signal" that's effectively a priority routing hint to the Manager — implemented as a conditional edge, not a direct call).

### 2.8 Inter-Agent Communication Summary

```
User message
   │
   ▼
Manager Agent ──(intent: "give me a DP problem")──► DSA Agent
   │                                                     │
   │◄──────────── recommended problem ──────────────────┘
   │
   ▼ (after user submits solution, next turn)
Manager Agent ──(intent: "evaluate my code")──────► DSA Agent
   │                                                     │
   │                                          mastery_delta{topic: "DP", outcome: 0.8}
   │                                                     ▼
   │                                          Progress Tracking Agent
   │                                                     │
   │                                          replan_signal? ──► Planning Agent (if true)
   │◄──────────────── final response ───────────────────┘
   ▼
User
```

All inter-agent "messages" are simply fields written into the shared `PlatformState` dict — there is no separate message bus. This is the simplest correct design for a LangGraph-based system and avoids race conditions.

### 2.9 Generalizing Beyond DSA: The Track Abstraction

The agents in 2.2-2.7 are described in DSA/SDE-generalist terms, but the same architecture must serve **Web Dev**, **ML/Data**, and other role-specific tracks without turning into a pile of one-off agents. The generalization is to recognize that DSA, Web Dev, and ML are all instances of the same pattern: a **Track**, defined by a taxonomy, a practice-task format, and an evaluation method — and a single **Practice Agent template** that gets parameterized per track.

**`Track` definition (conceptual schema):**

```python
class Track(TypedDict):
    track_id: str                  # "dsa", "web_dev", "ml_data", "system_design"
    display_name: str
    topic_taxonomy: list[Topic]    # ordered DAG of topics + prerequisites
    practice_format: Literal["coding_problem", "project_task", "notebook_task", "scenario_prompt"]
    evaluation_strategy: Literal["judge0_test_cases", "sandbox_tests_plus_llm_review",
                                   "notebook_metrics_plus_llm_review", "llm_rubric_only"]
```

**Onboarding maps target role → active tracks** (Section 13.1's "Target role" dropdown drives this):

| Target Role | Active Tracks |
|---|---|
| SDE-1 / Generalist | `dsa` (heavy), `cs_fundamentals`, `system_design` (light) |
| Full-Stack Web Developer | `dsa` (light), `web_dev`, `cs_fundamentals`, `system_design` |
| ML Engineer | `dsa` (light), `ml_data`, `stats_probability`, `cs_fundamentals` |
| Data Analyst | `sql_data`, `stats_probability`, `business_case_studies` |

**Practice Agent template — shared interface every track-specific agent implements:**

```python
class PracticeAgent(Protocol):
    track_id: str

    def generate_task(self, user_skill_snapshot: dict, roadmap_stage: str) -> Task: ...
    def evaluate_submission(self, task: Task, submission: Submission) -> EvaluationResult: ...
    def emit_mastery_delta(self, evaluation: EvaluationResult) -> MasteryDelta: ...
```

The **Manager Agent**, **Progress Tracking Agent**, and **Planning Agent** are entirely track-agnostic — they operate on `(topic, outcome, difficulty)` events and `roadmap_items`, regardless of which track a topic belongs to. This means **2.5 (Interview Agent), 2.6 (Progress Tracking), and 2.7 (Planning Agent) require zero changes** to support new tracks; you are only adding new `PracticeAgent` implementations (2.10, 2.11 below) and populating their `topic_taxonomy` + question/task banks. The Manager routes a practice-intent message to whichever `PracticeAgent` instance(s) correspond to the user's active tracks (determined from `user_profiles.active_tracks`).

### 2.10 Web Dev Agent (Practice Agent: `track_id = "web_dev"`)

- **Responsibilities:** Cover the Web Dev taxonomy (HTML/CSS fundamentals, JS fundamentals & async, React/frontend frameworks, REST API design, auth, databases & ORMs, deployment/CI basics). Generate **project-style tasks** rather than single-function problems — e.g., "build a paginated, filterable bookmarks REST API," "fix this accessibility bug in the given React component," "implement debounced search in this form." Evaluate via automated tests (unit/integration, run in sandbox) **plus** an LLM code-review pass against a rubric covering correctness, code structure, security basics (e.g., input validation, auth checks), and accessibility.
- **Inputs:** User's web-dev skill snapshot, roadmap stage, a starter repo/scaffold (for "fix this bug" tasks) or a blank scaffold (for "build this feature" tasks), submitted code (zip/Git diff or pasted files).
- **Outputs:** A task spec + starter scaffold reference, evaluation result (test pass/fail + LLM review notes per rubric dimension), mastery delta per web-dev subtopic.
- **Tools used:** Sandbox with Node/Python runtime for running test suites (extends the same Judge0/Piston-class sandbox used by the DSA Agent, but with project-level test runners like `pytest`/`jest` rather than single-function harnesses), LLM for code review, vector store of web-dev task templates (for semantic selection of the next task based on weak subtopics).
- **Memory requirements:** `user_skill_mastery` rows scoped to `track_id = "web_dev"`, a `practice_attempts` table generalized from `dsa_attempts` (see 2.14) storing submitted code + review output.
- **Communication:** Identical pattern to the DSA Agent — mastery deltas → Progress Tracking Agent.

### 2.11 ML / Data Agent (Practice Agent: `track_id = "ml_data"`)

- **Responsibilities:** Cover the ML/Data taxonomy (Python data stack — NumPy/Pandas, classical ML algorithms, model evaluation & metrics, deep learning basics, SQL/data manipulation, MLOps fundamentals). Generate **notebook-style tasks**: "implement gradient descent from scratch and verify against `sklearn`," "given this dataset, build a baseline classifier and report precision/recall/F1," "explain why this model is overfitting given these learning curves." Evaluation combines: running the submitted notebook/script in a sandboxed kernel and checking that reported metrics meet a threshold (e.g., "F1 > 0.7 on the holdout set"), plus an LLM review of methodology (did they do a train/test split correctly? handle class imbalance? justify model choice?), plus conceptual quiz items for theory-only topics (bias-variance, regularization).
- **Inputs:** User's ML skill snapshot, roadmap stage, dataset reference (small curated datasets bundled with each task — not full Kaggle-scale, to keep sandbox runtime bounded), submitted notebook/script.
- **Outputs:** Task spec + dataset reference, evaluation result (metric values vs. threshold + methodology review notes), mastery delta per ML subtopic.
- **Tools used:** Sandboxed Python execution environment with pinned ML libraries (pandas/numpy/scikit-learn pre-installed image), LLM for methodology review and conceptual-question grading, vector store of ML task templates + curated small datasets.
- **Memory requirements:** Same `practice_attempts` generalization as 2.10, scoped to `track_id = "ml_data"`.
- **Communication:** Identical pattern — mastery deltas → Progress Tracking Agent.

> **Adding further tracks** (Mobile Dev, DevOps, etc.) follows the exact same recipe: define the taxonomy, pick a `practice_format`/`evaluation_strategy` from the enum (or add a new one), and implement the `PracticeAgent` interface. No changes to the Manager, Progress Tracking Agent, or Planning Agent are needed — this is the payoff of the Track abstraction and is worth calling out explicitly in interviews as an example of designing for extensibility.

### 2.12 LeetCode & External Problem Integration (Two-Tier Model)

A common point of confusion: **there is no official LeetCode submission API**, and unofficial wrappers only expose *public profile data* (problems solved, recent submissions, contest rating) — not the ability to submit code on a user's behalf. Reproducing LeetCode's problem statements verbatim also raises copyright/ToS concerns. The DSA Agent (and Web Dev/ML Agents) therefore use a **two-tier model**:

**Tier 1 — Native problem bank (primary evaluation loop).** The platform maintains its own problem set: statements either authored originally or sourced from openly-licensed datasets (e.g., permissively-licensed problem+test-case collections, or problems you author yourself), each tagged into the platform's own taxonomy with full test suites. These run through Judge0/Piston **inside the platform** for the "Submit" button described in 13.3 — full pass/fail, runtime, complexity feedback, and this is what feeds the mastery model directly. For the MVP, bootstrap from an open dataset (~150-300 problems is enough to cover the taxonomy at 2-3 difficulty levels per topic) and re-tag into your schema.

**Tier 2 — Passive external tracking + recommendation.** The DSA Agent periodically syncs a user's *public* LeetCode/Codeforces profile via unofficial stats APIs (problems solved by difficulty/topic, contest rating) and feeds this as a **secondary signal** into the skill graph — e.g., "user shows 40 solved Graph problems on LeetCode → treat as supplementary evidence of Graphs mastery, blended with the platform's own diagnostic score." This also enables recommending external problems with a deep link: *"Here's a LeetCode problem on Topological Sort you haven't solved — [open in LeetCode ↗]"*. On the next profile sync, the new submission is picked up and mastery is updated retroactively.

**Net effect:** the platform **owns** the full evaluate-and-update loop for its native bank, and acts as a **recommendation + tracking layer** on top of LeetCode/Codeforces for everything else — the same approach taken by AlgoExpert/NeetCode (own curated set + editorial, rather than wrapping LeetCode). This is a deliberate, defensible design choice worth stating explicitly when discussing the project.

### 2.13 Resource Curation Pipeline (Learning Resources)

For CS Fundamentals, Web Dev, and ML topics, "RAG explanation + quiz" is insufficient — students learn from a good 20-minute video walkthrough or a well-written article, and recommendations must point to **real, vetted, existing content**, not LLM-invented links (LLMs hallucinate video titles and URLs reliably; never let an agent generate a link shown directly to the user).

This is implemented as an **offline curation pipeline**, not a live agent call — a background worker populates a `learning_resources` table, and agents simply *query* it at recommendation time.

**Sourcing — two layers:**

1. **Curated allowlist (primary, highest quality).** For each topic in each track's taxonomy, hand-pick 2-4 trusted sources as a one-time content-ops task: e.g., OS/DBMS/CN → Gate Smashers, Neso Academy; Web Dev → Traversy Media, Web Dev Simplified, Fireship, MDN, official React docs; ML → StatQuest, 3Blue1Brown, freeCodeCamp. Stored as `{topic_id, resource_type, title, url, source, channel_or_publisher}` — roughly 200-400 rows total across all tracks, manageable manually or semi-automatically.
2. **API/search backfill (secondary, for long-tail topics).** For topics not yet covered, use the **YouTube Data API** `search.list`, *restricted to the channel-ID allowlist from layer 1*, sorted by view count/rating and filtered by duration — this stays "live" without surfacing arbitrary low-quality videos. For articles, similarly restrict `web_search`/`web_fetch` to a domain allowlist (`geeksforgeeks.org`, `developer.mozilla.org`, `freecodecamp.org`, official docs domains).

**Storage & retrieval:** each `learning_resources` row gets a title+description embedding in the vector DB, indexed by `topic_id`, `track_id`, and `difficulty`. When the Planning Agent assigns a roadmap item (e.g., "Week 5: REST API design"), it performs a vector + filter lookup against `learning_resources` and attaches 1-2 videos + 1 article alongside the practice task — this is the resource panel shown in the Web Dev workspace mock in the discussion above.

**Background job:** runs weekly (Celery beat schedule), re-running the API backfill for topics whose resource count is below a threshold or whose existing resources are stale (e.g., a linked video was deleted — checked via a lightweight `HEAD` request / API existence check). Curated allowlist rows are never auto-removed, only supplemented.

### 2.14 Schema Additions Summary (forward reference)

The changes in 2.9-2.13 introduce the following additions to the data model (full DDL to be specified in the Data Modeling section):

- **`tracks`** — `track_id`, `display_name`, `practice_format`, `evaluation_strategy`.
- **`user_profiles.active_tracks`** — array/M2M of `track_id`s, set during onboarding from target role.
- **`topics`** — generalized from a DSA-only taxonomy to include `track_id` FK, so every track's taxonomy lives in one table.
- **`practice_attempts`** — generalization of `dsa_attempts` to a track-agnostic table: `{user_id, topic_id, track_id, task_id, submission, evaluation_result, mastery_delta, created_at}`.
- **`external_profile_links`** — `{user_id, platform ("leetcode"|"codeforces"), external_username, last_synced_at}` for Tier 2 of 2.12.
- **`learning_resources`** — `{resource_id, topic_id, track_id, resource_type ("video"|"article"), title, url, source, difficulty, embedding}` for 2.13.

---

## 3. System Architecture

### 3.1 Layer Overview

| Layer | Responsibility | Primary Tech |
|---|---|---|
| Frontend | Chat UI, dashboard, code editor, voice interface | Next.js 14 (App Router), TailwindCSS, shadcn/ui |
| API Gateway / Backend | Auth, request validation, streaming responses, REST + WebSocket | FastAPI |
| Agent Orchestration | Multi-agent state machine, routing, tool execution | LangGraph |
| Memory Layer | Short-term session state, long-term persistence, semantic recall | Redis + Postgres (LangGraph checkpointer) + pgvector/Qdrant |
| Database Layer | Structured data (users, attempts, roadmaps, interviews) | PostgreSQL |
| Vector DB | Embeddings for problems, KB chunks, episodic memory | pgvector (MVP) → Qdrant (scale) |
| LLM Layer | Reasoning, generation, evaluation, embeddings | Claude (primary), embedding model (e.g., `text-embedding-3-large` or open-source) |
| Background Workers | Spaced-repetition scheduling, nightly memory consolidation, reminders | Celery / Arq + Redis broker |
| Observability | Tracing agent runs, evaluation, cost monitoring | LangSmith (or open-source: Langfuse) |
| External Integrations | Calendar, notifications, code execution, external problem data | Google Calendar API, SendGrid/Twilio, Judge0, LeetCode/GitHub APIs |

### 3.2 ASCII Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                  │
│   Next.js Web App  |  Code Editor (Monaco)  |  Voice UI (WebRTC/Whisper)   │
└───────────────────────────────────┬────────────────────────────────────────┘
                                      │ HTTPS (REST) + WebSocket/SSE (streaming)
┌───────────────────────────────────▼────────────────────────────────────────┐
│                         API GATEWAY  (FastAPI)                             │
│   Auth (JWT/OAuth2) | Rate limiting | Pydantic validation | Streaming      │
└───────────────────────────────────┬────────────────────────────────────────┘
                                      │
┌───────────────────────────────────▼────────────────────────────────────────┐
│                  AGENT ORCHESTRATION LAYER  (LangGraph)                     │
│                                                                              │
│   ┌─────────────────┐     routes intent to one or more of:                 │
│   │  Manager Agent   │────────────────┬───────────────┬──────────────────┐ │
│   │  (Supervisor)    │                │               │                  │ │
│   └────────┬─────────┘          ┌─────▼─────┐   ┌─────▼──────┐   ┌──────▼─────┐
│            │                    │ DSA Agent │   │Resume Agent│   │ CS Fund.   │
│            │                    └─────┬─────┘   └─────┬──────┘   │ Agent      │
│            │                          │               │           └──────┬─────┘
│            │                    ┌─────▼─────────────────────────────────▼─────┐
│            │                    │             Interview Agent                 │
│            │                    └─────────────────────┬─────────────────────┘
│            │                                            │
│            │                          ┌─────────────────▼─────────────────┐
│            │                          │     Progress Tracking Agent        │
│            │                          └─────────────────┬─────────────────┘
│            │                                            │ replan_signal
│            │                          ┌─────────────────▼─────────────────┐
│            └─────────────────────────►│        Planning Agent              │
│                                        └────────────────────────────────────┘
└───────────────────────────────────┬────────────────────────────────────────┘
                                      │
┌───────────────────────────────────▼────────────────────────────────────────┐
│                              MEMORY LAYER                                   │
│  Redis (session/short-term) | Postgres Checkpointer (graph state, long-term)│
│  pgvector / Qdrant (semantic: problems, KB, episodic) | Neo4j (opt: graph)  │
└───────────────────────────────────┬────────────────────────────────────────┘
                                      │
┌───────────────────────────────────▼────────────────────────────────────────┐
│                       DATA & EXTERNAL TOOLS LAYER                           │
│  PostgreSQL (core relational data)                                          │
│  Judge0/Piston (code execution) | LeetCode & GitHub APIs                    │
│  Resume Parser | Google Calendar API | SendGrid/Twilio (notifications)     │
│  Whisper (STT) + TTS engine (voice interviews) | Web Search tool           │
└───────────────────────────────────┬────────────────────────────────────────┘
                                      │
┌───────────────────────────────────▼────────────────────────────────────────┐
│                                LLM LAYER                                    │
│   Claude (primary reasoning/generation/evaluation)                         │
│   Lightweight model for intent classification (cost optimization)          │
│   Embedding model for vector DB ingestion + query                          │
└──────────────────────────────────────────────────────────────────────────────┘

       Background workers (Celery/Arq) run alongside, consuming from Redis:
       - Nightly memory consolidation jobs
       - Spaced-repetition due-item scans → notification triggers
       - Scheduled diagnostics (weekly CS fundamentals quiz)
```

### 3.3 Key Architectural Decisions

1. **Single shared state, no message bus.** LangGraph's `PlatformState` is the only communication channel between agents. This is simpler to debug, test, and reason about than a pub/sub agent-message architecture, and is sufficient because the workflow is fundamentally a DAG-with-loops, not a fully decentralized swarm.
2. **Checkpointer = long-term conversational memory.** LangGraph's Postgres checkpointer persists the full graph state per `(user_id, thread_id)`, giving you "resume where you left off" for free.
3. **Separation of "fast path" and "slow path."** Real-time chat responses go through the FastAPI + LangGraph synchronous path (streamed via SSE). Heavy/periodic work (nightly mastery decay, spaced-repetition scans, memory consolidation/summarization) runs in Celery workers and writes results back to Postgres/vector DB, which the agents read on the next turn.
4. **pgvector first, dedicated vector DB later.** Co-locating vectors with relational data in Postgres (via `pgvector`) avoids a second database for the MVP and keeps transactional consistency between, e.g., a `dsa_attempts` row and its embedding. Migrate hot collections (problem bank, episodic memory) to Qdrant only once query volume/latency demands it.

---

## 13. Use Cases & UI Walkthroughs (What the User Actually Sees)

This section walks through the product screen-by-screen, in the order a real student would experience it. Each use case lists: the screen/interface, what the user enters or clicks, and what happens behind the scenes (which agents fire).

### 13.1 Sign-up & Onboarding Wizard

**Screen 1 — Account creation**
- Fields: name, email, password (or "Continue with Google").

**Screen 2 — Profile setup wizard (multi-step form)**
- Target role: dropdown — `SDE Intern / SDE-1 / SDE-2`
- Target companies: tag-input — e.g. `Amazon, Razorpay, Atlassian` (used later by Interview Agent for persona + by web-search tool for company-specific patterns)
- Placement/target date: date picker (e.g., "Dec 2026") — this is the single most important input, since the Planning Agent uses it to compute weeks-remaining and pacing
- Current status: college, branch, year, CGPA (optional)
- Known languages/tech stack: multi-select tags (Python, Java, React, etc.)
- Daily availability: slider — "How many hours/day can you study?" (e.g., 1-6 hrs) and which days of the week
- Resume upload (optional, drag-and-drop `.pdf`/`.docx`) — can be skipped and done later

**Behind the scenes:** This form populates `user_profiles`. No agent call yet — it's plain CRUD. If resume is uploaded, the **Resume Agent** fires asynchronously and the result is shown once ready (toast notification: "Resume analyzed ✓").

### 13.2 Diagnostic Assessment ("Baseline Skill Check")

After onboarding, the user sees:

```
┌──────────────────────────────────────────────────────────┐
│  Let's find out where you stand (≈20 min)                 │
│                                                              │
│  ☐ Section 1: DSA Concepts (8 MCQs, ~5 min)                │
│  ☐ Section 2: 2 Coding Problems (1 easy, 1 medium, ~10 min)│
│  ☐ Section 3: CS Fundamentals Quiz (10 MCQs, ~5 min)       │
│                                                              │
│              [ Start Diagnostic ]   [ Skip for now ]        │
└──────────────────────────────────────────────────────────┘
```

- **Section 1 & 3 (MCQ):** standard quiz UI — question text, 4 radio options, "Next" button, progress bar. These are served by the **CS Fundamentals Agent** and **DSA Agent** respectively (question generation/selection from the question bank).
- **Section 2 (Coding):** same split-pane editor described in 13.3, but in "diagnostic mode" — no hints available, used purely to calibrate.

**Result screen — "Your Starting Point":**

```
┌──────────────────────────────────────────────────────────┐
│                  YOUR BASELINE SKILL MAP                    │
│                                                              │
│        Arrays  ████████░░ 80%       OS    █████░░░░░ 50%   │
│        Strings ██████░░░░ 60%       DBMS  ███░░░░░░░ 30%   │
│        Trees   ████░░░░░░ 40%       CN    ██░░░░░░░░ 20%   │
│        Graphs  ██░░░░░░░░ 20%       OOP   ███████░░░ 70%   │
│        DP      █░░░░░░░░░ 10%                              │
│                                                              │
│   We've identified Graphs, DP, and CN as priority areas.   │
│              [ Generate My Roadmap → ]                      │
└──────────────────────────────────────────────────────────┘
```

**Behind the scenes:** Every diagnostic answer is sent as a `{topic, outcome, difficulty}` event to the **Progress Tracking Agent**, which initializes `user_skill_mastery` rows. Once diagnostics complete, the Manager routes to the **Planning Agent**, which generates the first `roadmap` + `roadmap_items`.

### 13.3 Solving a DSA Problem (Core Loop)

**Entry points:** "Today's Task" card on the dashboard, or typing in chat: *"give me a medium graph problem"*.

**Screen — Split-pane workspace:**

```
┌─────────────────────────────┬──────────────────────────────────────┐
│ Problem: Course Schedule II  │  ▾ Language: Python      [Run] [Submit]│
│ Difficulty: Medium  Tags: Graph, Topological Sort       │
│                               │  1  def findOrder(numCourses, prereqs):│
│ You are given numCourses...  │  2      # your code                   │
│                               │  3                                     │
│ Example 1:                   │  4                                     │
│  Input: [[1,0]]               │  ...                                   │
│  Output: [0,1]                │                                        │
│                               │  ──────────────────────────────────── │
│ Constraints: ...              │  Test Results:                        │
│                               │  ✅ Case 1 passed (0.02s)               │
│ ┌───────────────────────────┐│  ❌ Case 3 failed                       │
│ │ 💬 Ask Mentor / Hint        ││     Expected: [...] Got: [...]         │
│ │ "I'm stuck on cycle        ││  Estimated complexity: O(V+E) ✓        │
│ │  detection"                ││                                         │
│ │ [Send]                     ││  💡 Mentor: "You're not tracking        │
│ └───────────────────────────┘│  in-degree correctly — check your      │
│                               │  initialization of the in-degree array"│
└─────────────────────────────┴──────────────────────────────────────┘
```

**User actions:**
1. Reads problem statement.
2. Writes code in the Monaco editor.
3. Clicks **Run** → tests against visible sample cases only (fast feedback loop, no DB write).
4. Optionally asks for a **hint** via the chat box — the DSA Agent gives a *progressive* hint (first nudges toward the right data structure/pattern, only reveals more on repeated asks — never the full solution unless the user explicitly says "show solution," which is logged as a "gave up" signal for mastery scoring).
5. Clicks **Submit** → full evaluation via Judge0 against the complete hidden test suite + LLM-based complexity/code-quality review.

**Post-submission panel:**
```
┌──────────────────────────────────────────────────────────┐
│  ✅ Accepted — 8/8 test cases passed                        │
│  Runtime: 64ms (better than 71% of submissions)            │
│  Complexity: O(V+E) — matches optimal                       │
│                                                              │
│  Mastery update: Graphs  20% → 35% (+15)                    │
│  Topological Sort: First solve ✓                            │
│                                                              │
│  [ Solve a similar problem ]  [ Back to today's plan ]      │
└──────────────────────────────────────────────────────────┘
```

**Behind the scenes:** Submit triggers `DSA Agent → Judge0 (execution) → LLM (complexity/quality review) → mastery_delta event → Progress Tracking Agent → (maybe) replan_signal → Planning Agent`. All in one LangGraph run, shown to the user as a streamed response.

### 13.4 Resume Review

**Screen:**
```
┌──────────────────────────────────────────────────────────┐
│  📄 Upload your resume (.pdf/.docx)                         │
│  📋 (Optional) Paste a job description to tailor against    │
│                                                              │
│              [ Drag & drop or browse... ]                   │
└──────────────────────────────────────────────────────────┘
```

After upload, a side-by-side view:

```
┌───────────────────────────┬──────────────────────────────────────┐
│  Your Resume (rendered)    │  Analysis                              │
│                             │                                        │
│  ...Built a chat app using  │  ATS Match Score: 72/100               │
│  React and Firebase...      │  ⚠ "chat app" is vague — quantify      │
│                             │     impact (users, latency, scale)     │
│  ...Solved 150+ DSA          │  ✅ Strong: shows consistent practice  │
│  problems on LeetCode...     │                                        │
│                             │  Missing keywords vs JD: "Docker",     │
│                             │  "System Design", "CI/CD"               │
│                             │                                        │
│                             │  Detected skills: React, Firebase,     │
│                             │  Python, DSA → [Verify with a quick    │
│                             │   CS fundamentals check?] [Yes/No]     │
└───────────────────────────┴──────────────────────────────────────┘
```

**Behind the scenes:** Resume Agent extracts structured JSON, computes embedding-based JD match, generates inline suggestions. The "Verify with a quick check" button, if clicked, routes to the **CS Fundamentals Agent / DSA Agent** to generate a short skill-specific quiz (e.g., React lifecycle questions), closing the loop between claimed and verified skills.

### 13.5 Mock Interview

**Setup screen:**
```
┌──────────────────────────────────────────────────────────┐
│  Start a Mock Interview                                     │
│  Type:        ○ Technical (DSA)  ○ System Design  ● HR     │
│  Difficulty:  ○ Easy  ● Medium  ○ Hard                       │
│  Company style: [Amazon ▾]  (uses leadership-principle      │
│                   style follow-ups)                          │
│  Mode:        ● Text   ○ Voice 🎤                            │
│                            [ Start Interview ]               │
└──────────────────────────────────────────────────────────┘
```

**Interview room (chat interface, technical example):**
```
┌──────────────────────────────────────────────────────────┐
│ Interviewer: Let's start with a problem. You have a stream │
│ of integers and need to find the median at any point...    │
│                                                              │
│ [Code editor appears here if user starts writing code]     │
│                                                              │
│ You: I'd use two heaps — a max-heap for the lower half...   │
│                                                              │
│ Interviewer: Okay. What's the time complexity of inserting  │
│ a new number?                                                │
│                                                              │
│                                  [Type your response...]    │
│                                  [ End Interview ]           │
└──────────────────────────────────────────────────────────┘
```
In **voice mode**, the chat bubbles are replaced by a live waveform + transcript, with a mic toggle; the Interview Agent's responses are spoken via TTS.

**End-of-interview evaluation report:**
```
┌──────────────────────────────────────────────────────────┐
│  Mock Interview Report — HR / Amazon style — Medium         │
│                                                              │
│  Overall: 7.2 / 10                                           │
│  ─────────────────────────────────────────                  │
│  Q1 (Tell me about a conflict...): 8/10                      │
│    ✓ Strong STAR structure  ⚠ Missing measurable result      │
│  Q2 (Median of stream): 6/10                                  │
│    ✓ Correct approach (two heaps)                             │
│    ⚠ Didn't analyze space complexity                          │
│                                                              │
│  Communication: 7/10 — clear but a bit verbose                │
│                                                              │
│  📌 Added to your plan: "Practice quantifying impact in       │
│      behavioral answers" + "Revisit heap-based problems"      │
│                                                              │
│   [ View full transcript ]  [ Schedule next mock ]            │
└──────────────────────────────────────────────────────────┘
```

**Behind the scenes:** Two LLM roles run within the Interview Agent — an *interviewer* persona (asks questions, doesn't grade) and a separate *evaluator* persona (scores the full transcript against a rubric after the fact, reducing bias from the interviewer "wanting" a good answer). The evaluation output is written as both a structured row (`mock_interviews`, `interview_turns`) and an embedded episodic-memory summary for future recall.

### 13.6 Home Dashboard

```
┌──────────────────────────────────────────────────────────────────┐
│  Good morning, Aman 👋   Day 23 of your plan · 🔥 12-day streak     │
│                                                                      │
│  ┌─ Today's Plan ──────────────┐  ┌─ Skill Radar ─────────────┐    │
│  │ ☐ Solve: "Course Schedule II"│  │      Arrays                │   │
│  │      (Graphs, Medium)        │  │  DP    /\    Strings       │   │
│  │ ☐ Revise: 3 spaced-repetition│  │     \  /  \  /             │   │
│  │      problems (due today)    │  │ Graphs    Trees            │   │
│  │ ☐ CS Quiz: DBMS (10 Qs)      │  │      OOP  CN                │   │
│  │                               │  └─────────────────────────┘    │
│  │ [Start with Today's Task]    │                                   │
│  └───────────────────────────────┘  Readiness: 58% → target Dec '26│
│                                                                      │
│  ┌─ Ask your Mentor ──────────────────────────────────────────┐    │
│  │ 💬 "How am I tracking vs other students prepping for Amazon?"│   │
│  │                                              [Send]          │   │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Upcoming: Mock Interview (System Design) — Tomorrow, 6:00 PM       │
└──────────────────────────────────────────────────────────────────┘
```

This is the landing page after login — it's the synthesis of every agent's output: today's tasks (Planning Agent), skill radar (Progress Tracking Agent), readiness score, and a freeform chat box that routes through the Manager Agent like any other message.

### 13.7 Roadmap / Planning View

A horizontal timeline (weeks until target date) with topics as blocks, plus an "explain this plan" panel:

```
┌──────────────────────────────────────────────────────────────────┐
│  Your Roadmap → Target: Dec 2026 (24 weeks left)                   │
│                                                                      │
│  Week 1-2: Arrays & Strings ✅   Week 3-4: Trees ✅                  │
│  Week 5-7: Graphs (current) 🔵   Week 8-10: DP                       │
│  Week 11: Mock Interview Sprint  Week 12-14: System Design Basics    │
│  ...                                                                │
│                                                                      │
│  ⓘ Why this order? "Graphs moved earlier — your last 2 mock         │
│     interviews both included graph questions you struggled with."  │
│                                                                      │
│  [ Drag to reschedule ]  [ View full calendar ]                     │
└──────────────────────────────────────────────────────────────────┘
```

Dragging a block to reschedule sends a manual-override event, which the Planning Agent incorporates on its next run (and logs as a user preference for future planning).

### 13.8 Notifications

Delivered via email/push/in-app bell icon, generated by the background workers + Planning Agent:

- *"⏰ 3 spaced-repetition problems are due today — 10 min to keep your streak."*
- *"📅 Your weekly mock interview is scheduled for tomorrow, 6 PM. Reply to reschedule."*
- *"📊 Weekly summary: You solved 9 problems, improved Graphs mastery from 20%→55%. Next week's focus: Dynamic Programming."*

### 13.9 End-to-End "Day in the Life" Summary

| Time | Screen | What user does | Agents involved |
|---|---|---|---|
| 8:00 AM | Push notification | Reads daily reminder | Planning Agent (background job) |
| 8:05 AM | Dashboard | Opens today's DSA task | Manager → Planning Agent (fetch task) |
| 8:10 AM | Coding workspace | Solves problem, asks 1 hint, submits | DSA Agent, Judge0 |
| 8:25 AM | Workspace result panel | Sees mastery update | Progress Tracking Agent |
| 1:00 PM | Chat | Asks "explain normalization in DBMS" | CS Fundamentals Agent (RAG) |
| 6:00 PM | Interview room | Mock HR interview (voice) | Interview Agent (interviewer + evaluator) |
| 6:30 PM | Evaluation report | Reviews feedback | Progress Tracking Agent updates mastery |
| 9:00 PM | Roadmap view | Sees re-planned week (DP moved up) | Planning Agent (triggered by replan_signal) |
