/**
 * Mock domain data for Placement Mentor 2.0.
 * Shapes mirror the intended API contracts so a backend can be plugged in
 * without touching the screens.
 */

export type Mastery = "at-risk" | "weak" | "developing" | "strong" | "locked";

export interface SkillNode {
  id: string;
  name: string;
  track: "dsa" | "core" | "system" | "behavioral";
  mastery: number; // 0-100
  state: Mastery;
  practiceScore: number;
  interviewScore: number;
  ptg: number;
  trend: number; // delta over last 7 days
  prerequisites: string[];
  x: number; // canvas coords (0-100 grid units)
  y: number;
  rootCause?: string;
  nextAction?: string;
  revisionDue?: string;
  attempts?: { date: string; problem: string; verdict: "solved" | "partial" | "failed"; time: string }[];
}

export interface RoadmapTask {
  id: string;
  title: string;
  skill: string;
  difficulty: "easy" | "medium" | "hard";
  minutes: number;
  reason: string;
  status: "done" | "active" | "todo" | "revision";
  kind: "practice" | "concept" | "revision" | "interview" | "project";
}

export interface RoadmapDay {
  day: number;
  date: string;
  label: string;
  focus: string;
  status: "complete" | "today" | "upcoming";
  moved?: { from: string; why: string };
  tasks: RoadmapTask[];
}

export interface CompanyPrep {
  id: string;
  name: string;
  tier: string;
  readiness: number;
  dimensions: { label: string; value: number }[];
  unlocked: boolean;
  freeQuestions: number;
  totalQuestions: number;
  role: string;
}

export interface ResourceTopic {
  topic: string;
  track: string;
  why: string;
  items: { type: "video" | "article" | "docs" | "practice"; title: string; source: string; url: string }[];
}

export const student = {
  name: "Dhruv",
  role: "SDE — Product Companies",
  deadlineDays: 18,
  deadline: "12 Sep 2026",
  placementReadiness: 61,
  practiceScore: 82,
  interviewScore: 48,
  ptg: 34,
  streak: 23,
  hoursThisWeek: 14.5,
  targetHoursWeek: 20,
};

export const readinessHistory = [
  { week: "W1", readiness: 28, practice: 41, interview: 12 },
  { week: "W2", readiness: 35, practice: 54, interview: 19 },
  { week: "W3", readiness: 41, practice: 63, interview: 27 },
  { week: "W4", readiness: 47, practice: 70, interview: 31 },
  { week: "W5", readiness: 52, practice: 76, interview: 38 },
  { week: "W6", readiness: 57, practice: 80, interview: 44 },
  { week: "W7", readiness: 61, practice: 82, interview: 48 },
];

export const todayTasks: RoadmapTask[] = [
  {
    id: "t1",
    title: "Sliding window — variable size patterns",
    skill: "Sliding Window",
    difficulty: "medium",
    minutes: 45,
    reason: "3 of your last 5 two-pointer attempts failed on shrink conditions.",
    status: "active",
    kind: "practice",
  },
  {
    id: "t2",
    title: "Longest substring without repeating characters",
    skill: "Hashing",
    difficulty: "medium",
    minutes: 25,
    reason: "Reinforces the hash-map + window pairing you dropped in mock #4.",
    status: "todo",
    kind: "practice",
  },
  {
    id: "t3",
    title: "Explain your caching layer out loud (3 min)",
    skill: "Project Depth",
    difficulty: "easy",
    minutes: 10,
    reason: "Interview transfer gap: you code it well but cannot narrate it.",
    status: "todo",
    kind: "interview",
  },
  {
    id: "t4",
    title: "Revision — Binary search on answer",
    skill: "Binary Search",
    difficulty: "hard",
    minutes: 30,
    reason: "Spaced repetition due today (last solid recall 9 days ago).",
    status: "revision",
    kind: "revision",
  },
];

export const skills: SkillNode[] = [
  {
    id: "arrays",
    name: "Arrays",
    track: "dsa",
    mastery: 88,
    state: "strong",
    practiceScore: 91,
    interviewScore: 72,
    ptg: 66,
    trend: 3,
    prerequisites: [],
    x: 12,
    y: 18,
    nextAction: "Maintain with 1 hard problem weekly.",
    attempts: [
      { date: "Aug 16", problem: "Rotate Array", verdict: "solved", time: "11m" },
      { date: "Aug 14", problem: "Merge Intervals", verdict: "solved", time: "18m" },
    ],
  },
  {
    id: "hashing",
    name: "Hashing",
    track: "dsa",
    mastery: 74,
    state: "developing",
    practiceScore: 80,
    interviewScore: 51,
    ptg: 40,
    trend: 5,
    prerequisites: ["arrays"],
    x: 12,
    y: 40,
    rootCause: "Collision reasoning is memorised, not derived.",
    nextAction: "Two problems on hash design + verbalise trade-offs.",
    attempts: [{ date: "Aug 17", problem: "Group Anagrams", verdict: "solved", time: "14m" }],
  },
  {
    id: "sliding",
    name: "Sliding Window",
    track: "dsa",
    mastery: 46,
    state: "weak",
    practiceScore: 58,
    interviewScore: 24,
    ptg: 18,
    trend: -4,
    prerequisites: ["hashing"],
    x: 12,
    y: 62,
    rootCause: "Shrink condition derived by trial and error under time pressure.",
    nextAction: "Pattern drill: 4 variable-window problems, narrate invariant first.",
    revisionDue: "Today",
    attempts: [
      { date: "Aug 18", problem: "Min Window Substring", verdict: "failed", time: "42m" },
      { date: "Aug 15", problem: "Longest Repeating Char Replacement", verdict: "partial", time: "35m" },
    ],
  },
  {
    id: "twopointer",
    name: "Two Pointers",
    track: "dsa",
    mastery: 63,
    state: "developing",
    practiceScore: 71,
    interviewScore: 44,
    ptg: 33,
    trend: 2,
    prerequisites: ["arrays"],
    x: 34,
    y: 18,
    nextAction: "Mixed set with sliding window to separate the two patterns.",
  },
  {
    id: "recursion",
    name: "Recursion",
    track: "dsa",
    mastery: 70,
    state: "developing",
    practiceScore: 77,
    interviewScore: 49,
    ptg: 38,
    trend: 1,
    prerequisites: ["arrays"],
    x: 34,
    y: 44,
    nextAction: "Write recurrence relations before coding — 3 problems.",
  },
  {
    id: "dp",
    name: "Dynamic Programming",
    track: "dsa",
    mastery: 31,
    state: "at-risk",
    practiceScore: 44,
    interviewScore: 12,
    ptg: 9,
    trend: -2,
    prerequisites: ["recursion"],
    x: 34,
    y: 68,
    rootCause: "State definition skipped; jumps straight to tabulation from memory.",
    nextAction: "Blue Team concept session on state design before more problems.",
    attempts: [{ date: "Aug 13", problem: "Coin Change II", verdict: "failed", time: "50m" }],
  },
  {
    id: "trees",
    name: "Trees",
    track: "dsa",
    mastery: 66,
    state: "developing",
    practiceScore: 74,
    interviewScore: 47,
    ptg: 35,
    trend: 4,
    prerequisites: ["recursion"],
    x: 56,
    y: 30,
    nextAction: "Traversal variants without recursion.",
  },
  {
    id: "bst",
    name: "BST",
    track: "dsa",
    mastery: 54,
    state: "weak",
    practiceScore: 62,
    interviewScore: 30,
    ptg: 22,
    trend: 0,
    prerequisites: ["trees"],
    x: 56,
    y: 54,
    rootCause: "Invariant reasoning breaks on deletion cases.",
    nextAction: "Derive delete cases on paper, then implement.",
  },
  {
    id: "graphs",
    name: "Graphs",
    track: "dsa",
    mastery: 22,
    state: "locked",
    practiceScore: 25,
    interviewScore: 8,
    ptg: 6,
    trend: 0,
    prerequisites: ["trees"],
    x: 78,
    y: 30,
    nextAction: "Unlocks when Trees mastery ≥ 75.",
  },
  {
    id: "os",
    name: "Operating Systems",
    track: "core",
    mastery: 58,
    state: "developing",
    practiceScore: 64,
    interviewScore: 41,
    ptg: 30,
    trend: 2,
    prerequisites: [],
    x: 78,
    y: 60,
    nextAction: "Deadlock + scheduling verbal drill.",
  },
  {
    id: "system",
    name: "System Design",
    track: "system",
    mastery: 37,
    state: "weak",
    practiceScore: 42,
    interviewScore: 26,
    ptg: 19,
    trend: 1,
    prerequisites: ["os"],
    x: 78,
    y: 82,
    rootCause: "Requirement clarification skipped; jumps to components.",
    nextAction: "Red Team ambiguity drill — 1 round.",
  },
  {
    id: "project",
    name: "Project Depth",
    track: "behavioral",
    mastery: 49,
    state: "weak",
    practiceScore: 70,
    interviewScore: 28,
    ptg: 17,
    trend: -3,
    prerequisites: [],
    x: 56,
    y: 82,
    rootCause: "Cannot justify design decisions retrospectively.",
    nextAction: "Record a 3-minute architecture walkthrough.",
  },
];

export const roadmap: RoadmapDay[] = [
  {
    day: 12,
    date: "Aug 17",
    label: "Yesterday",
    focus: "Hashing consolidation",
    status: "complete",
    tasks: [
      { id: "d12a", title: "Group Anagrams", skill: "Hashing", difficulty: "medium", minutes: 25, reason: "Pattern reinforcement", status: "done", kind: "practice" },
      { id: "d12b", title: "Hash design trade-offs write-up", skill: "Hashing", difficulty: "easy", minutes: 15, reason: "Transfer gap in mock #4", status: "done", kind: "concept" },
    ],
  },
  {
    day: 13,
    date: "Aug 18",
    label: "Today",
    focus: "Sliding window recovery",
    status: "today",
    moved: {
      from: "Day 16",
      why: "Mock interview #4 showed a 34-point transfer gap on window problems. Two DP tasks were pushed back so the prerequisite pattern is repaired first.",
    },
    tasks: todayTasks,
  },
  {
    day: 14,
    date: "Aug 19",
    label: "Tomorrow",
    focus: "Two pointers vs window separation",
    status: "upcoming",
    tasks: [
      { id: "d14a", title: "Mixed pattern set (6 problems)", skill: "Two Pointers", difficulty: "medium", minutes: 70, reason: "Disambiguate confused patterns", status: "todo", kind: "practice" },
      { id: "d14b", title: "Think-aloud drill", skill: "Communication", difficulty: "easy", minutes: 15, reason: "Interview score lags practice by 34", status: "todo", kind: "interview" },
    ],
  },
  {
    day: 15,
    date: "Aug 20",
    label: "Day 15",
    focus: "DP state design (Blue Team)",
    status: "upcoming",
    moved: { from: "Day 13", why: "Deferred: prerequisite recursion recall was below threshold on Day 12." },
    tasks: [
      { id: "d15a", title: "State definition workshop", skill: "Dynamic Programming", difficulty: "hard", minutes: 60, reason: "Root cause: state skipped", status: "todo", kind: "concept" },
      { id: "d15b", title: "Climbing stairs → Coin change ladder", skill: "Dynamic Programming", difficulty: "medium", minutes: 45, reason: "Graduated difficulty", status: "todo", kind: "practice" },
    ],
  },
  {
    day: 16,
    date: "Aug 21",
    label: "Day 16",
    focus: "Mock interview #5",
    status: "upcoming",
    tasks: [
      { id: "d16a", title: "Full 5-stage mock interview", skill: "Interview", difficulty: "hard", minutes: 75, reason: "Replanning boundary — measures transfer", status: "todo", kind: "interview" },
    ],
  },
];

export const interviewReport = {
  role: "SDE-1 · Product",
  date: "16 Aug 2026",
  duration: "68 min",
  verdict: "Borderline — hire with reservations",
  dimensions: [
    { label: "Technical", value: 54 },
    { label: "Problem Solving", value: 61 },
    { label: "Communication", value: 38 },
    { label: "Project Depth", value: 33 },
    { label: "CS Fundamentals", value: 57 },
    { label: "Interview Confidence", value: 41 },
  ],
  transferGaps: [
    { topic: "Sliding Window", practice: 58, interview: 24 },
    { topic: "Dynamic Programming", practice: 44, interview: 12 },
    { topic: "Project Depth", practice: 70, interview: 28 },
    { topic: "Hashing", practice: 80, interview: 51 },
    { topic: "Trees", practice: 74, interview: 47 },
  ],
  moments: [
    { time: "08:14", round: "Behavioral", note: "Answer lacked a measurable outcome; STAR structure collapsed at Result." },
    { time: "24:02", round: "CS Fundamentals", note: "Correct definition of deadlock, could not apply it to the given scenario." },
    { time: "41:35", round: "DSA", note: "Working code at 19 min, but invariant was never stated aloud." },
    { time: "56:10", round: "Project", note: "Could not justify choosing Redis over an in-process cache." },
  ],
};

export const companies: CompanyPrep[] = [
  { id: "amazon", name: "Amazon", tier: "Tier 1", role: "SDE-1", readiness: 58, unlocked: true, freeQuestions: 2, totalQuestions: 148, dimensions: [ { label: "DSA", value: 66 }, { label: "CS Core", value: 55 }, { label: "Interview", value: 44 }, { label: "System Design", value: 31 }, { label: "Behavioral", value: 72 }, { label: "Resume", value: 61 } ] },
  { id: "google", name: "Google", tier: "Tier 1", role: "SWE-II", readiness: 41, unlocked: false, freeQuestions: 2, totalQuestions: 210, dimensions: [ { label: "DSA", value: 52 }, { label: "CS Core", value: 48 }, { label: "Interview", value: 33 }, { label: "System Design", value: 22 }, { label: "Behavioral", value: 55 }, { label: "Resume", value: 58 } ] },
  { id: "microsoft", name: "Microsoft", tier: "Tier 1", role: "SDE", readiness: 63, unlocked: false, freeQuestions: 2, totalQuestions: 132, dimensions: [ { label: "DSA", value: 69 }, { label: "CS Core", value: 64 }, { label: "Interview", value: 50 }, { label: "System Design", value: 38 }, { label: "Behavioral", value: 74 }, { label: "Resume", value: 66 } ] },
  { id: "meta", name: "Meta", tier: "Tier 1", role: "E3", readiness: 36, unlocked: false, freeQuestions: 2, totalQuestions: 176, dimensions: [ { label: "DSA", value: 47 }, { label: "CS Core", value: 41 }, { label: "Interview", value: 28 }, { label: "System Design", value: 19 }, { label: "Behavioral", value: 52 }, { label: "Resume", value: 54 } ] },
  { id: "adobe", name: "Adobe", tier: "Tier 2", role: "MTS-1", readiness: 55, unlocked: false, freeQuestions: 2, totalQuestions: 98, dimensions: [ { label: "DSA", value: 61 }, { label: "CS Core", value: 58 }, { label: "Interview", value: 42 }, { label: "System Design", value: 30 }, { label: "Behavioral", value: 68 }, { label: "Resume", value: 63 } ] },
  { id: "atlassian", name: "Atlassian", tier: "Tier 2", role: "SWE", readiness: 49, unlocked: false, freeQuestions: 2, totalQuestions: 87, dimensions: [ { label: "DSA", value: 57 }, { label: "CS Core", value: 51 }, { label: "Interview", value: 39 }, { label: "System Design", value: 34 }, { label: "Behavioral", value: 60 }, { label: "Resume", value: 59 } ] },
];

export const resources: ResourceTopic[] = [
  {
    topic: "Sliding Window",
    track: "DSA",
    why: "Half of array-string interview questions reduce to a window with a maintained invariant. Your interview score here is 34 points below practice.",
    items: [
      { type: "article", title: "Sliding Window Technique", source: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/window-sliding-technique/" },
      { type: "practice", title: "Sliding Window & Two Pointer study plan", source: "LeetCode", url: "https://leetcode.com/tag/sliding-window/" },
      { type: "docs", title: "CP-Algorithms: Two pointers method", source: "cp-algorithms", url: "https://cp-algorithms.com/others/tortoise_and_hare.html" },
    ],
  },
  {
    topic: "Dynamic Programming",
    track: "DSA",
    why: "Your failures cluster at state definition, not implementation. Fix the modelling step before adding volume.",
    items: [
      { type: "video", title: "Dynamic Programming — MIT 6.006 lectures", source: "MIT OpenCourseWare", url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/" },
      { type: "article", title: "DP for Beginners", source: "LeetCode Discuss", url: "https://leetcode.com/discuss/general-discussion/662866/dp-for-beginners-problems-patterns-sample-solutions" },
      { type: "practice", title: "Dynamic Programming problem tag", source: "LeetCode", url: "https://leetcode.com/tag/dynamic-programming/" },
    ],
  },
  {
    topic: "Operating Systems",
    track: "CS Core",
    why: "Interviewers probe scheduling and concurrency to test whether your definitions survive an applied scenario.",
    items: [
      { type: "docs", title: "Operating Systems: Three Easy Pieces", source: "OSTEP (free book)", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/" },
      { type: "video", title: "Operating System course", source: "NPTEL", url: "https://nptel.ac.in/courses/106106144" },
    ],
  },
  {
    topic: "System Design",
    track: "System Design",
    why: "You skip requirement clarification. Structure matters more than component vocabulary at entry level.",
    items: [
      { type: "article", title: "The System Design Primer", source: "GitHub", url: "https://github.com/donnemartin/system-design-primer" },
      { type: "docs", title: "AWS Architecture Center", source: "Amazon Web Services", url: "https://aws.amazon.com/architecture/" },
    ],
  },
  {
    topic: "Behavioral & Project Depth",
    track: "Behavioral",
    why: "Your project score drops 42 points between written resume and spoken defence.",
    items: [
      { type: "article", title: "STAR method for behavioural interviews", source: "MIT Career Advising", url: "https://capd.mit.edu/resources/the-star-method-for-behavioral-interviews/" },
      { type: "docs", title: "Google interview preparation guide", source: "Google Careers", url: "https://www.google.com/about/careers/applications/how-we-hire/" },
    ],
  },
];

export const resumeFindings = [
  {
    id: "r1",
    severity: "high" as const,
    line: "Worked on backend APIs for the college fest portal.",
    issue: "No scale, no ownership, no measurable outcome.",
    rewrite: "Built 9 REST endpoints for a fest portal serving 4,200 registrations, cutting checkout latency from 1.8s to 420ms with Redis-backed caching.",
    tag: "Weak bullet",
  },
  {
    id: "r2",
    severity: "high" as const,
    line: "Familiar with DSA, OOPS, DBMS, OS, CN.",
    issue: "Keyword dumping without evidence. Interviewers discount unqualified claims.",
    rewrite: "Remove. Move proof into project bullets (e.g. 'designed a normalised 11-table Postgres schema').",
    tag: "Skill gap",
  },
  {
    id: "r3",
    severity: "medium" as const,
    line: "Improved app performance significantly.",
    issue: "Missing metric — 'significantly' is unverifiable.",
    rewrite: "Reduced Android cold-start from 2.4s to 0.9s by deferring 6 non-critical initialisers.",
    tag: "Missing metric",
  },
  {
    id: "r4",
    severity: "low" as const,
    line: "Team lead of 4 members.",
    issue: "Leadership without a decision narrative.",
    rewrite: "Led a 4-person team; owned API contract design and unblocked a 3-day integration stall by splitting the schema migration.",
    tag: "Weak wording",
  },
];

export const problem = {
  id: "lc-3",
  title: "Longest Substring Without Repeating Characters",
  difficulty: "Medium" as const,
  skill: "Sliding Window",
  statement:
    "Given a string s, find the length of the longest substring without duplicate characters.",
  examples: [
    { input: 's = "abcabcbb"', output: "3", note: 'The answer is "abc", with length 3.' },
    { input: 's = "bbbbb"', output: "1", note: 'The answer is "b", with length 1.' },
  ],
  constraints: ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces"],
  hints: [
    "What must remain true about the characters inside your window at every step?",
    "When the invariant breaks, which pointer should move — and how far?",
    "A map from character to last index lets you jump the left pointer instead of stepping it.",
  ],
  starter: `function lengthOfLongestSubstring(s) {
  // invariant: window [left, right] contains no duplicates
  let left = 0, best = 0;
  const lastSeen = new Map();

  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if (lastSeen.has(c) && lastSeen.get(c) >= left) {
      left = lastSeen.get(c) + 1;
    }
    lastSeen.set(c, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,
  tests: [
    { name: 'abcabcbb', expected: "3", got: "3", pass: true, ms: 0.4 },
    { name: 'bbbbb', expected: "1", got: "1", pass: true, ms: 0.2 },
    { name: 'pwwkew', expected: "3", got: "3", pass: true, ms: 0.3 },
    { name: '" " (space)', expected: "1", got: "1", pass: true, ms: 0.1 },
    { name: 'dvdf', expected: "3", got: "2", pass: false, ms: 0.3 },
  ],
};

export const interviewTranscript = [
  { role: "interviewer" as const, text: "Let's start with the DSA round. You're given a string; return the length of the longest substring without repeating characters. Talk me through your approach before writing code.", time: "12:04" },
  { role: "candidate" as const, text: "I'd use a sliding window with a hash map of last-seen indices.", time: "12:05" },
  { role: "interviewer" as const, text: "What exactly stays true about the window at every step?", time: "12:05" },
  { role: "candidate" as const, text: "That there are no duplicates inside it.", time: "12:06" },
  { role: "interviewer" as const, text: "Good. Now — when you see a repeat, why is moving left to lastSeen + 1 safe, and why not left + 1?", time: "12:06" },
];
