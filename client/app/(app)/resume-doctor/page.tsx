"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  RotateCcw,
  Check,
  Briefcase,
  Zap,
  Flame,
  Award,
  ChevronRight,
  UserCheck,
  Upload,
  Copy,
  Download,
  PlusCircle,
  CheckCheck,
  Sliders,
  Eye,
  Edit3,
  Search
} from "lucide-react";
import { api } from "../../../lib/api";
import { useStudent } from "../../../hooks/queries/useStudent";

interface WeakBullet {
  id: string;
  section?: string;
  original_text: string;
  issue_type: string;
  critique: string;
  improved_rewrite: string;
  skills_added?: string[];
}

interface ResourceBulletSuggestion {
  topic_id: string;
  skill_category: string;
  skills_to_add: string[];
  suggested_bullet: string;
  context_reason: string;
}

interface CompanyTrackInfo {
  target_company: string;
  rubric_name: string;
  focus: string;
  bar_raiser_tip: string;
  detected_keywords: string[];
  missing_keywords: string[];
  priority_keywords?: string[];
}

interface DiagnosisReport {
  scores: {
    match_score: number;
    ats_score: number;
    impact_score: number;
    formatting_score: number;
    overall_grade: string;
  };
  gap_analysis: {
    matched_skills: string[];
    missing_skills: string[];
    missing_keywords: string[];
  };
  weak_bullets: WeakBullet[];
  resource_bullet_suggestions?: ResourceBulletSuggestion[];
  company_track?: CompanyTrackInfo;
  structural_recommendations: string[];
  executive_summary: string;
}

const PRESET_JDS: Record<string, string> = {
  "Google SDE (L3/L4)": `Google - Software Engineer (Core Systems)
Qualifications:
- BS/MS in Computer Science or equivalent practical experience.
- Expertise in Data Structures, Algorithms, and Software Design.
- Proficiency in Python, Go, C++, or Java.
- Experience with Distributed Systems, Microservices, Caching (Redis), and SQL/NoSQL databases.
- Proven track record optimizing latency, throughput, and system reliability.`,

  "Amazon SDE (AWS / Backend)": `Amazon - Software Development Engineer (AWS)
Basic Qualifications:
- 1+ years of non-internship professional software development experience.
- Programming experience with at least one modern language such as Java, Python, Go.
- Experience building scalable cloud services on AWS, Docker, Kubernetes.
- Deep understanding of CS fundamentals, concurrency, and OOP principles.
- Demonstrates Amazon Leadership Principles: Ownership, Deliver Results, Dive Deep.`,

  "Microsoft Full Stack Engineer": `Microsoft - Full Stack Software Engineer (Azure / Teams)
Requirements:
- Strong proficiency in React, TypeScript, Node.js, and C# / .NET / Python.
- Experience architecting RESTful APIs and GraphQL services.
- Familiarity with CI/CD pipelines, Azure Cloud, and automated testing.
- Passion for responsive design, web performance, and modern developer workflows.`,

  "Meta Software Engineer": `Meta - Software Engineer (Product Infrastructure)
Requirements:
- Strong skills in Systems Architecture, Python, JavaScript/TypeScript, or C++.
- Experience with high-scale web applications, A/B testing, and GraphQL/REST APIs.
- Ability to move fast and take end-to-end ownership of user-facing systems.`
};

const DEFAULT_RESUME = `Alex Chen
alex.chen@email.com • github.com/alexchen • linkedin.com/in/alexchen • (555) 234-5678

TECHNICAL SKILLS
Languages: Python, JavaScript, TypeScript, Go, SQL, C++
Frameworks & Tools: React, Next.js, FastAPI, Node.js, Docker, Redis, PostgreSQL, AWS, Git

WORK EXPERIENCE
Software Development Engineer Intern — CloudTech (May 2023 - Aug 2023)
• Designed and developed scalable backend microservices using FastAPI and PostgreSQL.
• Implemented distributed caching with Redis to optimize database query latency.
• Engineered automated CI/CD pipelines with GitHub Actions and Docker for multi-service builds.

TECHNICAL PROJECTS
High-Throughput Distributed Rate Limiter (Go, Redis, Docker)
• Architected rate limiting middleware in Go utilizing Redis token bucket algorithm.
• Optimized concurrency handling to process 25k+ requests per second without memory bottlenecks.
• Integrated Docker Compose environment for seamless local development and automated testing.

EDUCATION
Bachelor of Science in Computer Science — Tech University (2020 - 2024)
GPA: 3.85 / 4.00`;

const PASSIVE_PHRASES = [
  "worked on",
  "responsible for",
  "assisted with",
  "helped with",
  "handled",
  "participated in",
  "duties included",
  "served as",
  "contributed to"
];

export default function ResumeDoctor() {
  const { data: student } = useStudent();

  // State
  const [resumeText, setResumeText] = useState(DEFAULT_RESUME);
  const [jobDescription, setJobDescription] = useState(PRESET_JDS["Google SDE (L3/L4)"]);
  const [targetCompany, setTargetCompany] = useState("Google");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [activePreset, setActivePreset] = useState("Google SDE (L3/L4)");

  const [activeTab, setActiveTab] = useState<"bullets" | "suggestions" | "skills" | "jd" | "tips">("bullets");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<DiagnosisReport | null>(null);
  const [isProfileResumeLoaded, setIsProfileResumeLoaded] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [appliedCount, setAppliedCount] = useState(0);
  const [allAppliedNotification, setAllAppliedNotification] = useState(false);
  const [pdfLayoutMode, setPdfLayoutMode] = useState<"exact" | "modern">("exact");

  // Feature 3: Canvas View Mode (Edit vs. ATS Heatmap)
  const [canvasViewMode, setCanvasViewMode] = useState<"edit" | "heatmap">("edit");
  const [insertedKeywordBanner, setInsertedKeywordBanner] = useState<string | null>(null);

  // Interactive Metric Inputs state mapped by bullet index/id
  const [customMetricInputs, setCustomMetricInputs] = useState<Record<string, Record<string, string>>>({});

  // Auto-populate resume from onboarding profile telemetry or localStorage
  useEffect(() => {
    let cachedFullText = "";
    if (typeof window !== "undefined") {
      cachedFullText = localStorage.getItem("placement_mentor_resume_full_text") || "";
    }

    if (student) {
      const signals = student.telemetry?.resume_signals;
      let textToLoad = "";

      if (signals?.full_text && !signals.full_text.startsWith("data:") && signals.full_text.length > 50) {
        textToLoad = signals.full_text;
        setIsProfileResumeLoaded(true);
      } else if (cachedFullText && !cachedFullText.startsWith("data:") && cachedFullText.length > 50) {
        textToLoad = cachedFullText;
        setIsProfileResumeLoaded(true);
      } else if (signals && signals.extracted_skills && signals.extracted_skills.length > 0) {
        const skillsList = signals.extracted_skills.join(", ");
        const projectsList = (signals.extracted_projects && signals.extracted_projects.length > 0)
          ? signals.extracted_projects.map(p => `PROJECT: ${p}\n• Architected and developed core features for ${p}.\n• Optimized system performance, query throughput, and latency.`).join("\n\n")
          : `PROJECT: Distributed Systems Middleware\n• Engineered scalable services and real-time data handling.`;

        const name = student.profile?.fullName || "Candidate";
        const email = student.profile?.email || "candidate@email.com";
        const role = student.profile?.targetRole || "Software Engineer";

        textToLoad = `${name}\n${email} • Target Role: ${role}\n\nTECHNICAL SKILLS\n${skillsList}\n\nPROJECTS & EXPERIENCE\n${projectsList}`;
        setIsProfileResumeLoaded(true);
      }

      if (textToLoad) {
        setResumeText(textToLoad);
        handleRunDiagnosis(textToLoad);
      }

      if (student.profile?.targetCompanies && student.profile.targetCompanies.length > 0) {
        setTargetCompany(student.profile.targetCompanies[0]);
      }
      if (student.profile?.targetRole) {
        setTargetRole(student.profile.targetRole);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student]);

  const handleRunDiagnosis = async (customText?: string) => {
    const textToAnalyze = customText || resumeText;
    if (!textToAnalyze || textToAnalyze.trim().length < 10) return;

    setIsAnalyzing(true);
    try {
      const { data } = await api.post("/api/resume/diagnose", {
        resume_content: textToAnalyze,
        job_description: jobDescription,
        target_role: targetRole,
        target_company: targetCompany
      });

      if (data && data.scores) {
        setReport(data);
      }
    } catch {
      try {
        const { data } = await api.post("/resume/diagnose", {
          resume_content: textToAnalyze,
          job_description: jobDescription,
          target_role: targetRole,
          target_company: targetCompany
        });
        if (data && data.scores) {
          setReport(data);
        }
      } catch (err2) {
        console.error("Resume diagnosis fallback error:", err2);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Initial diagnosis on mount
  useEffect(() => {
    if (!student) {
      handleRunDiagnosis(DEFAULT_RESUME);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Extracts bracketed placeholders like [Insert %], [Insert X ms], [Insert # of users]
   */
  const extractPlaceholders = (text: string): string[] => {
    const matches = text.match(/\[[^\]]+\]/g);
    return matches ? Array.from(new Set(matches)) : [];
  };

  /**
   * Computes the rendered rewrite string incorporating any user-typed custom metric inputs.
   */
  const getRenderedRewrite = (bulletId: string, rewriteTemplate: string): string => {
    let result = rewriteTemplate;
    const bulletInputs = customMetricInputs[bulletId] || {};
    const placeholders = extractPlaceholders(rewriteTemplate);

    for (const ph of placeholders) {
      const customVal = bulletInputs[ph];
      if (customVal && customVal.trim()) {
        result = result.replace(ph, customVal.trim());
      }
    }
    return result;
  };

  const handleUpdateCustomMetric = (bulletId: string, placeholder: string, value: string) => {
    setCustomMetricInputs(prev => ({
      ...prev,
      [bulletId]: {
        ...(prev[bulletId] || {}),
        [placeholder]: value
      }
    }));
  };

  /**
   * In-place line replacement that accurately locates the bullet line in resumeText.
   */
  const replaceSingleBullet = (currentText: string, original: string, replacement: string): { text: string; replaced: boolean } => {
    const cleanOrig = original.trim().replace(/^[\u2022\u25cf\u25cb\u25e6\-*+•–—]\s*/, "").trim();
    const cleanRepl = replacement.trim().replace(/^[\u2022\u25cf\u25cb\u25e6\-*+•–—]\s*/, "").trim();

    const lines = currentText.split("\n");
    let replaced = false;

    const updatedLines = lines.map(line => {
      if (replaced) return line;
      const trimmed = line.trim();
      const cleanLine = trimmed.replace(/^[\u2022\u25cf\u25cb\u25e6\-*+•–—]\s*/, "").trim();

      if (
        line.includes(original) ||
        trimmed === original.trim() ||
        cleanLine.toLowerCase() === cleanOrig.toLowerCase() ||
        (cleanOrig.length > 25 && cleanLine.toLowerCase().includes(cleanOrig.toLowerCase())) ||
        (cleanLine.length > 25 && cleanOrig.toLowerCase().includes(cleanLine.toLowerCase()))
      ) {
        replaced = true;
        const bulletMatch = line.match(/^(\s*[\u2022\u25cf\u25cb\u25e6\-*+•–—]\s*)/);
        const prefix = bulletMatch ? bulletMatch[1] : (line.startsWith("  ") ? "  • " : "• ");
        return prefix + cleanRepl;
      }
      return line;
    });

    if (replaced) {
      return { text: updatedLines.join("\n"), replaced: true };
    }

    if (currentText.includes(original)) {
      return { text: currentText.replace(original, replacement), replaced: true };
    }
    if (currentText.includes(cleanOrig)) {
      return { text: currentText.replace(cleanOrig, cleanRepl), replaced: true };
    }

    const origWords = new Set(cleanOrig.toLowerCase().split(/\s+/).filter(w => w.length > 2));
    let bestIdx = -1;
    let maxScore = 0;

    lines.forEach((l, idx) => {
      const lWords = l.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      if (lWords.length < 3) return;
      const common = lWords.filter(w => origWords.has(w)).length;
      const score = common / Math.max(origWords.size, lWords.length, 1);
      if (score > 0.45 && score > maxScore) {
        maxScore = score;
        bestIdx = idx;
      }
    });

    if (bestIdx !== -1) {
      const line = lines[bestIdx];
      const bulletMatch = line.match(/^(\s*[\u2022\u25cf\u25cb\u25e6\-*+•–—]\s*)/);
      const prefix = bulletMatch ? bulletMatch[1] : "• ";
      lines[bestIdx] = prefix + cleanRepl;
      return { text: lines.join("\n"), replaced: true };
    }

    return { text: currentText, replaced: false };
  };

  const handleApplyRewrite = (original: string, bulletId: string, rewriteTemplate: string) => {
    const finalReplacement = getRenderedRewrite(bulletId, rewriteTemplate);
    const { text: updatedResume } = replaceSingleBullet(resumeText, original, finalReplacement);
    setResumeText(updatedResume);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("placement_mentor_resume_full_text", updatedResume);
      } catch { }
    }

    setAppliedCount(prev => prev + 1);

    if (report) {
      const remaining = report.weak_bullets.filter(b => b.original_text !== original);
      setReport({
        ...report,
        weak_bullets: remaining,
        scores: {
          ...report.scores,
          impact_score: Math.min(98, report.scores.impact_score + 6),
          ats_score: Math.min(99, report.scores.ats_score + 3),
          match_score: Math.min(98, report.scores.match_score + 4),
          overall_grade: remaining.length === 0 ? "A+" : "A-"
        }
      });
    }
  };

  const handleApplyAllRewrites = () => {
    if (!report || !report.weak_bullets || report.weak_bullets.length === 0) return;

    let current = resumeText;
    let appliedNow = 0;

    for (const wb of report.weak_bullets) {
      const finalRepl = getRenderedRewrite(wb.id, wb.improved_rewrite);
      const { text, replaced } = replaceSingleBullet(current, wb.original_text, finalRepl);
      current = text;
      if (replaced) appliedNow++;
    }

    setResumeText(current);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("placement_mentor_resume_full_text", current);
      } catch { }
    }

    setAppliedCount(prev => prev + appliedNow);
    setAllAppliedNotification(true);
    setTimeout(() => setAllAppliedNotification(false), 3000);

    setReport({
      ...report,
      weak_bullets: [],
      scores: {
        ...report.scores,
        impact_score: 95,
        ats_score: 96,
        match_score: 94,
        overall_grade: "A+"
      }
    });
  };

  /**
   * 1-Click Missing Keyword Inserter: Dynamically appends the chosen skill into the SKILLS section.
   */
  const handleInsertMissingSkill = (skill: string) => {
    const lines = resumeText.split("\n");
    let inserted = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineUpper = line.toUpperCase();
      if (lineUpper.includes("TECHNICAL SKILLS") || lineUpper.includes("SKILLS") || lineUpper.startsWith("FRAMEWORKS") || lineUpper.startsWith("LANGUAGES")) {
        // Append to the line or next line
        if (lines[i].includes(":") && !lines[i].toLowerCase().includes(skill.toLowerCase())) {
          lines[i] = `${lines[i]}, ${skill}`;
          inserted = true;
          break;
        } else if (i + 1 < lines.length && lines[i + 1].trim().length > 0 && !lines[i + 1].toLowerCase().includes(skill.toLowerCase())) {
          lines[i + 1] = `${lines[i + 1]}, ${skill}`;
          inserted = true;
          break;
        }
      }
    }

    if (!inserted) {
      lines.splice(2, 0, `TECHNICAL SKILLS: ${skill}`);
    }

    const updatedText = lines.join("\n");
    setResumeText(updatedText);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("placement_mentor_resume_full_text", updatedText);
      } catch { }
    }

    setInsertedKeywordBanner(`✓ Added "${skill}" into Technical Skills`);
    setTimeout(() => setInsertedKeywordBanner(null), 3000);

    // Update missing skills list
    if (report) {
      const updatedMissing = report.gap_analysis.missing_skills.filter(s => s.toLowerCase() !== skill.toLowerCase());
      const updatedMatched = [...report.gap_analysis.matched_skills, skill];
      setReport({
        ...report,
        gap_analysis: {
          ...report.gap_analysis,
          missing_skills: updatedMissing,
          matched_skills: updatedMatched
        },
        scores: {
          ...report.scores,
          match_score: Math.min(99, report.scores.match_score + 3),
          ats_score: Math.min(99, report.scores.ats_score + 2)
        }
      });
    }
  };

  const handleAddResourceBullet = (suggestedBullet: string) => {
    const cleanBullet = suggestedBullet.replace(/^[\u2022\u25cf\u25cb\u25e6\-*+•–—]\s*/, "").trim();
    const lines = resumeText.split("\n");
    let inserted = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim().toUpperCase();
      if (line.includes("PROJECTS") || line.includes("EXPERIENCE")) {
        let insertIndex = i + 1;
        while (insertIndex < lines.length && lines[insertIndex].trim().length > 0) {
          insertIndex++;
        }
        lines.splice(insertIndex, 0, `• ${cleanBullet}`);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      lines.push("", "TECHNICAL HIGHLIGHTS", `• ${cleanBullet}`);
    }

    const newResume = lines.join("\n");
    setResumeText(newResume);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("placement_mentor_resume_full_text", newResume);
      } catch { }
    }

    if (report && report.resource_bullet_suggestions) {
      const remaining = report.resource_bullet_suggestions.filter(s => s.suggested_bullet !== suggestedBullet);
      setReport({
        ...report,
        resource_bullet_suggestions: remaining
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const b64 = reader.result as string;
        setIsAnalyzing(true);
        try {
          const { data } = await api.post("/api/resume/diagnose", {
            resume_content: b64,
            job_description: jobDescription,
            target_role: targetRole,
            target_company: targetCompany
          });
          if (data?.resume_signals?.raw_text && !data.resume_signals.raw_text.startsWith("data:")) {
            setResumeText(data.resume_signals.raw_text);
            if (typeof window !== "undefined") {
              try {
                localStorage.setItem("placement_mentor_resume_full_text", data.resume_signals.raw_text);
              } catch { }
            }
          }
          if (data?.scores) {
            setReport(data);
          }
        } catch {
          // Fallback
        } finally {
          setIsAnalyzing(false);
        }
      };
    } else {
      reader.readAsText(file);
      reader.onload = () => {
        const text = reader.result as string;
        setResumeText(text);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("placement_mentor_resume_full_text", text);
          } catch { }
        }
        handleRunDiagnosis(text);
      };
    }
  };

  /**
   * High-Fidelity PDF generation.
   */
  const handleDownloadPDF = () => {
    const lines = resumeText.split("\n");
    let name = "Alex Chen";
    for (let i = 0; i < Math.min(lines.length, 3); i++) {
      if (lines[i].trim() && !lines[i].includes("@")) {
        name = lines[i].trim();
        break;
      }
    }

    let bodyHtml = "";

    if (pdfLayoutMode === "exact") {
      const formattedLines = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed) return "<div style=\"height: 8pt;\"></div>";

        const isHeader = (
          (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.length < 35 && !trimmed.startsWith("•") && !trimmed.startsWith("-")) ||
          /^(TECHNICAL SKILLS|SKILLS|WORK EXPERIENCE|EXPERIENCE|PROJECTS|TECHNICAL PROJECTS|EDUCATION|ACHIEVEMENTS|CERTIFICATIONS|LEADERSHIP|PUBLICATIONS)/i.test(trimmed)
        );

        if (isHeader) {
          return `<div style="font-weight: 700; font-size: 11pt; text-transform: uppercase; border-bottom: 1pt solid #111827; padding-bottom: 2pt; margin-top: 10pt; margin-bottom: 4pt; letter-spacing: 0.4pt;">${trimmed}</div>`;
        }

        if (/^[\u2022\u25cf\u25cb\u25e6\-*+•–—]\s*/.test(trimmed) || line.startsWith("  ")) {
          const bulletContent = trimmed.replace(/^[\u2022\u25cf\u25cb\u25e6\-*+•–—]\s*/, "");
          return `<div style="display: flex; margin-left: 14pt; margin-bottom: 2.5pt; font-size: 9.8pt; line-height: 1.38;"><span style="margin-right: 6pt;">•</span><span>${bulletContent}</span></div>`;
        }

        if (trimmed.includes("—") || trimmed.includes(" - ") || /\b(20\d{2}|19\d{2}|Present)\b/i.test(trimmed)) {
          return `<div style="font-weight: 600; font-size: 10.2pt; color: #111827; margin-top: 4pt; margin-bottom: 2pt;">${trimmed}</div>`;
        }

        return `<div style="font-size: 9.8pt; line-height: 1.4; color: #1f2937; margin-bottom: 2pt;">${trimmed}</div>`;
      }).join("\n");

      bodyHtml = `
        <div style="font-family: 'Times New Roman', Times, 'Georgia', serif; font-size: 10pt; color: #000; padding: 0.1in;">
          ${formattedLines}
        </div>
      `;
    } else {
      let htmlContent = "";
      let inList = false;
      let startIndex = 0;

      htmlContent += `<div class="resume-header"><h1 class="candidate-name">${name}</h1></div>`;

      for (let i = startIndex; i < lines.length; i++) {
        const rawLine = lines[i];
        const trimmed = rawLine.trim();

        if (!trimmed) {
          if (inList) {
            htmlContent += `</ul>`;
            inList = false;
          }
          continue;
        }

        const isHeader = (
          (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.length < 35 && !trimmed.startsWith("•") && !trimmed.startsWith("-")) ||
          /^(TECHNICAL SKILLS|SKILLS|WORK EXPERIENCE|EXPERIENCE|PROJECTS|TECHNICAL PROJECTS|EDUCATION|ACHIEVEMENTS|CERTIFICATIONS|LEADERSHIP|PUBLICATIONS)/i.test(trimmed)
        );

        if (isHeader) {
          if (inList) {
            htmlContent += `</ul>`;
            inList = false;
          }
          htmlContent += `<div class="section-title">${trimmed}</div>`;
          continue;
        }

        const isBullet = /^[\u2022\u25cf\u25cb\u25e6\-*+•–—]\s*/.test(trimmed) || rawLine.startsWith("  ");
        if (isBullet) {
          if (!inList) {
            htmlContent += `<ul class="bullet-list">`;
            inList = true;
          }
          const bulletText = trimmed.replace(/^[\u2022\u25cf\u25cb\u25e6\-*+•–—]\s*/, "");
          htmlContent += `<li class="bullet-item">${bulletText}</li>`;
          continue;
        }

        if (inList) {
          htmlContent += `</ul>`;
          inList = false;
        }

        if (trimmed.includes("—") || trimmed.includes(" - ") || trimmed.includes(" | ") || /\b(20\d{2}|19\d{2}|Present)\b/i.test(trimmed)) {
          htmlContent += `<div class="job-subheading">${trimmed}</div>`;
        } else {
          htmlContent += `<div class="standard-line">${trimmed}</div>`;
        }
      }

      if (inList) {
        htmlContent += `</ul>`;
      }

      bodyHtml = htmlContent;
    }

    const printDoc = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${name.replace(/[^a-zA-Z0-9]/g, "_")}_Resume</title>
        <style>
          @page {
            size: letter portrait;
            margin: 0.55in 0.6in 0.55in 0.6in;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #111827;
            background: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .resume-header {
            text-align: center;
            margin-bottom: 10pt;
            border-bottom: 1.5pt solid #1f2937;
            padding-bottom: 5pt;
          }
          .candidate-name {
            font-size: 17pt;
            font-weight: 700;
            color: #111827;
            letter-spacing: -0.2pt;
            margin-bottom: 3pt;
            text-transform: uppercase;
          }
          .section-title {
            font-size: 11pt;
            font-weight: 700;
            color: #111827;
            text-transform: uppercase;
            letter-spacing: 0.4pt;
            margin-top: 9pt;
            margin-bottom: 3pt;
            border-bottom: 1pt solid #d1d5db;
            padding-bottom: 2pt;
          }
          .job-subheading {
            font-size: 10.2pt;
            font-weight: 600;
            color: #1f2937;
            margin-top: 4pt;
            margin-bottom: 2pt;
          }
          .standard-line {
            font-size: 9.8pt;
            color: #374151;
            margin-bottom: 2.5pt;
          }
          .bullet-list {
            list-style-type: disc;
            margin-left: 14pt;
            margin-bottom: 5pt;
            padding: 0;
          }
          .bullet-item {
            font-size: 9.8pt;
            color: #1f2937;
            margin-bottom: 2pt;
            line-height: 1.38;
            text-align: justify;
          }
        </style>
      </head>
      <body>
        ${bodyHtml}
      </body>
      </html>
    `;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(printDoc);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 2000);
      }, 350);
    }
  };

  /**
   * Feature 3: Renders the interactive heatmap version of the resume with syntax highlighting
   */
  const renderHeatmapContent = useMemo(() => {
    const matchedSkills = report?.gap_analysis?.matched_skills || ["Python", "FastAPI", "React", "Docker", "SQL", "Redis"];
    const companyKeywords = report?.company_track?.detected_keywords || ["Distributed Systems", "P99 Latency", "Throughput", "Microservices"];

    const lines = resumeText.split("\n");

    return lines.map((line, lineIdx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={lineIdx} className="h-4" />;
      }

      // Check if header
      const isHeader = (
        (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.length < 35 && !trimmed.startsWith("•") && !trimmed.startsWith("-")) ||
        /^(TECHNICAL SKILLS|SKILLS|WORK EXPERIENCE|EXPERIENCE|PROJECTS|TECHNICAL PROJECTS|EDUCATION|ACHIEVEMENTS|CERTIFICATIONS|LEADERSHIP|PUBLICATIONS)/i.test(trimmed)
      );

      if (isHeader) {
        return (
          <div key={lineIdx} className="font-bold text-[13px] text-primary uppercase tracking-wider border-b border-border-subtle pb-1 mt-4 mb-2">
            {trimmed}
          </div>
        );
      }

      // Parse tokens for highlighting
      const isBullet = /^[\u2022\u25cf\u25cb\u25e6\-*+•–—]\s*/.test(trimmed) || line.startsWith("  ");
      const bulletPrefix = isBullet ? "• " : "";
      let cleanContent = isBullet ? trimmed.replace(/^[\u2022\u25cf\u25cb\u25e6\-*+•–—]\s*/, "") : line;

      // Tokenize and build spans
      const regexTerms: { term: string; type: "matched" | "company" | "metric" | "passive" }[] = [];

      matchedSkills.forEach(s => {
        if (s.length > 1) regexTerms.push({ term: s, type: "matched" });
      });
      companyKeywords.forEach(k => {
        if (k.length > 2) regexTerms.push({ term: k, type: "company" });
      });
      PASSIVE_PHRASES.forEach(p => {
        regexTerms.push({ term: p, type: "passive" });
      });

      // Sort longer terms first to match compounds
      regexTerms.sort((a, b) => b.term.length - a.term.length);

      // Build composite regex
      const patternParts = regexTerms.map(t => t.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      patternParts.push(String.raw`\b\d+(?:,\d+)*(?:\.\d+)?(?:%|\s*(?:ms|sec|users|k|requests|qps))\b`);

      const compositeRegex = new RegExp(`(${patternParts.join("|")})`, "gi");

      const parts = cleanContent.split(compositeRegex);

      return (
        <div key={lineIdx} className={`text-[13px] leading-relaxed text-on-surface ${isBullet ? "pl-5 relative my-1" : "my-0.5"}`}>
          {isBullet && <span className="absolute left-0 text-primary font-bold">•</span>}
          {parts.map((segment, sIdx) => {
            if (!segment) return null;
            const segmentLower = segment.toLowerCase();

            // Check if metric
            if (/\b\d+(?:,\d+)*(?:\.\d+)?(?:%|\s*(?:ms|sec|users|k|requests|qps))\b/i.test(segment)) {
              return (
                <span key={sIdx} className="bg-status-warning/20 text-status-warning font-bold border border-status-warning/30 px-1 py-0.5 rounded text-[12px] font-mono mx-0.5" title="Quantified Metric (Google X-Y-Z formula)">
                  {segment}
                </span>
              );
            }

            // Check if passive
            if (PASSIVE_PHRASES.some(p => p.toLowerCase() === segmentLower)) {
              return (
                <span key={sIdx} className="bg-status-error/15 text-status-error line-through border border-status-error/30 px-1 py-0.5 rounded text-[12px] font-medium mx-0.5" title="Weak/Passive phrase: Replace with strong action verb">
                  {segment}
                </span>
              );
            }

            // Check if company keyword
            if (companyKeywords.some(k => k.toLowerCase() === segmentLower)) {
              return (
                <span key={sIdx} className="bg-primary/15 text-primary font-bold border border-primary/30 px-1 py-0.5 rounded text-[12px] mx-0.5 shadow-xs" title={`Target ${targetCompany} Keyword`}>
                  ★ {segment}
                </span>
              );
            }

            // Check if matched skill
            if (matchedSkills.some(s => s.toLowerCase() === segmentLower)) {
              return (
                <span key={sIdx} className="bg-status-success/15 text-status-success font-bold border border-status-success/30 px-1 py-0.5 rounded text-[12px] mx-0.5" title="Verified JD Skill Match">
                  ✓ {segment}
                </span>
              );
            }

            return <span key={sIdx}>{segment}</span>;
          })}
        </div>
      );
    });
  }, [resumeText, report, targetCompany]);

  return (
    <div className="flex-1 flex flex-col pt-20 pb-8 px-6 max-w-[1500px] mx-auto w-full h-[calc(100vh-2rem)] overflow-hidden">
      {/* TOP HEADER */}
      <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline-sm text-[20px] font-bold text-on-background">Resume Doctor & Job Matcher</h1>
              {isProfileResumeLoaded && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-status-success/10 text-status-success border border-status-success/20 flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> Candidate Resume Loaded
                </span>
              )}
            </div>
            <p className="font-body-sm text-[13px] text-secondary">
              Evaluating your exact resume lines against hiring standards and quantifying impact for {targetRole}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <label className="cursor-pointer bg-surface hover:bg-surface-container border border-border-subtle hover:border-primary/40 text-on-surface font-label-md text-[13px] font-medium px-4 py-2 rounded-xl transition-all duration-150 flex items-center gap-2 shadow-xs hover:shadow-sm active:scale-[0.98] group" title="Upload a resume PDF or text file">
            <Upload className="w-4 h-4 text-secondary group-hover:text-primary transition-colors" />
            <span>Upload PDF</span>
            <input type="file" accept=".pdf,.txt,.docx" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={() => handleRunDiagnosis()}
            disabled={isAnalyzing}
            className="bg-primary hover:bg-primary/90 text-on-primary font-label-md text-[13px] font-semibold px-5 py-2 rounded-xl transition-all duration-200 shadow-xs hover:shadow-md active:scale-[0.98] flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer group"
          >
            {isAnalyzing ? <Sparkles className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />}
            <span>{isAnalyzing ? "Analyzing Alignment..." : "Run AI Diagnosis"}</span>
          </button>
        </div>
      </div>

      {/* MAIN SPLIT WORKSPACE */}
      <div className="grid grid-cols-12 gap-6 mt-4 flex-grow overflow-hidden">

        {/* LEFT COLUMN: INTERACTIVE RESUME PREVIEW & HEATMAP (6 COLS) */}
        <div className="col-span-12 lg:col-span-6 flex flex-col h-full bg-surface border border-border-subtle rounded-xl overflow-hidden shadow-sm">

          {/* Header Controls Bar */}
          <div className="px-3.5 py-2.5 bg-surface-bright border-b border-border-subtle flex items-center justify-between gap-2 shrink-0">
            {/* Left: Title & Mode Switcher */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="flex items-center gap-1.5 text-on-background">
                <FileText className="w-4 h-4 text-primary" />
                <span className="font-label-md text-[13px] font-bold tracking-tight">Resume</span>
              </div>

              {/* Mode Switcher (Editor vs ATS Heatmap) */}
              <div className="inline-flex items-center bg-surface-container p-0.5 rounded-lg border border-border-subtle text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => setCanvasViewMode("edit")}
                  className={`px-2.5 py-1 rounded-md transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                    canvasViewMode === "edit"
                      ? "bg-surface text-primary font-bold shadow-xs border border-border-subtle"
                      : "text-secondary hover:text-on-surface"
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Editor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCanvasViewMode("heatmap")}
                  className={`px-2.5 py-1 rounded-md transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                    canvasViewMode === "heatmap"
                      ? "bg-status-success text-white font-bold shadow-xs"
                      : "text-secondary hover:text-on-surface"
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Heatmap</span>
                </button>
              </div>
            </div>

            {/* Right: Actions Group */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Copy Button */}
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== "undefined") {
                    navigator.clipboard.writeText(resumeText);
                    setCopiedNotification(true);
                    setTimeout(() => setCopiedNotification(false), 2000);
                  }
                }}
                className="text-[11px] text-on-surface hover:text-primary font-medium px-2.5 py-1 bg-surface hover:bg-surface-container border border-border-subtle hover:border-primary/40 rounded-lg transition-all duration-150 flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer h-7"
                title="Copy entire resume text"
              >
                {copiedNotification ? <Check className="w-3 h-3 text-status-success" /> : <Copy className="w-3 h-3 text-secondary" />}
                <span>{copiedNotification ? "Copied!" : "Copy"}</span>
              </button>

              {/* PDF Format Selector (Exact / Modern) */}
              <div className="inline-flex items-center bg-surface-container p-0.5 rounded-lg border border-border-subtle text-[11px] font-medium h-7">
                <button
                  type="button"
                  onClick={() => setPdfLayoutMode("exact")}
                  className={`px-2 py-0.5 rounded transition-all duration-150 cursor-pointer ${
                    pdfLayoutMode === "exact"
                      ? "bg-surface text-on-surface font-bold shadow-xs border border-border-subtle"
                      : "text-secondary hover:text-on-surface"
                  }`}
                  title="Preserves exact original formatting and line breaks"
                >
                  Exact
                </button>
                <button
                  type="button"
                  onClick={() => setPdfLayoutMode("modern")}
                  className={`px-2 py-0.5 rounded transition-all duration-150 cursor-pointer ${
                    pdfLayoutMode === "modern"
                      ? "bg-surface text-on-surface font-bold shadow-xs border border-border-subtle"
                      : "text-secondary hover:text-on-surface"
                  }`}
                  title="Formats into modern structured ATS document"
                >
                  Modern
                </button>
              </div>

              {/* Download PDF Button */}
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="text-[11px] text-on-primary bg-primary hover:bg-primary/90 font-medium px-3 py-1 rounded-lg transition-all duration-150 flex items-center gap-1.5 shadow-xs hover:shadow-sm active:scale-95 cursor-pointer group h-7"
                title="Export high-fidelity ATS PDF resume"
              >
                <Download className="w-3 h-3 transition-transform duration-200 group-hover:-translate-y-0.5" />
                <span>PDF</span>
              </button>
            </div>
          </div>

          {/* Feature 3: Heatmap Legend Bar when Heatmap is Active */}
          {canvasViewMode === "heatmap" && (
            <div className="px-4 py-2 bg-surface-container-low border-b border-border-subtle flex items-center justify-between text-[11px] font-medium shrink-0">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1 text-status-success font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-status-success/30 border border-status-success inline-block"></span>
                  Matched JD Skill
                </span>
                <span className="flex items-center gap-1 text-primary font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary/30 border border-primary inline-block"></span>
                  Target Focus Keyword
                </span>
                <span className="flex items-center gap-1 text-status-warning font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-status-warning/30 border border-status-warning inline-block"></span>
                  Quantified Metric
                </span>
                <span className="flex items-center gap-1 text-status-error line-through">
                  Passive Phrase
                </span>
              </div>
              <button
                onClick={() => setCanvasViewMode("edit")}
                className="text-primary hover:underline text-[11px] font-semibold cursor-pointer px-2 py-0.5 rounded hover:bg-primary/10 transition-colors"
              >
                Switch to Edit ✎
              </button>
            </div>
          )}

          {/* Feature 3: 1-Click Quick Insert Missing Keywords Bar */}
          {report?.gap_analysis?.missing_skills && report.gap_analysis.missing_skills.length > 0 && (
            <div className="px-4 py-2 bg-primary/5 border-b border-primary/20 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 overflow-x-auto py-0.5">
                <span className="text-[11px] font-bold text-primary shrink-0 flex items-center gap-1">
                  <PlusCircle className="w-3.5 h-3.5" /> 1-Click Insert Missing Skills:
                </span>
                {report.gap_analysis.missing_skills.slice(0, 4).map((skill, i) => (
                  <button
                    key={i}
                    onClick={() => handleInsertMissingSkill(skill)}
                    className="text-[11px] bg-surface border border-primary/30 hover:bg-primary/15 hover:border-primary/50 text-primary px-2.5 py-1 rounded-lg font-medium shrink-0 transition-all duration-150 shadow-xs hover:shadow-sm active:scale-95 cursor-pointer flex items-center gap-1"
                    title={`Click to add "${skill}" into your Technical Skills`}
                  >
                    <PlusCircle className="w-3 h-3 text-primary" />
                    <span>{skill}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {insertedKeywordBanner && (
            <div className="px-4 py-1.5 bg-status-success/15 border-b border-status-success/30 text-[12px] text-status-success font-medium flex items-center gap-1.5 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{insertedKeywordBanner}</span>
            </div>
          )}

          {/* Main Canvas Area */}
          <div className="flex-1 overflow-y-auto p-5 font-mono text-[13px] leading-relaxed text-on-surface bg-surface-bright space-y-4">
            {canvasViewMode === "edit" ? (
              <textarea
                value={resumeText}
                onChange={(e) => {
                  setResumeText(e.target.value);
                  if (typeof window !== "undefined") {
                    try {
                      localStorage.setItem("placement_mentor_resume_full_text", e.target.value);
                    } catch { }
                  }
                }}
                placeholder="Paste or edit your complete resume text here..."
                rows={24}
                className="w-full h-full bg-transparent border-0 outline-none resize-none font-mono text-[13px] text-on-surface leading-relaxed"
              />
            ) : (
              <div className="font-sans leading-relaxed space-y-1">
                {renderHeatmapContent}
              </div>
            )}
          </div>

          {/* Quick Stats Bar */}
          <div className="p-3 bg-surface border-t border-border-subtle flex justify-between items-center text-[12px] text-secondary font-label-sm shrink-0">
            <span>Detected Skills: <strong>{report?.gap_analysis?.matched_skills?.length || 0}</strong></span>
            <span>Pending Weak Bullets: <strong className="text-status-warning">{report?.weak_bullets?.length || 0}</strong></span>
            <span>ATS Grade: <strong className="text-status-success">{report?.scores?.overall_grade || "B+"}</strong></span>
          </div>
        </div>

        {/* RIGHT COLUMN: ATS & JOB MATCH DIAGNOSTIC HUB (6 COLS) */}
        <div className="col-span-12 lg:col-span-6 flex flex-col h-full bg-surface border border-border-subtle rounded-xl overflow-hidden shadow-sm">

          {/* Bento Score Bar */}
          <div className="grid grid-cols-4 gap-2 p-4 bg-surface-bright border-b border-border-subtle shrink-0">
            <div className="bg-surface border border-border-subtle p-3 rounded-lg text-center shadow-xs">
              <span className="font-label-sm text-[10px] uppercase font-bold text-secondary block mb-0.5">Match Score</span>
              <span className="font-display-lg text-[22px] font-bold text-primary">{report?.scores?.match_score || 82}%</span>
            </div>
            <div className="bg-surface border border-border-subtle p-3 rounded-lg text-center shadow-xs">
              <span className="font-label-sm text-[10px] uppercase font-bold text-secondary block mb-0.5">ATS Score</span>
              <span className="font-display-lg text-[22px] font-bold text-status-success">{report?.scores?.ats_score || 85}%</span>
            </div>
            <div className="bg-surface border border-border-subtle p-3 rounded-lg text-center shadow-xs">
              <span className="font-label-sm text-[10px] uppercase font-bold text-secondary block mb-0.5">Impact Score</span>
              <span className="font-display-lg text-[22px] font-bold text-status-warning">{report?.scores?.impact_score || 70}%</span>
            </div>
            <div className="bg-surface border border-border-subtle p-3 rounded-lg text-center shadow-xs">
              <span className="font-label-sm text-[10px] uppercase font-bold text-secondary block mb-0.5">Format</span>
              <span className="font-display-lg text-[22px] font-bold text-blue-team">{report?.scores?.formatting_score || 90}%</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-border-subtle bg-surface px-3 shrink-0 overflow-x-auto gap-1">
            <button
              onClick={() => setActiveTab("bullets")}
              className={`py-3 px-3 text-[13px] font-medium border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${activeTab === "bullets" ? "border-primary text-primary font-bold" : "border-transparent text-secondary hover:text-on-surface"
                }`}
            >
              <Flame className="w-4 h-4" />
              <span>Weak Bullets</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === "bullets" ? "bg-primary/15 text-primary" : "bg-surface-container text-secondary"}`}>
                {report?.weak_bullets?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("suggestions")}
              className={`py-3 px-3 text-[13px] font-medium border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${activeTab === "suggestions" ? "border-primary text-primary font-bold" : "border-transparent text-secondary hover:text-on-surface"
                }`}
            >
              <PlusCircle className="w-4 h-4 text-status-success" />
              <span>Resource Bullets</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === "suggestions" ? "bg-status-success/20 text-status-success" : "bg-surface-container text-secondary"}`}>
                {report?.resource_bullet_suggestions?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("skills")}
              className={`py-3 px-3 text-[13px] font-medium border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${activeTab === "skills" ? "border-primary text-primary font-bold" : "border-transparent text-secondary hover:text-on-surface"
                }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Skills Gap</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === "skills" ? "bg-status-error/15 text-status-error" : "bg-surface-container text-secondary"}`}>
                {report?.gap_analysis?.missing_skills?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("jd")}
              className={`py-3 px-3 text-[13px] font-medium border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${activeTab === "jd" ? "border-primary text-primary font-bold" : "border-transparent text-secondary hover:text-on-surface"
                }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Target JD</span>
            </button>

            <button
              onClick={() => setActiveTab("tips")}
              className={`py-3 px-3 text-[13px] font-medium border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${activeTab === "tips" ? "border-primary text-primary font-bold" : "border-transparent text-secondary hover:text-on-surface"
                }`}
            >
              <Award className="w-4 h-4" />
              <span>Action Plan & Tips</span>
            </button>
          </div>

          {/* Tab Content Container */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">

            {/* TAB 1: WEAK BULLETS & INTERACTIVE METRIC REWRITER */}
            {activeTab === "bullets" && (
              <div className="space-y-4">
                <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-xl flex justify-between items-center">
                  <p className="text-[12px] text-on-surface-variant leading-relaxed">
                    💡 <strong>Google X-Y-Z Formula</strong>: <em>&quot;Accomplished [X] as measured by [Y], by doing [Z]&quot;</em>.
                  </p>
                  {report?.weak_bullets && report.weak_bullets.length > 1 && (
                    <button
                      onClick={handleApplyAllRewrites}
                      className="bg-primary hover:bg-primary/90 active:scale-[0.98] text-on-primary font-semibold text-[12px] px-3.5 py-1.5 rounded-xl transition-all duration-150 shrink-0 ml-3 flex items-center gap-1.5 shadow-sm hover:shadow cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Apply All ({report.weak_bullets.length})</span>
                    </button>
                  )}
                </div>

                {allAppliedNotification && (
                  <div className="p-3 bg-status-success/15 border border-status-success/30 rounded-xl text-[13px] text-status-success font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>All suggested bullet optimizations were applied directly into your live resume!</span>
                  </div>
                )}

                {/* State: Is Analyzing / Scanning */}
                {isAnalyzing && (
                  <div className="text-center p-10 space-y-3 bg-surface-bright border border-primary/20 rounded-xl">
                    <Sparkles className="w-8 h-8 text-primary mx-auto animate-spin" />
                    <h3 className="font-label-md text-[15px] font-bold text-on-surface">Scanning Bullets Against Hiring Standards...</h3>
                    <p className="font-body-sm text-[12px] text-secondary max-w-sm mx-auto">
                      Extracting your exact narrative lines and benchmarking against Google X-Y-Z formula standards.
                    </p>
                  </div>
                )}

                {/* State: Not Analyzed Yet */}
                {!isAnalyzing && !report && (
                  <div className="text-center p-10 space-y-3 bg-surface-bright border border-border-subtle rounded-xl">
                    <FileText className="w-8 h-8 text-secondary mx-auto" />
                    <h3 className="font-label-md text-[15px] font-bold text-on-surface">Ready for Diagnostic</h3>
                    <p className="font-body-sm text-[12px] text-secondary max-w-sm mx-auto">
                      Click &quot;Run AI Diagnosis&quot; to detect weak impact bullets and generate quantified rewrites.
                    </p>
                  </div>
                )}

                {/* State: Has Weak Bullets with Interactive Metric Customizer */}
                {!isAnalyzing && report && report.weak_bullets && report.weak_bullets.length > 0 && (
                  report.weak_bullets.map((bullet, idx) => {
                    const placeholders = extractPlaceholders(bullet.improved_rewrite);
                    const renderedRewrite = getRenderedRewrite(bullet.id, bullet.improved_rewrite);
                    const hasCustomized = Object.keys(customMetricInputs[bullet.id] || {}).length > 0;

                    return (
                      <div key={idx} className="p-4 bg-surface-bright border border-border-subtle rounded-xl space-y-3 shadow-sm hover:border-primary/40 transition-all">
                        <div className="flex justify-between items-start">
                          <span className="px-2 py-0.5 bg-status-warning/10 text-status-warning border border-status-warning/20 text-[10px] font-bold rounded uppercase">
                            {bullet.issue_type || "WEAK IMPACT"}
                          </span>
                          <span className="text-[11px] text-secondary font-mono">{bullet.section || "EXPERIENCE"}</span>
                        </div>

                        {/* Original Line */}
                        <div className="p-2.5 bg-status-error/5 border-l-2 border-status-error rounded text-[13px] text-on-surface">
                          <span className="text-[11px] text-secondary block font-bold uppercase mb-0.5">Original Line from Your Resume:</span>
                          <p className="line-through text-on-surface-variant decoration-status-error">{bullet.original_text}</p>
                        </div>

                        {/* Critique */}
                        <p className="text-[12px] text-secondary italic">
                          🔍 {bullet.critique}
                        </p>

                        {/* Interactive Placeholders Customizer */}
                        {placeholders.length > 0 && (
                          <div className="p-3 bg-surface border border-primary/20 rounded-lg space-y-2">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary uppercase">
                              <Sliders className="w-3.5 h-3.5" />
                              <span>Validate & Insert Your Exact Metric:</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {placeholders.map((ph, pIdx) => {
                                const currentVal = (customMetricInputs[bullet.id] || {})[ph] || "";
                                const cleanLabel = ph.replace(/\[|\]/g, "");
                                return (
                                  <div key={pIdx} className="space-y-1">
                                    <label className="text-[11px] font-mono text-secondary block">{cleanLabel}</label>
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="text"
                                        value={currentVal}
                                        onChange={(e) => handleUpdateCustomMetric(bullet.id, ph, e.target.value)}
                                        placeholder={ph.includes("%") ? "e.g. 35%" : ph.includes("ms") ? "e.g. 80ms" : "e.g. 10,000"}
                                        className="w-full bg-surface-container-low border border-border-subtle rounded-lg px-2.5 py-1 text-[12px] font-medium text-on-surface focus:border-primary outline-none"
                                      />
                                      {/* Quick preset chips */}
                                      {ph.includes("%") && (
                                        <div className="flex gap-1">
                                          {["25%", "40%"].map(val => (
                                            <button
                                              key={val}
                                              type="button"
                                              onClick={() => handleUpdateCustomMetric(bullet.id, ph, val)}
                                              className="px-2 py-0.5 text-[10px] bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded font-mono font-bold transition-colors cursor-pointer active:scale-95"
                                            >
                                              {val}
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Live Tailored Rewrite Preview */}
                        <div className="p-3 bg-status-success/10 border-l-2 border-status-success rounded text-[13px] text-on-surface">
                          <span className="text-[11px] text-status-success font-bold block uppercase mb-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> {hasCustomized ? "Your Validated Tailored Rewrite:" : "Google X-Y-Z Optimized Rewrite:"}
                          </span>
                          <p className="font-medium text-on-surface leading-relaxed">{renderedRewrite}</p>
                        </div>

                        {/* Action Button */}
                        <button
                          onClick={() => handleApplyRewrite(bullet.original_text, bullet.id, bullet.improved_rewrite)}
                          className="w-full bg-primary hover:bg-primary/90 active:scale-[0.99] text-on-primary py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-xs hover:shadow-md cursor-pointer group"
                        >
                          <Check className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                          <span>Apply Tailored Rewrite to Live Resume</span>
                        </button>
                      </div>
                    );
                  })
                )}

                {/* State: All Bullets Verified */}
                {!isAnalyzing && report && (!report.weak_bullets || report.weak_bullets.length === 0) && (
                  <div className="text-center p-12 space-y-3 bg-surface-bright border border-border-subtle rounded-xl">
                    <CheckCircle2 className="w-10 h-10 text-status-success mx-auto" />
                    <h3 className="font-label-md text-[16px] font-bold text-on-surface">All Bullet Points Verified!</h3>
                    <p className="font-body-sm text-[13px] text-secondary max-w-sm mx-auto">
                      All bullet points currently in your resume follow strong metrics, action verbs, and Google X-Y-Z formula standards.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: DYNAMIC RESOURCE & COMPLETED TOPIC BULLETS */}
            {activeTab === "suggestions" && (
              <div className="space-y-4">
                <div className="p-3.5 bg-status-success/10 border border-status-success/20 rounded-xl">
                  <p className="text-[12px] text-on-surface leading-relaxed">
                    ✨ <strong>Dynamic Resource Suggestions</strong>: Ready-to-copy bullet points generated from completed practice modules and mastered competencies.
                  </p>
                </div>

                {report?.resource_bullet_suggestions && report.resource_bullet_suggestions.length > 0 ? (
                  report.resource_bullet_suggestions.map((sugg, idx) => (
                    <div key={idx} className="p-4 bg-surface-bright border border-border-subtle rounded-xl space-y-3 shadow-sm hover:border-status-success/40 transition-all">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                          {sugg.skill_category}
                        </span>
                        <span className="text-[11px] text-secondary font-mono">Topic: {sugg.topic_id}</span>
                      </div>

                      <div className="p-3 bg-surface border border-border-subtle rounded-lg">
                        <p className="text-[13px] font-medium text-on-surface leading-relaxed">
                          {sugg.suggested_bullet}
                        </p>
                      </div>

                      <p className="text-[12px] text-secondary">
                        🎯 <em>{sugg.context_reason}</em>
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {sugg.skills_to_add.map((sk, i) => (
                          <span key={i} className="text-[11px] bg-surface-container px-2 py-0.5 rounded text-secondary font-medium">
                            +{sk}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => handleAddResourceBullet(sugg.suggested_bullet)}
                        className="w-full bg-status-success hover:bg-status-success/90 active:scale-[0.99] text-white py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-xs hover:shadow-md cursor-pointer group"
                      >
                        <PlusCircle className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
                        <span>Add Bullet into Resume Projects</span>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-12 space-y-3 bg-surface-bright border border-border-subtle rounded-xl">
                    <CheckCircle2 className="w-10 h-10 text-status-success mx-auto" />
                    <h3 className="font-label-md text-[16px] font-bold text-on-surface">No Pending Suggestions</h3>
                    <p className="font-body-sm text-[13px] text-secondary max-w-sm mx-auto">
                      Complete more practice questions or learning topics to unlock dynamic new resume bullets!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SKILLS GAP MATRIX */}
            {activeTab === "skills" && (
              <div className="space-y-5">
                {/* Matched Skills */}
                <div>
                  <h3 className="font-label-md text-[13px] font-bold text-status-success uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Matched Skills ({report?.gap_analysis?.matched_skills?.length || 0})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {report?.gap_analysis?.matched_skills?.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-status-success/10 border border-status-success/20 text-status-success font-label-sm text-[12px] rounded-lg font-medium">
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing High-Priority Skills */}
                <div>
                  <h3 className="font-label-md text-[13px] font-bold text-status-error uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> Missing JD Skills ({report?.gap_analysis?.missing_skills?.length || 0})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {report?.gap_analysis?.missing_skills?.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-status-error/10 border border-status-error/20 text-status-error font-label-sm text-[12px] rounded-lg font-medium">
                        + {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Keywords */}
                <div>
                  <h3 className="font-label-md text-[13px] font-bold text-status-warning uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Recommended Keywords ({report?.gap_analysis?.missing_keywords?.length || 0})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {report?.gap_analysis?.missing_keywords?.map((kw, i) => (
                      <span key={i} className="px-3 py-1 bg-status-warning/10 border border-status-warning/20 text-status-warning font-label-sm text-[12px] rounded-lg font-medium">
                        • {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: TARGET JOB DESCRIPTION */}
            {activeTab === "jd" && (
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {Object.keys(PRESET_JDS).map((name) => (
                    <button
                      key={name}
                      onClick={() => {
                        setActivePreset(name);
                        setJobDescription(PRESET_JDS[name]);
                        if (name.includes("Google")) setTargetCompany("Google");
                        if (name.includes("Amazon")) setTargetCompany("Amazon");
                        if (name.includes("Microsoft")) setTargetCompany("Microsoft");
                        if (name.includes("Meta")) setTargetCompany("Meta");
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-[12px] font-medium transition-all duration-150 cursor-pointer active:scale-95 flex items-center gap-1.5 ${activePreset === name
                          ? "bg-primary text-on-primary font-bold shadow-xs border border-primary"
                          : "bg-surface border border-border-subtle text-secondary hover:text-on-surface hover:bg-surface-container"
                        }`}
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>{name}</span>
                    </button>
                  ))}
                </div>

                <textarea
                  rows={14}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste target job description..."
                  className="w-full bg-surface-bright border border-border-subtle rounded-xl p-3.5 text-[13px] text-on-surface outline-none focus:border-primary font-sans leading-relaxed resize-none"
                />
              </div>
            )}

            {/* TAB 5: HIRING INSIGHTS & RECOMMENDATIONS */}
            {activeTab === "tips" && (
              <div className="space-y-4">
                {report?.company_track && (
                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-label-sm text-[12px] font-bold text-primary uppercase tracking-wider">
                        {report.company_track.rubric_name}
                      </span>
                      <span className="text-[11px] font-mono text-secondary">Bar Raiser Guide</span>
                    </div>
                    <p className="text-[13px] text-on-surface leading-relaxed">
                      🎯 <strong>Focus</strong>: {report.company_track.focus}
                    </p>
                    <p className="text-[12px] text-secondary italic">
                      💡 <strong>Bar-Raiser Tip</strong>: {report.company_track.bar_raiser_tip}
                    </p>
                  </div>
                )}

                {report?.executive_summary && (
                  <div className="p-4 bg-surface-bright border border-border-subtle rounded-xl space-y-1">
                    <span className="font-label-sm text-[11px] font-bold text-primary uppercase tracking-wider block">Executive Diagnostic Summary</span>
                    <p className="text-[13px] text-on-surface leading-relaxed">{report.executive_summary}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <h3 className="font-label-md text-[13px] font-bold text-on-surface uppercase tracking-wider mb-2">High-Impact Action Items</h3>
                  {(report?.structural_recommendations || [
                    "Add quantified metrics to project descriptions.",
                    "Include missing keywords in technical summary."
                  ]).map((rec, i) => (
                    <div key={i} className="p-3 bg-surface-bright border border-border-subtle rounded-xl flex items-start gap-2.5 text-[13px] text-on-surface">
                      <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
