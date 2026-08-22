# PlaceMate

**An autonomous multi-agent placement preparation platform.** PlaceMate replaces static roadmaps and disconnected practice tools with a closed-loop cognitive cycle — **Diagnose → Plan → Practice → Evaluate & Re-Plan** — driven by a Bayesian mastery model, a dependency-aware skill graph, a Preparation Load Index, and a team of specialized AI agents working in concert.

Every other placement-prep tool gives you content. PlaceMate gives you a *system that watches how you actually perform*, quantifies the gap between what you can solve in practice and what you can deliver under interview pressure, and re-plans your prep around it — in real time, with zero manual tuning.

---

## Table of Contents

- [Why PlaceMate](#why-placemate)
- [The Agentic Loop](#the-agentic-loop)
- [Signature Systems: PTG & the Review Panel](#signature-systems-ptg--the-review-panel)
- [The Interview System](#the-interview-system)
- [Free vs. Premium: Company-Specific Prep](#free-vs-premium-company-specific-prep)
- [Scalability, UX & Technical Sophistication](#scalability-ux--technical-sophistication)
- [Feature Matrix](#feature-matrix)
- [System Architecture](#system-architecture)
- [Agent Roster](#agent-roster)
- [The Engine Layer](#the-engine-layer-deterministic-math-no-ai)
- [Practice Sandbox](#practice-sandbox)
- [API Reference](#api-reference)
- [Frontend Routes](#frontend-routes)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)

---

## Why PlaceMate

Most placement-prep tools are static: a checklist of topics, a pile of LeetCode links, maybe a canned mock-interview script. None of them close the loop. They don't know whether you're actually improving, they don't know where your prep time is being wasted, and they definitely don't know that you can solve a problem perfectly untimed at your desk but freeze the moment an interviewer is watching.

PlaceMate is built around one central insight: **practice performance and interview performance are different signals, and the gap between them is the single most useful diagnostic in placement prep.** We call this the **Performance Transfer Gap (PTG)**, and the entire platform — planning, revision scheduling, load management, agent behavior — is built to measure it and act on it.

---

## The Agentic Loop

```
 ┌───────────────┐     ┌───────────────┐     ┌────────────────┐     ┌────────────────────┐
 │    DIAGNOSE    │────▶│      PLAN      │────▶│    PRACTICE     │────▶│  EVALUATE & REPLAN  │
 │  Multi-source  │     │ Graph-driven   │     │ Sandbox + mock  │     │  BKT + PTG + causal │
 │  intake:       │     │ roadmap:       │     │ interviews:     │     │  graph traversal    │
 │  resume,       │     │ Gemini-backed  │     │ Judge0 sandbox, │     │  feeds back into    │
 │  GitHub,       │     │ daily task     │     │ dual-agent      │     │  the next plan      │
 │  LeetCode,     │     │ generation     │     │ interview panel │     │                     │
 │  self-assess   │     │                │     │                 │     │                     │
 └───────────────┘     └───────────────┘     └────────────────┘     └────────────────────┘
```

This is not a one-shot wizard. Every stage writes back into a shared, persistent student state, so the loop compounds — each day's plan is a function of everything the student has done so far, not a static curriculum.

---

## Signature Systems: PTG & the Review Panel

### Performance Transfer Gap (PTG)

PTG is the platform's core differentiator: a single deterministic score that quantifies **how much a student's ability degrades under interview conditions relative to untimed practice.**

```
PTG = Practice Score − Interview Score
```

- **Practice Score** is computed from correctness, complexity-match, time efficiency, and recency-decay across a student's sandbox submissions.
- **Interview Score** is a weighted composite from live mock-interview sessions — Technical (40%), Communication (25%), Speed (20%), plus supporting rubric dimensions scored turn-by-turn by the Shadow Critic agent.
- The gap between the two is bucketed into **severity tiers**, each mapped to a distinct intervention: a large positive PTG doesn't just get logged — it changes what the Curriculum Agent assigns next (more mock interviews, less new content), and it directly inflates the load estimate in the Review Panel (see below), because a student who chokes under pressure needs remedial time the raw topic checklist would never surface.

This turns "you're weak at Trees" into "you're not actually weak at Trees — you solve them fine at your desk, but you fall apart the moment someone is watching you think, and here's exactly how much that's costing you."

### The Review Panel — Load & Capacity Intelligence

The Review Panel is a dedicated screen that answers the question every student actually has and no roadmap tool answers: *"Am I going to be ready in time, given how much time I actually have?"*

It's powered by the **Preparation Load Index (PLI)**, a purpose-built engine that models the student's remaining prep as a capacity-planning problem, not a checklist:

```
topic_load_minutes = (target_mastery − current_mastery) × minutes_to_master_per_unit
daily_load_total   = Σ topic_load_minutes / remaining_days
capacity           = daily_time_budget_minutes

overload_ratio     = daily_load_total / capacity
```

- **< 0.85 → On Track 🟢  ·  0.85–1.0 → At Risk 🟡  ·  > 1.0 → Overloaded 🔴**
- Every topic's load is individually inflated when its PTG is high — the Review Panel is the first place in the platform where "you can solve this in practice" and "you can solve this in an interview" are reconciled into one honest number.
- Topics are ranked by daily-minute contribution, surfacing the **top 3 bottlenecks** automatically — no manual triage required.
- A **projected readiness date** is computed from total remaining load against the student's own pace and stacked directly against their deadline, so overload isn't an abstract warning — it's "you'll finish 4 days after your deadline at this rate."
- The panel is fully interactive: adjusting the daily time budget or deadline re-triggers the calculation live and the projection updates immediately — this is a working what-if instrument, not a static report.

**Complete flow:** Student opens `/review` → backend reads persisted student state (mastery per topic, time budget, deadline, PTG) from PostgreSQL → `LoadCalculator` computes PLI per topic and in aggregate → panel renders a capacity gauge, load-status badge, per-topic breakdown, top bottlenecks with one-click "Focus Now" actions, and a budget-rebalance form — all in one view, all backed by real computation, no third-party dependency.

This is the piece that makes PlaceMate a genuine decision-support system rather than a dashboard: it takes two numbers every student already has in their head — how much time they have, and how far behind they are — and turns them into a concrete, continuously updated, actionable plan.

---

## The Interview System

The mock interview is the highest-fidelity piece of the platform — a real, spoken, adversarially-graded interview session, not a Q&A form with a chatbot.

**Two agents, one conversation, opposing jobs.** `panel_interviewer.py` runs the actual interview — it holds the conversation across all five stages (Behavioral/LP, CS Core, Live DSA, Resume Deep-Dive, HR/Culture), each with its own system instructions and question strategy pulled from `question_bank.py`. Running silently alongside it, `shadow_critic.py` never speaks to the student — it scores every single turn against a structured rubric in real time, injects hidden follow-up probes back into the Interviewer's next question when an answer looks shallow or evasive, and cross-references what the student is saying *in the interview* against what their *own resume* claims — flagging contradictions the instant they appear rather than at the end of the session. The student only ever sees one interviewer; underneath, two agents are working against each other to keep that interviewer honest.

**It's a voice interview, not a text chat.** The Interviewer's questions are converted to natural speech through a live **ElevenLabs** text-to-speech integration (`services/voice/elevenlabs_service.py`), so the practice experience actually approximates the pressure of a real spoken interview instead of a scrolling transcript.

**Resilient by design.** Question generation is Gemini-backed and dynamic by default, but every stage falls back to a curated static bank (`engine/interview_banks/fallback_bank.json`) if the LLM call fails or is rate-limited — the interview never breaks mid-session just because a model call timed out.

**State that survives the session.** On the client, `use-interview-store.ts` holds the live turn-by-turn conversation state (current stage, transcript, timers) so the UI stays responsive across a long multi-stage session, while the backend persists interview turns, Shadow Critic scores, and the final PTG report to PostgreSQL through a dedicated `interview_router.py` — so a session survives a refresh and feeds straight into the student's mastery state and Review Panel the moment it ends.

**Complete flow:** Student starts a session from `/interview/new` → `panel_interviewer` opens Stage 1 → each question is spoken aloud via ElevenLabs → the student answers → `shadow_critic` scores the turn and silently checks it against the resume → the Interviewer's next question adapts in real time → after Stage 5, the session closes out with a full PTG report, which immediately updates the student's roadmap and Review Panel load estimates.

---

## Free vs. Premium: Company-Specific Prep

The entire core loop — diagnosis, the skill graph, the adaptive roadmap, the full 200-problem practice sandbox, the generic 5-stage voice interview panel, PTG scoring, and the Review Panel — is available on the **free tier**, in full, with no artificial caps. Nothing in the core cognitive loop is held back to upsell.

The one thing that's genuinely premium is **company-specific preparation**, because it's the one thing that's expensive to build well and directly maps to outcome: showing up to a real Google, Amazon, or Meta interview loop having practiced *that company's actual interview shape*, not a generic DSA drill.

| | **Free** | **Premium — Company Prep** |
|---|---|---|
| Diagnosis (resume, GitHub, LeetCode) | ✅ | ✅ |
| Skill Graph & Adaptive Roadmap | ✅ | ✅ |
| Practice Sandbox — full 200-problem bank | ✅ | ✅ |
| Mock Interview Panel (5-stage, voice) | ✅ Generic panel | ✅ Generic **+** company-specific panel |
| PTG Scoring & Review Panel | ✅ | ✅ |
| Interview question sets | Balanced generic bank | **Real, distinct per-company question sets** — e.g. a Google-shaped bar-raiser round looks structurally different from an Amazon LP-heavy loop, not the same questions with a company logo swapped in |
| Problem prioritization | Standard topic-weighted order | **Company-weighted problem selection** — the topics and problems that company's loop is actually known for are surfaced first |
| Company Prep dashboard (`/company-prep`) | Locked | Full overlay — company-specific readiness view |

**How the gate works:** `GET /agents/company/access` checks entitlement before the `Company Prep Filter` agent is allowed to re-weight the roadmap or serve a company-specific interview panel; everything else in the platform never touches this gate. This keeps the free product genuinely complete on its own — the premium layer is additive, not a crippled trial.

---

## Scalability, UX & Technical Sophistication

**Architectural separation for scale.** PlaceMate cleanly splits three concerns that most AI products conflate: a **multi-agent LLM layer** (Gemini-backed reasoning: planning, hints, interviewing, critique), a **deterministic engine layer** (BKT mastery updates, PTG, PLI, DAG traversal — pure math, zero LLM calls, zero hallucination risk, sub-millisecond latency), and an **execution layer** (Judge0-based code sandboxing). Because the deterministic engine never touches the LLM, the platform's core scoring and planning logic is fast, cheap, reproducible, and trivially horizontally scalable — it's stateless compute that can be replicated behind a load balancer without any coordination overhead.

**Real persistence, built for concurrency.** Student state now lives in PostgreSQL rather than process memory, giving the platform true multi-tenant, cross-device, cross-restart durability — the prerequisite for running this at hackathon-demo scale today and production scale tomorrow without a rewrite.

**Agent orchestration, not a single mega-prompt.** A Supervisor/Router agent classifies intent and dispatches to narrowly-scoped specialist agents (Diagnosis, Curriculum & Planning, Practice & Socratic, Interview Panel, Mastery & Decay, Company Prep). Each agent owns one job with a tight system prompt, which keeps latency low, keeps outputs predictable, and lets any single agent be swapped, re-prompted, or scaled independently of the rest of the system. All agents share a single Gemini client with automatic fallback across SDK versions, and failures raise typed errors instead of silently returning fabricated content — the platform never guesses when it doesn't know.

**Dual-agent adversarial design for interview fidelity.** The mock interview isn't one model playing a role — it's an **Interviewer agent** conducting the session and a silent **Shadow Critic agent** scoring every turn against a rubric in parallel, feeding hidden follow-up probes back to the Interviewer mid-conversation, and cross-examining every answer against the student's own resume in real time to flag contradictions the moment they happen — the kind of adversarial rigor a single-prompt chatbot interviewer structurally cannot replicate. Questions are delivered as natural speech via a live ElevenLabs TTS integration, and the whole pipeline degrades gracefully to a curated fallback question bank if a model call fails, so a live session never breaks mid-interview.

**Graph-native curriculum logic.** The skill graph is a real, validated dependency DAG, not a flat list — the Root-Cause Engine performs backward traversal to find the *earliest* broken prerequisite behind a weak topic, so remediation targets causes, not symptoms. The schema is multi-track by design (SDE, Web Dev, ML, DevOps), so adding a new role track is a data addition, not an architectural change.

**Production-grade execution sandbox.** Code runs through Judge0 CE across four languages with a real auto-grading harness — including automatic `ListNode`/`TreeNode` construction from array and level-order notation, and canonical-form normalization of list/tree outputs — so grading is structurally correct, not string-matched.

**UX built around one continuous narrative, not disconnected tools.** Onboarding, roadmap, practice sandbox, interview, skill graph, and the Review Panel all read from and write to the same persisted student state — a student's mock interview PTG shows up in their next day's roadmap *and* inflates the right topic's load in the Review Panel within the same session, with no manual sync step anywhere in the product.

---

## Feature Matrix

### Module 1 — Intelligence, Onboarding & Multi-Source Diagnosis

| # | Feature | Description |
|---|---|---|
| 1 | Student Digital Profile | Unified, persistent per-topic mastery profile, durable in PostgreSQL across restarts and devices. |
| 2 | Intelligent Onboarding | Goal setup (target role, companies, deadline) plus self-assessment sliders drive a synthesized baseline mastery profile. |
| 3 | Multi-Source Skill Diagnosis | Resume parser extracts skills, projects, and experience; GitHub and LeetCode fetchers pull real public API telemetry with graceful fallback under rate limits. |
| 4 | Interactive Resume Doctor | Split-screen live rewriter with document upload and annotated review. |
| 5 | ATS Resume Scoring | Genuine 0–100 score from keyword density, keyword coverage, and formatting signal analysis. |

### Module 2 — Dynamic Skill Graph & Explainable Adaptive Roadmap

| # | Feature | Description |
|---|---|---|
| 6 | Interconnected Skill Graph | A true dependency DAG with backward traversal for root-cause diagnosis of weak topics. |
| 7 | Dynamic Mastery Model | Full Bayesian Knowledge Tracing, factoring difficulty, hints used, and attempt history. |
| 8 | Personalized Adaptive Roadmap | Gemini-backed daily roadmap generation, personalized against real persisted mastery state, across 4 role tracks. |
| 9 | Explainable Roadmap Decisions | Audit-log mechanism records the "why" behind roadmap changes. |
| 10 | Skill Decay & Spaced Revision | Recency-weighted decay in practice scoring with automatic revision flagging when mastery drops below threshold. |
| 11 | Smart Placement Readiness | Deterministic pass/fail readiness evaluation with actionable recommendations. |
| 12 | **Load & Capacity Review Panel** | Preparation Load Index engine computing overload risk, topic-level bottlenecks, and projected readiness date against deadline — see [dedicated section above](#signature-systems-ptg--the-review-panel). |

### Module 3 — In-Platform Practice Sandbox & Intelligent Mentorship

| # | Feature | Description |
|---|---|---|
| 13 | Practice Environment & Secure Sandbox | Monaco-based editor with real Judge0 CE execution across Python/C++/Java/JavaScript, hidden + visible test suites, and an auto-grading harness with structural normalization. |
| 14 | Progressive 3-Tier Hint System | Socratic hint structure — intuition → structure → edge cases — with no syntax handouts, plus live Socratic debugging of failed or inefficient submissions. |
| 15 | 200-Problem Curated Bank (`placement_mentor_problem_bank_200.json`) | Problems spanning Arrays & Hashing, Stack, Dynamic Programming, Two Pointers, Linked Lists, Trees, Graphs, and more — each with a reference solution, 3-tier hints, and hidden test cases never exposed to the client. |

### Module 4 — Hyper-Realistic Mock Interview Simulation

| # | Feature | Description |
|---|---|---|
| 16 | 5-Stage Interview Panel | Distinct system instructions across Behavioral/LP, CS Core, Live DSA, Resume Deep-Dive, and HR/Culture stages, each drawing from a dedicated question bank. Free tier; a company-specific version of this panel is available under [Premium](#free-vs-premium-company-specific-prep). |
| 17 | Dual-Agent Interview Panel | A Shadow Critic silently scores every turn against a rubric, feeds hidden probes back into the live Interviewer agent, and cross-examines answers against the student's own resume in real time to flag contradictions. |
| 18 | Live Voice Interview (ElevenLabs TTS) | Interviewer questions are delivered as natural spoken audio, not text, for realistic interview-pressure practice. |
| 19 | Resilient Question Delivery | Automatic fallback to a curated static question bank if live Gemini generation fails, so sessions never break mid-interview. |
| 20 | **Performance Transfer Gap Reporting** | Post-interview PTG computed against the student's own practice history — see [dedicated section above](#signature-systems-ptg--the-review-panel). |

### Module 5 — Proactive Career Agent

| # | Feature | Description |
|---|---|---|
| 21 | Company Prep Overlay *(Premium)* | Real, distinct per-company interview question sets and company-weighted problem prioritization, gated behind an entitlement check — see [Free vs. Premium](#free-vs-premium-company-specific-prep). |
| 22 | Red Team Pressure Engine | Adversarial mid-interview challenge generation to simulate real interview pressure. |

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          CLIENT — Next.js App                            │
│   Onboarding · Dashboard · Roadmap · Practice · Interview ·               │
│   Skill Graph · Company Prep · Resume Doctor · Review Panel              │
└───────────────────────────────────┬────────────────────────────────────--┘
                                     │  HTTPS / REST
┌───────────────────────────────────▼─────────────────────────────────────-┐
│                         API LAYER — FastAPI                              │
│  /api/auth  /api/onboarding  /api/student  /mastery  /resources          │
│  /roadmap  /agents  /api/interview  /api/sandbox  /api/problems          │
│  /api/review                                                             │
└─────────────┬───────────────────┬───────────────────┬───────────┬───────-┘
              │                   │                   │           │
┌─────────────▼───────────┐ ┌─────▼────────────┐ ┌────▼─────────┐ ┌▼───────────┐
│  MULTI-AGENT LAYER       │ │  DETERMINISTIC     │ │ CODE SANDBOX  │ │  VOICE      │
│  (Gemini Interactions    │ │  ENGINE (no AI)    │ │               │ │  ElevenLabs │
│  API)                    │ │                    │ │  Judge0 CE    │ │  TTS        │
│                          │ │  BKT Mastery Model  │ │  (RapidAPI)   │ │             │
│  Supervisor              │ │  PTG Calculator     │ │               │ │  Voices     │
│  Planner                 │ │  PLI / Load Calc.   │ │  Auto-Grading │ │  Interviewer│
│  Blue Team                │ │  Skill Graph DAG    │ │  Harness      │ │  turns      │
│  Red Team                 │ │  Root-Cause Engine  │ │               │ │             │
│  Interviewer + Shadow     │ │  Eligibility Gate   │ │               │ │             │
│   Critic                  │ │  Resource Catalog   │ │               │ │             │
│  Company Prep             │ │                    │ │               │ │             │
└──────────────┬─────────────┘ └───────────┬─────────┘ └──────┬────────┘ └──────┬──────┘
               │                            │                  │                 │
               │           ┌────────────────▼──────────────────▼─────────────────▼───┐
               └──────────▶│                    SHARED STATE STORE                     │
                           │      PostgreSQL — persistent, multi-tenant, cross-device   │
                           └─────────────────────────────────────────────────────────────┘
```

---

## Agent Roster

| Agent | Responsibility |
|---|---|
| Supervisor / Router Agent | Intent classification and routing to specialist agents |
| Diagnosis & Resume Agent | Resume extraction, ATS scoring, live redlining |
| Curriculum & Planning Agent | Daily roadmap generation and end-of-day re-planning |
| Practice & Socratic Agent | Code execution orchestration, 3-tier hints, Socratic debugging |
| Interview Panel Agent (`panel_interviewer.py`) | Conducts the live 5-stage mock interview, voiced via ElevenLabs TTS |
| Shadow Critic Agent (`shadow_critic.py`) | Silent per-turn rubric scoring, hidden probe injection, and real-time resume/story consistency cross-checking |
| Mastery & Decay Agent | BKT updates, PTG computation, decay-weighted scoring, audit logging |
| Red Team Pressure Engine | Adversarial mid-interview challenges |
| Company Prep Filter (`company_filter.py`) | Premium — company-weighted topic prioritization and per-company interview question selection |

All agents share a single Gemini client built on Google's Interactions API, with automatic fallback to the legacy `generateContent` call for older SDK versions. Failures raise a typed error rather than returning fabricated results.

---

## The Engine Layer (deterministic math, no AI)

- **BKT Mastery Model** — Bayesian Knowledge Tracing update: prior mastery + new practice evidence → posterior mastery probability.
- **Practice Score** — correctness + complexity match + time efficiency + recency-decay weighting across attempts.
- **Interview Score** — weighted composite: Technical 40%, Communication 25%, Speed 20%, plus additional rubric dimensions.
- **PTG Calculator** — Performance Transfer Gap = Practice Score − Interview Score, with severity tiers mapped to intervention types.
- **Preparation Load Index (PLI)** — per-topic and aggregate load modeling against daily time budget, with PTG-weighted remedial inflation and deadline projection.
- **Skill Graph DAG / Root-Cause Engine** — dependency graph validation and backward root-cause traversal.
- **Eligibility Gate** — deterministic interview-readiness evaluation.
- **Resource Catalog** — curated external resources mapped per role.

---

## Practice Sandbox

- 200 curated DSA problems spanning Arrays & Hashing, Stack, Dynamic Programming, Two Pointers, Linked Lists, Trees, Graphs, and more — each with a reference solution, 3-tier hints, and hidden test cases never sent to the client.
- Real remote execution via Judge0 CE across Python, C++, Java, and JavaScript.
- Auto-grading harness that constructs `ListNode`/`TreeNode` from array/level-order notation and normalizes list and tree outputs back to canonical form for comparison.
- A single endpoint serves both Run and Submit actions.

---

## API Reference

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/auth/signup`, `/api/auth/login` | Auth |
| `GET/PATCH` | `/api/settings` | Account settings |
| `POST` | `/api/onboarding/submit` | Multi-source onboarding ingestion |
| `GET` | `/api/student/*` | Student profile / telemetry |
| `GET/POST` | `/mastery/*` | Mastery state and evaluation |
| `GET` | `/resources/*` | Skill graph + curated resource lookups |
| `POST` | `/roadmap/generate` | Generate a personalized daily roadmap |
| `POST` | `/roadmap/replan` | End-of-day re-plan given updated mastery/PTG |
| `GET` | `/api/review/load-summary` | Preparation Load Index — capacity, overload risk, bottlenecks, projected readiness |
| `POST` | `/agents/route` | Supervisor intent routing |
| `POST` | `/agents/hint`, `/agents/debug`, `/agents/concept/{topic_id}` | Blue Team hints & coaching |
| `POST` | `/agents/challenge` | Red Team adversarial challenge |
| `POST` | `/api/interview/turn` | Live interview turn — Interviewer response + spoken audio via ElevenLabs |
| `POST` | `/api/interview/score` | Shadow Critic scoring, including resume/story consistency cross-check |
| `POST` | `/api/interview/report` | Post-interview PTG report |
| `POST` | `/agents/company/overlay`, `GET /agents/company/access` | Company Prep overlay + freemium gate |
| `GET` | `/api/problems`, `/api/problems/{id}`, `/api/problems/topics` | Problem bank |
| `POST` | `/api/sandbox/run` | Execute + grade a submission via Judge0 |
| `GET` | `/health` | Liveness check |

Interactive docs are available at `/docs` once the backend is running.

---

## Frontend Routes

| Route | Purpose |
|---|---|
| `/` | Landing page — Sign In / Create Account |
| `/onboarding` | Target role, resume upload, GitHub/LeetCode linking, self-assessment |
| `/dashboard` | Main hub after login |
| `/roadmap` | Daily AI-generated roadmap view |
| `/practice/[taskId]` | Monaco editor, live Run/Submit, hints, mastery display |
| `/interview/new` | Start a new voice-based mock interview session |
| `/interview/[id]` | Live mock interview session — real-time transcript, spoken questions |
| `/skill-graph` | Visual dependency graph of topic mastery |
| `/review` | Load & Capacity Review Panel — overload risk, bottlenecks, budget rebalancing |
| `/company-prep` | Company-specific prep overlay (premium) |
| `/resume-doctor` | Resume analysis |

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- A Gemini API key
- A Judge0 CE (RapidAPI) key
- An ElevenLabs API key
- A PostgreSQL instance

### Backend

```bash
cd server
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `server/.env`:
```env
GEMINI_API_KEY=your-gemini-key
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_HOST=judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your-rapidapi-key
ELEVENLABS_API_KEY=your-elevenlabs-key
DATABASE_URL=postgresql://user:password@localhost:5432/placemate
```

Run from the repository root:

```bash
cd ..
python -m uvicorn server.main:app --host 0.0.0.0 --port 4000 --reload
```

### Frontend

```bash
cd client
npm install
npm run dev
```

---

## Project Structure

```
├── client/                                     # Next.js 15 Frontend
│   ├── app/
│   │   ├── (app)/
│   │   │   ├── company-prep/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── interview/
│   │   │   │   ├── new/page.tsx                # Start a new interview session
│   │   │   │   └── page.tsx
│   │   │   ├── practice/[taskId]/page.tsx
│   │   │   ├── resume-doctor/page.tsx
│   │   │   ├── review/page.tsx                 # Load & Capacity Review Panel
│   │   │   ├── roadmap/page.tsx
│   │   │   ├── skill-graph/page.tsx
│   │   │   └── layout.tsx
│   │   ├── company-prep-landing/page.tsx
│   │   ├── interview/[id]/page.tsx             # Live interview session
│   │   ├── onboarding/page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── modals/auth-modal.tsx
│   │   ├── workspace/ExecutionConsole.tsx      # Sandbox run/submit console
│   │   ├── providers.tsx
│   │   ├── sidebar.tsx
│   │   └── topbar.tsx
│   ├── hooks/
│   │   ├── mutations/useExecuteCode.ts
│   │   ├── queries/
│   │   │   ├── useLoadSummary.ts               # Review Panel data hook
│   │   │   ├── useMastery.ts
│   │   │   ├── useProblem.ts
│   │   │   ├── useRoadmap.ts
│   │   │   ├── useSkillGraph.ts
│   │   │   └── useStudent.ts
│   │   ├── use-interview-store.ts              # Live interview session state
│   │   └── use-ui-store.ts
│   └── lib/api.ts
│
├── server/                                     # FastAPI Backend
│   ├── agents/                                 # Gemini-backed multi-agent system
│   │   ├── blue_team/coaching_guide.py
│   │   ├── company_prep/company_filter.py
│   │   ├── config/gemini_client.py             # Shared Gemini client (Interactions API)
│   │   ├── interview/
│   │   │   ├── panel_interviewer.py            # Runs the 5-stage interview
│   │   │   ├── question_bank.py
│   │   │   └── shadow_critic.py                # Scoring + resume consistency checks
│   │   ├── planner/
│   │   │   ├── replan_checkpoint.py
│   │   │   └── roadmap_planner.py
│   │   ├── red_team/pressure_engine.py
│   │   ├── resume_doctor/resume_doctor_agent.py
│   │   └── supervisor/supervisor.py
│   ├── data/interview_questions.json
│   ├── db/
│   │   ├── database.py
│   │   └── models.py
│   ├── engine/                                 # Deterministic math — no AI calls
│   │   ├── eligibility/gate_checker.py
│   │   ├── interview_banks/fallback_bank.json  # Static fallback if Gemini fails
│   │   ├── mastery/                            # BKT model
│   │   ├── resources/                          # Curated resource catalog
│   │   ├── scores/
│   │   │   ├── interview_score.py
│   │   │   ├── load_calculator.py              # Preparation Load Index
│   │   │   ├── practice_score.py
│   │   │   └── ptg_calculator.py
│   │   └── skill_graph/                        # DAG solver, root-cause diagnosis
│   ├── routers/
│   │   ├── agents_router.py
│   │   ├── auth_router.py
│   │   ├── interview_router.py                 # Dedicated interview endpoints
│   │   ├── mastery_router.py
│   │   ├── onboarding_router.py
│   │   ├── resources_router.py
│   │   ├── resume_doctor_router.py
│   │   ├── review_router.py                    # Review Panel endpoint
│   │   ├── roadmap_router.py
│   │   ├── sandbox_router.py
│   │   └── student_router.py
│   ├── sandbox/                                # Judge0 client + auto-grading harness
│   ├── schemas/                                # Pydantic models shared across the backend
│   ├── services/
│   │   ├── auth/auth_middleware.py
│   │   ├── ingestion/                          # Resume, GitHub, LeetCode parsers
│   │   ├── sandbox/sandbox_service.py
│   │   ├── student_state/student_state_service.py
│   │   └── voice/elevenlabs_service.py         # Interview text-to-speech
│   ├── main.py
│   └── requirements.txt
│
├── shared/                                     # Shared types & constants
│   ├── constants/{bkt-config.ts, thresholds.ts, interview_questions.json}
│   └── types/                                  # TypeScript types mirroring backend schemas
│
├── placement_mentor_problem_bank_200.json      # 200-problem bank
└── start.py                                    # 1-command startup launcher
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React, Tailwind CSS |
| Client State | React Query (server state) + Zustand-style stores (e.g. `use-interview-store.ts` for live session state) |
| Code Editor | Monaco Editor |
| Backend | FastAPI, Pydantic |
| Agent Orchestration | Custom lightweight multi-agent dispatch — Supervisor + specialist agents (`panel_interviewer.py`, `shadow_critic.py`, `roadmap_planner.py`, `coaching_guide.py`, `pressure_engine.py`, `company_filter.py`, `resume_doctor_agent.py`) |
| LLM | Google Gemini 2.5 Flash / Pro via the Interactions API |
| Interview Voice | ElevenLabs neural text-to-speech (`services/voice/elevenlabs_service.py`) |
| Code Execution | Judge0 CE (RapidAPI) |
| Data Store | PostgreSQL |
