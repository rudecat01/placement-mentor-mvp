import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { X, TrendingDown, TrendingUp, ArrowRight } from "lucide-react";
import { AppShell, PageHeader } from "@/components/pm/app-shell";
import { Meter, Tag } from "@/components/pm/primitives";
import { skills, type SkillNode } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/skills")({
  head: () => ({
    meta: [
      { title: "Skill graph · Placement Mentor" },
      {
        name: "description",
        content:
          "An interactive prerequisite graph where every node encodes mastery, transfer gap and the next action for that topic.",
      },
      { property: "og:title", content: "Skill graph · Placement Mentor" },
      { property: "og:description", content: "Prerequisite-aware mastery graph with per-skill root causes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SkillGraph,
});

const stateStyle: Record<SkillNode["state"], string> = {
  strong: "border-success bg-success-soft text-success",
  developing: "border-border-strong bg-surface text-foreground",
  weak: "border-warning bg-warning-soft text-warning-foreground",
  "at-risk": "border-danger bg-danger-soft text-danger",
  locked: "border-dashed border-border-strong bg-surface-muted text-muted-foreground",
};

function SkillGraph() {
  const [selected, setSelected] = useState<SkillNode | null>(skills[2] ?? null);
  const [filter, setFilter] = useState<string>("all");

  const visible = skills.filter((s) => filter === "all" || s.track === filter);

  return (
    <AppShell breadcrumb={["Prepare", "Skill graph"]}>
      <PageHeader
        title="Skill graph"
        description="Prerequisites, mastery and decay. A node turns amber when interview performance falls behind practice."
        right={
          <div className="flex gap-1 rounded-md border border-border bg-surface p-0.5">
            {[
              ["all", "All"],
              ["dsa", "DSA"],
              ["core", "CS core"],
              ["system", "System"],
              ["behavioral", "Behavioral"],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={cn(
                  "focus-ring rounded px-2.5 py-1 text-xs transition-colors",
                  filter === id ? "bg-secondary font-medium" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        }
      />

      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col xl:flex-row">
        <div className="relative min-h-[560px] flex-1 overflow-auto">
          <div className="grid-canvas absolute inset-0 opacity-[0.55]" aria-hidden />
          <div className="relative h-[620px] min-w-[760px]">
            <svg className="absolute inset-0 h-full w-full" aria-hidden>
              {visible.flatMap((s) =>
                s.prerequisites
                  .map((p) => skills.find((k) => k.id === p))
                  .filter((p): p is SkillNode => !!p && visible.includes(p))
                  .map((p) => (
                    <line
                      key={`${p.id}-${s.id}`}
                      x1={`${p.x + 7}%`}
                      y1={`${p.y + 4}%`}
                      x2={`${s.x + 7}%`}
                      y2={`${s.y + 1}%`}
                      stroke="var(--border-strong)"
                      strokeWidth={1.25}
                      strokeDasharray={s.state === "locked" ? "4 4" : undefined}
                    />
                  )),
              )}
            </svg>

            {visible.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
                className={cn(
                  "focus-ring absolute w-[150px] rounded-lg border p-3 text-left shadow-subtle transition-all duration-200 hover:-translate-y-0.5 hover:shadow-raised",
                  stateStyle[s.state],
                  selected?.id === s.id && "ring-2 ring-ring ring-offset-2 ring-offset-background",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] font-medium">{s.name}</span>
                  {s.trend !== 0 &&
                    (s.trend > 0 ? (
                      <TrendingUp className="h-3 w-3 text-success" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-danger" />
                    ))}
                </div>
                <div className="num mt-1 text-[11px] opacity-80">{s.mastery} mastery</div>
                <Meter
                  value={s.mastery}
                  size="sm"
                  className="mt-2"
                  tone={s.mastery < 40 ? "danger" : s.mastery < 65 ? "warning" : "success"}
                />
              </button>
            ))}
          </div>

          <div className="pointer-events-none sticky bottom-4 ml-4 inline-flex flex-wrap gap-3 rounded-md border border-border bg-surface/95 px-3 py-2 text-[11px] backdrop-blur">
            {[
              ["Strong", "bg-success"],
              ["Developing", "bg-border-strong"],
              ["Weak", "bg-warning"],
              ["At risk", "bg-danger"],
              ["Locked", "bg-muted-foreground/40"],
            ].map(([l, c]) => (
              <span key={l} className="flex items-center gap-1.5 text-muted-foreground">
                <span className={cn("h-2 w-2 rounded-full", c)} /> {l}
              </span>
            ))}
          </div>
        </div>

        {selected && (
          <aside className="animate-rise w-full shrink-0 border-t border-border bg-surface p-5 xl:w-[360px] xl:border-l xl:border-t-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="label-caps">{selected.track}</div>
                <h2 className="mt-1 text-lg font-semibold tracking-tight">{selected.name}</h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Close panel"
                className="focus-ring rounded-md p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {[
                { l: "Mastery", v: selected.mastery, tone: "primary" as const },
                { l: "Practice score", v: selected.practiceScore, tone: "success" as const },
                { l: "Interview score", v: selected.interviewScore, tone: "warning" as const },
                { l: "PTG", v: selected.ptg, tone: "danger" as const },
              ].map((r) => (
                <div key={r.l}>
                  <div className="flex items-baseline justify-between text-[13px]">
                    <span className="text-muted-foreground">{r.l}</span>
                    <span className="num font-semibold">{r.v}</span>
                  </div>
                  <Meter value={r.v} tone={r.tone} className="mt-1.5" />
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
              <Tag tone={selected.trend >= 0 ? "success" : "danger"}>
                {selected.trend >= 0 ? "+" : ""}
                {selected.trend} in 7 days
              </Tag>
              {selected.revisionDue && <Tag tone="info">revision {selected.revisionDue.toLowerCase()}</Tag>}
              {selected.state === "locked" && <Tag>locked</Tag>}
            </div>

            {selected.rootCause && (
              <div className="mt-5">
                <div className="label-caps">Root cause</div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{selected.rootCause}</p>
              </div>
            )}

            {selected.nextAction && (
              <div className="mt-5 rounded-md border border-border bg-surface-muted p-3">
                <div className="label-caps">Recommended next action</div>
                <p className="mt-1.5 text-[13px] leading-relaxed">{selected.nextAction}</p>
                <button className="focus-ring mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                  Schedule for tomorrow <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            )}

            {selected.attempts?.length ? (
              <div className="mt-5">
                <div className="label-caps">Recent attempts</div>
                <ul className="mt-2 divide-y divide-border rounded-md border border-border">
                  {selected.attempts.map((a) => (
                    <li key={a.problem} className="flex items-center gap-3 px-3 py-2 text-[13px]">
                      <span className="num w-12 shrink-0 text-xs text-muted-foreground">{a.date}</span>
                      <span className="min-w-0 flex-1 truncate">{a.problem}</span>
                      <span className="num text-xs text-muted-foreground">{a.time}</span>
                      <Tag
                        tone={a.verdict === "solved" ? "success" : a.verdict === "partial" ? "warning" : "danger"}
                      >
                        {a.verdict}
                      </Tag>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        )}
      </div>
    </AppShell>
  );
}
