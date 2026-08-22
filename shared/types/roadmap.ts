// Adaptive Roadmap types - fill in by shared contract agreement
export type TaskDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface RoadmapTask {
  id: string;
  title: string;
  allocatedMinutes: number;
  difficulty: TaskDifficulty;
  track?: string;
  topicId?: string;
  topicName?: string;
  rationale?: string;
  type?: string;
  isCompleted?: boolean;
}

export interface WhyThisMovedLog {
  topicId: string;
  topicName: string;
  action: string;
  reason: string;
  triggerEvent: string;
}

export interface DayPlan {
  dayNumber: number;
  totalBudgetMinutes: number;
  allocatedMinutes?: number;
  tasks: RoadmapTask[];
  whyThisMovedLogs?: WhyThisMovedLog[];
}
