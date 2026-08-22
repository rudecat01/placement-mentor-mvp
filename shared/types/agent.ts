// Agent message types — fill in by shared contract agreement
export interface SocraticHintResponse { hintLevel: 1 | 2 | 3; guidanceText: string; reflectionQuestion: string; }
export interface ShadowCriticScore { stage: string; overallTurnVerdict: 'STRONG' | 'ACCEPTABLE' | 'NEEDS_PROBING' | 'FAILING'; }