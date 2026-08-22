import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Play, Send, Lightbulb, CheckCircle2, XCircle, MessageSquare } from "lucide-react";
import { AppShell } from "@/components/pm/app-shell";
import { Meter, Tag } from "@/components/pm/primitives";
import { problem } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/practice")({
  head: () => ({
    meta: [
      { title: "Practice workspace · Placement Mentor" },
      {
        name: "description",
        content:
          "An IDE-style DSA workspace: problem, editor, tests, complexity and the mastery impact of each submission.",
      },
      { property: "og:title", content: "Practice workspace · Placement Mentor" },
      { property: "og:description", content: "Code, run tests and see the mastery impact of every submission." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Practice,
});

function Practice() {
  const [code, setCode] = useState(problem.starter);
  const [hints, setHints] = useState(1);
  const [ran, setRan] = useState(false);
  const [tab, setTab] = useState<"tests" | "mentor" | "impact">("tests");

  const passed = problem.tests.filter((t) => t.pass).length;

  return (
    <AppShell
      breadcrumb={["Prepare", "Practice", problem.title]}
      actions={
        <>
          <button
            onClick={() => { setRan(true); setTab("tests"); }}
            className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-border-strong px-2.5 py-1.5 text-xs font-medium hover:bg-secondary"
          >
            <Play className="h-3.5 w-3.5" /> Run
          </button>
          <button
            onClick={() => { setRan(true); setTab("impact"); }}
            className="focus-ring inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
          >
            <Send className="h-3.5 w-3.5" /> Submit
          </button>
        </>
      }
    >
      <div className="grid h-[calc(100vh-3.5rem)] grid-rows-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(300px,26%)_minmax(0,1fr)_minmax(300px,26%)] lg:grid-rows-1">
        {/* Problem */}
        <section className="overflow-y-auto border-b border-border lg:border-b-0 lg:border-r">
          <div className="border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <Tag tone="warning">{problem.difficulty}</Tag>
              <Tag>{problem.skill}</Tag>
            </div>
            <h1 className="mt-2.5 text-[17px] font-semibold leading-snug tracking-tight">
              {problem.title}
            </h1>
          </div>

          <div className="space-y-6 px-5 py-5 text-[13px] leading-relaxed">
            <p>{problem.statement}</p>

            <div>
              <div className="label-caps">Examples</div>
              <div className="mt-2 space-y-2">
                {problem.examples.map((e) => (
                  <div key={e.input} className="rounded-md border border-border bg-surface-muted p-3">
                    <div className="num text-xs">Input: {e.input}</div>
                    <div className="num mt-1 text-xs">Output: {e.output}</div>
                    <div className="mt-1.5 text-xs text-muted-foreground">{e.note}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="label-caps">Constraints</div>
              <ul className="num mt-2 space-y-1 text-xs text-muted-foreground">
                {problem.constraints.map((c) => (
                  <li key={c}>· {c}</li>
                ))}
              </ul>
            </div>

            <div>
              <div className="label-caps">Hints</div>
              <ol className="mt-2 space-y-2">
                {problem.hints.slice(0, hints).map((h, i) => (
                  <li key={h} className="animate-rise flex gap-2 text-[13px] text-muted-foreground">
                    <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                    <span>
                      <span className="font-medium text-foreground">Hint {i + 1}. </span>
                      {h}
                    </span>
                  </li>
                ))}
              </ol>
              {hints < problem.hints.length && (
                <button
                  onClick={() => setHints((h) => h + 1)}
                  className="focus-ring mt-3 text-xs font-medium text-primary hover:underline"
                >
                  Reveal next hint ({problem.hints.length - hints} left)
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Editor */}
        <section className="flex min-h-[320px] flex-col border-b border-border lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3 border-b border-border px-4 py-2 text-xs">
            <span className="num font-medium">solution.js</span>
            <select
              className="focus-ring ml-auto rounded border border-border bg-surface px-1.5 py-1 text-xs"
              defaultValue="js"
              aria-label="Language"
            >
              <option value="js">JavaScript</option>
              <option value="py">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
          </div>
          <div className="relative flex-1 overflow-hidden">
            <textarea
              spellCheck={false}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              aria-label="Code editor"
              className="num h-full w-full resize-none bg-surface p-4 pl-11 text-[12.5px] leading-6 outline-none"
            />
            <div
              aria-hidden
              className="num pointer-events-none absolute inset-y-0 left-0 w-9 select-none border-r border-border bg-surface-muted pt-4 text-right text-[12.5px] leading-6 text-muted-foreground/70"
            >
              {code.split("\n").map((_, i) => (
                <div key={i} className="pr-2">
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-xs text-muted-foreground">
            <span className="num">Ln {code.split("\n").length}, Col 1</span>
            <span className="num ml-auto">Autosaved · 18:24</span>
          </div>
        </section>

        {/* Results */}
        <section className="flex min-h-[260px] flex-col overflow-hidden">
          <div className="flex border-b border-border text-xs">
            {(["tests", "mentor", "impact"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "focus-ring relative px-4 py-2.5 capitalize transition-colors",
                  tab === t ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t === "impact" ? "Mastery impact" : t}
                {tab === t && <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-t bg-primary" />}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {tab === "tests" && (
              <div className="p-4">
                {!ran ? (
                  <p className="text-[13px] text-muted-foreground">
                    Run your code to see test results, runtime and memory.
                  </p>
                ) : (
                  <>
                    <div className="flex items-baseline justify-between text-[13px]">
                      <span className="font-medium">
                        {passed}/{problem.tests.length} tests passed
                      </span>
                      <span className="num text-xs text-muted-foreground">64 ms · 44.2 MB</span>
                    </div>
                    <ul className="mt-3 divide-y divide-border rounded-md border border-border">
                      {problem.tests.map((t) => (
                        <li key={t.name} className="flex items-center gap-2.5 px-3 py-2 text-[13px]">
                          {t.pass ? (
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 shrink-0 text-danger" />
                          )}
                          <span className="num min-w-0 flex-1 truncate">{t.name}</span>
                          {!t.pass && (
                            <span className="num text-xs text-danger">
                              got {t.got}, want {t.expected}
                            </span>
                          )}
                          <span className="num text-xs text-muted-foreground">{t.ms}ms</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 rounded-md border border-border bg-surface-muted p-3 text-[13px]">
                      <div className="label-caps">Complexity</div>
                      <p className="num mt-1.5">Time O(n) · Space O(min(n, Σ))</p>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        Matches the optimal bound for this problem.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {tab === "mentor" && (
              <div className="flex h-full flex-col">
                <div className="flex-1 space-y-4 overflow-y-auto p-4 text-[13px] leading-relaxed">
                  <p className="flex gap-2 text-muted-foreground">
                    <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>
                      Your failing case is <span className="num">dvdf</span>. Before I say anything
                      else — what is supposed to be true about every character inside your window?
                    </span>
                  </p>
                  <p className="rounded-md bg-secondary p-3">That there are no duplicates.</p>
                  <p className="flex gap-2 text-muted-foreground">
                    <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>
                      Right. Now trace <span className="num">dvdf</span> by hand. At index 2 you see{" "}
                      <span className="num">d</span> again. Where is <span className="num">left</span>{" "}
                      at that moment, and does moving it break the invariant or restore it?
                    </span>
                  </p>
                </div>
                <div className="border-t border-border p-3">
                  <input
                    className="focus-ring w-full rounded-md border border-input bg-surface px-3 py-2 text-[13px]"
                    placeholder="Answer the mentor…"
                  />
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    The mentor will not give you the solution. It asks until you find it.
                  </p>
                </div>
              </div>
            )}

            {tab === "impact" && (
              <div className="space-y-5 p-4">
                <div>
                  <div className="label-caps">Sliding Window mastery</div>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="num text-2xl font-semibold">46</span>
                    <span className="num text-xs text-success">+0 pending clean submission</span>
                  </div>
                  <Meter value={46} tone="warning" className="mt-2" />
                </div>
                <ul className="space-y-2.5 text-[13px] text-muted-foreground">
                  <li>· Correctness on first submission weighs 40% of the mastery delta.</li>
                  <li>· Time-to-insight (14 min) is above your 9-minute target for medium windows.</li>
                  <li>· 2 hints used — reduces the credited delta by 20%.</li>
                </ul>
                <div className="rounded-md border border-border bg-surface-muted p-3 text-[13px]">
                  <span className="font-medium">Next:</span> a second variable-window problem without
                  hints, then narrate the invariant aloud for the interview transfer credit.
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
