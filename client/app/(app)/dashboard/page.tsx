/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { 
  Target, 
  TrendingUp, 
  Dumbbell, 
  ArrowUp, 
  Mic, 
  Minus, 
  AlertTriangle, 
  Flag, 
  BrainCircuit, 
  Clock, 
  ArrowRight, 
  BookOpen, 
  Circle, 
  Network, 
  PlusCircle, 
  Zap,
  Sparkles,
  Layers,
  FolderGit2,
  Bell,
  X,
  Lock
} from "lucide-react";
import { useState, useEffect } from "react";
import { useStudent } from "../../../hooks/queries/useStudent";
import { useRoadmap } from "../../../hooks/queries/useRoadmap";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const { data: student, isLoading: isStudentLoading } = useStudent();
  const { data: roadmap, isLoading: isRoadmapLoading } = useRoadmap();
  
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const activeDayPlan = roadmap?.[0];
  const activeTask = activeDayPlan?.tasks?.[0];

  // 1. Resume ATS Score (from extracted resume signals)
  const resumeAtsScore = Math.round(student?.telemetry?.resume_signals?.ats_score || 85);

  // 2. Skills Mastery Score (independent mean percentage across all active topics)
  const topicEntries = Object.entries(student?.topicStates || {});
  const avgSkillsScore = topicEntries.length > 0
    ? Math.round((topicEntries.reduce((acc, [, val]) => acc + (val.mastery || 0.7), 0) / topicEntries.length) * 100)
    : 76;

  // 3. Practice Diagnostic Score
  const practiceScore = student?.practiceScore ?? 74;

  // 4. Interview Verified Score
  const interviewScore = student?.isCalibrated && student?.interviewScore !== null ? student.interviewScore : null;

  // 5. Composite Readiness Score (Weighted combination of practice, skills, resume, and mock interview)
  const readinessScore = interviewScore !== null
    ? Math.round(0.35 * practiceScore + 0.25 * avgSkillsScore + 0.20 * resumeAtsScore + 0.20 * interviewScore)
    : Math.round(0.45 * practiceScore + 0.35 * avgSkillsScore + 0.20 * resumeAtsScore);

  // Sort topics by lowest mastery first for hotspots
  const sortedTopics = [...topicEntries].sort((a, b) => (a[1].mastery || 0) - (b[1].mastery || 0));
  
  const hotspots = sortedTopics
    .filter(([, val]) => (val.mastery || 0) < 0.65)
    .slice(0, 3)
    .map(([key, val]) => ({
      id: key,
      name: val.topic_name || key.replace(/_/g, " ").toUpperCase(),
      gap: Math.round((1 - (val.mastery || 0.3)) * 100),
      mastery: Math.round((val.mastery || 0.3) * 100),
    }));

  // Strong topics from mastery
  const strongTopics = sortedTopics
    .filter(([, val]) => (val.mastery || 0) >= 0.60)
    .slice(-3)
    .reverse()
    .map(([key, val]) => ({
      name: val.topic_name || key.replace(/_/g, " ").toUpperCase(),
      mastery: Math.round((val.mastery || 0.7) * 100),
    }));

  const resumeSkills = student?.telemetry?.resume_signals?.extracted_skills || [];
  const resumeProjects = student?.telemetry?.resume_signals?.extracted_projects || [];

  // Fetch DAG prerequisite alert for the weakest hotspot
  useEffect(() => {
    if (hotspots.length > 0) {
      fetch('/api/agents/notifications/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic_id: hotspots[0].id, 
          mastery_map: Object.fromEntries(topicEntries.map(([k, v]) => [k, v.mastery])),
          role: student?.profile?.targetRole || "SDE"
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setAlerts([data.data]);
        }
      })
      .catch(err => console.error("Failed to fetch alerts", err));
    }
  }, [hotspots.length]);

  if (isStudentLoading || isRoadmapLoading) {
    return <div className="p-24 text-center">Loading Command Center...</div>;
  }

  return (
    <div className="pt-24 pb-margin-desktop px-margin-desktop max-w-[1400px] mx-auto w-full flex-grow flex flex-col gap-gutter">
      {/* HEADER SECTION */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h1 className="font-display-lg text-[32px] font-bold text-on-background tracking-tight">Command Center</h1>
          <p className="font-body-lg text-[16px] text-secondary mt-1 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Target: <span className="font-semibold text-on-background">{student?.profile?.targetRole || "SDE"}</span> at {student?.profile?.targetCompanies?.join(', ') || 'Tech'} 
            <span className="text-border-subtle">|</span>
            <span className="font-label-md text-[14px] font-medium text-on-surface px-2 py-0.5 bg-surface-container-low rounded-md">
              {student?.remainingDays || 45} Days Remaining
            </span>
          </p>
        </div>
        <div className="text-right flex items-end gap-6 relative">
          <div className="relative">
            <button 
              onClick={() => setIsAlertOpen(!isAlertOpen)}
              className="relative p-2 rounded-full hover:bg-surface-container-low transition-colors"
            >
              <Bell className="w-6 h-6 text-secondary hover:text-on-background transition-colors" />
              {alerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-status-error rounded-full border-2 border-background"></span>
              )}
            </button>

            {isAlertOpen && (
              <div className="absolute right-0 top-full mt-2 w-[350px] bg-surface border border-border-subtle rounded-xl shadow-lg z-50 overflow-hidden flex flex-col text-left">
                <div className="p-4 border-b border-border-subtle flex justify-between items-center bg-surface-bright">
                  <h3 className="font-headline-sm text-[16px] font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-status-warning" />
                    Blue Team Coaching Alerts
                  </h3>
                  <button onClick={() => setIsAlertOpen(false)} className="text-secondary hover:text-on-background">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4 max-h-[300px] overflow-y-auto flex flex-col gap-3">
                  {alerts.length > 0 ? alerts.map((alert, idx) => (
                    <div key={idx} className="p-3 bg-status-warning/10 border border-status-warning/20 rounded-lg">
                      <span className="font-label-sm font-bold text-status-warning block mb-1">PREREQUISITE WEAKNESS</span>
                      <p className="text-[13px] text-on-surface mb-2">{alert.message}</p>
                      <p className="text-[12px] font-medium text-secondary bg-surface p-2 rounded border border-border-subtle">
                        {alert.remediation}
                      </p>
                      <button 
                        onClick={() => router.push(`/practice/${alert.prerequisite_id}`)}
                        className="mt-3 text-[12px] font-bold text-primary flex items-center gap-1 hover:underline"
                      >
                        Practice {alert.prerequisite_topic} <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )) : (
                    <p className="text-[13px] text-secondary text-center py-4">No active alerts. You are on track!</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end">
            <span className="font-label-sm text-[12px] font-medium text-secondary uppercase tracking-wider mb-1">Daily Time Budget</span>
            <div className="flex items-baseline gap-1">
              <span className="font-headline-md text-[24px] font-bold text-primary">{student?.profile?.dailyTimeBudget || 120}</span>
              <span className="font-body-sm text-[14px] text-secondary">min</span>
            </div>
          </div>
        </div>
      </section>

      {/* PRIMARY METRICS GRID */}
      <section className="grid grid-cols-12 gap-gutter">
        {/* Readiness Metric */}
        <div className="col-span-12 md:col-span-3 bg-surface border border-border-subtle rounded-xl p-5 flex flex-col relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="font-label-md text-[14px] font-medium text-secondary uppercase tracking-wide">Readiness</span>
            <TrendingUp className="text-status-success w-5 h-5" />
          </div>
          <div className="mt-auto relative z-10">
            <div className="flex items-end gap-2">
              <span className="font-display-lg text-[32px] font-bold text-on-background leading-none">
                {readinessScore}<span className="text-[24px] text-secondary">%</span>
              </span>
            </div>
            <div className="w-full bg-surface-container-highest h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-status-success h-full rounded-full transition-all" style={{ width: `${readinessScore}%` }}></div>
            </div>
            <p className="font-label-sm text-[12px] font-medium text-secondary mt-2">Interview Gate: 85% Required</p>
          </div>
        </div>

        {/* Practice Score Metric */}
        <div className="col-span-12 md:col-span-3 bg-surface border border-border-subtle rounded-xl p-5 flex flex-col relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-team/5 rounded-full blur-2xl group-hover:bg-blue-team/10 transition-colors"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="font-label-md text-[14px] font-medium text-secondary uppercase tracking-wide">Practice Score</span>
            <Dumbbell className="text-secondary w-5 h-5" />
          </div>
          <div className="mt-auto relative z-10">
            <div className="flex items-end gap-2">
              <span className="font-display-lg text-[32px] font-bold text-on-background leading-none">{practiceScore}</span>
            </div>
            <p className="font-label-sm text-[12px] font-medium text-status-success mt-3 flex items-center gap-1">
              <ArrowUp className="w-3.5 h-3.5" />
              Dynamic Diagnostic Baseline
            </p>
          </div>
        </div>

        {/* Interview Score Metric */}
        <div className="col-span-12 md:col-span-3 bg-surface border border-border-subtle rounded-xl p-5 flex flex-col relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/10 transition-colors"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="font-label-md text-[14px] font-medium text-secondary uppercase tracking-wide">Interview Score</span>
            <Mic className="text-secondary w-5 h-5" />
          </div>
          <div className="mt-auto relative z-10">
            <div className="flex items-end gap-2">
              <span className="font-display-lg text-[32px] font-bold text-on-background leading-none">
                {student?.isCalibrated && student?.interviewScore !== null ? `${student.interviewScore}%` : "--"}
              </span>
            </div>
            <p className="font-label-sm text-[12px] font-medium text-status-warning mt-3 flex items-center gap-1">
              <Minus className="w-3.5 h-3.5" />
              {student?.isCalibrated ? "Verified Live Mock" : "Locked • Needs 1st Mock"}
            </p>
          </div>
        </div>

        {/* PTG Metric */}
        <div className={`col-span-12 md:col-span-3 bg-surface border rounded-xl p-5 flex flex-col relative overflow-hidden ${
          student?.isCalibrated ? "border-status-error/30" : "border-border-subtle"
        }`}>
          <div className={`absolute inset-0 ${student?.isCalibrated ? "bg-status-error/5" : "bg-primary/5"}`}></div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <div className="flex flex-col">
              <span className={`font-label-md text-[14px] font-bold flex items-center gap-1 ${
                student?.isCalibrated ? "text-status-error" : "text-primary"
              }`}>
                {student?.isCalibrated ? <AlertTriangle className="w-[18px] h-[18px]" /> : <Lock className="w-[18px] h-[18px]" />}
                {student?.isCalibrated ? "PTG Gap Alert" : "PTG Score Locked"}
              </span>
              <span className="font-label-sm text-[12px] font-medium text-secondary">Transfer Gap</span>
            </div>
            <span className={`font-display-lg text-[32px] font-bold leading-none ${
              student?.isCalibrated ? "text-status-error" : "text-secondary"
            }`}>
              {student?.isCalibrated && student?.ptg !== null ? `${student.ptg}%` : "Locked"}
            </span>
          </div>
          <div className="mt-auto relative z-10">
            {student?.isCalibrated ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden flex relative">
                    <div className="h-full bg-secondary-fixed-dim absolute left-0" style={{ width: `${student?.interviewScore ?? 0}%` }}></div>
                    <div className="h-full bg-blue-team absolute" style={{ left: `${student?.interviewScore ?? 0}%`, width: `${student?.ptg ?? 0}%` }}></div>
                  </div>
                </div>
                <p className="font-label-sm text-[12px] font-medium text-on-surface mt-1">
                  Calibrated against live mock performance.
                </p>
              </>
            ) : (
              <div className="mt-1">
                <button
                  onClick={() => router.push("/interview")}
                  className="w-full text-left font-label-sm text-[12px] font-bold text-primary hover:underline flex items-center justify-between"
                >
                  <span>Attempt Mock to Calibrate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* BENTO ROW 2: Today's Mission & Adaptive Roadmap */}
      <section className="grid grid-cols-12 gap-gutter flex-grow">
        {/* TODAY'S MISSION */}
        <div className="col-span-12 lg:col-span-8 bg-surface border border-border-subtle rounded-xl flex flex-col shadow-sm">
          <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-surface-bright rounded-t-xl">
            <h2 className="font-headline-sm text-[20px] font-bold text-on-background flex items-center gap-2">
              <Flag className="text-primary w-5 h-5" />
              Today&apos;s Mission
            </h2>
            <div className="font-label-sm text-[12px] font-medium bg-surface-container-low border border-border-subtle px-3 py-1 rounded-full text-secondary">
              {activeDayPlan?.allocatedMinutes || 120} / {student?.profile?.dailyTimeBudget || 120} mins planned
            </div>
          </div>
          <div className="p-6 flex-grow flex flex-col">
            {/* Active Task */}
            <div className="border-l-4 border-l-primary pl-5 py-2 mb-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="inline-flex items-center gap-1 font-label-sm text-primary bg-primary/10 px-2 py-0.5 rounded text-[11px] uppercase tracking-wider mb-2 font-bold">
                    <BrainCircuit className="w-3.5 h-3.5" />
                    {activeTask?.track || "DSA"} • {activeTask?.difficulty || "MEDIUM"}
                  </span>
                  <h3 className="font-headline-md text-[24px] font-bold text-on-background">{activeTask?.title || "Diagnostic Milestone"}</h3>
                </div>
                <span className="font-label-md text-[14px] font-medium text-secondary flex items-center gap-1">
                  <Clock className="w-[18px] h-[18px]" /> {activeTask?.allocatedMinutes || 45}m
                </span>
              </div>
              <p className="font-body-md text-[16px] text-secondary mb-4 max-w-2xl">
                <strong>Why this task:</strong> {activeTask?.rationale || "Personalized milestone based on your target role and skill profile."}
              </p>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    if (!activeTask) return;
                    const isInt = activeTask.track === "INTERVIEW" || activeTask.type === "MOCK_INTERVIEW" || activeTask.title.toLowerCase().includes("interview") || activeTask.title.toLowerCase().includes("verbalization");
                    router.push(isInt ? `/interview?taskId=${activeTask.id}` : `/practice/${activeTask.id}`);
                  }}
                  className="bg-primary hover:bg-primary/90 text-on-primary font-label-md text-[14px] font-medium px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                >
                  {(activeTask?.track === "INTERVIEW" || activeTask?.type === "MOCK_INTERVIEW" || activeTask?.title?.toLowerCase().includes("interview") || activeTask?.title?.toLowerCase().includes("verbalization"))
                    ? "Enter Mock Interview" 
                    : "Enter Workspace"}
                  <ArrowRight className="w-[18px] h-[18px]" />
                </button>
                <button 
                  onClick={() => router.push("/roadmap")}
                  className="bg-surface hover:bg-surface-container-low border border-border-subtle text-on-surface font-label-md text-[14px] font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2"
                >
                  <BookOpen className="w-[18px] h-[18px]" />
                  View Full Schedule
                </button>
              </div>
            </div>
            
            <hr className="border-border-subtle mb-6" />
            
            {/* Queue / Up Next */}
            <h4 className="font-label-md text-[14px] font-medium text-secondary uppercase tracking-wider mb-4">Up Next Today</h4>
            <ul className="flex flex-col gap-3">
              {activeDayPlan?.tasks?.slice(1).map((task) => {
                const isInt = task.track === "INTERVIEW" || task.type === "MOCK_INTERVIEW" || task.title.toLowerCase().includes("interview") || task.title.toLowerCase().includes("verbalization");
                return (
                  <li key={task.id} onClick={() => router.push(isInt ? `/interview?taskId=${task.id}` : `/practice/${task.id}`)} className="flex items-center justify-between p-3 rounded-lg border border-border-subtle bg-surface hover:bg-surface-container-lowest transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <Circle className="text-outline-variant group-hover:text-primary transition-colors w-5 h-5" />
                      <div>
                        <span className="font-label-md text-[14px] font-medium text-on-background block">{task.title}</span>
                        <span className="font-label-sm text-[12px] font-medium text-secondary">{task.track} • {task.difficulty}</span>
                      </div>
                    </div>
                    <span className="font-label-sm text-[12px] font-medium text-secondary">{task.allocatedMinutes}m</span>
                  </li>
                );
              })}
              {(!activeDayPlan?.tasks || activeDayPlan.tasks.length <= 1) && (
                <li className="text-secondary font-body-sm">All milestones queued for today!</li>
              )}
            </ul>
          </div>
        </div>

        {/* ADAPTIVE PLAN (RIGHT SIDEBAR - DYNAMICALLY SOURCED) */}
        <div className="col-span-12 lg:col-span-4 bg-surface border border-border-subtle rounded-xl flex flex-col shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border-subtle bg-surface-bright flex justify-between items-center">
            <h2 className="font-headline-sm text-[20px] font-bold text-on-background">Adaptive Plan</h2>
            <button onClick={() => router.push("/roadmap")} className="text-primary font-label-sm text-[12px] font-medium hover:underline">View Full Roadmap</button>
          </div>
          <div className="p-6 flex-grow relative">
            <div className="absolute left-[31px] top-6 bottom-6 w-px bg-border-subtle"></div>
            <ul className="flex flex-col gap-6 relative z-10">
              {/* Dynamic Task Progression from Live Roadmap */}
              {activeDayPlan?.tasks?.map((task, idx) => (
                <li key={task.id} className="flex gap-4">
                  <div className={`w-4 h-4 mt-1 rounded-full shrink-0 flex items-center justify-center ${
                    idx === 0 
                      ? "bg-primary border-4 border-surface shadow-[0_0_0_2px_#1a146b]" 
                      : idx === 1 
                      ? "bg-surface border-2 border-primary" 
                      : "bg-surface border-2 border-outline-variant"
                  }`}>
                    {idx === 0 && <span className="w-1.5 h-1.5 bg-on-primary rounded-full"></span>}
                  </div>
                  <div>
                    <span className="font-label-sm text-[12px] font-bold text-primary block mb-1">
                      {idx === 0 ? "Step 1 (Active)" : `Step ${idx + 1} (${task.allocatedMinutes}m)`}
                    </span>
                    <span className="font-body-sm text-[14px] font-medium text-on-background line-clamp-1">{task.title}</span>
                    <span className="font-label-sm text-[12px] font-medium text-secondary block mt-0.5 line-clamp-2">{task.rationale}</span>
                  </div>
                </li>
              ))}
              {(!activeDayPlan?.tasks || activeDayPlan.tasks.length === 0) && (
                <li className="text-secondary text-[14px]">Generating personalized timeline...</li>
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* BENTO ROW 3: Dynamic Skill Graph Snapshot */}
      <section className="grid grid-cols-12 gap-gutter">
        <div className="col-span-12 bg-surface border border-border-subtle rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline-sm text-[20px] font-bold text-on-background flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Skill Graph & Resume Telemetry Snapshot
            </h2>
            <button onClick={() => router.push("/skill-graph")} className="bg-surface-container-low hover:bg-surface-variant text-on-surface border border-border-subtle font-label-md text-[14px] font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
              <Network className="w-[18px] h-[18px]" />
              Open Full Graph
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Dynamic PTG Focus Areas */}
            <div>
              <h3 className="font-label-md text-[14px] font-medium text-secondary uppercase tracking-wider mb-4 border-b border-border-subtle pb-2">
                Focus Areas (Action Required)
              </h3>
              <ul className="flex flex-col gap-4">
                {hotspots.map((item) => (
                  <li key={item.id} className="flex justify-between items-center p-2.5 rounded-lg hover:bg-surface-container-lowest transition-colors border border-border-subtle/50">
                    <div>
                      <span className="font-body-md text-[16px] text-on-background font-medium block">{item.name}</span>
                      <span className="font-label-sm text-[12px] font-medium text-status-warning block">
                        Mastery: {item.mastery}% | Target Gap: {item.gap}%
                      </span>
                    </div>
                    <button onClick={() => router.push(`/practice/${item.id}`)} className="text-primary hover:text-primary/80 p-1.5 rounded-full hover:bg-primary/10 transition-colors" title="Practice this topic">
                      <PlusCircle className="w-5 h-5" />
                    </button>
                  </li>
                ))}
                {hotspots.length === 0 && (
                  <li className="text-secondary font-body-sm">All baseline topics meet minimum threshold!</li>
                )}
              </ul>
            </div>
            
            {/* Dynamic Verified Strengths, Extracted Skills & Projects */}
            <div>
              <h3 className="font-label-md text-[14px] font-medium text-secondary uppercase tracking-wider mb-4 border-b border-border-subtle pb-2">
                Verified Strengths & Extracted Stack
              </h3>
              <div className="flex flex-col gap-4">
                {/* Verified Mastery Topics */}
                {strongTopics.map((item) => (
                  <div key={item.name} className="flex justify-between items-center p-2.5 rounded-lg hover:bg-surface-container-lowest transition-colors border border-border-subtle/50">
                    <div>
                      <span className="font-body-md text-[16px] text-on-background font-medium flex items-center gap-1.5">
                        {item.name} <Zap className="w-4 h-4 text-status-success" />
                      </span>
                      <span className="font-label-sm text-[12px] font-medium text-status-success block">
                        Verified Proficiency ({item.mastery}%)
                      </span>
                    </div>
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                ))}

                {/* Extracted Resume Skills Tags */}
                {resumeSkills.length > 0 && (
                  <div className="pt-2">
                    <span className="font-label-sm text-[11px] font-bold text-secondary uppercase tracking-wider block mb-2">
                      Detected Technologies & Tools ({resumeSkills.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {resumeSkills.map((skill) => (
                        <span key={skill} className="px-2.5 py-1 rounded-md text-[12px] font-medium bg-primary/10 text-primary border border-primary/20">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extracted Resume Projects */}
                {resumeProjects.length > 0 && (
                  <div className="pt-2">
                    <span className="font-label-sm text-[11px] font-bold text-secondary uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                      <FolderGit2 className="w-3.5 h-3.5 text-primary" />
                      Parsed Resume Projects ({resumeProjects.length})
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {resumeProjects.slice(0, 3).map((proj) => (
                        <span key={proj} className="px-2.5 py-1.5 rounded-md text-[12px] font-medium bg-surface-container-low text-on-surface border border-border-subtle text-left line-clamp-1">
                          {proj}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
