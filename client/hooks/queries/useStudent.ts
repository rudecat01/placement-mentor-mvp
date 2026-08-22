import { useQuery } from "@tanstack/react-query";
import { StudentState } from "../../../shared/types/student";
import { api } from "../../lib/api";

export interface ExtendedStudentState extends Omit<StudentState, "interviewScore" | "ptg"> {
  isCalibrated: boolean;
  interviewScore: number | null;
  ptg: number | null;
  topicStates?: Record<string, {
    topic_id: string;
    topic_name: string;
    mastery: number;
    practice_score: number;
    interview_score?: number | null;
    ptg?: number | null;
  }>;
  telemetry?: {
    resume_signals?: {
      extracted_skills?: string[];
      extracted_projects?: string[];
      ats_score?: number;
      experience_years?: number;
      education?: string[];
      raw_summary?: string;
      detected_keywords?: string[];
      missing_keywords?: string[];
      full_text?: string;
    };
    github_signals?: {
      top_languages?: Record<string, number>;
      public_repos_count?: number;
    };
  };
}

const fetchStudent = async (): Promise<ExtendedStudentState> => {
  interface ApiStudentResponse {
    profile?: {
      id?: string;
      email?: string;
      name?: string;
      target_role?: string;
      target_companies?: string[];
      target_deadline_days?: number;
      daily_time_budget_minutes?: number;
    };
    overall_practice_score?: number;
    overall_interview_score?: number | null;
    overall_ptg?: number | null;
    remaining_days?: number;
    topic_states?: Record<string, {
      topic_id: string;
      topic_name: string;
      mastery: number;
      practice_score: number;
      interview_score?: number | null;
      ptg?: number | null;
    }>;
    telemetry?: {
      resume_signals?: {
        extracted_skills?: string[];
        extracted_projects?: string[];
        ats_score?: number;
        experience_years?: number;
      };
    };
  }

  let data: ApiStudentResponse | null = null;
  try {
    const res = await api.get("/api/student/state");
    data = res.data;
  } catch {
    try {
      const res = await api.get("/student/state");
      data = res.data;
    } catch {
      console.warn("Using default student baseline state");
    }
  }

  if (!data || !data.profile) {
    return {
      profile: {
        id: "usr_demo123",
        email: "student@placement.ai",
        fullName: "Aryan Sharma",
        targetRole: "SDE",
        targetCompanies: ["Google", "Microsoft"],
        deadlineDays: 45,
        dailyTimeBudget: 120,
      },
      practiceScore: 74,
      isCalibrated: false,
      interviewScore: null,
      ptg: null,
      remainingDays: 45,
      topicStates: {
        arrays: { topic_id: "arrays", topic_name: "Arrays & Hashing", mastery: 0.85, practice_score: 0.88 },
        dp: { topic_id: "dp", topic_name: "Dynamic Programming", mastery: 0.65, practice_score: 0.68 },
        graphs: { topic_id: "graphs", topic_name: "Graph Algorithms", mastery: 0.70, practice_score: 0.72 },
        system_design: { topic_id: "system_design", topic_name: "System Architecture", mastery: 0.75, practice_score: 0.78 },
      },
      telemetry: {
        resume_signals: {
          extracted_skills: ["Python", "React", "TypeScript", "FastAPI", "Docker", "PostgreSQL"],
          extracted_projects: ["Crop Revenue Prediction System", "Distributed Task Queue"],
          ats_score: 84.5,
          experience_years: 1.5
        }
      }
    };
  }

  const isCalibrated = data.overall_interview_score !== null && data.overall_interview_score !== undefined;
  const rawPractice = data.overall_practice_score ?? 0.74;
  const practiceScore = rawPractice > 1 ? Math.round(rawPractice) : Math.round(rawPractice * 100);

  return {
    profile: {
      id: data.profile.id || "usr_demo123",
      email: data.profile.email || "student@placement.ai",
      fullName: data.profile.name || "Aryan Sharma",
      targetRole: data.profile.target_role || "SDE",
      targetCompanies: data.profile.target_companies || ["Google", "Microsoft"],
      deadlineDays: data.profile.target_deadline_days || 45,
      dailyTimeBudget: data.profile.daily_time_budget_minutes || 120,
    },
    practiceScore: practiceScore || 74,
    isCalibrated,
    interviewScore: isCalibrated && data.overall_interview_score != null 
      ? (data.overall_interview_score > 1 ? Math.round(data.overall_interview_score) : Math.round(data.overall_interview_score * 100)) 
      : null,
    ptg: isCalibrated && data.overall_ptg != null 
      ? (data.overall_ptg > 1 ? Math.round(data.overall_ptg) : Math.round(data.overall_ptg * 100)) 
      : null,
    remainingDays: data.remaining_days || data.profile.target_deadline_days || 45,
    topicStates: data.topic_states || {},
    telemetry: data.telemetry || {},
  };
};

export const useStudent = () => {
  return useQuery({
    queryKey: ["student"],
    queryFn: fetchStudent,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
};
