import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchProblem = async (problemId: string) => {
  const { data } = await axios.get(`http://localhost:4000/api/sandbox/problem/${problemId}`);
  return data.data;
};

export function useProblem(problemId: string) {
  return useQuery({
    queryKey: ['problem', problemId],
    queryFn: () => fetchProblem(problemId),
    enabled: !!problemId,
  });
}
