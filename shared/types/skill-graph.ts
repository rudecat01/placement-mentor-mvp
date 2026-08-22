export interface SkillNode {
  id: string;
  label: string;
  currentMastery: number; // 0.0 to 1.0
  practiceScore?: number;
  interviewScore?: number;
  ptg?: number;
  prerequisites: string[];
  track?: string;
  difficulty?: string;
  redTeamInsight?: string;
}

export interface SkillEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface SkillGraphDAG {
  nodes: SkillNode[];
  edges: SkillEdge[];
}