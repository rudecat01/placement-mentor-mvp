// BKT Mastery types — fill in by shared contract agreement
export type MasteryLifecycleState = 'WEAK' | 'AT_RISK' | 'STABLE' | 'MASTERED';
export interface TopicMastery { topicId: string; masteryScore: number; lifecycleState: MasteryLifecycleState; }