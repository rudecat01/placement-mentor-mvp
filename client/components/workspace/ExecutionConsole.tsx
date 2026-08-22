import React, { useState } from 'react';
import { Loader2, Play, UploadCloud, CheckCircle, XCircle } from 'lucide-react';

interface ExecutionConsoleProps {
  isExecutingRun: boolean;
  isExecutingSubmit: boolean;
  onRun: () => void;
  onSubmit: () => void;
  results: any[];
}

export function ExecutionConsole({ isExecutingRun, isExecutingSubmit, onRun, onSubmit, results }: ExecutionConsoleProps) {
  const [activeTab, setActiveTab] = useState<'results' | 'custom'>('results');
  const [activeTestIdx, setActiveTestIdx] = useState(0);

  const isExecuting = isExecutingRun || isExecutingSubmit;

  return (
    <div className="h-[300px] shrink-0 flex flex-col bg-surface border-t border-border-subtle z-20">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle">
        <div className="flex gap-4">
          <button 
            className={`text-sm font-medium pb-2 ${activeTab === 'results' ? 'text-primary border-b-2 border-primary' : 'text-text-muted hover:text-text-main'}`}
            onClick={() => setActiveTab('results')}
          >
            Test Results
          </button>
          <button 
            className={`text-sm font-medium pb-2 ${activeTab === 'custom' ? 'text-primary border-b-2 border-primary' : 'text-text-muted hover:text-text-main'}`}
            onClick={() => setActiveTab('custom')}
          >
            Custom Cases
          </button>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onRun}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-surface-hover hover:bg-surface-active text-text-main rounded-md border border-border-subtle disabled:opacity-50 transition-colors"
          >
            {isExecutingRun ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            Run
          </button>
          <button 
            onClick={onSubmit}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-50 transition-colors"
          >
            {isExecutingSubmit ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
            Submit
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 relative">
        {isExecuting && (
          <div className="absolute inset-0 z-10 bg-surface/50 backdrop-blur-[2px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-primary" size={32} />
              <span className="text-sm font-medium text-text-muted">Executing code on Judge0 Sandbox...</span>
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="flex flex-col h-full gap-4">
            {results && results.length > 0 ? (
              <div className="flex flex-col gap-4 h-full">
                <div className="flex gap-2 flex-wrap">
                  {results.map((res, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTestIdx(idx)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${
                        activeTestIdx === idx 
                          ? 'bg-surface-active border border-border-strong' 
                          : 'bg-surface border border-border-subtle hover:bg-surface-hover'
                      }`}
                    >
                      {res.passed ? (
                        <CheckCircle size={14} className="text-green-500" />
                      ) : (
                        <XCircle size={14} className="text-red-500" />
                      )}
                      Case {idx + 1}
                    </button>
                  ))}
                </div>

                {results[activeTestIdx] && (
                  <div className="flex-1 overflow-y-auto p-4 bg-surface-hover rounded-md border border-border-subtle space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-text-muted uppercase mb-1">Status</h4>
                      <div className={`font-mono text-sm ${results[activeTestIdx].passed ? 'text-green-400' : 'text-red-400'}`}>
                        {results[activeTestIdx].status}
                      </div>
                    </div>
                    {results[activeTestIdx].error && (
                      <div>
                        <h4 className="text-xs font-semibold text-red-400 uppercase mb-1">Compile / Runtime Error</h4>
                        <pre className="font-mono text-sm text-text-main p-2 bg-surface rounded border border-red-500/20 whitespace-pre-wrap">
                          {results[activeTestIdx].error || results[activeTestIdx].compile_output}
                        </pre>
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-semibold text-text-muted uppercase mb-1">Expected Output</h4>
                      <pre className="font-mono text-sm text-text-main p-2 bg-surface rounded border border-border-subtle whitespace-pre-wrap">
                        {results[activeTestIdx].expected_output}
                      </pre>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-text-muted uppercase mb-1">Your Output</h4>
                      <pre className="font-mono text-sm text-text-main p-2 bg-surface rounded border border-border-subtle whitespace-pre-wrap">
                        {results[activeTestIdx].stdout || results[activeTestIdx].stderr || "No output"}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-text-muted text-sm">
                Run your code to see test results.
              </div>
            )}
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="flex flex-col h-full items-center justify-center text-text-muted text-sm">
            Custom test cases feature is coming soon.
          </div>
        )}
      </div>
    </div>
  );
}
