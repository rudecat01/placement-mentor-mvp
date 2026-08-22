import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check, Clock, Info, Play } from "lucide-react";
import { AppShell, PageHeader } from "@/components/pm/app-shell";
import { Meter, Panel, SectionTitle, Stat, Tag, difficultyTone } from "@/components/pm/primitives";
import { readinessHistory, skills, student, todayTasks } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Today · Placement Mentor" },
      {
        name: "description",
        content:
          "Your placement command centre: today's mission, readiness, weakest skills, transfer gap and roadmap progress.",
      },
      { property: "og:title", content: "Today · Placement Mentor" },
      { property: "og:description", content: "Today's mission, readiness and transfer gap in one view." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [done, setDone] = useState<string[]>([]);
  const totalMinutes = todayTasks.reduce((a, t) => a + t.minutes, 0);
  const doneMinutes = todayTasks.filter((t) => done.includes(t.id)).reduce((a, t) => a + t.minutes, 0);
  const weakest = [...skills].sort((a, b) => a.mastery - b.mastery).slice(0, 4);

  return (
    <AppShell breadcrumb={["Prepare", "Today"]}>
      <PageHeader
        title={`Good evening, ${student.name}`}
        description={`${student.deadlineDays} days until your preparation deadline on ${student.deadline}. Your interview score is the constraint right now — not your practice volume.`}
        right={
          <Link
            to="/interview"
            className="focus-ring inline-flex items-center gap-2 rounded-md border border-border-strong px-3 py-2 text-[13px] font-medium hover:bg-secondary"
          >
            <Play className="h-3.5 w-3.5" /> Run mock interview
          </Link>
        }
      />

      <div className="grid gap-8 px-4 py-8 md:px-8 xl:grid-cols-[minmax(0,1fr)_312px]">
        <div className="min-w-0 space-y-10">
          {/* Today's mission — dominant */}
          <section>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="label-caps">Day 13 of 31 · Today&apos;s mission</div>
                <h2 className="mt-1.5 text-[22px] font-semibold tracking-tight">
                  Sliding window recovery
                </h2>
              </div>
              <div className="text-right">
                <div className="num text-sm font-semibold">
                  {doneMinutes}<span className="text-muted-foreground">/{totalMinutes} min</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {done.length} of {todayTasks.length} tasks complete
                </div>
              </div>
            </div>
            <Meter value={(doneMinutes / totalMinutes) * 100} className="mt-4" />

            <ul className="mt-5 divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
              {todayTasks.map((t) => {
                const complete = done.includes(t.id);
                return (
                  <li
                    key={t.id}
                    className={cn(
                      "group flex gap-4 p-4 transition-colors",
                      complete ? "bg-surface-muted" : "hover:bg-surface-muted/60",
                    )}
                  >
                    <button
                      aria-label={complete ? "Mark incomplete" : "Mark complete"}
                      onClick={() =>
                        setDone((d) => (d.includes(t.id) ? d.filter((x) => x !== t.id) : [...d, t.id]))
                      }
                      className={cn(
                        "focus-ring mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors",
                        complete
                          ? "border-success bg-success text-success-foreground"
                          : "border-border-strong hover:border-primary",
                      )}
                    >
                      {complete && <Check className="h-3 w-3" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "text-[14px] font-medium",
                            complete && "text-muted-foreground line-through",
                          )}
                        >
                          {t.title}
                        </span>
                        <Tag tone={difficultyTone(t.difficulty)}>{t.difficulty}</Tag>
                        {t.kind === "revision" && <Tag tone="info">revision due</Tag>}
                      </div>
                      <p className="mt-1.5 flex items-start gap-1.5 text-[13px] leading-relaxed text-muted-foreground">
                        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        {t.reason}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className="num flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {t.minutes}m
                      </span>
                      <Link
                        to="/practice"
                        className="focus-ring rounded-md border border-border px-2 py-1 text-[11px] font-medium opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                      >
                        Open
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Readiness trend */}
          <section>
            <SectionTitle
              action={
                <span className="text-xs text-muted-foreground">Last 7 weeks</span>
              }
            >
              Readiness trajectory
            </SectionTitle>
            <Panel className="mt-3 p-4">
              <div className="grid grid-cols-3 gap-6 border-b border-border pb-4">
                <Stat label="Placement readiness" value={student.placementReadiness} delta={4} tone="primary" />
                <Stat label="Practice score" value={student.practiceScore} delta={2} tone="success" />
                <Stat label="Interview score" value={student.interviewScore} delta={4} tone="warning" />
              </div>
              <div className="mt-4 h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={readinessHistory} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                    <defs>
                      <linearGradient id="fillReadiness" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="week" tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" />
                    <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        fontSize: 12,
                        background: "var(--popover)",
                      }}
                    />
                    <Area type="monotone" dataKey="practice" stroke="var(--chart-2)" strokeWidth={1.5} fill="none" />
                    <Area type="monotone" dataKey="interview" stroke="var(--chart-4)" strokeWidth={1.5} fill="none" />
                    <Area type="monotone" dataKey="readiness" stroke="var(--chart-1)" strokeWidth={2} fill="url(#fillReadiness)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </section>

          {/* Weaknesses table */}
          <section>
            <SectionTitle
              action={
                <Link to="/skills" className="text-xs text-primary hover:underline">
                  Open skill graph
                </Link>
              }
            >
              Where you are losing marks
            </SectionTitle>
            <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-surface">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="px-4 py-2.5 font-medium">Skill</th>
                    <th className="px-4 py-2.5 font-medium">Mastery</th>
                    <th className="px-4 py-2.5 font-medium">Practice</th>
                    <th className="px-4 py-2.5 font-medium">Interview</th>
                    <th className="px-4 py-2.5 font-medium">PTG</th>
                    <th className="px-4 py-2.5 font-medium">Root cause</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {weakest.map((s) => (
                    <tr key={s.id} className="hover:bg-surface-muted/60">
                      <td className="whitespace-nowrap px-4 py-3 font-medium">{s.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="num w-6">{s.mastery}</span>
                          <Meter
                            value={s.mastery}
                            size="sm"
                            tone={s.mastery < 40 ? "danger" : s.mastery < 65 ? "warning" : "success"}
                            className="w-16"
                          />
                        </div>
                      </td>
                      <td className="num px-4 py-3">{s.practiceScore}</td>
                      <td className="num px-4 py-3">{s.interviewScore}</td>
                      <td className="num px-4 py-3 font-medium text-danger">{s.ptg}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.rootCause ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Contextual right rail */}
        <aside className="space-y-6">
          <Panel className="p-4">
            <SectionTitle>Transfer gap</SectionTitle>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              What survives interview conditions.
            </p>
            <div className="mt-4 space-y-4">
              {[
                { l: "Practice", v: student.practiceScore, tone: "success" as const },
                { l: "Interview", v: student.interviewScore, tone: "warning" as const },
                { l: "PTG", v: student.ptg, tone: "danger" as const },
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
            <Link
              to="/report"
              className="focus-ring mt-5 flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              Read the full assessment <ArrowRight className="h-3 w-3" />
            </Link>
          </Panel>

          <Panel className="p-4">
            <SectionTitle>Next replanning boundary</SectionTitle>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              Your plan will be recomputed after <span className="font-medium text-foreground">Mock #5 on Day 16</span>.
              Today&apos;s tasks are locked until then — mid-day changes break focus.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-muted-foreground">3 days · 2 pending signals</span>
            </div>
          </Panel>

          <Panel className="p-4">
            <SectionTitle>This week</SectionTitle>
            <div className="mt-3 space-y-3">
              <div>
                <div className="flex items-baseline justify-between text-[13px]">
                  <span className="text-muted-foreground">Focused hours</span>
                  <span className="num font-semibold">
                    {student.hoursThisWeek}/{student.targetHoursWeek}
                  </span>
                </div>
                <Meter value={(student.hoursThisWeek / student.targetHoursWeek) * 100} className="mt-1.5" />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <Tag tone="success">12 problems solved</Tag>
                <Tag tone="warning">1 mock interview</Tag>
                <Tag>3 revisions due</Tag>
              </div>
            </div>
          </Panel>
        </aside>
      </div>
    </AppShell>
  );
}
