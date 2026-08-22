// Student profile types — fill in by shared contract agreement
export type TargetRole = 'SDE' | 'BACKEND' | 'FRONTEND' | 'FULLSTACK' | 'ML' | 'DEVOPS' | string;
export interface StudentProfile {
  id: string;
  email: string;
  fullName: string;
  targetRole: TargetRole;
  targetCompanies: string[];
  deadlineDays: number;
  dailyTimeBudget?: number;
}
export interface StudentState {
  profile: StudentProfile;
  practiceScore: number;
  interviewScore: number;
  ptg: number;
  remainingDays: number;
}