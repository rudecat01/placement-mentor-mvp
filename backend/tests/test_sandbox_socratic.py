"""Placement Mentor 2.0 - Sandbox & Socratic Agent Tests."""

import pytest
from backend.app.core.sandbox import CodeSandbox
from backend.app.core.socratic_agent import SocraticAgent
from backend.app.models.schemas import ComplexityVerdict, Problem, TestCaseItem


@pytest.fixture
def product_window_problem():
    return Problem(
        id="arr_023",
        title="Product Window",
        topic="Sliding Window",
        difficulty=2,
        estimated_minutes=30,
        statement="Find maximum product window of size k.",
        visible_tests=[
            TestCaseItem(input={"nums": [1, 2, 3, 4], "k": 2}, output=12),
            TestCaseItem(input={"nums": [2, 5, 1, 8, 2, 9, 1], "k": 3}, output=144)
        ],
        hidden_tests=[
            TestCaseItem(input={"nums": [-2, -3, 4, -1, -2], "k": 2}, output=6)
        ],
        hints={
            "1": "Tier 1: Think of sliding window.",
            "2": "Tier 2: Maintain rolling products.",
            "3": "Tier 3: Handle zeros and negatives."
        }
    )


def test_sandbox_accepted_solution(product_window_problem):
    sandbox = CodeSandbox()
    correct_code = """
def productWindow(nums, k):
    max_prod = float('-inf')
    for i in range(len(nums) - k + 1):
        curr = 1
        for j in range(i, i + k):
            curr *= nums[j]
        if curr > max_prod:
            max_prod = curr
    return max_prod
"""
    verdict = sandbox.execute(product_window_problem, correct_code, "python")
    assert verdict.verdict == "Accepted"
    assert verdict.passed_tests == 3
    assert verdict.total_tests == 3
    assert verdict.execution_time_ms > 0.0


def test_sandbox_wrong_answer(product_window_problem):
    sandbox = CodeSandbox()
    buggy_code = """
def productWindow(nums, k):
    return 0  # Always wrong
"""
    verdict = sandbox.execute(product_window_problem, buggy_code, "python")
    assert verdict.verdict == "Wrong Answer"
    assert verdict.passed_tests == 0
    assert verdict.failed_input is not None


def test_sandbox_runtime_error(product_window_problem):
    sandbox = CodeSandbox()
    error_code = """
def productWindow(nums, k):
    return nums[100]  # IndexError
"""
    verdict = sandbox.execute(product_window_problem, error_code, "python")
    assert verdict.verdict == "Runtime Error"
    assert "IndexError" in verdict.compiler_error


def test_socratic_tiered_hints(product_window_problem):
    agent = SocraticAgent()
    h1 = agent.get_tiered_hint(product_window_problem, 1)
    assert h1.hint_tier == 1
    assert "sliding window" in h1.hint_content.lower()

    h3 = agent.get_tiered_hint(product_window_problem, 3)
    assert h3.hint_tier == 3
    assert "zeros" in h3.hint_content.lower()


def test_socratic_debugger_guidance(product_window_problem):
    agent = SocraticAgent()
    dbg = agent.generate_socratic_debug_guidance(
        problem=product_window_problem,
        user_code="...",
        compiler_error="IndexError: list index out of range"
    )
    assert "boundary" in dbg.socratic_question.lower() or "pointer" in dbg.socratic_question.lower()
    assert dbg.suggested_micro_test is not None
