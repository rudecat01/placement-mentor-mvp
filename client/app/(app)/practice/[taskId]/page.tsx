"use client";

import React, { useState, useEffect } from "react";
import { Lightbulb, ChevronDown, ChevronLeft, ChevronRight, Bookmark, ArrowLeft } from "lucide-react";
import Editor from "@monaco-editor/react";
import { useRouter } from "next/navigation";
import { useProblem } from "../../../../hooks/queries/useProblem";
import { useRoadmap } from "../../../../hooks/queries/useRoadmap";
import { useExecuteCode } from "../../../../hooks/mutations/useExecuteCode";
import { ExecutionConsole } from "../../../../components/workspace/ExecutionConsole";

export default function PracticeWorkspace({ params }: { params: { taskId: string } | Promise<{ taskId: string }> }) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{ taskId: string } | null>(null);

  useEffect(() => {
    if (params instanceof Promise) {
      params.then(setResolvedParams);
    } else {
      setResolvedParams(params);
    }
  }, [params]);

  const taskId = resolvedParams?.taskId || "";

  const { data: roadmap } = useRoadmap();
  const task = roadmap?.find((d) => d.tasks.some(t => t.id === taskId))?.tasks.find(t => t.id === taskId);
  const problemId = task?.topicId || (taskId === "default" ? "PM001" : taskId);

  const { data: problem, isLoading } = useProblem(problemId);
  const executeCodeMutation = useExecuteCode();

  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [hintsViewed, setHintsViewed] = useState(new Set<number>());
  const [executionResults, setExecutionResults] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [executingType, setExecutingType] = useState<'run' | 'submit' | null>(null);

  // Stopwatch
  useEffect(() => {
    let interval: any;
    if (isTimerRunning && problem) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, problem]);

  // Load starter code when problem loads or language changes
  useEffect(() => {
    if (problem && problem.starter_code && problem.starter_code[language]) {
      setCode(problem.starter_code[language]);
    }
  }, [problem, language]);

  const handleReset = () => {
    if (problem && problem.starter_code && problem.starter_code[language]) {
      setCode(problem.starter_code[language]);
      setExecutionResults([]);
    }
  };

  const handleRun = async () => {
    if (!problem) return;
    setExecutingType('run');
    try {
      const results = await executeCodeMutation.mutateAsync({
        problem_id: problem.problem_id,
        language: language,
        code: code,
        test_cases: problem.test_cases
      });
      setExecutionResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setExecutingType(null);
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;
    setExecutingType('submit');
    try {
      const results = await executeCodeMutation.mutateAsync({
        problem_id: problem.problem_id,
        language: language,
        code: code,
        test_cases: problem.hidden_cases
      });
      setExecutionResults(results);

      // Check if all passed
      if (results.every((r: any) => r.passed)) {
        setIsTimerRunning(false);
        alert(`Success! Time: ${Math.floor(elapsedTime / 60)}:${(elapsedTime % 60).toString().padStart(2, '0')}, Hints: ${hintsViewed.size}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setExecutingType(null);
    }
  };

  if (!resolvedParams || isLoading || (taskId && !roadmap)) {
    return <div className="flex-1 flex items-center justify-center bg-bg-page pt-16">Loading...</div>;
  }

  if (!problem) {
    return <div className="flex-1 flex items-center justify-center bg-bg-page pt-16">Problem not found for taskId: {taskId} (topicId: {problemId})</div>;
  }

  const diffLabel = (problem.difficulty?.label || task?.difficulty || "Medium").toLowerCase();
  const diffColor = diffLabel === "easy" ? "bg-green-100 text-green-700" : diffLabel === "medium" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700";

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      <main className="flex-1 w-full h-full flex bg-bg-page pt-16">
        {/* Left Panel: Problem Statement */}
        <section className={`h-full flex flex-col bg-surface border-r border-border-subtle transition-all duration-300 ${isSidebarOpen ? 'w-1/3 min-w-[300px]' : 'w-12 min-w-[48px]'}`}>
          {isSidebarOpen ? (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Problem Header */}
              <div className="p-4 border-b border-border-subtle bg-[#F1F5F9] sticky top-0 z-10 flex justify-between items-start shrink-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-sm bg-surface-container-highest text-secondary font-label-sm text-[12px]">{problem.topic?.primary || task?.track}</span>
                    <span className={`px-2 py-0.5 rounded-sm font-label-sm text-[12px] capitalize ${diffColor}`}>
                      {diffLabel}
                    </span>
                  </div>
                  <h2 className="font-headline-sm text-[20px] text-on-surface font-semibold flex items-center gap-2">
                    {problem.title || task?.title}
                  </h2>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => setIsSidebarOpen(false)} className="text-secondary hover:bg-surface-hover p-1 rounded transition-colors" title="Collapse Sidebar">
                    <ChevronLeft size={20} />
                  </button>
                  <div className="text-sm font-mono text-secondary font-bold bg-surface-container-low px-2 py-1 rounded">
                    {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              </div>

              {/* Problem Content */}
              <div className="p-4 space-y-6 font-body-md text-[16px] text-on-surface flex-1 overflow-y-auto whitespace-pre-wrap">
                {problem.statement?.context && <p>{problem.statement.context}</p>}
                {problem.statement?.problem && <p>{problem.statement.problem}</p>}
                

                {problem.statement?.constraints && (
                   <div>
                     <h3 className="font-bold text-on-surface mb-2 font-label-md text-[14px]">Constraints:</h3>
                     <p className="text-secondary font-code-block text-[14px]">{problem.statement.constraints}</p>
                   </div>
                )}
                
                {problem.examples && problem.examples.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h3 className="font-bold text-on-surface font-label-md text-[14px]">Examples:</h3>
                    {problem.examples.map((ex: any, i: number) => (
                      <div key={i} className="bg-surface-container-low p-4 rounded-lg border border-border-subtle">
                        <div className="font-bold text-sm mb-2 text-on-surface">Example {i + 1}</div>
                        <div className="font-code-block text-[14px] space-y-1">
                          {ex.input && <p><span className="text-secondary font-bold">Input:</span> {ex.input}</p>}
                          {ex.output && <p><span className="text-secondary font-bold">Output:</span> {ex.output}</p>}
                          {ex.explanation && <p className="mt-2 text-secondary"><span className="font-bold text-on-surface">Explanation:</span> {ex.explanation}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Progressive Hints */}
              {problem.hints && Object.values(problem.hints).length > 0 && (
                <div className="p-4 border-t border-border-subtle bg-surface shrink-0">
                  <h3 className="font-label-md text-[14px] text-secondary mb-3 flex items-center gap-2">
                    <Lightbulb className="w-[18px] h-[18px]" />
                    Hints ({hintsViewed.size} viewed)
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {Object.values(problem.hints).map((hint: any, idx: number) => (
                      <details 
                        key={idx}
                        className="group bg-surface-container-low border border-border-subtle rounded-lg"
                        onToggle={(e) => {
                          if (e.currentTarget.open) {
                            setHintsViewed(prev => {
                              const next = new Set(prev);
                              next.add(idx);
                              return next;
                            });
                          }
                        }}
                      >
                        <summary className="flex justify-between items-center font-body-sm text-[14px] cursor-pointer list-none p-3 hover:bg-surface-container transition-colors">
                          <span>Hint {idx + 1}</span>
                          <ChevronDown className="transition group-open:rotate-180 w-[18px] h-[18px]" />
                        </summary>
                        <div className="p-3 border-t border-border-subtle font-body-sm text-[14px] text-secondary bg-surface-container-lowest">
                          {hint}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col h-full items-center py-4 gap-4 bg-[#F1F5F9]">
              <button onClick={() => setIsSidebarOpen(true)} className="text-secondary hover:bg-surface-hover p-1.5 rounded transition-colors" title="Expand Sidebar">
                <ChevronRight size={20} />
              </button>
              <div className="[writing-mode:vertical-lr] text-sm font-semibold text-text-muted uppercase tracking-widest mt-4">
                {problem.title || task?.title}
              </div>
            </div>
          )}
        </section>

        {/* Right Panel: Code Editor & Execution */}
        <section className="flex-1 h-full flex flex-col bg-[#1E1E1E] overflow-hidden">
          {/* Editor Header */}
          <div className="h-12 border-b border-border-subtle flex items-center justify-between px-4 bg-surface shrink-0">
            <div className="flex items-center gap-4">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-surface-hover border border-border-subtle text-text-main text-sm rounded px-2 py-1 outline-none focus:border-primary"
              >
                <option value="cpp">C++ (GCC 9.2.0)</option>
                <option value="python">Python (3.8.1)</option>
              </select>
              <button
                type="button"
                onClick={handleReset}
                className="text-sm font-medium text-text-muted hover:text-text-main transition-colors"
              >
                Reset Code
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>

          {/* Execution Console Lock Layout */}
          <ExecutionConsole
            isExecutingRun={executeCodeMutation.isPending && executingType === 'run'}
            isExecutingSubmit={executeCodeMutation.isPending && executingType === 'submit'}
            onRun={handleRun}
            onSubmit={handleSubmit}
            results={executionResults}
          />
        </section>
      </main>
    </div>
  );
}
