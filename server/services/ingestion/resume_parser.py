"""
Placement Mentor 2.0 - Resume Parser & Technical Signal Extractor
[OWNED BY MEMBER 1 - DB & USER STATE ARCHITECT]

Extracts:
- Technical Skills & Competency Tags (across 100+ technologies)
- Project Summaries and Named Project Extraction
- ATS Compatibility Score (0 - 100)
- Experience Level and Education Signals
- Binary PDF / Base64 / Plain Text automatic decompression & sanitization
- Missing Keywords compared against SDE / Web Dev standard role profiles
"""

import io
import re
import base64
from typing import List, Dict, Any, Optional
from ...schemas.student import ResumeSignals
from ...agents.config.gemini_client import call_gemini_json, MODELS

KNOWN_SKILLS = [
    # Languages
    "python", "javascript", "typescript", "java", "c++", "cpp", "c", "c#", "go", "golang",
    "rust", "ruby", "php", "swift", "kotlin", "scala", "sql", "html", "css", "r",
    # Frontend
    "react", "next.js", "nextjs", "vue", "vue.js", "angular", "svelte", "tailwind",
    "tailwindcss", "redux", "zustand", "html5", "css3", "sass", "bootstrap",
    # Backend & APIs
    "fastapi", "flask", "django", "node.js", "nodejs", "express", "express.js",
    "nest.js", "nestjs", "spring", "spring boot", "graphql", "rest", "grpc",
    # Databases & Caching
    "postgresql", "postgres", "mysql", "mongodb", "sqlite", "redis", "cassandra",
    "dynamodb", "elasticsearch", "prisma", "sqlalchemy", "mongoose",
    # DevOps & Cloud
    "docker", "kubernetes", "k8s", "aws", "gcp", "azure", "ci/cd", "github actions",
    "linux", "terraform", "nginx", "prometheus", "grafana",
    # CS Core & Algorithmic
    "data structures", "algorithms", "dsa", "oop", "system design", "operating systems",
    "dbms", "computer networks", "multithreading", "concurrency",
    # AI & ML
    "machine learning", "deep learning", "pytorch", "tensorflow", "scikit-learn",
    "nlp", "llm", "langchain", "huggingface", "pandas", "numpy", "opencv"
]

ACTION_VERBS = [
    "built", "designed", "implemented", "developed", "architected", "optimized",
    "reduced", "increased", "scaled", "automated", "created", "deployed", "spearheaded",
    "led", "migrated", "refactored", "improved", "launched"
]


class ResumeParser:
    def _sanitize_raw_text(self, text: str) -> str:
        """Decompresses and extracts clean human-readable text from base64, PDF, or raw text."""
        if not text:
            return ""

        extracted_text = ""

        # 1. Base64 Data URL or raw base64 string
        if text.startswith("data:") and "base64," in text:
            b64_data = text.split("base64,")[1]
            try:
                raw_bytes = base64.b64decode(b64_data)
                try:
                    from pypdf import PdfReader
                    reader = PdfReader(io.BytesIO(raw_bytes))
                    pages = [p.extract_text() or "" for p in reader.pages]
                    extracted_text = "\n".join(pages)
                except Exception:
                    extracted_text = raw_bytes.decode("utf-8", errors="ignore")
            except Exception:
                pass

        # 2. Raw PDF binary stream (%PDF)
        if not extracted_text and "%PDF" in text:
            try:
                from pypdf import PdfReader
                pdf_bytes = text.encode("latin-1", errors="ignore")
                reader = PdfReader(io.BytesIO(pdf_bytes))
                pages = [p.extract_text() or "" for p in reader.pages]
                extracted_text = "\n".join(pages)
            except Exception:
                # Regex fallback for PDF literal strings
                pdf_strings = re.findall(r'\(([A-Za-z0-9\s.,!?:;@_+\-#/\\=-]+)\)', text)
                ascii_words = re.findall(r'[a-zA-Z0-9+#.-]{2,}', text)
                combined = " ".join(pdf_strings + ascii_words)
                extracted_text = combined if len(combined) > 20 else text

        if extracted_text and len(extracted_text.strip()) > 10:
            return extracted_text

        return text

    async def parse(self, resume_text: str, target_role: str = "SDE") -> ResumeSignals:
        """Alias for parse_text."""
        return await self.parse_text(resume_text, target_role=target_role)

    async def parse_text(self, resume_text: str, target_role: str = "SDE") -> ResumeSignals:
        """Parses raw resume text and extracts structured telemetry signals."""
        clean_text = self._sanitize_raw_text(resume_text)
        text_lower = clean_text.lower()

        # 1. Skill Extraction (Deterministic fallback to LLM)
        extracted_skills = []
        for skill in KNOWN_SKILLS:
            # Match whole words or clean boundaries
            pattern = r'(?:^|\W)' + re.escape(skill) + r'(?:$|\W)'
            if re.search(pattern, text_lower):
                display_name = self._format_skill_name(skill)
                if display_name not in extracted_skills:
                    extracted_skills.append(display_name)

        # Gemini LLM Fallback for missing skills
        try:
            prompt = f"Extract a JSON array of strings representing technical skills, frameworks, and programming languages found in this resume. Ignore any skills from this list: {', '.join(extracted_skills)}.\n\nResume Text:\n{clean_text[:5000]}"
            sys_inst = "You are a precise technical skill extractor. Return ONLY a JSON array of strings, e.g. [\"Hadoop\", \"Kafka\"]. Do not hallucinate."
            llm_skills = await call_gemini_json(MODELS["FLASH"], sys_inst, prompt)
            if isinstance(llm_skills, list):
                for s in llm_skills:
                    if isinstance(s, str) and len(s) > 1 and s not in extracted_skills:
                        extracted_skills.append(s.title())
        except Exception as e:
            print(f"Gemini LLM fallback for resume parser failed: {e}")


        # 2. Project Extraction
        extracted_projects = self._extract_projects(clean_text)

        # 3. Experience Years Extraction
        experience_years = self._estimate_experience(text_lower)

        # 4. ATS Scoring Algorithm
        ats_score, detected_kw, missing_kw = self._calculate_ats_score(
            clean_text, text_lower, extracted_skills, target_role
        )

        return ResumeSignals(
            extracted_skills=extracted_skills,
            extracted_projects=extracted_projects,
            ats_score=round(ats_score, 1),
            experience_years=experience_years,
            education=self._extract_education(text_lower),
            detected_keywords=detected_kw,
            missing_keywords=missing_kw,
            raw_summary=f"Extracted {len(extracted_skills)} technical skills ({', '.join(extracted_skills[:6])}), {len(extracted_projects)} projects, ATS score {ats_score:.1f}/100.",
            full_text=clean_text
        )

    def _format_skill_name(self, skill: str) -> str:
        skill_map = {
            "cpp": "C++",
            "c++": "C++",
            "nextjs": "Next.js",
            "next.js": "Next.js",
            "nodejs": "Node.js",
            "node.js": "Node.js",
            "react": "React",
            "fastapi": "FastAPI",
            "postgresql": "PostgreSQL",
            "postgres": "PostgreSQL",
            "mongodb": "MongoDB",
            "aws": "AWS",
            "gcp": "GCP",
            "k8s": "Kubernetes",
            "kubernetes": "Kubernetes",
            "sql": "SQL",
            "dsa": "Data Structures & Algorithms",
            "oop": "OOP",
            "dbms": "DBMS",
            "ci/cd": "CI/CD",
            "ml": "Machine Learning",
            "nlp": "NLP",
            "llm": "LLM",
            "pytorch": "PyTorch",
            "tensorflow": "TensorFlow"
        }
        return skill_map.get(skill.lower(), skill.title())

    def _extract_projects(self, text: str) -> List[str]:
        projects = []
        lines = text.split("\n")
        in_project_section = False

        for line in lines:
            line_str = line.strip()
            if not line_str:
                continue

            # Check section header
            if re.search(r'^(projects|academic projects|key projects|personal projects|technical projects)', line_str, re.I):
                in_project_section = True
                continue
            elif re.search(r'^(experience|work experience|education|skills|certifications|achievements|coursework)', line_str, re.I):
                in_project_section = False

            if in_project_section:
                # Strip leading bullets or numbering
                cleaned = line_str.lstrip("-•* 0123456789. \t").strip()
                if not cleaned:
                    continue

                # If project title line with separator (e.g. "Distributed Rate Limiter: Built..." or "Project | React")
                if ":" in cleaned:
                    candidate = cleaned.split(":", 1)[0].strip()
                    if 3 <= len(candidate) <= 60 and not candidate.lower().startswith(("http", "www", "github")):
                        projects.append(candidate)
                elif "|" in cleaned or "–" in cleaned or " - " in cleaned:
                    candidate = re.split(r'[|–]|\s-\s', cleaned)[0].strip()
                    if 3 <= len(candidate) <= 60 and not candidate.lower().startswith(("http", "www", "github")):
                        projects.append(candidate)
                elif len(cleaned) <= 60 and not cleaned.endswith((".", ",")):
                    projects.append(cleaned)
                elif len(cleaned) > 15 and any(v in cleaned.lower() for v in ACTION_VERBS):
                    projects.append(cleaned[:80])

        if not projects:
            # Fallback: Look for lines across full text mentioning built/developed/created
            for line in lines:
                cleaned = line.strip().lstrip("-•* 0123456789. \t")
                if ":" in cleaned:
                    candidate = cleaned.split(":", 1)[0].strip()
                    if 4 <= len(candidate) <= 50 and any(w in candidate.lower() for w in ["system", "platform", "app", "service", "engine", "limiter", "detector", "tracker", "agent"]):
                        projects.append(candidate)

        if not projects:
            matches = re.findall(r'(?:built|developed|implemented|designed|created)\s+([A-Za-z0-9\s\-]{4,50}?)(?:\.|\n|,|using|with)', text, re.I)
            for m in matches[:4]:
                if len(m.strip()) > 4:
                    projects.append(m.strip().title())

        # Deduplicate while preserving order
        seen = set()
        clean_projects = []
        for p in projects:
            p_clean = p.strip()
            if p_clean.lower() not in seen and len(p_clean) > 2:
                seen.add(p_clean.lower())
                clean_projects.append(p_clean)

        return clean_projects[:5]

    def _estimate_experience(self, text_lower: str) -> float:
        match = re.search(r'(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+experience', text_lower)
        if match:
            try:
                return float(match.group(1))
            except ValueError:
                pass

        if "fresher" in text_lower or "student" in text_lower or "graduate" in text_lower:
            return 0.0

        return 1.0

    def _extract_education(self, text_lower: str) -> Optional[str]:
        if "b.tech" in text_lower or "bachelor of technology" in text_lower:
            return "B.Tech in Computer Science / Engineering"
        elif "b.e." in text_lower or "bachelor of engineering" in text_lower:
            return "B.E. in Computer Science"
        elif "b.s." in text_lower or "bachelor of science" in text_lower:
            return "B.S. in Computer Science"
        elif "m.tech" in text_lower or "master of technology" in text_lower or "m.s." in text_lower:
            return "Master's Degree in Computer Science"
        return "Bachelor's Degree in Technical Discipline"

    def _calculate_ats_score(
        self,
        raw_text: str,
        text_lower: str,
        extracted_skills: List[str],
        target_role: str
    ) -> tuple[float, List[str], List[str]]:
        score = 50.0

        skill_count = len(extracted_skills)
        if skill_count >= 10:
            score += 20.0
        elif skill_count >= 6:
            score += 15.0
        elif skill_count >= 3:
            score += 10.0
        else:
            score += 5.0

        metrics_matches = re.findall(r'\b(?:\d+%\b|\d+x\b|\d+\s*(?:ms|seconds|minutes|users|requests|queries|tps|qps))\b', text_lower)
        if len(metrics_matches) >= 3:
            score += 15.0
        elif len(metrics_matches) >= 1:
            score += 8.0

        action_matches = sum(1 for v in ACTION_VERBS if v in text_lower)
        if action_matches >= 5:
            score += 10.0
        elif action_matches >= 2:
            score += 5.0

        has_projects = bool(re.search(r'projects?', text_lower))
        has_skills = bool(re.search(r'skills?', text_lower))
        has_education = bool(re.search(r'education', text_lower))
        if has_projects and has_skills and has_education:
            score += 5.0

        essential_keywords = {
            "SDE": ["Data Structures", "Algorithms", "System Design", "Python", "SQL", "Git", "REST", "CI/CD"],
            "WEB_DEVELOPMENT": ["React", "TypeScript", "Node.js", "REST", "HTML", "CSS", "PostgreSQL", "Tailwind"],
            "MACHINE_LEARNING": ["Python", "PyTorch", "TensorFlow", "Pandas", "Scikit-Learn", "Algorithms", "SQL"]
        }

        role_key = "SDE" if "sde" in target_role.lower() else ("WEB_DEVELOPMENT" if "web" in target_role.lower() else "MACHINE_LEARNING")
        expected_kw = essential_keywords.get(role_key, essential_keywords["SDE"])

        detected_kw = [kw for kw in expected_kw if kw.lower() in text_lower]
        missing_kw = [kw for kw in expected_kw if kw.lower() not in text_lower]

        final_score = min(98.0, max(20.0, score))
        return final_score, detected_kw, missing_kw


resume_parser = ResumeParser()
