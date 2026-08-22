import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function useLoadSummary(userId = "usr_demo123") {
  return useQuery({
    queryKey: ["load-summary", userId],
    queryFn: () =>
      axios
        .get(`${API_BASE}/api/review/load-summary?user_id=${userId}`)
        .then((r) => r.data),
    refetchInterval: 60_000, // auto-refresh every minute
    staleTime: 30_000,
  });
}
