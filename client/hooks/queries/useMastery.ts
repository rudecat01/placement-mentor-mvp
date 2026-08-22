import { useQuery } from "@tanstack/react-query";
import { TopicMastery } from "../../../shared/types/mastery";
import { api } from "../../lib/api";

const fetchMastery = async (): Promise<TopicMastery[]> => {
  const { data } = await api.get("/api/student/state");
  
  // Convert dict of { topicId: { mastery_score, lifecycle_state } } to array
  const topicStates = data.topic_states || {};
  return Object.keys(topicStates).map((topicId) => ({
    topicId,
    masteryScore: Math.round((topicStates[topicId].mastery_score || 0) * 100),
    lifecycleState: topicStates[topicId].lifecycle_state || "UNKNOWN",
  }));
};

export const useMastery = () => {
  return useQuery({
    queryKey: ["mastery"],
    queryFn: fetchMastery,
    retry: 1,
  });
};
