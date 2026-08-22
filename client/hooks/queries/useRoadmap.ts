import { useQuery } from "@tanstack/react-query";
import { DayPlan, TaskDifficulty } from "../../../shared/types/roadmap";
import { api } from "../../lib/api";

const ROADMAP_CACHE_KEY = "placement_mentor_roadmap_cache";

interface RawRoadmapTask {
  id?: string;
  title?: string;
  topic_id?: string;
  topicId?: string;
  topic_name?: string;
  topicName?: string;
  track?: string;
  type?: string;
  difficulty?: TaskDifficulty;
  allocated_minutes?: number;
  allocatedMinutes?: number;
  rationale?: string;
  is_completed?: boolean;
  isCompleted?: boolean;
}

interface RawWhyMovedLog {
  topic_id?: string;
  topicId?: string;
  topic_name?: string;
  topicName?: string;
  action?: string;
  reason?: string;
  trigger_event?: string;
  triggerEvent?: string;
}

interface RawDayPlan {
  day_number?: number;
  dayNumber?: number;
  total_budget_minutes?: number;
  totalBudgetMinutes?: number;
  allocated_minutes?: number;
  allocatedMinutes?: number;
  tasks?: RawRoadmapTask[];
  why_this_moved_logs?: RawWhyMovedLog[];
  whyThisMovedLogs?: RawWhyMovedLog[];
}

// Helper to normalize backend snake_case and camelCase payloads into DayPlan interface
const normalizeDayPlan = (raw: RawDayPlan): DayPlan => {
  const rawTasks = raw.tasks || [];
  const tasks = rawTasks.map((t: RawRoadmapTask) => ({
    id: t.id || `task_${Math.random().toString(36).slice(2, 8)}`,
    title: t.title || "Practice Milestone",
    topicId: t.topic_id || t.topicId || "",
    topicName: t.topic_name || t.topicName || "",
    track: t.track || "DSA",
    type: t.type || "CODING_PRACTICE",
    difficulty: t.difficulty || "MEDIUM",
    allocatedMinutes: t.allocated_minutes ?? t.allocatedMinutes ?? 35,
    rationale: t.rationale || "Personalized diagnostic milestone.",
    isCompleted: t.is_completed ?? t.isCompleted ?? false,
  }));

  const rawLogs = raw.why_this_moved_logs || raw.whyThisMovedLogs || [];
  const whyThisMovedLogs = rawLogs.map((l: RawWhyMovedLog) => ({
    topicId: l.topic_id || l.topicId || "",
    topicName: l.topic_name || l.topicName || "",
    action: l.action || "PRIORITIZED",
    reason: l.reason || "",
    triggerEvent: l.trigger_event || l.triggerEvent || "",
  }));

  return {
    dayNumber: raw.day_number ?? raw.dayNumber ?? 1,
    totalBudgetMinutes: raw.total_budget_minutes ?? raw.totalBudgetMinutes ?? 120,
    allocatedMinutes: raw.allocated_minutes ?? raw.allocatedMinutes ?? 120,
    tasks,
    whyThisMovedLogs,
  };
};

const fetchRoadmap = async (): Promise<DayPlan[]> => {
  // 1. Check local storage cache
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(ROADMAP_CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return (parsed as RawDayPlan[]).map(normalizeDayPlan);
        }
      } catch {
        localStorage.removeItem(ROADMAP_CACHE_KEY);
      }
    }
  }

  // 2. Fetch current student state first to generate personalized roadmap
  let studentState = {};
  let targetRole = "SDE";
  let targetCompanies = ["Google", "Microsoft"];
  let timeBudget = 120;

  try {
    const studentRes = await api.get("/api/student/state");
    if (studentRes.data) {
      studentState = studentRes.data;
      targetRole = studentRes.data.profile?.target_role || targetRole;
      targetCompanies = studentRes.data.profile?.target_companies || targetCompanies;
      timeBudget = studentRes.data.profile?.daily_time_budget_minutes || timeBudget;
    }
  } catch {
    // fallback if uninitialized
  }

  const payload = {
    student_state: studentState,
    skill_graph: {},
    day_number: 1,
    daily_budget_minutes: timeBudget,
    target_role: targetRole,
    target_companies: targetCompanies,
  };

  const { data } = await api.post("/api/roadmap/generate", payload);

  // 3. Normalize & Save to local storage
  if (typeof window !== "undefined" && data.data) {
    const rawArray = (Array.isArray(data.data) ? data.data : [data.data]) as RawDayPlan[];
    const normalizedArray = rawArray.map(normalizeDayPlan);
    localStorage.setItem(ROADMAP_CACHE_KEY, JSON.stringify(normalizedArray));
    return normalizedArray;
  }

  return [];
};

export const useRoadmap = () => {
  return useQuery({
    queryKey: ["roadmap"],
    queryFn: fetchRoadmap,
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
    retry: 1,
  });
};
