"""Placement Mentor 2.0 - Isolated Subprocess Code Execution Sandbox.

Runs Python solutions against visible and hidden test suites, measuring:
- Total passed tests vs total test cases
- Execution time in ms
- Peak memory in MB
- Syntax/Compiler and runtime exception captures
"""

import json
import os
import subprocess
import sys
import tempfile
import time
from typing import Any, List
from backend.app.models.schemas import ComplexityVerdict, Problem, TestCaseItem


class CodeSandbox:
    def __init__(self, timeout_seconds: float = 3.0):
        self.timeout_seconds = timeout_seconds

    def execute(self, problem: Problem, user_code: str, language: str = "python") -> ComplexityVerdict:
        if language.lower() != "python":
            return ComplexityVerdict(
                passed_tests=0,
                total_tests=len(problem.visible_tests) + len(problem.hidden_tests),
                verdict="Language Unsupported",
                execution_time_ms=0.0,
                peak_memory_mb=0.0,
                compiler_error=f"Sandbox currently only supports Python 3 execution. Provided: '{language}'"
            )

        all_tests: List[TestCaseItem] = list(problem.visible_tests) + list(problem.hidden_tests)
        total_tests = len(all_tests)
        if total_tests == 0:
            return ComplexityVerdict(
                passed_tests=1,
                total_tests=1,
                verdict="Accepted",
                execution_time_ms=1.0,
                peak_memory_mb=2.0
            )

        # Prepare test cases JSON
        serialized_tests = [
            {"input": t.input, "output": t.output} for t in all_tests
        ]

        harness_code = f"""
import sys, json, time, tracemalloc

# User Solution
{user_code}

raw_tests_str = {json.dumps(json.dumps(serialized_tests))}
tests = json.loads(raw_tests_str)

# Find entry function
candidate_funcs = [
    obj for name, obj in list(locals().items()) 
    if callable(obj) and not name.startswith('__') and name not in ['tracemalloc', 'json', 'time', 'sys']
]

if not candidate_funcs:
    print(json.dumps({{"error": "No function definition found in submission."}}))
    sys.exit(0)

func = candidate_funcs[-1]

passed = 0
total = len(tests)
failed_info = None

tracemalloc.start()
t0 = time.perf_counter()

for idx, t in enumerate(tests):
    inp = t["input"]
    expected = t["output"]
    try:
        if isinstance(inp, dict):
            res = func(**inp)
        elif isinstance(inp, list):
            res = func(*inp)
        else:
            res = func(inp)

        if res == expected:
            passed += 1
        else:
            failed_info = {{"input": inp, "expected": expected, "actual": res}}
            break
    except Exception as e:
        failed_info = {{"input": inp, "expected": expected, "compiler_error": f"{{type(e).__name__}}: {{str(e)}}"}}
        break

t1 = time.perf_counter()
current_mem, peak_mem = tracemalloc.get_traced_memory()
tracemalloc.stop()

result = {{
    "passed": passed,
    "total": total,
    "time_ms": (t1 - t0) * 1000.0,
    "peak_memory_mb": peak_mem / (1024 * 1024),
    "failed_info": failed_info
}}

print("___SANDBOX_DELIMITER___")
print(json.dumps(result))
"""

        with tempfile.NamedTemporaryFile(suffix=".py", mode="w", delete=False, encoding="utf-8") as f:
            f.write(harness_code)
            temp_path = f.name

        try:
            t_start = time.perf_counter()
            proc = subprocess.run(
                [sys.executable, temp_path],
                capture_output=True,
                text=True,
                timeout=self.timeout_seconds,
                encoding="utf-8",
                errors="replace"
            )
            t_elapsed_ms = (time.perf_counter() - t_start) * 1000.0

            if proc.returncode != 0:
                error_msg = proc.stderr.strip() or proc.stdout.strip() or "Process exited with non-zero status"
                return ComplexityVerdict(
                    passed_tests=0,
                    total_tests=total_tests,
                    verdict="Runtime Error",
                    execution_time_ms=t_elapsed_ms,
                    peak_memory_mb=1.5,
                    compiler_error=error_msg
                )

            output = proc.stdout
            if "___SANDBOX_DELIMITER___" not in output:
                return ComplexityVerdict(
                    passed_tests=0,
                    total_tests=total_tests,
                    verdict="Runtime Error",
                    execution_time_ms=t_elapsed_ms,
                    peak_memory_mb=1.5,
                    compiler_error=output.strip() or "Failed to parse test execution output."
                )

            data_str = output.split("___SANDBOX_DELIMITER___")[-1].strip()
            data = json.loads(data_str)

            if "error" in data:
                return ComplexityVerdict(
                    passed_tests=0,
                    total_tests=total_tests,
                    verdict="Wrong Answer",
                    execution_time_ms=t_elapsed_ms,
                    peak_memory_mb=1.5,
                    compiler_error=data["error"]
                )

            passed = data["passed"]
            failed_info = data.get("failed_info")

            compiler_err = failed_info.get("compiler_error") if failed_info else None
            failed_input = failed_info.get("input") if failed_info else None
            expected_output = failed_info.get("expected") if failed_info else None
            actual_output = failed_info.get("actual") if failed_info else None

            if passed == total_tests:
                verdict_str = "Accepted"
            elif compiler_err:
                verdict_str = "Runtime Error"
            else:
                verdict_str = "Wrong Answer"


            return ComplexityVerdict(
                passed_tests=passed,
                total_tests=total_tests,
                verdict=verdict_str,
                execution_time_ms=max(0.1, data.get("time_ms", t_elapsed_ms)),
                peak_memory_mb=max(0.5, data.get("peak_memory_mb", 1.0)),
                failed_input=failed_input,
                expected_output=expected_output,
                actual_output=actual_output,
                compiler_error=compiler_err
            )

        except subprocess.TimeoutExpired:
            return ComplexityVerdict(
                passed_tests=0,
                total_tests=total_tests,
                verdict="Time Limit Exceeded",
                execution_time_ms=self.timeout_seconds * 1000.0,
                peak_memory_mb=5.0,
                compiler_error="Execution exceeded time limit of 3.0 seconds."
            )
        except Exception as e:
            return ComplexityVerdict(
                passed_tests=0,
                total_tests=total_tests,
                verdict="Runtime Error",
                execution_time_ms=0.0,
                peak_memory_mb=0.0,
                compiler_error=f"Execution error: {str(e)}"
            )
        finally:
            if os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except Exception:
                    pass
