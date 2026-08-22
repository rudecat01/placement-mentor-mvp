import os
import json
import base64
import requests
from typing import Dict, Any, List
from dotenv import load_dotenv

load_dotenv()

JUDGE0_API_URL = os.getenv("JUDGE0_API_URL", "https://judge0-ce.p.rapidapi.com")
JUDGE0_API_HOST = os.getenv("JUDGE0_API_HOST", "judge0-ce.p.rapidapi.com")
JUDGE0_API_KEY = os.getenv("JUDGE0_API_KEY", "")

LANGUAGE_MAP = {
    "cpp": 54,       # GCC 9.2.0
    "python": 71,    # Python 3.8.1
}

class SandboxService:
    def __init__(self):
        self.problem_bank_path = "placement_mentor_problem_bank_200.json"
        self._problems = None

    def _load_problems(self):
        if self._problems is None:
            try:
                with open(self.problem_bank_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self._problems = {p['problem_id']: p for p in data.get('problems', [])}
            except Exception as e:
                print(f"[SandboxService] Failed to load problem bank: {e}")
                self._problems = {}
        return self._problems

    def get_problem_details(self, problem_id: str) -> Dict[str, Any]:
        problems = self._load_problems()
        if problem_id not in problems:
            return None
        
        p = problems[problem_id]
        
        # Test case split: first 3 for test_cases, next 5 for hidden_cases
        all_tests = p.get('test_data', {}).get('visible_tests', [])
        test_cases = all_tests[:3]
        hidden_cases = all_tests[3:8]
        
        return {
            "problem_id": p.get("problem_id"),
            "title": p.get("title"),
            "difficulty": p.get("difficulty"),
            "topic": p.get("topic"),
            "statement": p.get("statement"),
            "starter_code": {lang: code for lang, code in p.get("starter_code", {}).items() if lang in LANGUAGE_MAP},
            "hints": p.get("hints", []),
            "test_cases": test_cases,
            "hidden_cases": hidden_cases,
        }

    def execute_code(self, problem_id: str, language: str, code: str, test_cases: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        problems = self._load_problems()
        if problem_id not in problems:
            raise ValueError("Problem not found")
        
        p = problems[problem_id]
        driver_code = p.get("driver_code", {}).get(language)
        if not driver_code:
            raise ValueError(f"Language {language} not supported for this problem")
        
        lang_id = LANGUAGE_MAP.get(language)
        if not lang_id:
            raise ValueError(f"Language {language} not supported in Judge0 mapping")

        # Inject user code
        full_code = driver_code.replace("{{USER_CODE}}", code)

        # Prepare batch submission
        submissions = []
        for tc in test_cases:
            stdin = tc.get("input", "")
            if isinstance(stdin, dict):
                stdin = "\n".join(str(v) for v in stdin.values())
            elif isinstance(stdin, list):
                stdin = "\n".join(str(v) for v in stdin)

            submissions.append({
                "language_id": lang_id,
                "source_code": base64.b64encode(full_code.encode("utf-8")).decode("utf-8"),
                "stdin": base64.b64encode(str(stdin).encode("utf-8")).decode("utf-8"),
            })

        # Submit to Judge0
        headers = {
            "content-type": "application/json",
            "X-RapidAPI-Key": JUDGE0_API_KEY,
            "X-RapidAPI-Host": JUDGE0_API_HOST
        }
        
        url = f"{JUDGE0_API_URL}/submissions/batch?base64_encoded=true"
        
        response = requests.post(url, json={"submissions": submissions}, headers=headers)
        if response.status_code != 201:
            raise Exception(f"Judge0 submission failed: {response.text}")
        
        tokens = response.json()
        token_str = ",".join([t["token"] for t in tokens])
        
        # Poll for results
        import time
        results = []
        max_retries = 15
        for _ in range(max_retries):
            time.sleep(1)
            res = requests.get(f"{url}&tokens={token_str}", headers=headers)
            if res.status_code == 200:
                res_data = res.json().get("submissions", [])
                # Check if all finished
                if all(sub.get("status", {}).get("id", 1) > 2 for sub in res_data):
                    for idx, sub in enumerate(res_data):
                        stdout = base64.b64decode(sub.get("stdout") or "").decode("utf-8").strip() if sub.get("stdout") else ""
                        stderr = base64.b64decode(sub.get("stderr") or "").decode("utf-8").strip() if sub.get("stderr") else ""
                        compile_output = base64.b64decode(sub.get("compile_output") or "").decode("utf-8").strip() if sub.get("compile_output") else ""
                        error = base64.b64decode(sub.get("message") or "").decode("utf-8").strip() if sub.get("message") else ""
                        
                        expected_out = str(test_cases[idx].get("output", "")).strip()
                        passed = stdout == expected_out and sub.get("status", {}).get("id") == 3

                        results.append({
                            "id": test_cases[idx].get("id", idx+1),
                            "status": "Accepted" if passed else sub.get("status", {}).get("description", "Error"),
                            "stdout": stdout,
                            "stderr": stderr,
                            "compile_output": compile_output,
                            "error": error,
                            "passed": passed,
                            "expected_output": expected_out,
                            "time": sub.get("time"),
                            "memory": sub.get("memory")
                        })
                    return results
            else:
                raise Exception(f"Judge0 polling failed: {res.text}")
        
        raise Exception("Execution timeout")

sandbox_service = SandboxService()
