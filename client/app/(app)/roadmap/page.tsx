/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRoadmap } from "../../../hooks/queries/useRoadmap";
import { useStudent } from "../../../hooks/queries/useStudent";
import { Circle, ArrowRight, PlayCircle, Lock, BookOpen, BrainCircuit, Sparkles, Target, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useState } from "react";

export default function AdaptiveRoadmapPage() {
  const { data: roadmap, isLoading: isRoadmapLoading } = useRoadmap();
  const { data: student, isLoading: isStudentLoading } = useStudent();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isCompleting, setIsCompleting] = useState<Record<string, boolean>>({});

  if (isRoadmapLoading || isStudentLoading) {
    return <div className="p-24 text-center">Loading Adaptive Roadmap...</div>;
  }

  const topicEntries = Object.entries(student?.topicStates || {});
  const weakTopics = topicEntries
    .filter(([, v]) => (v.mastery || 0) < 0.65)
    .sort((a, b) => (a[1].mastery || 0) - (b[1].mastery || 0));

  const targetRole = student?.profile?.targetRole || "SDE";
  const targetCompanies = student?.profile?.targetCompanies || ["Google", "Microsoft"];
  const companiesStr = targetCompanies.join(", ");

  // Build projected multi-day timeline from live state + Gemini day 1 plan
  const liveDay1 = roadmap?.[0] || {
    dayNumber: 1,
    totalBudgetMinutes: student?.profile?.dailyTimeBudget || 120,
    allocatedMinutes: student?.profile?.dailyTimeBudget || 120,
    tasks: [
      { id: "t1", title: "DSA Mastery: 1-D Dynamic Programming", topicId: "1-D Dynamic Programming", track: "DSA", difficulty: "HARD", allocatedMinutes: 50, rationale: "Focusing on your lowest mastery topic." },
      { id: "t2", title: "DSA Core Practice: Two Pointers & Sliding Window", topicId: "Two Pointers", track: "DSA", difficulty: "MEDIUM", allocatedMinutes: 40, rationale: "Building up your foundational algorithmic patterns." },
      { id: "t3", title: "Advanced Problem Solving: Trees & Recursion", topicId: "Trees", track: "DSA", difficulty: "HARD", allocatedMinutes: 30, rationale: "Pushing your limits on complex recursive tree structures." }
    ],
    whyThisMovedLogs: []
  };

  // Generate adaptive projected days
  const projectedDays = [
    liveDay1,
    {
      dayNumber: 2,
      totalBudgetMinutes: student?.profile?.dailyTimeBudget || 120,
      allocatedMinutes: student?.profile?.dailyTimeBudget || 120,
      isProjected: true,
      tasks: [
        {
          id: "proj_d2_1",
          title: `Graph Algorithms & BFS/DFS Traversal Drills (${companiesStr})`,
          topicId: "Graphs",
          track: "DSA",
          difficulty: "MEDIUM",
          allocatedMinutes: 50,
          rationale: `Targeted practice for ${weakTopics[1]?.[1]?.topic_name || "Graph Algorithms"} gap.`
        },
        {
          id: "proj_d2_2",
          title: "Advanced Data Structures: Tries",
          topicId: "Tries",
          track: "DSA",
          difficulty: "MEDIUM",
          allocatedMinutes: 40,
          rationale: "Building prefix-tree intuition for string problems."
        },
        {
          id: "proj_d2_3",
          title: "Optimization Drill: Greedy Algorithms",
          topicId: "Greedy",
          track: "DSA",
          difficulty: "HARD",
          allocatedMinutes: 30,
          rationale: "Mastering complex condition-based optimization."
        }
      ]
    },
    {
      dayNumber: 3,
      totalBudgetMinutes: student?.profile?.dailyTimeBudget || 120,
      allocatedMinutes: student?.profile?.dailyTimeBudget || 120,
      isProjected: true,
      tasks: [
        {
          id: "proj_d3_1",
          title: "Binary Search Optimization (Hard/Medium)",
          topicId: "Binary Search",
          track: "DSA",
          difficulty: "HARD",
          allocatedMinutes: 50,
          rationale: "Escalating algorithm difficulty to meet company benchmarks."
        },
        {
          id: "proj_d3_2",
          title: "Red Team Drill: Intervals & Overlap Parsing",
          topicId: "Intervals",
          track: "DSA",
          difficulty: "HARD",
          allocatedMinutes: 40,
          rationale: "Deep technical drilling on sorting and merging logic."
        },
        {
          id: "proj_d3_3",
          title: "Backtracking & Permutation Generation",
          topicId: "Backtracking",
          track: "DSA",
          difficulty: "MEDIUM",
          allocatedMinutes: 30,
          rationale: "Preparing structured recursive states."
        }
      ]
    },
    {
      dayNumber: 4,
      totalBudgetMinutes: student?.profile?.dailyTimeBudget || 120,
      allocatedMinutes: student?.profile?.dailyTimeBudget || 120,
      isProjected: true,
      tasks: [
        {
          id: "proj_d4_1",
          title: `Full-Length Placement Mock: Advanced Graphs (${companiesStr})`,
          topicId: "Advanced Graphs",
          track: "DSA",
          difficulty: "HARD",
          allocatedMinutes: 75,
          rationale: "45-minute live coding challenge Dijkstra/Kruskal simulation."
        },
        {
          id: "proj_d4_2",
          title: "Readiness Checkpoint: 2-D Dynamic Programming",
          topicId: "2-D Dynamic Programming",
          track: "DSA",
          difficulty: "HARD",
          allocatedMinutes: 45,
          rationale: "Evaluating whether mastery meets the 85% Interview Gate."
        }
      ]
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto pt-24 pb-margin-desktop px-margin-desktop max-w-[1100px] mx-auto w-full space-y-8">
      {/* Header */}
      <div className="border-b border-border-subtle pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display-lg text-[32px] md:text-[36px] font-bold text-on-background tracking-tight mb-2 flex items-center gap-2.5">
            <BrainCircuit className="w-8 h-8 text-primary" />
            Adaptive Roadmap & Timeline
          </h1>
          <p className="font-body-lg text-[16px] text-secondary max-w-2xl">
            Live AI-scheduled progression generated by <strong className="text-on-background font-semibold">Gemini 2.5 Flash</strong>. Calibrated to your resume skills, weak gaps, and {targetRole} placement goals at {companiesStr}.
          </p>
        </div>
        <div className="bg-surface border border-border-subtle rounded-xl p-3.5 flex items-center gap-3 shrink-0">
          <Target className="w-5 h-5 text-primary shrink-0" />
          <div>
            <span className="font-label-sm text-[11px] text-secondary uppercase font-bold block">Interview Gate</span>
            <span className="font-label-md text-[14px] font-bold text-on-background">{student?.practiceScore ?? 52}% / 85% Required</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative border-l-2 border-border-subtle ml-4 pl-8 space-y-12">
        {projectedDays.map((day, dayIndex) => (
          <motion.div 
            key={day.dayNumber}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: dayIndex * 0.1 }}
            className="relative"
          >
            {/* Timeline dot */}
            <div className={`absolute -left-[41px] top-1 bg-surface rounded-full p-1 border-2 ${
              dayIndex === 0 ? "border-primary text-primary ring-4 ring-primary/15" : 
              "border-border-subtle text-secondary"
            }`}>
              {dayIndex === 0 ? <Circle className="fill-primary w-4 h-4" /> : <Circle className="w-4 h-4" />}
            </div>

            <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h2 className="font-headline-sm text-[20px] font-bold text-on-background flex items-center gap-2">
                  {dayIndex === 0 ? "Today's Live Mission (Day 1)" : `Day ${day.dayNumber} Projection`}
                  {dayIndex === 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Live Gemini AI
                    </span>
                  )}
                </h2>
                <p className="font-body-sm text-[14px] text-secondary">
                  {dayIndex === 0 ? "Active time budget allocation solving high-priority diagnostic gaps." : "Adaptive milestone projection based on target role velocity."}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-label-sm text-[12px] font-medium bg-surface-container-low border border-border-subtle px-3 py-1 rounded-md text-secondary">
                  {day.allocatedMinutes} mins planned
                </span>
                {dayIndex === 0 && (
                  <button 
                    onClick={async () => {
                      const res = await fetch('/api/agents/planner/roadmap', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          student_id: student?.profile?.id, 
                          day_number: day.dayNumber + 1 
                        })
                      });
                      if (res.ok) {
                        alert("Next day's plan generated!");
                        window.location.reload();
                      }
                    }}
                    className="font-label-sm text-[12px] font-medium bg-primary text-on-primary px-3 py-1 rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Complete Session & Plan Next Day
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {day.tasks.map((task) => {
                const isInt = task.track === "INTERVIEW" || ("type" in task && task.type === "MOCK_INTERVIEW") || task.title.toLowerCase().includes("interview") || task.title.toLowerCase().includes("verbalization");
                return (
                  <div 
                    key={task.id} 
                    onClick={() => {
                      if (dayIndex !== 0) return;
                      router.push(isInt ? `/interview?taskId=${task.id}` : `/practice/${task.id}`);
                    }}
                    className={`border rounded-xl p-4 flex flex-col justify-between transition-all ${
                      dayIndex === 0 
                        ? "bg-surface border-border-subtle hover:border-primary/50 shadow-sm cursor-pointer group" 
                        : "bg-surface-container-lowest border-border-subtle/50 opacity-80"
                    }`}
                  >
                  <div>
                    <div className="flex justify-between items-start mb-2.5">
                      <span className={`px-2 py-0.5 rounded font-label-sm text-[10px] uppercase tracking-wider font-bold ${
                        task.difficulty === "HARD" ? "bg-status-warning/10 text-status-warning" : 
                        task.difficulty === "EASY" ? "bg-status-success/10 text-status-success" :
                        "bg-primary/10 text-primary"
                      }`}>
                        {task.track || "DSA"} • {task.difficulty}
                      </span>
                      {dayIndex === 0 ? (
                        <PlayCircle className="text-secondary group-hover:text-primary w-5 h-5 transition-colors" />
                      ) : (
                        <Lock className="text-outline w-4 h-4" />
                      )}
                    </div>
                    
                    <h3 className="font-label-md text-[15px] font-bold text-on-background mb-1.5 line-clamp-2">{task.title}</h3>
                    <p className="font-body-sm text-[12px] text-secondary line-clamp-2 mb-3">{task.rationale}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-secondary font-label-sm text-[12px] pt-3 border-t border-border-subtle/50 mt-auto">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      {task.allocatedMinutes} mins
                    </span>
                    {dayIndex === 0 && (
                      <div className="flex items-center gap-2">
                        <button
                          disabled={isCompleting[task.id] || (task as any).isCompleted}
                          onClick={async (e) => {
                            e.stopPropagation();
                            if ((task as any).isCompleted) return;
                            setIsCompleting(prev => ({ ...prev, [task.id]: true }));
                            try {
                              await api.post("/api/roadmap/task/complete", { topic_id: (task as any).topicId || "dp", difficulty: task.difficulty });
                              (task as any).isCompleted = true; 
                              queryClient.invalidateQueries({ queryKey: ["student"] });
                              queryClient.invalidateQueries({ queryKey: ["skillGraph"] });
                            } finally {
                              setIsCompleting(prev => ({ ...prev, [task.id]: false }));
                            }
                          }}
                          className={`flex items-center gap-1 font-medium text-[11px] px-2 py-1 rounded-md transition-colors z-10 ${(task as any).isCompleted ? "bg-status-success/20 text-status-success" : "bg-surface-container-high hover:bg-primary/20 hover:text-primary text-secondary"}`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {(task as any).isCompleted ? "Done" : "Mark as Done"}
                        </button>
                        <span className="flex items-center gap-1 text-primary font-medium group-hover:underline">
                          Start <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      ))}
      </div>
    </div>
  );
}
