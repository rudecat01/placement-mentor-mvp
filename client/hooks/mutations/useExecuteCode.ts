import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

interface ExecuteCodePayload {
  problem_id: string;
  language: string;
  code: string;
  test_cases: any[];
}

const executeCode = async (payload: ExecuteCodePayload) => {
  const { data } = await axios.post('http://localhost:4000/api/sandbox/execute', payload);
  return data.data;
};

export function useExecuteCode() {
  return useMutation({
    mutationFn: executeCode,
  });
}
