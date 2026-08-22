import { useQuery } from "@tanstack/react-query";
import { SkillGraphDAG, SkillNode, SkillEdge } from "../../../shared/types/skill-graph";
import { api } from "../../lib/api";

const DEFAULT_DAG_EDGES: Record<string, SkillEdge[]> = {
  SDE: [
    { id: "e1", source: "Arrays & Hashing", target: "Two Pointers" },
    { id: "e2", source: "Arrays & Hashing", target: "Stack" },
    { id: "e3", source: "Two Pointers", target: "Binary Search" },
    { id: "e4", source: "Two Pointers", target: "Sliding Window" },
    { id: "e5", source: "Two Pointers", target: "Linked List" },
    { id: "e6", source: "Binary Search", target: "Trees" },
    { id: "e7", source: "Sliding Window", target: "Trees" },
    { id: "e8", source: "Linked List", target: "Trees" },
    { id: "e9", source: "Trees", target: "Tries" },
    { id: "e10", source: "Trees", target: "Heap / Priority Queue" },
    { id: "e11", source: "Trees", target: "Backtracking" },
    { id: "e12", source: "Heap / Priority Queue", target: "Intervals" },
    { id: "e13", source: "Heap / Priority Queue", target: "Greedy" },
    { id: "e14", source: "Heap / Priority Queue", target: "Advanced Graphs" },
    { id: "e15", source: "Backtracking", target: "Graphs" },
    { id: "e16", source: "Backtracking", target: "1-D Dynamic Programming" },
    { id: "e17", source: "Graphs", target: "Advanced Graphs" },
    { id: "e18", source: "Graphs", target: "2-D Dynamic Programming" },
    { id: "e19", source: "Graphs", target: "Math & Geometry" },
    { id: "e20", source: "1-D Dynamic Programming", target: "2-D Dynamic Programming" },
    { id: "e21", source: "1-D Dynamic Programming", target: "Bit Manipulation" },
    { id: "e22", source: "Bit Manipulation", target: "Math & Geometry" }
  ],
  WEB_DEVELOPMENT: [
    { id: "we1", source: "html_css", target: "javascript_core" },
    { id: "we2", source: "javascript_core", target: "typescript" },
    { id: "we3", source: "typescript", target: "react_ecosystem" },
    { id: "we4", source: "react_ecosystem", target: "nextjs_ssr" },
    { id: "we5", source: "backend_apis", target: "databases" },
    { id: "we6", source: "databases", target: "auth_security" },
    { id: "we7", source: "auth_security", target: "ci_cd_deployment" },
  ],
  MACHINE_LEARNING: [
    { id: "mle1", source: "python_scientific", target: "math_linear_algebra" },
    { id: "mle2", source: "math_linear_algebra", target: "classical_ml" },
    { id: "mle3", source: "classical_ml", target: "deep_learning" },
    { id: "mle4", source: "deep_learning", target: "pytorch_framework" },
    { id: "mle5", source: "pytorch_framework", target: "nlp_transformers" },
    { id: "mle6", source: "deep_learning", target: "cv_fundamentals" },
    { id: "mle7", source: "pytorch_framework", target: "mlops_pipeline" },
  ]
};

const TOPIC_INSIGHTS: Record<string, string> = {
  "Arrays & Hashing": "Solid foundational implementation, watch out for boundary conditions.",
  "Two Pointers": "Good intuitive pattern recognition. Frequently probed in FAANG.",
  "Stack": "Proficient with standard monotonic stack patterns.",
  "Binary Search": "Ensure you correctly manage off-by-one errors.",
  "Sliding Window": "Great for substring and subarray problems.",
  "Linked List": "Clean pointer reversal logic. Watch for null-pointer dereferencing.",
  "Trees": "Strong recursive traversal basics. Focus on iterative approaches.",
  "Tries": "Essential for autocomplete and prefix matching.",
  "Heap / Priority Queue": "Critical for top-K elements problems.",
  "Backtracking": "Work on generating permutations and combinations efficiently.",
  "Graphs": "Needs structured practice with cycle detection and shortest path.",
  "1-D Dynamic Programming": "High transfer gap area. Work on verbalizing state recurrence relations.",
  "Intervals": "Always sort by start time first.",
  "Greedy": "Intuitive but requires formal proofs during interviews.",
  "Advanced Graphs": "Focus on Kruskal's, Prim's, and Dijkstra's algorithm.",
  "2-D Dynamic Programming": "Master the grid layout and state transitions.",
  "Bit Manipulation": "Review XOR operations and bitmasking.",
  "Math & Geometry": "Good understanding of modulo arithmetic and basic geometry."
};

interface BackendTopicState {
  topic_name?: string;
  mastery?: number;
  practice_score?: number;
  interview_score?: number | null;
  ptg?: number | null;
}

const fetchSkillGraph = async (): Promise<SkillGraphDAG> => {
  let role = "SDE";
  let topicStates: Record<string, BackendTopicState> = {};

  try {
    const { data } = await api.get("/api/student/state");
    if (data) {
      role = data.profile?.target_role || role;
      topicStates = data.topic_states || {};
    }
  } catch {
    // fallback
  }

  const roleKey = role.toLowerCase().includes("web") 
    ? "WEB_DEVELOPMENT" 
    : role.toLowerCase().includes("machine") || role.toLowerCase().includes("ml") 
    ? "MACHINE_LEARNING" 
    : "SDE";

  const edges = DEFAULT_DAG_EDGES[roleKey] || DEFAULT_DAG_EDGES["SDE"];

  // Build nodes dynamically from actual topic_states
  const nodes: SkillNode[] = Object.entries(topicStates).map(([topicId, state]: [string, BackendTopicState]) => {
    const masteryVal = typeof state.mastery === "number" ? state.mastery : 0.45;
    const practiceScore = typeof state.practice_score === "number" ? state.practice_score : Math.min(0.95, masteryVal + 0.08);
    const hasInterview = typeof state.interview_score === "number" && state.interview_score !== null;
    const interviewScore = hasInterview ? (state.interview_score as number) : 0;
    const ptgVal = hasInterview && typeof state.ptg === "number" 
      ? state.ptg 
      : (hasInterview ? Math.max(0, Math.round((practiceScore - interviewScore) * 100) / 100) : 0);

    const prereqs = edges
      .filter((e) => e.target === topicId)
      .map((e) => e.source);

    return {
      id: topicId,
      label: state.topic_name || topicId.replace(/_/g, " ").toUpperCase(),
      currentMastery: masteryVal,
      practiceScore: practiceScore,
      interviewScore: interviewScore,
      ptg: ptgVal,
      prerequisites: prereqs,
      track: roleKey,
      redTeamInsight: TOPIC_INSIGHTS[topicId] || `Targeted interview drill recommended for ${state.topic_name || topicId}.`
    };
  });

  return {
    nodes,
    edges,
  };
};

export const useSkillGraph = () => {
  return useQuery({
    queryKey: ["skillGraph"],
    queryFn: fetchSkillGraph,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};
