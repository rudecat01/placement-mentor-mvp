# Placement Mentor 2.0 — Complete Frontend Design Specification

## 1. Product Identity

Placement Mentor 2.0 is an adaptive placement and career acceleration platform.

It should feel like a **premium EdTech + developer tool + career intelligence product**, not a generic AI chatbot.

Core product loop:

**Sign In → Profile Setup → Multi-Source Initial State → Skill Graph → Roadmap → Daily Practice → Mastery Update → Interview Eligibility → Interview → Interview Score → PTG → Blue/Red Intervention → End-of-Day Re-plan → Next Day**

All modules use one persistent student state containing:

- Profile
- Target role
- Deadline
- Daily time budget
- Skills
- Mastery
- Practice Score
- Interview Score
- PTG
- Roadmap
- Activity history
- Resources
- Interview history
- Resume
- Company preparation state

---

# 2. Visual Design Direction

## Overall Feel

Reference the information hierarchy and learning-product feel of modern platforms such as takeUforward, but do not copy branding or exact UI.

Target aesthetic:

**Premium EdTech + Developer IDE + Linear/Notion-style productivity**

The interface should be:

- Professional
- Clean
- Modern
- Technical
- Calm
- High-information but uncluttered
- Interactive
- Trustworthy
- Polished enough for a production SaaS product

Avoid:

- Generic dark-blue AI dashboard
- Purple/blue neon gradients
- Excessive glassmorphism
- Glowing cards
- AI sparkle icons everywhere
- Excessive rounded cards
- Generic chatbot-first layouts
- Repetitive KPI-card grids
- Decorative animations without purpose

Use a light-first interface:

- Warm/off-white page background
- White surfaces
- Near-black typography
- Neutral borders
- One restrained brand accent
- Semantic success/warning/error colors
- Subtle shadows
- Moderate corner radius

---

# 3. Global Navigation

Authenticated application should have persistent navigation.

## Main Navigation

- Dashboard
- Roadmap
- Practice
- Skills
- Interviews
- Resources
- Resume
- Company Prep
- Progress / Analytics

## User Area

- Profile
- Target Role
- Preparation Deadline
- Daily Time Budget
- Settings
- Account
- Logout

## Global Utilities

- Search / Command Palette
- Notifications
- Help
- Keyboard shortcuts
- Current readiness summary

---

# 4. Landing Page

Purpose: explain the product and convert a new user.

## Hero

Core message:

> A placement mentor that continuously measures what you can do, what you can demonstrate in interviews, and what you should do next.

Primary CTA:

**Start Preparing**

Secondary CTA:

**Explore Platform**

## Hero Visual

Show an authentic product preview:

- Skill Graph
- Adaptive Roadmap
- PTG
- Interview panel

Avoid generic AI illustrations.

## Sections

### Problem

Students use disconnected tools for:

- DSA
- Learning resources
- Resume
- Interviews
- Company preparation

### Solution

Placement Mentor connects all of them into one adaptive system.

### Core Loop

**Diagnose → Plan → Practice → Evaluate → Adapt**

### PTG

Show:

Practice Score vs Interview Score → Performance Transfer Gap.

### Adaptive Roadmap

Show how a student’s actions change future preparation.

### Interview

Show full company-style interview simulation.

### Skills

Show Skill Graph.

### Final CTA

Start preparation.

---

# 5. Sign Up / Sign In

## Sign In

- Email
- Password
- Social login if implemented
- Forgot password
- Sign up

## Sign Up

- Name
- Email
- Password
- Optional profile setup continuation

## Post Authentication

Immediately route to profile onboarding for a new user or Dashboard for an existing user.

---

# 6. Onboarding

Diagnostic assessment is NOT part of the initial onboarding flow.

## Step 1 — Goal

Select:

- Target role
- Experience level
- Preparation duration / deadline
- Daily study time
- Learning preferences

Example roles:

- SDE
- Backend
- Frontend
- Full Stack
- ML Engineer
- Data Engineer
- DevOps
- Other

## Step 2 — Self Assessment

Topic mastery sliders.

Example:

- Arrays
- Trees
- Graphs
- DP
- JavaScript
- React
- Git/GitHub
- DBMS
- OS
- CN
- OOP

Use this as an initial estimate, not final truth.

## Step 3 — Resume

Optional:

- Upload PDF
- Upload DOC/DOCX
- Preview file
- Extract skills
- Projects
- Technologies
- Experience

## Step 4 — GitHub

Optional:

- GitHub URL
- Extract languages
- Repository/project evidence
- Technology usage
- Activity

## Step 5 — LeetCode

Optional:

- Profile URL
- Solved counts
- Difficulty distribution
- Topic activity
- Other legally/technically available public statistics

These sources initialize the Skill Graph.

---

# 7. Initial Skill State

After onboarding, generate the student's initial Skill Graph.

Sources:

- Self-assessment
- Resume
- GitHub
- LeetCode
- Role requirements

Each topic has:

- Mastery 0.00–1.00
- Evidence source
- Confidence
- Role importance
- Prerequisites
- Dependents

Important UI distinction:

**Self-assessed** vs **demonstrated evidence**

Example:

> React self-assessment: 80%
>
> Resume/GitHub evidence: strong

---

# 8. Role Competency Map

Every target role has a competency map and resource map.

## Web Development Example

- HTML
- CSS
- JavaScript
- React
- Git/GitHub
- HTTP
- REST APIs
- Backend basics
- Testing
- Deployment
- Role-specific tools

## ML Example

- Python
- NumPy
- Pandas
- Statistics
- ML fundamentals
- Model evaluation
- Deployment

The UI should visualize role coverage and mastery.

---

# 9. Resource System

Resources are attached to topics/subtopics.

Resource types:

- YouTube videos
- Official documentation
- Tutorials
- Blogs
- Articles
- Visualizations

Every resource should display:

- Topic
- Type
- Source
- Estimated duration
- Difficulty
- External link

Links must be curated/verified.

Do not display fabricated links.

## Resource Entry

Example:

**React Hooks**
- Video
- Official React docs
- Blog
- Tutorial

CTA:

**Open Resource**

Quizzes are future functionality and should not be required for the initial frontend.

---

# 10. Skill Graph

This is a signature product screen.

Use a large interactive canvas.

Represent skills as a dependency DAG.

Example:

Arrays
→ Hashing
→ Two Pointers
→ Sliding Window

Recursion
→ Backtracking
→ DP

Each node should encode:

- Skill name
- Mastery
- State
- Role importance

States:

- Mastered
- Stable
- At Risk
- Weak

## Node Interaction

Click a node to open a detail panel.

Show:

- Mastery
- Practice Score
- Interview Score
- PTG
- Trend
- Recent attempts
- Root cause
- Prerequisites
- Dependent skills
- Revision status
- Resources
- Recommended next action

## Graph Interactions

- Zoom
- Pan
- Filter by role
- Filter by mastery
- Focus weak areas
- Show prerequisites
- Show PTG hotspots

---

# 11. Placement Readiness Dashboard

Main dashboard should function as the student’s command center.

## Header

- Greeting
- Current role
- Deadline
- Days remaining
- Daily time budget

## Primary Metrics

- Placement Readiness
- Practice Score
- Interview Score
- PTG

Do not show everything as isolated cards.

Create clear visual hierarchy.

## Today's Mission

Most prominent section.

Show:

- Task
- Topic
- Difficulty
- Estimated time
- Progress
- Why this task

## Skill Snapshot

Show weakest and strongest skills.

## Roadmap Progress

- Current day
- Completion
- Upcoming milestones

## Interview Status

- Ready now
- Preparation required
- Next interview unlock condition

## Recent Performance

- Last submissions
- Interview attempts
- PTG changes
- Mastery changes

---

# 12. Adaptive Roadmap

Roadmap is a core product screen.

Use a task-planner / timeline interface.

## Every Task Contains

- Day
- Topic
- Task type
- Difficulty
- Estimated time
- Status
- Reason
- Resource/problem link

## Task Types

- DSA problem
- DSA revision
- Role learning
- Role practice
- Resource session
- Interview training
- Blue Team coaching
- Red Team pressure training

## Fixed Daily Time

If user has 120 minutes/day:

**Sum of planned tasks = 120 minutes**

Use a small configured rounding tolerance only if necessary.

## Important Behavior

The current day is a commitment.

Do NOT reshuffle the current day's tasks when new evidence appears.

Evidence is collected in pending state.

After all required tasks are completed:

- Update mastery
- Update practice score
- Update interview evidence
- Update PTG
- Update revision/decay state
- Generate next day's plan

If student finishes early:

- Show optional extension tasks
- Do not change planned daily budget

If student does not finish:

- Keep unfinished tasks logged
- Next day's planner decides how much fixed time is allocated to recovery

## Why This Moved

Every major roadmap change must have an explanation.

Show:

- What changed
- Why it changed
- Which previous result caused it
- Which skill gap it addresses
- Old priority vs new priority

---

# 13. DSA Practice Workspace

This should feel like a professional coding IDE.

## Layout

### Left

- Problem statement
- Context
- Examples
- Constraints
- Expected complexity
- Hints

### Center

Monaco Editor

Languages:

- C++
- Python
- Java
- JavaScript

### Bottom / Right

- Run
- Submit
- Test cases
- Runtime
- Memory
- Verdict
- Compiler output
- Complexity
- Submission history
- Mastery impact

## Sandbox

Actual isolated execution.

Display:

- Passed tests
- Failed tests
- Runtime
- Memory
- Exit code
- stdout/stderr

---

# 14. Progressive Hints

Exactly three levels.

## Hint Level 1

- High-level intuition
- Pattern recognition

## Hint Level 2

- Data structure
- Algorithm direction
- Structural pseudologic

## Hint Level 3

- Edge cases
- Detailed reasoning
- Implementation architecture

Do not immediately reveal complete solutions.

Display hint usage because hints affect the student's independent-performance evidence.

---

# 15. Socratic Debugger

Debugger does NOT require the student's full history.

It uses only:

- Current problem
- Current code
- Compiler/test output
- Requested hint level

Behavior:

- Identify bug
- Ask guiding questions
- Point toward conceptual mistake
- Highlight edge case
- Avoid giving direct solution unless escalated

UI should look like an integrated developer assistant, not a generic chatbot.

---

# 16. Mastery Model UI

Each submission captures:

- Correctness
- Difficulty
- Attempts
- Hints
- Runtime
- Memory
- Complexity
- Time spent

Mastery update is BKT-style.

Current product parameters:

- Slip = 0.10
- Guess = 0.20

P(correct):

`P(correct) = M*(1-Slip) + (1-M)*Guess`

Correct:

`Posterior = M*(1-Slip) / P(correct)`

Incorrect:

`Posterior = M*Slip / (1-P(correct))`

Evidence factors:

### Difficulty
- Easy = 0.80
- Medium = 1.00
- Hard = 1.20

### Attempts
- 1 = 1.00
- 2 = 0.90
- 3 = 0.80
- 4+ = 0.70

### Hints
- 0 = 1.00
- 1 = 0.92
- 2 = 0.84
- 3 = 0.76

### Complexity
- Optimal = 1.00
- Acceptable = 0.90
- Poor = 0.75

### Time
- At/under target = 1.00
- 1–1.5× target = 0.90
- >1.5× target = 0.80

Evidence multiplier:

`Difficulty * Attempts * Hints * Complexity * Time`

Base gain:

`0.12 * EvidenceMultiplier`

Correct:

`NewMastery = Posterior + BaseGain*(1-Posterior)`

Incorrect:

`NewMastery = Posterior - 0.08*(1-EvidenceMultiplier) - 0.02*(1-Posterior)`

Clamp to 0–1.

All constants should be configurable.

---

# 17. Practice Score

Practice Score represents low-pressure performance.

Display by topic.

Uses:

- Correctness
- Difficulty
- Hints
- Attempts
- Efficiency
- Time
- Recent performance

Visualize:

- Current score
- Trend
- Confidence
- Recent evidence

---

# 18. Interview Eligibility

Interview Gate uses configurable thresholds.

## Immediate Interview

Unlock immediately when:

- Role-core average mastery ≥ 0.75
- No critical topic < 0.60
- Practice Score ≥ 0.70

## Later Interview

Unlock after a completed-day checkpoint when:

- Role-core average mastery ≥ 0.70
- No critical topic < 0.55
- Practice Score ≥ 0.65

## Not Ready

Keep interview gated.

Show:

- Current values
- Required threshold
- Missing topics
- Next roadmap focus

Critical topics depend on selected role.

---

# 19. Full Interview Experience

Interview should feel like a real professional interview environment, not a chatbot.

## Full Interview Flow

1. Pre-interview
2. Behavioral / Leadership
3. CS Fundamentals
4. DSA Coding
5. Resume / Project Deep Dive
6. HR / Culture Fit
7. Final assessment

User may also start an individual round.

---

# 20. Interview Screen

Show:

- Interviewer
- Current round
- Question
- Timer
- Voice state
- Transcript
- Round progress
- Candidate response state

Voice states:

- Listening
- Thinking
- Speaking
- Follow-up

Keep the interface minimal and serious.

---

# 21. DSA Interview Round

Use the same sandbox but under interview conditions:

- Timed
- No hints
- Verbal explanation required
- Follow-up questions
- Hidden tests
- Runtime/memory
- Complexity discussion

Measure:

- Correctness
- Time
- Complexity
- Explanation
- Follow-up handling
- Pressure performance

---

# 22. Shadow Critic

Dual-agent interview architecture.

## Interviewer Agent

- Conducts the conversation
- Asks questions
- Uses candidate context
- Generates follow-ups

## Shadow Critic Agent

Silent evaluator.

Measures:

- Technical correctness
- Communication
- Weak concepts
- Inconsistencies
- Follow-up quality
- Interview behavior

Shadow Critic can influence follow-up questions without becoming visible to the student during the interview.

---

# 23. Resume / Project Interview Round

The interviewer uses the uploaded resume.

Ask:

- Project architecture
- Technical decisions
- Ownership
- Challenges
- Technologies
- Tradeoffs
- Impact

Dynamic follow-ups should depend on previous answers.

---

# 24. Story Consistency Check

Compare:

- Resume claims
- Interview answers

Detect contradictions.

Example:

Resume:
> Designed backend architecture independently.

Interview:
> “A teammate handled the backend architecture.”

System can trigger polite cross-examination.

Post-interview show consistency feedback.

---

# 25. Interview Score

Topic/skill-level Interview Score should consider:

- Technical correctness
- Time pressure
- Explanation
- Follow-ups
- Communication
- Confidence/behavior
- Problem solving

Show:

- Overall Interview Score
- Round-level scores
- Topic-level scores
- Trend

---

# 26. Performance Transfer Gap (PTG)

Core product feature.

Formula:

`PTG = Practice Score - Interview Score`

Interpretation:

### PTG ≤ 0.10
Good transfer

### 0.10 < PTG ≤ 0.25
Moderate transfer weakness

### PTG > 0.25
High transfer gap

PTG is a diagnostic signal.

It should NOT directly reduce technical mastery.

## PTG UI

Show:

Practice Score
vs
Interview Score

Then:

**Performance Transfer Gap**

Example:

Practice: 0.82
Interview: 0.45
PTG: 0.37

Show topic-level transfer gaps.

---

# 27. Blue Team — Coach

Blue Team activates after interview analysis and PTG detection.

Reads:

- Current mastery
- Practice Score
- Recent errors
- PTG

Chooses intervention:

- Concept explanation
- Guided example
- Think-aloud exercise
- Targeted practice
- Resource recommendation

Goal:

- Increase independent Practice Score
- Improve transfer-related ability

The Blue Team does not directly rewrite today's schedule.

Its evidence is added to shared state.

---

# 28. Red Team — Adversary

Red Team activates after interview analysis.

Reads:

- Topic Practice Score
- Interview Score
- PTG
- Relevant failure patterns

Creates interview-pressure situations:

- Timed problem
- Follow-up questions
- Ambiguity
- Interruptions
- Verbal explanation
- Changing constraints
- Resume/project probing

Goal:

Expose whether the candidate can transfer skill under interview conditions.

Red Team updates Interview Score/communication evidence and PTG.

---

# 29. Blue/Red Relationship

Correct sequence:

**Interview → Analyze → PTG → Red Team stress test + Blue Team coaching → Re-practice → Re-interview → PTG again**

They do not directly modify today's roadmap.

At the next end-of-day checkpoint:

- Updated mastery
- Practice Score
- Interview Score
- PTG
- Revision state

are consumed by the Planning Agent.

If PTG is high:

- More interview-pressure training
- More think-aloud work
- Less pure difficulty escalation for that topic

If PTG is low but mastery is also low:

- Return to foundational practice
- Do not over-focus on pressure training

---

# 30. Revision / Skill Decay

Each skill has lifecycle state:

- Mastered
- Stable
- At Risk
- Weak

The system tracks:

- Last demonstrated success
- Time since last success
- Mastery decay
- Revision priority

Revision should automatically enter the roadmap.

Use fresh variants rather than repeatedly showing the same problem.

---

# 31. Readiness Score

Overall Placement Readiness:

0–100

Breakdown:

- DSA
- Development
- CS Core
- Resume
- Interviews

Show:

- Current readiness
- Target level
- Biggest blockers
- Trend
- Recent improvements

---

# 32. Company-Specific Preparation

Company selection is NOT mandatory during onboarding.

Company Prep is a separate layer inside the platform.

Example:

- Amazon
- Google
- Microsoft
- Meta
- Adobe
- Atlassian

Company preparation modifies:

- DSA priorities
- Interview style
- Behavioral themes
- CS topics
- System Design
- Resources

The company layer uses the Skill Graph.

Do NOT create a separate skill model.

---

# 33. Company Preparation UI

Company page:

- Company
- Role
- Readiness
- DSA
- CS Core
- Interviews
- System Design
- Behavioral
- Resume
- Resources

## Freemium

Free:
- 2 questions
- Short interview preview
- Basic readiness preview

Premium:
- Full company roadmap
- Complete question bank
- Full interview simulation
- System Design
- Advanced analytics
- Full preparation workflow

Use clear locked/unlocked states.

---

# 34. Resume Doctor

Independent tool.

Does not require roadmap generation.

Split screen:

### Left

Resume PDF preview.

### Right

AI analysis.

Features:

- Red-line weak bullets
- Weak wording
- Missing metrics
- Vague claims
- Skill gaps
- 1-click rewrite suggestions
- Accept / Reject rewrite

Use XYZ-style bullet rewriting.

Generate optimized PDF.

---

# 35. ATS Resume Scoring

Independent tool.

Score:

0–100

Analyze:

- Keyword density
- Formatting
- Section hierarchy
- Parsing readability
- Role alignment

Feedback priority:

- Critical Fixes
- High Value Enhancements
- Formatting Polish

---

# 36. Job Description Matcher

Accept:

- Raw JD text
- JD URL

Extract:

- Technical stack
- Cloud tools
- CS competencies
- Behavioral/leadership themes

Calculate:

**Skill Delta**

Show:

- Required
- Current
- Gap
- Importance

Inject skill gaps into the active roadmap when appropriate.

---

# 37. Multi-Track Preparation

Generalized platform supports:

- DSA
- Web Development
- Machine Learning
- CS Fundamentals
- Interview Prep

All tracks share:

- Skill Graph
- Mastery
- Resources
- Roadmap
- Progress
- Readiness

Do not create isolated mini-apps.

---

# 38. Role-Specific Learning Flow

Example Web Development student:

### Roadmap may contain

- HTML/CSS practice
- JavaScript learning
- React practice
- Git/GitHub
- HTTP
- REST APIs
- Backend fundamentals
- Testing
- Deployment
- DSA

Resources should be attached to relevant skills.

The roadmap can mix:

**Learn → Practice → Revise → Interview**

---

# 39. What-If Preparation Simulator

Allow user to change constraints.

Examples:

- Interview in 5 days
- Only 1 hour/day
- Switch target role
- Switch target company
- Increase DSA focus

Generate alternative roadmap.

Show:

- New allocation
- Tradeoffs
- Compressed topics
- Projected readiness

The simulator should not permanently change the actual roadmap unless the user confirms.

---

# 40. Relevant Contests / Community Layer

Optional later feature.

Contest Radar:

- LeetCode
- Codeforces
- CodeChef
- HackerRank

Show:

- Upcoming contests
- Start date
- Duration
- Relevant skill areas

Optional social features:

- Similar mastery peers
- Friendly leaderboard
- Practice competitions
- Collaborative mock interviews

This is secondary to the core closed-loop system.

---

# 41. Optional Career Agent

Future/advanced layer.

After verified mastery:

- Discover jobs
- Match jobs with profile
- Draft recruiter outreach
- Generate proof-of-skill links/badges
- Show why the student matches the role

This should not dominate the core product UX.

---

# 42. Global Progress / Analytics

Student can inspect:

- Mastery trend
- Practice trend
- Interview trend
- PTG trend
- Readiness trend
- Roadmap completion
- Revision completion
- Skill improvements
- Recent activity

Use meaningful charts rather than generic analytics tiles.

---

# 43. Notifications

Optional:

- Daily plan ready
- Revision due
- Interview unlocked
- PTG improvement
- Roadmap updated
- Company preparation progress
- Deadline reminders

---

# 44. Global UI States

Frontend must support:

### Loading
- Skeletons
- Progress indicators
- Contextual loading text

### Empty
- No roadmap
- No interview history
- No GitHub
- No LeetCode
- No resume

### Error
- API failure
- Sandbox failure
- Voice failure
- Resource failure

### Locked
- Interview not yet available
- Premium company features
- Future features

### Success
- Problem solved
- Interview completed
- Skill improved
- PTG reduced
- Roadmap updated

---

# 45. Signature Product Moments

The UI should emphasize these moments:

## Moment 1 — Initial Profile

Show how resume/GitHub/LeetCode/self-assessment combine into an initial Skill Graph.

## Moment 2 — Roadmap

Show why today's task exists.

## Moment 3 — DSA Submission

Show real sandbox results.

## Moment 4 — Mastery Update

Animate the skill moving.

## Moment 5 — Interview Unlock

Show readiness gate crossed.

## Moment 6 — Interview

Show realistic voice interaction.

## Moment 7 — PTG

Show Practice vs Interview gap.

## Moment 8 — Blue/Red Intervention

Show targeted intervention.

## Moment 9 — Next Day Replan

Show roadmap allocation changing based on evidence.

These are the strongest product/demo moments and should receive the most visual polish.

---

# 46. Product Design Principle

The product should not look like:

**User → Chatbot → Answer**

It should look like:

**Student → Evidence → Skill Graph → Plan → Action → Measurement → Adaptation**

The AI is embedded into workflows instead of replacing the product.

---

# 47. Frontend Implementation Priorities

Build in this order:

1. Authentication
2. Onboarding
3. Dashboard
4. Skill Graph
5. Roadmap
6. DSA Workspace
7. Interview
8. PTG Report
9. Blue/Red Intervention
10. Resources
11. Resume Doctor
12. Company Prep
13. Analytics
14. What-If Simulator
15. Advanced career/social features

Prioritize the complete end-to-end loop over decorative features.

---

# 48. Key UX Rule

The student should always know:

1. **Where am I?**
2. **What should I do now?**
3. **Why am I doing it?**
4. **How am I performing?**
5. **What changes because of my performance?**

The interface should answer these five questions continuously.
