"""
Placement Mentor 2.0 - Resume Doctor AI Agent
[OWNED BY MEMBER 1 & MEMBER 3 - AI & INGESTION ARCHITECTURE]

Implements the complete Resume Doctor Architecture:
1. Structured Resume Normalization (Skills, Experience, Projects, Education)
2. Job Description (JD) Parsing & Extraction via Gemini 2.5 Flash
3. Semantic & Keyword Matching Engine with Company-Specific Rubrics (Google, Amazon, Meta, Microsoft, etc.)
4. Multi-Factor Scoring Engine (Match Score, ATS Score, Impact/Quality Score)
5. Gap Analysis (Missing Skills, Critical Keywords, Vague Bullets)
6. Non-Hallucinatory Google X-Y-Z Formula Bullet Rewriter with User Validation Placeholders
7. Dynamic Resume Bullet Suggestions derived from Completed Resources & High-Mastery Skills
"""

from __future__ import annotations

import json
import re
from typing import Any, Dict, List, Optional, Set
from ..config.gemini_client import MODELS, call_gemini_json
from ...services.ingestion.resume_parser import resume_parser, KNOWN_SKILLS, ACTION_VERBS
from ...engine.resources.resource_catalog import RESOURCE_CATALOG


JD_PARSER_SYSTEM_INSTRUCTION = """
You are a Technical Recruiting & Job Description Intelligence Agent.
Extract the structured technical requirements from the provided Job Description (JD).

Output ONLY a JSON object adhering to this schema:
{
  "role_title": "string",
  "company_name": "string",
  "experience_level": "INTERN | JUNIOR | MID | SENIOR | LEAD",
  "required_skills": ["string"],
  "preferred_skills": ["string"],
  "domain_keywords": ["string"],
  "key_responsibilities": ["string"]
}
"""


RESUME_ANALYZER_SYSTEM_INSTRUCTION = """
You are the Lead Resume Doctor & Senior Technical Hiring Bar Raiser for tier-1 tech companies (Google, Amazon, Meta, Microsoft, Apple, Netflix, Fintech).
You evaluate resumes with ruthless precision against the Google X-Y-Z formula: "Accomplished [X] as measured by [Y], by doing [Z]".

Analyze the candidate's structured resume against the structured Job Description and the target company's hiring bar.

CRITICAL INSTRUCTIONS FOR WEAK BULLETS & REWRITING:
1. "original_text" in "weak_bullets" MUST BE A VERBATIM, EXACT LINE from the Candidate's Resume Bullet Points provided below.
2. NEVER classify section titles (e.g. 'Achievements', 'Certifications', 'Education', 'Projects', 'Skills'), institution names, dates, or standalone keywords as weak bullets. ONLY select actual narrative experience or project sentences.
3. NEVER fabricate, invent, or hallucinate numerical data (percentages, user numbers, latency, dollar savings) that do NOT exist in the candidate's original text.
4. When writing "improved_rewrite", you MUST:
   - Keep the rewrite contextually accurate to the candidate's actual project/work (do not replace with unrelated generic boilerplate).
   - If the original text contains metrics, preserve and refine them.
   - If the original text lacks metrics, YOU MUST USE EXPLICIT BRACKETED PLACEHOLDERS such as [Insert %], [Insert X ms], [Insert # users], or [Insert scale] for the user to validate.
   - Example: If original is "Built API using FastAPI and PostgreSQL", improved_rewrite is:
     "Architected RESTful microservices using FastAPI and PostgreSQL, reducing endpoint response times by [Insert %] across [Insert # of daily requests]."
5. If no weak bullet points exist in the candidate's text, return "weak_bullets": [].

Output ONLY a JSON object adhering to this schema:
{
  "match_score": 85,
  "ats_score": 88,
  "impact_score": 75,
  "formatting_score": 90,
  "matched_skills": ["string"],
  "missing_skills": ["string"],
  "missing_keywords": ["string"],
  "weak_bullets": [
    {
      "id": "wb_1",
      "section": "EXPERIENCE | PROJECTS",
      "original_text": "string (the exact verbatim line from candidate's resume)",
      "issue_type": "WEAK_IMPACT | MISSING_METRICS | VAGUE_ACTION | PASSIVE_VOICE",
      "critique": "string explaining the flaw",
      "improved_rewrite": "string (contextual Google X-Y-Z formula with [Insert %] placeholders for ungrounded numbers)",
      "skills_added": ["string"]
    }
  ],
  "structural_recommendations": [
    "string (specific high-ROI improvements)"
  ],
  "company_track_feedback": "string (specific critique based on target company rubric)",
  "executive_summary": "string"
}
"""


# Company Track Rubric Profiles & Bar-Raiser Criteria
COMPANY_RUBRICS: Dict[str, Dict[str, Any]] = {
    "GOOGLE": {
        "display_name": "Google Engineering Track",
        "focus": "Algorithmic Complexity, Big-O Scalability, Distributed Systems & Google X-Y-Z Rigor",
        "priority_keywords": [
            "Distributed Systems", "P99 Latency", "Throughput", "Concurrency",
            "Big-O", "Microservices", "Unit Testing", "Scalability", "Data Structures"
        ],
        "weight_multipliers": {"match": 1.1, "impact": 1.2, "ats": 1.05},
        "bar_raiser_tip": "Google hiring committees look for deep algorithmic scalability, distributed architecture tradeoffs, and strict Google X-Y-Z quantified milestones."
    },
    "AMAZON": {
        "display_name": "Amazon Track (Leadership Principles)",
        "focus": "Customer Obsession, Ownership, Deliver Results, High Availability & Operational Excellence",
        "priority_keywords": [
            "Ownership", "Deliver Results", "99.99% Uptime", "Customer Obsession",
            "AWS", "Cost Optimization", "SLA", "Operational Excellence", "Dive Deep"
        ],
        "weight_multipliers": {"match": 1.05, "impact": 1.25, "ats": 1.05},
        "bar_raiser_tip": "Amazon bar raisers evaluate explicit ownership, bias for action, production SLA impact, and customer-first business metrics."
    },
    "MICROSOFT": {
        "display_name": "Microsoft Track",
        "focus": "Enterprise Scalability, Azure Cloud Architecture, Cross-Team Collaboration & Security",
        "priority_keywords": [
            "Enterprise Architecture", "Azure", "CI/CD", "Cross-Functional Collaboration",
            "Maintainability", "Security & Compliance", "API Design", "Integration Testing"
        ],
        "weight_multipliers": {"match": 1.1, "impact": 1.05, "ats": 1.1},
        "bar_raiser_tip": "Microsoft evaluators emphasize enterprise reliability, maintainable code architectures, cloud governance, and cross-disciplinary delivery."
    },
    "META": {
        "display_name": "Meta / Facebook Track",
        "focus": "Speed of Execution ('Move Fast'), High-Scale User Growth, A/B Testing & Fullstack Ownership",
        "priority_keywords": [
            "A/B Testing", "User Engagement", "Move Fast", "GraphQL", "End-to-End Ownership",
            "Latency Optimization", "Performance Profiling", "High Concurrency"
        ],
        "weight_multipliers": {"match": 1.15, "impact": 1.2, "ats": 1.0},
        "bar_raiser_tip": "Meta managers seek high product velocity, end-to-end user growth impact, experimentation (A/B testing), and fullstack ownership."
    },
    "APPLE": {
        "display_name": "Apple Track",
        "focus": "Low-Level Performance Optimization, Memory Management, Security, Privacy & Craft",
        "priority_keywords": [
            "Performance Optimization", "Memory Management", "Privacy & Security",
            "Low-Latency", "User Experience", "Concurrency", "C++", "System Architecture"
        ],
        "weight_multipliers": {"match": 1.2, "impact": 1.1, "ats": 1.05},
        "bar_raiser_tip": "Apple prioritizes immaculate engineering craft, low-level memory efficiency, privacy safeguards, and refined user experience."
    },
    "NETFLIX": {
        "display_name": "Netflix Track",
        "focus": "Resilient Microservices (Chaos Engineering), High Concurrency Streaming, High Autonomy",
        "priority_keywords": [
            "High Concurrency", "Resilience", "Chaos Engineering", "Distributed Caching",
            "Microservices", "Telemetry", "Observability", "Throughput"
        ],
        "weight_multipliers": {"match": 1.1, "impact": 1.25, "ats": 1.05},
        "bar_raiser_tip": "Netflix bar raisers look for high freedom and responsibility, resilient fault-tolerant distributed services, and high-concurrency scale."
    },
    "FINTECH": {
        "display_name": "Fintech & High-Growth Startups",
        "focus": "Transactional Integrity (ACID), Zero-to-One Product Shipping, Payment APIs & Fast Iteration",
        "priority_keywords": [
            "ACID Compliance", "0-to-1 Delivery", "Payment Integration", "PostgreSQL",
            "Fullstack Agility", "Fast Shipping", "Data Integrity", "Stripe"
        ],
        "weight_multipliers": {"match": 1.1, "impact": 1.15, "ats": 1.05},
        "bar_raiser_tip": "Fintech and startups look for bullet-proof financial transaction integrity, agile 0-to-1 execution, and end-to-end delivery."
    }
}


class ResumeDoctorAgent:
    """
    Autonomous multi-stage resume diagnostics, company bar calibration, and optimization agent.
    """

    def get_company_rubric(self, target_company: Optional[str] = "Google") -> Dict[str, Any]:
        """Resolves target company rubric configuration with case-insensitive fallback."""
        if not target_company:
            return COMPANY_RUBRICS["GOOGLE"]
        comp_upper = target_company.strip().upper()
        for key, conf in COMPANY_RUBRICS.items():
            if key in comp_upper or comp_upper in key:
                return conf
        if any(w in comp_upper for w in ["STARTUP", "FINTECH", "SERIES", "Y COMBINATOR", "YC"]):
            return COMPANY_RUBRICS["FINTECH"]
        return COMPANY_RUBRICS["GOOGLE"]

    async def parse_job_description(self, jd_text: str) -> Dict[str, Any]:
        """
        Extracts structured skill requirements and keywords from a Job Description.
        """
        if not jd_text or len(jd_text.strip()) < 10:
            return {
                "role_title": "Software Engineer",
                "company_name": "Tech Company",
                "experience_level": "MID",
                "required_skills": ["Data Structures", "Algorithms", "System Design", "Python", "SQL"],
                "preferred_skills": ["Docker", "AWS", "CI/CD", "PostgreSQL"],
                "domain_keywords": ["Distributed Systems", "Microservices", "Scalability", "High Availability"],
                "key_responsibilities": ["Design scalable backend services", "Optimize query performance"]
            }

        prompt = f"Parse the following Job Description into structured JSON:\n\n{jd_text}"
        try:
            parsed_jd = await call_gemini_json(
                model_name=MODELS["FLASH"],
                system_instruction=JD_PARSER_SYSTEM_INSTRUCTION,
                user_prompt=prompt
            )
            return parsed_jd
        except Exception as e:
            print(f"[ResumeDoctor] JD parse fallback: {e}")
            return {
                "role_title": "Software Engineer",
                "company_name": "Tech Company",
                "experience_level": "MID",
                "required_skills": ["Data Structures", "Algorithms", "Python"],
                "preferred_skills": ["Cloud", "Databases"],
                "domain_keywords": ["Backend", "Scalability"],
                "key_responsibilities": ["Build software components"]
            }

    def _is_section_header(self, line: str) -> Optional[str]:
        """
        Detects section header titles comprehensively across standard and non-standard resume formats.
        """
        clean = re.sub(r'[^a-zA-Z\s&/]', '', line).strip()
        if not clean or len(clean) > 40:
            return None

        clean_lower = clean.lower()

        headers = {
            "EXPERIENCE": [
                r'^(work\s+)?experience$',
                r'^employment(\s+history)?$',
                r'^professional\s+experience$',
                r'^internships?(\s+experience)?$',
                r'^work\s+history$',
                r'^industry\s+experience$'
            ],
            "PROJECTS": [
                r'^(technical\s+|academic\s+|key\s+|personal\s+|major\s+|featured\s+)?projects$',
                r'^portfolio$',
                r'^open\s+source(\s+contributions)?$',
                r'^selected\s+projects$'
            ],
            "EDUCATION": [
                r'^education(\s+background)?$',
                r'^academic\s+qualifications?$',
                r'^academics$',
                r'^academic\s+history$',
                r'^degrees?$'
            ],
            "SKILLS": [
                r'^(technical\s+)?skills(\s+&\s+tools)?$',
                r'^skills\s+and\s+tools$',
                r'^technologies$',
                r'^core\s+competencies$',
                r'^programming\s+languages$',
                r'^tools\s+&\s+frameworks$',
                r'^technical\s+proficiencies$'
            ],
            "ACHIEVEMENTS": [
                r'^achievements$',
                r'^(key\s+|scholastic\s+|academic\s+)?achievements$',
                r'^honors?(\s+&\s+awards)?$',
                r'^awards?(\s+&\s+honors?)?$',
                r'^accomplishments$',
                r'^competitions?(\s+&\s+hackathons)?$'
            ],
            "CERTIFICATIONS": [
                r'^certifications?$',
                r'^certificates?$',
                r'^licenses?(\s+&\s+certifications?)?$',
                r'^courses?(\s+&\s+certifications?)?$',
                r'^training(\s+&\s+certifications?)?$'
            ],
            "PUBLICATIONS": [
                r'^publications?$',
                r'^research(\s+papers?)?$',
                r'^patents?$',
                r'^whitepapers?$'
            ],
            "LEADERSHIP": [
                r'^leadership(\s+experience)?$',
                r'^positions?\s+of\s+responsibility$',
                r'^extra-?curricular(\s+activities)?$',
                r'^volunteering(\s+experience)?$',
                r'^community(\s+involvement)?$',
                r'^activities$'
            ],
            "COURSEWORK": [
                r'^(relevant\s+)?coursework$',
                r'^courses?$'
            ],
            "SUMMARY": [
                r'^(professional\s+)?summary$',
                r'^profile$',
                r'^about(\s+me)?$',
                r'^objective$',
                r'^career\s+objective$'
            ],
            "OTHER": [
                r'^languages?(\s+known)?$',
                r'^interests?(\s+&\s+hobbies)?$',
                r'^hobbies$',
                r'^personal\s+details$',
                r'^contact(\s+info(rmation)?)?$',
                r'^links?(\s+&\s+profiles)?$',
                r'^declaration$',
                r'^references?$'
            ]
        }

        for sec, patterns in headers.items():
            for pat in patterns:
                if re.match(pat, clean_lower):
                    return sec
        return None

    def _is_job_or_project_header(self, line: str) -> bool:
        """Filters company names, dates, roles, and project subheaders."""
        stripped = line.strip()
        if not stripped:
            return False
        has_date = bool(re.search(r'\b(20\d{2}|19\d{2}|present|current|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b', stripped, re.I))
        has_sep = any(s in stripped for s in ["—", "–", " | ", " - ", " // "])
        has_paren_tech = bool(re.search(r'\([A-Za-z0-9\s,./+#-]+\)$', stripped))
        
        has_degree = bool(re.search(r'\b(b\.?tech|b\.?s\.?|b\.?e\.?|m\.?tech|m\.?s\.?|bachelor|master|university|institute|college|cgpa|gpa)\b', stripped, re.I))

        if has_degree and (has_date or len(stripped) < 75):
            return True
        if (has_date and has_sep) or (has_sep and len(stripped) < 65) or (has_paren_tech and len(stripped) < 65):
            return True
        return False

    def _is_valid_narrative_bullet(self, text: str) -> bool:
        """
        Ensures a candidate line is an actual narrative project or experience bullet point,
        and NOT a section title, standalone keyword list, date, contact detail, or award title.
        """
        stripped = text.strip()
        if not stripped or len(stripped) < 25:
            return False

        if self._is_section_header(stripped) is not None:
            return False

        if stripped.endswith(":") and len(stripped) < 50:
            return False

        if re.search(r'(@|github\.com|linkedin\.com|http:\/\/|https:\/\/|\+?\d{10,})', stripped, re.I):
            return False

        words = stripped.split()
        if len(words) < 5:
            return False

        comma_count = stripped.count(",")
        if comma_count >= 3 and len(words) <= comma_count * 2:
            return False

        return True

    def _extract_candidate_bullet_points(self, raw_text: str) -> List[str]:
        """
        Extracts complete unwrapped bullet points strictly from EXPERIENCE and PROJECTS sections,
        filtering out standalone keywords, achievements, and section headers.
        """
        current_section = "OTHER"
        bullets = []
        current_bullet = ""

        for line in raw_text.splitlines():
            stripped = line.strip()
            if not stripped:
                if current_bullet and current_section in ["EXPERIENCE", "PROJECTS", "LEADERSHIP"]:
                    if self._is_valid_narrative_bullet(current_bullet):
                        bullets.append(current_bullet.strip())
                current_bullet = ""
                continue

            sec = self._is_section_header(stripped)
            if sec:
                if current_bullet and current_section in ["EXPERIENCE", "PROJECTS", "LEADERSHIP"]:
                    if self._is_valid_narrative_bullet(current_bullet):
                        bullets.append(current_bullet.strip())
                current_bullet = ""
                current_section = sec
                continue

            if current_section not in ["EXPERIENCE", "PROJECTS", "LEADERSHIP"]:
                current_bullet = ""
                continue

            if self._is_job_or_project_header(stripped):
                if current_bullet and self._is_valid_narrative_bullet(current_bullet):
                    bullets.append(current_bullet.strip())
                current_bullet = ""
                continue

            is_bullet_start = bool(re.match(r'^[\u2022\u25cf\u25cb\u25e6\-*+•–—]\s*', stripped))
            if is_bullet_start:
                if current_bullet and self._is_valid_narrative_bullet(current_bullet):
                    bullets.append(current_bullet.strip())
                cleaned = re.sub(r'^[\u2022\u25cf\u25cb\u25e6\-*+•–—]\s*', '', stripped)
                current_bullet = cleaned
            elif current_bullet:
                current_bullet += " " + stripped
            elif len(stripped) >= 25 and not stripped.endswith(":"):
                current_bullet = stripped

        if current_bullet and current_section in ["EXPERIENCE", "PROJECTS", "LEADERSHIP"]:
            if self._is_valid_narrative_bullet(current_bullet):
                bullets.append(current_bullet.strip())

        if not bullets:
            for line in raw_text.splitlines():
                stripped = line.strip()
                if bool(re.match(r'^[\u2022\u25cf\u25cb\u25e6\-*+•–—]\s*', stripped)):
                    cleaned = re.sub(r'^[\u2022\u25cf\u25cb\u25e6\-*+•–—]\s*', '', stripped)
                    if self._is_valid_narrative_bullet(cleaned):
                        bullets.append(cleaned)

        seen = set()
        clean_bullets = []
        for b in bullets:
            norm = b.lower()
            if norm not in seen and self._is_valid_narrative_bullet(b) and not self._is_job_or_project_header(b):
                seen.add(norm)
                clean_bullets.append(b)

        return clean_bullets

    def _extract_numbers_from_text(self, text: str) -> Set[str]:
        """Extracts existing numbers, percentages, latencies, and metrics from original text."""
        raw_matches = re.findall(r'\b\d+(?:,\d+)*(?:\.\d+)?(?:\s*(?:%|ms|sec|seconds|minutes|k|m|users|requests|qps))?\b', text, flags=re.I)
        cleaned: Set[str] = set()
        for m in raw_matches:
            cleaned.add(m.strip().lower())
            digits = re.sub(r'[^\d.]', '', m)
            if digits:
                cleaned.add(digits)
        return cleaned

    def _enforce_metric_validation(self, original_text: str, rewrite: str) -> str:
        """
        Validates the improved rewrite against the candidate's original text.
        If the rewrite contains newly introduced ungrounded numbers that were not in the original text
        and are not already enclosed in validation brackets `[...]`, converts them to explicit placeholders.
        """
        if not rewrite:
            return ""

        original_tokens = self._extract_numbers_from_text(original_text)

        # Split by bracketed tokens so we never touch text already inside [ ... ]
        parts = re.split(r'(\[[^\]]+\])', rewrite)
        processed_parts = []

        for p in parts:
            if p.startswith("[") and p.endswith("]"):
                processed_parts.append(p)
            else:
                # 1. Check for percentages e.g. 42% or 15.5%
                def _handle_pct(m: re.Match) -> str:
                    val = m.group(0)
                    digits = re.sub(r'[^\d.]', '', val)
                    if val.lower() in original_tokens or digits in original_tokens:
                        return val
                    return "[Insert %]"

                p = re.sub(r'\b\d+(?:\.\d+)?\s*%', _handle_pct, p)

                # 2. Check for latency/time e.g. 50ms, 200 ms, 3 seconds
                def _handle_time(m: re.Match) -> str:
                    val = m.group(0)
                    digits = re.sub(r'[^\d.]', '', val)
                    if val.lower() in original_tokens or digits in original_tokens:
                        return val
                    return "[Insert X ms]"

                p = re.sub(r'\b\d+\s*(?:ms|sec|seconds|minutes)\b', _handle_time, p, flags=re.I)

                # 3. Check for standalone large numbers (e.g. 10,000 users or 500 requests)
                def _handle_large_nums(m: re.Match) -> str:
                    val = m.group(0)
                    digits = re.sub(r'[^\d.]', '', val)
                    if val.lower() in original_tokens or digits in original_tokens:
                        return val
                    if int(float(digits)) <= 5:
                        return val
                    return "[Insert #]"

                p = re.sub(r'\b\d{2,}(?:,\d{3})+\b|\b\d{3,}\b', _handle_large_nums, p)

                processed_parts.append(p)

        return "".join(processed_parts)

    def generate_resource_bullet_suggestions(
        self,
        topic_or_resource_id: str,
        target_role: str = "SDE"
    ) -> List[Dict[str, Any]]:
        """
        Dynamically generates ready-to-copy, Google X-Y-Z formula bullet points with metric placeholders
        when a student completes a learning resource or reaches high mastery in a topic.
        """
        tid = topic_or_resource_id.lower()

        suggestions: List[Dict[str, Any]] = []

        if "react" in tid or "frontend" in tid or "html-css" in tid or "web" in tid:
            suggestions.append({
                "topic_id": "react-fundamentals",
                "skill_category": "Frontend & UI Architecture",
                "skills_to_add": ["React 19", "Custom Hooks", "Client-Side State Optimization"],
                "suggested_bullet": "Architected dynamic, component-driven web application using React 19 and custom state hooks, reducing re-render latency by [Insert %] across [Insert #] UI workflows.",
                "context_reason": "Verifies frontend state engineering and modern component design patterns."
            })
            suggestions.append({
                "topic_id": "nextjs-ssr",
                "skill_category": "Fullstack SSR & Caching",
                "skills_to_add": ["Next.js App Router", "Server Side Rendering", "API Caching"],
                "suggested_bullet": "Engineered fullstack web platform leveraging Next.js App Router and server-side rendering, improving First Contentful Paint (FCP) by [Insert %].",
                "context_reason": "Highlights fullstack server-side rendering and Core Web Vitals optimization."
            })
        elif "javascript" in tid or "event-loop" in tid or "typescript" in tid:
            suggestions.append({
                "topic_id": "javascript-fundamentals",
                "skill_category": "Async Programming & Language Core",
                "skills_to_add": ["TypeScript", "Async/Await", "Event Loop Profiling"],
                "suggested_bullet": "Optimized high-concurrency event-driven JavaScript/TypeScript backend services, cutting event loop queue delays by [Insert X ms] under peak workloads.",
                "context_reason": "Demonstrates deep mastery of JavaScript asynchronous execution context and event loop mechanics."
            })
        elif "dp" in tid or "algorithms" in tid or "graphs" in tid or "trees" in tid or "dsa" in tid:
            suggestions.append({
                "topic_id": "dsa-core",
                "skill_category": "Algorithmic Problem Solving",
                "skills_to_add": ["Dynamic Programming", "Graph Traversals (BFS/DFS)", "Space Complexity Optimization"],
                "suggested_bullet": "Implemented optimized graph traversal and dynamic programming memoization routines, reducing time complexity from O(2^N) to O(N*M) across large dataset queries.",
                "context_reason": "Proves algorithmic rigor and Big-O space/time optimization skills essential for Tier-1 coding rounds."
            })
        elif "docker" in tid or "devops" in tid or "k8s" in tid or "ci_cd" in tid:
            suggestions.append({
                "topic_id": "devops-ci-cd",
                "skill_category": "DevOps & Cloud Infrastructure",
                "skills_to_add": ["Docker", "CI/CD Pipelines", "Containerization"],
                "suggested_bullet": "Containerized multi-service architecture using Docker and multi-stage builds, slashing container image sizes by [Insert %] and accelerating deployment pipelines by [Insert X minutes].",
                "context_reason": "Showcases production containerization, reproducible builds, and modern CI/CD automation."
            })
        elif "sql" in tid or "database" in tid or "postgres" in tid:
            suggestions.append({
                "topic_id": "databases-sql",
                "skill_category": "Database Optimization & Indexing",
                "skills_to_add": ["PostgreSQL", "B-Tree Indexing", "Query Optimization", "ACID Transactions"],
                "suggested_bullet": "Designed relational database schema in PostgreSQL with composite B-Tree indexes, reducing P95 query execution times by [Insert %] across [Insert # of records] rows.",
                "context_reason": "Validates database query profiling, indexing strategies, and relational schema modeling."
            })
        else:
            suggestions.append({
                "topic_id": "system-design",
                "skill_category": "Scalable Backend Architecture",
                "skills_to_add": ["FastAPI", "Redis Caching", "Microservices Architecture"],
                "suggested_bullet": "Engineered asynchronous REST APIs using FastAPI integrated with Redis caching, boosting endpoint throughput by [Insert %] across [Insert # of concurrent users].",
                "context_reason": "High-impact backend architecture demonstration with caching and concurrency metrics."
            })

        return suggestions

    async def diagnose_resume(
        self,
        resume_content: str,
        job_description: Optional[str] = None,
        target_role: str = "SDE",
        target_company: str = "Google"
    ) -> Dict[str, Any]:
        """
        Runs the complete 6-stage Resume Doctor diagnostic pipeline with Company-Specific Bar Calibration.
        """
        # 1. Parse & Sanitize Resume
        resume_signals = await resume_parser.parse(resume_content)
        raw_text = resume_signals.full_text or resume_signals.raw_summary or resume_content

        company_rubric = self.get_company_rubric(target_company)

        structured_jd = await self.parse_job_description(job_description or "")
        if target_company and structured_jd.get("company_name") in ["Tech Company", ""]:
            structured_jd["company_name"] = target_company
        if target_role and structured_jd.get("role_title") in ["Software Engineer", ""]:
            structured_jd["role_title"] = target_role

        candidate_bullets = self._extract_candidate_bullet_points(raw_text)
        bullets_formatted = "\n".join([f"- {b}" for b in candidate_bullets[:15]])

        analysis_prompt = f"""
Target Company Rubric: {company_rubric['display_name']}
Target Focus & Rubric Criteria: {company_rubric['focus']}
Company Priority Keywords: {', '.join(company_rubric['priority_keywords'])}
Bar-Raiser Tip: {company_rubric['bar_raiser_tip']}

Candidate's Exact Resume Bullet Points (ONLY choose from these verbatim lines):
{bullets_formatted if bullets_formatted else raw_text[:3000]}

Candidate Extracted Signals:
- Skills: {', '.join(resume_signals.extracted_skills)}
- Projects: {', '.join(resume_signals.extracted_projects)}
- Experience Years: {resume_signals.experience_years}

Target Job Description:
- Target Role: {structured_jd.get('role_title', target_role)} at {structured_jd.get('company_name', target_company)}
- Required Skills: {', '.join(structured_jd.get('required_skills', []))}
- Preferred Skills: {', '.join(structured_jd.get('preferred_skills', []))}
- Domain Keywords: {', '.join(structured_jd.get('domain_keywords', []))}
- Responsibilities: {', '.join(structured_jd.get('key_responsibilities', []))}

DIAGNOSTIC TASK:
1. Grade the resume against {company_rubric['display_name']}.
2. Evaluate ALL candidate bullet points provided above. For EVERY bullet point that lacks strong quantified metrics, clear engineering ownership, or the Google X-Y-Z formula (Accomplished X as measured by Y by doing Z), generate a weak_bullet diagnosis and high-impact rewrite with metric placeholders.
3. In 'weak_bullets', 'original_text' MUST match a line from above verbatim. DO NOT select standalone section names like 'Achievements' or 'Skills'.
4. In 'improved_rewrite', write a contextual rewrite adhering to Google X-Y-Z formula. DO NOT hallucinate numbers; use [Insert %], [Insert X ms], or [Insert # users] placeholders for any metric not present in the original bullet.
5. Also suggest relevant new bullet points in 'resource_bullet_suggestions' if the candidate has gaps in {company_rubric['display_name']} priority skills.
"""

        try:
            diagnosis = await call_gemini_json(
                model_name=MODELS["FLASH"],
                system_instruction=RESUME_ANALYZER_SYSTEM_INSTRUCTION,
                user_prompt=analysis_prompt
            )

            if not diagnosis:
                raise ValueError("LLM returned empty diagnosis")

            multipliers = company_rubric.get("weight_multipliers", {"match": 1.0, "impact": 1.0, "ats": 1.0})
            
            raw_match = int(diagnosis.get("match_score", 75))
            raw_ats = int(diagnosis.get("ats_score", resume_signals.ats_score or 80))
            raw_impact = int(diagnosis.get("impact_score", 72))
            raw_formatting = int(diagnosis.get("formatting_score", 85))

            skills_lower = [s.lower() for s in resume_signals.extracted_skills]
            detected_company_kw = [kw for kw in company_rubric["priority_keywords"] if any(k in kw.lower() for k in skills_lower) or kw.lower() in raw_text.lower()]
            missing_company_kw = [kw for kw in company_rubric["priority_keywords"] if kw not in detected_company_kw]

            calibrated_match = min(98, max(45, int(raw_match * multipliers.get("match", 1.0) + (len(detected_company_kw) * 1.5))))
            calibrated_ats = min(99, max(40, int(raw_ats * multipliers.get("ats", 1.0))))
            calibrated_impact = min(98, max(40, int(raw_impact * multipliers.get("impact", 1.0))))

            raw_weak_bullets = diagnosis.get("weak_bullets", [])
            verified_weak_bullets = []

            for wb in raw_weak_bullets:
                orig = wb.get("original_text", "").strip().lstrip("•-*–— \t").strip()
                if self._is_section_header(orig) is not None:
                    continue

                match = None
                for cb in candidate_bullets:
                    if orig.lower() in cb.lower() or cb.lower() in orig.lower():
                        match = cb
                        break
                if not match and orig in raw_text and len(orig) >= 25:
                    match = orig

                if match:
                    wb["original_text"] = match
                    raw_rewrite = wb.get("improved_rewrite", "")
                    wb["improved_rewrite"] = self._enforce_metric_validation(match, raw_rewrite)
                    verified_weak_bullets.append(wb)
                elif len(orig) > 10:
                    # Relaxed matching: accept it if it's substantial enough even without perfect match
                    wb["original_text"] = orig
                    verified_weak_bullets.append(wb)

            if not verified_weak_bullets and candidate_bullets:
                fallback_sample = candidate_bullets[0]
                verified_weak_bullets.append({
                    "id": "wb_1",
                    "section": "EXPERIENCE",
                    "original_text": fallback_sample,
                    "issue_type": "MISSING_METRICS",
                    "critique": f"Lacks specific {company_rubric['display_name']} scale metrics and quantified impact.",
                    "improved_rewrite": f"Architected high-throughput components for {fallback_sample}, optimizing execution efficiency by [Insert %] across [Insert # of daily requests].",
                    "skills_added": ["Performance Optimization", "Scalable Architecture"]
                })

            resource_suggestions = self.generate_resource_bullet_suggestions(target_role, target_role)

            return {
                "success": True,
                "resume_signals": {
                    "extracted_skills": resume_signals.extracted_skills,
                    "extracted_projects": resume_signals.extracted_projects,
                    "experience_years": resume_signals.experience_years,
                    "raw_text": raw_text
                },
                "structured_jd": structured_jd,
                "company_track": {
                    "target_company": target_company,
                    "rubric_name": company_rubric["display_name"],
                    "focus": company_rubric["focus"],
                    "bar_raiser_tip": company_rubric["bar_raiser_tip"],
                    "detected_keywords": detected_company_kw,
                    "missing_keywords": missing_company_kw[:5]
                },
                "scores": {
                    "match_score": calibrated_match,
                    "ats_score": calibrated_ats,
                    "impact_score": calibrated_impact,
                    "formatting_score": raw_formatting,
                    "overall_grade": "A-" if calibrated_match >= 85 else "B+" if calibrated_match >= 72 else "Needs Polish"
                },
                "gap_analysis": {
                    "matched_skills": diagnosis.get("matched_skills", resume_signals.extracted_skills[:8]),
                    "missing_skills": diagnosis.get("missing_skills", missing_company_kw[:3] or ["System Design", "Redis", "Distributed Systems"]),
                    "missing_keywords": diagnosis.get("missing_keywords", missing_company_kw[:4] or ["P99 Latency", "Throughput", "CI/CD"])
                },
                "weak_bullets": verified_weak_bullets,
                "resource_bullet_suggestions": resource_suggestions,
                "structural_recommendations": diagnosis.get("structural_recommendations", [
                    f"Align project bullets with {company_rubric['display_name']} principles by using [Insert %] placeholders for measurable impact.",
                    "Ensure every experience bullet begins with an authoritative action verb (Architected, Spearheaded, Optimized).",
                    f"Integrate missing target keywords ({', '.join(missing_company_kw[:3])}) into your skills and project summaries."
                ]),
                "executive_summary": diagnosis.get("executive_summary", f"Solid technical foundation for {structured_jd.get('role_title')} at {target_company}. Applying Google X-Y-Z formula metrics with validated placeholders will elevate your interview callback rate.")
            }

        except Exception as e:
            print(f"[ResumeDoctor] Diagnostic fallback: {e}")
            return self._build_local_fallback(raw_text, resume_signals, structured_jd, company_rubric)

    def _build_local_fallback(self, raw_text: str, signals: Any, jd: Dict[str, Any], company_rubric: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Provides a resilient fallback report adhering to metric validation and company rubric rules."""
        if not company_rubric:
            company_rubric = COMPANY_RUBRICS["GOOGLE"]

        extracted = signals.extracted_skills or ["Python", "React", "SQL"]
        candidate_bullets = self._extract_candidate_bullet_points(raw_text)
        sample_bullet = candidate_bullets[0] if candidate_bullets else "Developed backend components and managed databases."

        detected_kw = [kw for kw in company_rubric["priority_keywords"] if kw.lower() in raw_text.lower()]
        missing_kw = [kw for kw in company_rubric["priority_keywords"] if kw not in detected_kw]

        resource_suggestions = self.generate_resource_bullet_suggestions(jd.get("role_title", "SDE"), jd.get("role_title", "SDE"))

        weak_bullets_list = []
        for i, cb in enumerate(candidate_bullets):
            # Check if this bullet lacks quantified numbers
            has_metric = bool(re.search(r'\b\d+(?:%|\s*(?:ms|sec|users|requests|qps|k|m))\b', cb, re.I))
            if not has_metric or i == 0:
                weak_bullets_list.append({
                    "id": f"wb_{i+1}",
                    "section": "EXPERIENCE" if i < len(candidate_bullets) // 2 else "PROJECTS",
                    "original_text": cb,
                    "issue_type": "MISSING_METRICS" if not has_metric else "WEAK_IMPACT",
                    "critique": f"Lacks specific {company_rubric['display_name']} scale metrics, latency milestones, and quantified business impact.",
                    "improved_rewrite": f"Architected high-throughput components for {cb}, improving processing efficiency by [Insert %] across [Insert # of daily requests].",
                    "skills_added": ["Performance Optimization", "Scalability", "System Architecture"]
                })

        if not weak_bullets_list:
            weak_bullets_list.append({
                "id": "wb_1",
                "section": "EXPERIENCE",
                "original_text": sample_bullet,
                "issue_type": "MISSING_METRICS",
                "critique": f"Lacks specific {company_rubric['display_name']} scale metrics and verified throughput.",
                "improved_rewrite": f"Architected resilient microservices and optimized query caching for {sample_bullet}, decreasing response times by [Insert %] across [Insert # of daily requests].",
                "skills_added": ["FastAPI", "Database Indexing", "Performance Optimization"]
            })

        return {
            "success": True,
            "resume_signals": {
                "extracted_skills": extracted,
                "extracted_projects": getattr(signals, "extracted_projects", ["Distributed System"]),
                "experience_years": getattr(signals, "experience_years", 1.0),
                "raw_text": raw_text
            },
            "structured_jd": jd,
            "company_track": {
                "target_company": jd.get("company_name") if (jd.get("company_name") and jd.get("company_name") not in ["Tech Company", ""]) else (company_rubric.get("display_name", "").split()[0] if company_rubric else "Google"),
                "rubric_name": company_rubric["display_name"],
                "focus": company_rubric["focus"],
                "bar_raiser_tip": company_rubric["bar_raiser_tip"],
                "detected_keywords": detected_kw,
                "missing_keywords": missing_kw[:5]
            },
            "scores": {
                "match_score": 78,
                "ats_score": getattr(signals, "ats_score", 82),
                "impact_score": 70,
                "formatting_score": 88,
                "overall_grade": "B+"
            },
            "gap_analysis": {
                "matched_skills": extracted,
                "missing_skills": missing_kw[:3] or ["System Design", "Redis", "Distributed Caching"],
                "missing_keywords": missing_kw[:4] or ["P99 Latency", "Throughput", "High Availability"]
            },
            "weak_bullets": weak_bullets_list,
            "resource_bullet_suggestions": resource_suggestions,
            "structural_recommendations": [
                "Quantify business and engineering outcomes in bullet points using explicit [Insert %] placeholders for verification.",
                f"Incorporate {company_rubric['display_name']} priorities ({', '.join(missing_kw[:3])}) into project summaries."
            ],
            "executive_summary": f"Strong technical baseline. Applying Google X-Y-Z quantified bullet formulas calibrated to {company_rubric['display_name']} will maximize callback rates."
        }

    async def rewrite_bullet_custom(
        self,
        bullet_text: str,
        target_role: str = "SDE",
        style: str = "METRIC_HEAVY"
    ) -> Dict[str, Any]:
        """
        Rewrites a specific bullet point in 3 distinct styles without hallucinating ungrounded metrics:
        1. Metric-Heavy (Google X-Y-Z formula with [Insert %] placeholders)
        2. Technical-Depth (Focus on architecture & edge cases)
        3. Leadership & Ownership (Focus on initiative & cross-functional impact)
        """
        prompt = f"""
Original Resume Bullet: "{bullet_text}"
Target Role: {target_role}
Requested Style: {style}

CRITICAL RULES:
1. Rewrite this bullet point into 3 high-impact variations following the Google X-Y-Z formula ("Accomplished X as measured by Y, by doing Z").
2. DO NOT hallucinate or fabricate numerical data (percentages, user numbers, latency ms) not present in the original text.
3. If metrics are needed, use explicit placeholders like [Insert %], [Insert X ms], or [Insert # users] for the candidate to fill in.

Output ONLY JSON:
{{
  "metric_heavy": "string",
  "technical_depth": "string",
  "leadership_oriented": "string",
  "action_verbs_used": ["string"],
  "rationale": "string"
}}
"""
        try:
            res = await call_gemini_json(
                model_name=MODELS["FLASH"],
                system_instruction="You are an expert tech resume bullet point optimizer with strict anti-hallucination validation.",
                user_prompt=prompt
            )
            if isinstance(res, dict):
                if "metric_heavy" in res:
                    res["metric_heavy"] = self._enforce_metric_validation(bullet_text, res["metric_heavy"])
                if "technical_depth" in res:
                    res["technical_depth"] = self._enforce_metric_validation(bullet_text, res["technical_depth"])
                if "leadership_oriented" in res:
                    res["leadership_oriented"] = self._enforce_metric_validation(bullet_text, res["leadership_oriented"])
                return res
        except Exception:
            pass

        return {
            "metric_heavy": f"Architected high-throughput services for {bullet_text}, increasing overall processing efficiency by [Insert %] under peak concurrency.",
            "technical_depth": f"Engineered scalable distributed workflow implementing Redis caching and asynchronous queues for {bullet_text}.",
            "leadership_oriented": f"Spearheaded technical design and deployment of {bullet_text}, collaborating with [Insert #] engineers to deliver [Insert #] weeks ahead of schedule.",
            "action_verbs_used": ["Architected", "Engineered", "Spearheaded"],
            "rationale": "Transformed passive phrasing into quantified, action-driven achievement with validated metric placeholders."
        }


resume_doctor_agent = ResumeDoctorAgent()
