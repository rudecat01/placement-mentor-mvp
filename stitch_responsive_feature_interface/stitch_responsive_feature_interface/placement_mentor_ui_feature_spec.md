# Placement Mentor — Frontend Feature & UI Specification

## 1. Product Structure

Placement Mentor has two primary entry points from the landing page:

1. **Role Preparation** — free, general placement preparation.
2. **Company Preparation** — paid, company-specific preparation.

Both use the same underlying product architecture, but Company Preparation has a slightly more premium visual treatment.

The Company layer uses the same Skill Graph, mastery model, roadmap engine, resources, practice system, interview engine, and PTG system as Role Preparation.

---

# 2. Landing Page

## Top Navigation

- Placement Mentor logo/brand
- Role Preparation
- Company Preparation

### Role Preparation
- Free
- Minimal, clean, professional visual language
- General role-focused placement preparation

### Company Preparation
- Paid
- Same design system
- Slightly more premium visual treatment
- Company-specific preparation

Do not make the two experiences look like completely different products.

---

# 3. Role Preparation Landing Page

## Hero

Communicate:

- Personalized placement preparation
- Adaptive roadmap
- Skill tracking
- Practice
- Interviews
- Performance Transfer Gap

Primary CTA:

**Start Preparing**

Secondary CTA:

**Explore Platform**

## Product Preview

Show authentic product UI instead of generic AI illustrations:

- Dashboard
- Skill Graph
- Roadmap
- DSA workspace
- Interview
- PTG

## Product Story

Explain:

**Profile → Skill Graph → Roadmap → Practice → Interview → PTG → Adaptive Replanning**

## Role Coverage

Example roles:

- SDE
- Backend
- Frontend
- Full Stack
- ML Engineer
- Data Engineer
- DevOps

---

# 4. Company Preparation Landing Page

The Company Preparation landing page should be directly accessible from the top navigation.

## Visual Direction

- Same core design system as Role Preparation
- Slightly richer typography
- Slightly more refined transitions
- Stronger company-focused visual hierarchy
- Subtle premium treatment
- No excessive luxury/gold/neon effects

It should feel like a premium extension of the same product.

## Hero

Headline direction:

**Prepare for the interview you actually want to crack.**

Supporting message:

Company-specific DSA, CS fundamentals, technical interviews, behavioral preparation, project/resume questioning, system design and adaptive interview training.

Primary CTA:

**Explore Companies**

Secondary CTA:

**See How It Works**

## Company Selection

Display companies such as:

- Amazon
- Google
- Microsoft
- Meta
- Adobe
- Atlassian

Each company card can show:

- Company
- Available roles
- Preparation coverage
- Difficulty/competitiveness
- Free preview indicator

CTA:

**Prepare for [Company]**

## Why Company Preparation

Visualize:

**Existing Skill Graph → Company Requirements → Personalized Company Preparation**

Make it clear that company preparation uses the user's existing profile rather than creating a second skill system.

## Preparation Coverage

Display:

- DSA
- CS Fundamentals
- Technical Interviews
- Behavioral / Leadership
- Resume / Projects
- System Design
- Company-specific resources

## Personalized Preview

Before purchase, show a limited readiness preview.

Example:

**Company Readiness: 64%**

Strong:
- Arrays
- React
- Projects

Needs Work:
- Graphs
- DBMS
- Interview Transfer

## Freemium Structure

### Free
- 2 company-specific questions
- Short interview preview
- Basic readiness preview

### Premium
- Full company roadmap
- Full company problem bank
- Complete interview simulation
- CS preparation
- System Design
- Behavioral preparation
- Detailed analytics
- Company resources

Primary CTA:

**Unlock Full Company Preparation**

---

# 5. Authentication

## Sign Up

- Name
- Email
- Password
- Continue to onboarding

## Sign In

- Email
- Password
- Forgot password
- Continue

After authentication:

- New user → Onboarding
- Existing user → Dashboard

---

# 6. Onboarding

Diagnostic assessment is NOT part of initial onboarding.

## Step 1 — Goal

Collect:

- Target role
- Experience level
- Preparation duration/deadline
- Daily study time
- Preferences

## Step 2 — Self Assessment

Role-relevant mastery sliders.

Possible skills include:

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

Self assessment is only an initial estimate.

## Step 3 — Resume

Optional:

- PDF upload
- DOC/DOCX upload
- File preview
- Skill extraction
- Project extraction
- Technology extraction
- Experience extraction

## Step 4 — GitHub

Optional:

- GitHub profile URL
- Languages
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

These sources establish the initial Skill Graph state.

---

# 7. Skill Extraction Processing Animation

Whenever the platform is processing profile information, use a meaningful progress experience.

Example:

**Reading Profile → Extracting Skills → Comparing Evidence → Mapping Skills → Building Skill Graph**

Do not use random loading animations.

---

# 8. Home / Main Dashboard

The Home page is the central workspace after onboarding.

It should answer:

1. What should I do today?
2. How ready am I?
3. What are my biggest weaknesses?
4. How am I performing in interviews?
5. What changes because of my performance?

## Dashboard Header

Show:

- Greeting
- Target role
- Preparation deadline
- Days remaining
- Daily time budget

Example:

**SDE · 45 days remaining · 120 min/day**

## Primary Section — Today's Plan

This should visually dominate the dashboard.

Example:

### Today's Plan — 120 min

**Graphs — Medium DSA**  
35 min  
Why: High relevance + weak mastery  
**Start Practice**

**JavaScript Closures**  
25 min  
**Learn**

**Graph Revision**  
20 min  
**Revise**

**Interview Transfer Drill**  
40 min  
**Start**

The total planned time must equal the user's daily time budget.

## Placement Readiness

Show:

**Placement Readiness: 72 / 100**

Breakdown:

- DSA
- Development
- CS Core
- Resume
- Interview

## PTG

Make PTG a prominent dashboard element.

Show:

**Practice Score: 82**  
**Interview Score: 48**  
**PTG: 34**

Highlight the biggest transfer gap.

## Skill Snapshot

Show:

- Strongest skills
- Weakest skills
- At-risk skills
- Recent mastery changes

## Roadmap Progress

Show:

- Current day
- Overall completion
- Upcoming milestones

## Interview Status

Show:

- Ready now
- Preparing
- Unlock progress

## Career Tools

Add Resume Doctor / ATS / JD-related status cards directly on the dashboard.

### Resume Doctor

Show:

- Resume health
- Weakest bullets
- Rewrite suggestions
- Skill/evidence gaps

CTA:

**Open Resume Doctor**

### ATS Checker

Show:

- ATS score
- Role alignment
- Keyword issues
- Formatting issues

CTA:

**Check Resume**

These should also be available as dedicated tools.

---

# 9. Main Navigation

Suggested sidebar:

## Home

## Prepare
- Roadmap
- Practice
- Interview

## Understand
- Skill Graph
- Progress
- Resources

## Career
- Resume Doctor
- ATS Checker

## Company
- Company Prep

## Account
- Profile
- Settings
- Logout

Company Prep should be visually separated as a premium product layer.

---

# 10. Role-Based Resource Hub

Resources are a first-class feature for every selected role.

The selected role loads a competency map and resource map.

## Web Development Resource Track

Topics:

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

## ML / Data Resource Track

Topics:

- Python
- NumPy
- Pandas
- Statistics
- ML fundamentals
- Model evaluation
- Deployment

Additional tracks can use the same structure.

## Resource Types

- YouTube videos
- Official documentation
- Blogs
- Articles
- Tutorials
- Visualizations

Each resource shows:

- Topic
- Type
- Source
- Duration
- Difficulty
- Why recommended
- External link

Resources should be curated/verified and should not use fabricated URLs.

## Contextual Resources

Resources should also appear inside:

- Roadmap tasks
- Skill Graph
- Practice pages
- Interview improvement pages

Users should not always need to leave the current workflow to find learning material.

---

# 11. Skill Graph

Signature product screen.

Use a large interactive dependency graph.

Example:

Arrays
→ Hashing
→ Two Pointers
→ Sliding Window

Recursion
→ Backtracking
→ DP

Each node shows:

- Skill
- Mastery
- Lifecycle status
- Role importance

States:

- Mastered
- Stable
- At Risk
- Weak

## Skill Node Detail Panel

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
- Recommended action

Graph interactions:

- Zoom
- Pan
- Focus weak skills
- Filter by mastery
- Filter by role
- Show dependencies
- Show PTG hotspots

---

# 12. Adaptive Roadmap

The roadmap is generated from:

- Role
- Deadline
- Daily time budget
- Skill Graph
- Mastery
- Role requirements
- Available resources
- Optional company/JD constraints

## Roadmap Task

Every task contains:

- Day
- Topic
- Type
- Difficulty
- Estimated time
- Status
- Why selected
- Problem/resource link

Types:

- DSA problem
- Revision
- Role learning
- Role practice
- Resource session
- Interview training
- Blue Team intervention
- Red Team training

## Fixed Daily Time

If the student has 120 minutes/day:

**Total planned time = 120 minutes**

Only allocation changes.

## Roadmap Update Rule

The current day is a commitment.

Never reshuffle today's tasks after a single submission.

Store evidence in pending state.

When required tasks for the day are complete:

- Update mastery
- Update Practice Score
- Update Interview evidence
- Update PTG
- Update revision/decay
- Generate next-day plan

If the student finishes early:

- Show optional extension tasks
- Do not change the planned daily budget

If the student does not finish:

- Log incomplete tasks
- Let the next-day planner decide recovery allocation

## Roadmap Generation Animation

Use a multi-step animation:

**Analyzing Skills → Prioritizing Weak Areas → Checking Role Requirements → Allocating Time → Selecting Tasks → Building Roadmap**

## Roadmap Update Animation

Use:

**Reviewing Today's Evidence → Updating Mastery → Checking Revision → Evaluating PTG → Rebalancing Priorities → Building Tomorrow's Plan**

## Why This Moved

Every significant roadmap change must show:

- What changed
- Why
- Which performance result triggered it
- Which gap it addresses
- Old priority vs new priority

---

# 13. DSA Practice Workspace

Premium developer-tool experience.

## Left

- Problem
- Context
- Examples
- Constraints
- Expected complexity
- Hints

## Center

Monaco Editor.

Languages:

- C++
- Python
- Java
- JavaScript

## Bottom / Right

- Run
- Submit
- Visible tests
- Hidden tests status
- Runtime
- Memory
- Verdict
- Compiler output
- Complexity
- Submission history
- Mastery impact

## Sandbox

Actual isolated code execution.

Show:

- Passed tests
- Failed tests
- Runtime
- Memory
- Exit code
- stdout/stderr

---

# 14. Progressive Hints

Exactly three levels.

### Level 1
- High-level intuition
- Pattern recognition

### Level 2
- Data structure
- Algorithm direction
- Structural pseudologic

### Level 3
- Edge cases
- Detailed reasoning
- Implementation architecture

Do not reveal the complete solution in initial hints.

---

# 15. Socratic Debugger

The Socratic debugger only needs:

- Current problem
- Current code
- Compiler/test output
- Requested hint level

It should:

- Identify the bug
- Ask guiding questions
- Point toward conceptual errors
- Highlight edge cases
- Avoid directly giving the full solution unless explicitly escalated

UI should feel like a developer tool integrated into the editor.

---

# 16. Practice / Mastery Evidence

Every practice attempt records:

- Correctness
- Difficulty
- Attempts
- Hints
- Runtime
- Memory
- Complexity
- Time spent

The UI should make the evidence visible after submission.

Example:

**Accepted · Medium · 2 Attempts · 2 Hints · O(n) · 63ms**

Then show:

**Mastery updated: 0.60 → 0.88**

with a subtle animation.

---

# 17. Mastery Update Logic

The model is BKT-style.

Slip = 0.10  
Guess = 0.20

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

`EvidenceMultiplier = Difficulty * Attempts * Hints * Complexity * Time`

`BaseGain = 0.12 * EvidenceMultiplier`

Correct:

`NewMastery = Posterior + BaseGain*(1-Posterior)`

Incorrect:

`NewMastery = Posterior - 0.08*(1-EvidenceMultiplier) - 0.02*(1-Posterior)`

Clamp to 0–1.

Constants should be configurable.

---

# 18. Practice Score

Practice Score is the topic-level low-pressure performance estimate.

Uses:

- Correctness
- Difficulty
- Hints
- Attempts
- Efficiency
- Time
- Recent performance

Show:

- Current score
- Trend
- Recent evidence

---

# 19. Interview Eligibility

Interview Gate:

## Immediate

Unlock when:

- Role-core average mastery ≥ 0.75
- No critical topic < 0.60
- Practice Score ≥ 0.70

## Later

Unlock after a completed-day checkpoint when:

- Role-core average mastery ≥ 0.70
- No critical topic < 0.55
- Practice Score ≥ 0.65

## Not Ready

Keep interview gated.

Show:

- Current values
- Required values
- Missing topics
- Next roadmap focus

Critical topics depend on selected role.

---

# 20. Interview Experience

Full five-stage interview:

1. Behavioral / Leadership
2. CS Fundamentals
3. DSA Coding
4. Resume / Project Deep Dive
5. HR / Culture Fit

Voice-enabled.

## Interview UI

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

Keep the screen immersive and professional.

## Interview Processing Animation

After completion:

**Analyzing Answers → Evaluating Technical Skills → Comparing Practice vs Interview → Finding Transfer Gaps → Generating Coaching Plan**

---

# 21. DSA Interview Round

Use the same sandbox under interview conditions:

- Timed
- No hints
- Verbal explanation required
- Follow-ups
- Hidden tests
- Complexity discussion

Measure:

- Correctness
- Time
- Complexity
- Explanation
- Follow-up handling
- Pressure performance

---

# 22. Dual-Agent Interview Panel

## Interviewer Agent

- Conducts conversation
- Uses candidate context
- Asks follow-ups
- Adapts to answers

## Shadow Critic

Silent evaluator.

Measures:

- Technical correctness
- Communication
- Weak concepts
- Contradictions
- Follow-up quality
- Interview behavior

Shadow Critic can influence future questions without appearing as a visible second chatbot.

---

# 23. Resume / Project Interview

Interviewer reads the uploaded resume and asks:

- Project architecture
- Technical decisions
- Ownership
- Technologies
- Challenges
- Tradeoffs
- Impact

Follow-ups should dynamically depend on previous answers.

---

# 24. Story Consistency Check

Compare:

**Resume claims ↔ Interview answers**

Detect contradictions.

If needed, trigger polite cross-examination.

After interview, show consistency feedback.

---

# 25. Interview Score

Topic-level Interview Score uses:

- Technical correctness
- Time pressure
- Explanation
- Follow-ups
- Communication
- Confidence / behavioral performance
- Problem solving

Show:

- Overall
- By round
- By skill
- Trend

---

# 26. Performance Transfer Gap

Core differentiator.

`PTG = Practice Score - Interview Score`

### Good transfer
PTG ≤ 0.10

### Moderate transfer weakness
0.10 < PTG ≤ 0.25

### High transfer gap
PTG > 0.25

PTG should NOT directly lower technical mastery.

It indicates how well the student transfers knowledge into interview conditions.

## PTG Analysis Animation

**Collecting Practice Data → Collecting Interview Data → Comparing Skills → Detecting Gaps → Ranking Interventions**

Show topic-level comparisons.

---

# 27. Blue Team

Blue Team activates after interview analysis and PTG detection.

Reads:

- Current mastery
- Practice Score
- Recent errors
- PTG

Interventions:

- Concept explanation
- Guided example
- Think-aloud exercise
- Targeted practice
- Resource recommendation

Goal:

**Increase independent Practice Score and improve transfer ability.**

Blue Team does not directly rewrite today's roadmap.

---

# 28. Red Team

Red Team activates after interview analysis.

Reads:

- Practice Score
- Interview Score
- PTG
- Relevant failure patterns

Generates:

- Timed problems
- Follow-up questions
- Ambiguity
- Interruptions
- Verbal explanations
- Changing constraints
- Resume/project probing

Goal:

**Expose whether the skill transfers under interview conditions.**

Results update Interview Score/communication evidence/PTG.

---

# 29. Blue / Red Intervention Loop

Correct flow:

**Interview → Analyze → PTG → Red Team Stress Test + Blue Team Coaching → Re-practice → Re-interview → PTG Recalculation**

Neither directly rewrites the current day's roadmap.

At the end-of-day checkpoint, their updated evidence enters the Planning Agent.

### If PTG is high

- More interview-pressure training
- More think-aloud practice
- Less pure difficulty escalation

### If PTG is low but mastery is also low

- Return to foundational learning/practice
- Do not over-focus on pressure

---

# 30. Skill Decay / Revision

Lifecycle states:

- Mastered
- Stable
- At Risk
- Weak

Track:

- Last successful demonstration
- Time since demonstration
- Decay
- Revision priority

Revision appears inside the roadmap.

Use fresh variants rather than repeating the exact same problem.

---

# 31. Placement Readiness

Overall score:

**0–100**

Breakdowns:

- DSA
- Development
- CS Core
- Resume
- Interview

Show:

- Current score
- Target
- Biggest blockers
- Trend
- Recent improvement

---

# 32. Company Preparation Dashboard

When the user enters a company-specific preparation area, use the company as the context.

## Header

Example:

**Amazon — SDE**

- Company Preparation
- Days remaining
- Company Readiness

## Company Readiness

Show:

**Company Readiness: 68 / 100**

Breakdown:

- DSA
- CS Core
- Technical Interview
- Behavioral
- Projects
- System Design

Example:

DSA 78/80  
CS Core 61/75  
Technical 64/75  
Behavioral 72/75  
Projects 70/80  
System Design 48/65

## Today's Company Plan

Show company-prioritized tasks, always respecting the fixed daily time budget.

Example:

- Graphs — Medium DSA — 35m
- DBMS — 20m
- Interview Transfer Drill — 25m
- Project Deep Dive — 40m

## Company PTG

Show:

Practice Score  
Interview Score  
PTG

Highlight the largest company-specific transfer gap.

CTA:

**Train Transfer**

## Company Roadmap

Show the adaptive roadmap through the company lens.

Do not create a second roadmap engine.

## Company Interview

Show:

- Ready
- Not ready
- Unlock progress
- Start Company Interview

Use the existing Interview Gate.

## Company Preparation Tracks

Tabs/sections:

- DSA
- CS Core
- Technical Interview
- Behavioral
- Projects
- System Design

## Company Resources

Show:

- DSA resources
- CS resources
- Behavioral resources
- System Design resources
- Interview resources

## Company Skill Gaps

Show:

- Biggest blockers
- Current
- Target
- Recommended action

---

# 33. Company Dashboard Resume / Career Tools

Show compact dashboard sections:

## Resume Readiness

- ATS Score
- Company Alignment
- Weak bullets
- Missing keywords

CTA:

**Open Resume Doctor**

## ATS Checker

- ATS score
- Role alignment
- Keyword issues
- Formatting issues

CTA:

**Check Resume**

Detailed tools remain separately accessible.

---

# 34. Resume Doctor

Standalone workspace.

Split screen:

### Left
Resume PDF.

### Right
AI review.

Features:

- Red-line weak bullets
- Weak wording
- Missing metrics
- Vague claims
- Skill gaps
- Rewrite suggestions
- Accept
- Reject
- Regenerate PDF

---

# 35. ATS Checker

Standalone tool.

Score:

**0–100**

Analyze:

- Keyword density
- Formatting
- Section hierarchy
- Parsing readability
- Role alignment

Feedback:

- Critical Fixes
- High Value Enhancements
- Formatting Polish

---

# 36. JD / Role Alignment

The dashboard may surface role alignment and gap information.

Show:

- Current skill
- Required skill
- Skill Delta
- Priority

Do not require roadmap generation for basic resume/ATS functionality.

---

# 37. What-If Preparation Simulator

Allow users to test:

- Interview in 5 days
- Only 1 hour/day
- Switch target role
- Switch target company
- Increase DSA priority

Generate alternative roadmap.

Show:

- Allocation
- Tradeoffs
- Compressed areas
- Projected readiness

Do not permanently modify the real roadmap unless the user confirms.

---

# 38. Global Processing Animation System

Any operation that has meaningful processing time should have a tailored progress experience.

## Skill Extraction

**Reading → Extracting → Verifying → Mapping**

## Roadmap Generation

**Analyzing → Prioritizing → Allocating → Selecting → Building**

## Roadmap Update

**Reviewing Evidence → Updating Mastery → Checking Revision → Evaluating PTG → Replanning**

## PTG Analysis

**Comparing Practice → Comparing Interview → Detecting Gap → Ranking Interventions**

## Interview Analysis

**Analyzing Answers → Scoring → Finding Weaknesses → Generating Feedback**

## Resume Analysis

**Parsing → Extracting → Evaluating → Recommending**

## Important

Animations must communicate system state.

Avoid:

- Random spinners
- Neon AI effects
- Decorative particles
- Fake “thinking” animations with no relationship to the actual process

---

# 39. Application States

Every major screen must handle:

## Loading
- Skeleton
- Progress indicator
- Contextual processing message

## Empty
- No resume
- No GitHub
- No LeetCode
- No roadmap
- No interviews

## Error
- Backend failure
- Sandbox failure
- Voice failure
- Resource failure

## Locked
- Interview unavailable
- Premium company features

## Success
- Problem solved
- Skill improved
- Interview completed
- PTG reduced
- Roadmap updated

---

# 40. Signature Product Moments

The strongest UI moments should be:

1. Initial Skill Extraction
2. Skill Graph creation
3. Roadmap generation
4. DSA sandbox result
5. Mastery update
6. Interview unlock
7. Voice interview
8. Interview analysis
9. PTG reveal
10. Blue/Red intervention
11. Next-day roadmap update
12. Company readiness improvement

These should receive the highest interaction and animation polish.

---

# 41. Overall UX Principle

The product should never feel like:

**User → Chatbot → Answer**

It should feel like:

**Student → Evidence → Skill Graph → Plan → Action → Measurement → Adaptation**

The AI should be embedded into workflows rather than becoming the entire UI.

Every important screen should help the user understand:

1. Where am I?
2. What should I do now?
3. Why am I doing it?
4. How am I performing?
5. What changes because of my performance?

---

# 42. Core Navigation Summary

## Role Preparation

- Home
- Roadmap
- Practice
- Skills
- Resources
- Interview
- Resume Doctor
- ATS Checker

## Company Preparation

- Company Dashboard
- Company Roadmap
- Company DSA
- Company CS Core
- Company Interviews
- Behavioral
- Projects
- System Design
- Company Resources
- Company Readiness
- Company PTG
- Resume / ATS

---

# 43. Design Priority

The frontend implementation should prioritize:

1. Home / Dashboard
2. Roadmap
3. Skill Graph
4. DSA Workspace
5. Interview
6. PTG Report
7. Company Dashboard
8. Company Landing
9. Resources
10. Resume Doctor
11. ATS Checker
12. Analytics / supporting screens

The UI should be built around the complete adaptive loop rather than as a collection of disconnected screens.
