import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Clock, GitBranch, Check, Lock } from "lucide-react";
import { AppShell, PageHeader } from "@/components/pm/app-shell";
import { Meter, Tag, difficultyTone } from "@/components/pm/primitives";
import { roadmap } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap · Placement Mentor" },
      {
        name: "description",
        content:
          "A day-level adaptive roadmap: topic, difficulty, estimated time, the reason it is scheduled, and why it moved.",
      },
      { property: "og:title", content: "Roadmap · Placement Mentor" },
      { property: "og:description", content: "Day-level adaptive preparation plan with reasons attached to every task." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Roadmap,
});

function Roadmap() {
  const [open, setOpen] = useState<number[]>([13]);
  const [why, setWhy] = useState<number | null>(null);
  const toggle = (d: number) => setOpen((o) => (o.includes(d) ? o.filter((x) => x !== d) : [...o, d]));

  return (
    <AppShell breadcrumb={["Prepare", "Roadmap"]}>
      <PageHeader
        title="Preparation roadmap"
        description="31 days, recomputed only at replanning boundaries. Every task carries the evidence that put it there."
        right={
          <div className="flex items-center gap-4 text-right">
            <div>
              <div className="label-caps">Plan progress</div>
              <div className="num text-lg font-semibold">39%</div>
            </div>
            <Meter value={39} className="w-28" />
          </div>
        }
      />

      <div className="px-4 py-8 md:px-8">
        <div className="relative">
          <div className="absolute bottom-4 left-[15px] top-4 hidden w-px bg-border sm:block" />
          <ol className="space-y-3">
            {roadmap.map((day) => {
              const expanded = open.includes(day.day);
              const doneCount = day.tasks.filter((t) => t.status === "done").length;
              return (
                <li key={day.day} className="relative sm:pl-12">
                  <span
                    className={cn(
                      "absolute left-0 top-4 hidden h-8 w-8 place-items-center rounded-full border text-[11px] font-semibold sm:grid",
                      day.status === "complete"
                        ? "border-success bg-success-soft text-success"
                        : day.status === "today"
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-surface text-muted-foreground",
                    )}
                  >
                    {day.status === "complete" ? <Check className="h-3.5 w-3.5" /> : day.day}
                  </span>

                  <div
                    className={cn(
                      "overflow-hidden rounded-lg border bg-surface transition-colors",
                      day.status === "today" ? "border-primary/40" : "border-border",
                    )}
                  >
                    <button
                      onClick={() => toggle(day.day)}
                      aria-expanded={expanded}
                      className="focus-ring flex w-full items-center gap-4 px-4 py-3.5 text-left"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[14px] font-medium">{day.focus}</span>
                          {day.status === "today" && <Tag tone="primary">today</Tag>}
                          {day.moved && <Tag tone="info">moved</Tag>}
                        </div>
                        <div className="num mt-1 text-xs text-muted-foreground">
                          Day {day.day} · {day.date} · {day.tasks.length} tasks ·{" "}
                          {day.tasks.reduce((a, t) => a + t.minutes, 0)} min
                        </div>
                      </div>
                      {day.status === "complete" && (
                        <span className="num hidden text-xs text-success sm:block">
                          {doneCount}/{day.tasks.length} done
                        </span>
                      )}
                      {day.status === "today" && (
                        <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                          <Lock className="h-3 w-3" /> locked until Day 16
                        </span>
                      )}
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                          expanded && "rotate-180",
                        )}
                      />
                    </button>

                    {expanded && (
                      <div className="animate-rise border-t border-border">
                        {day.moved && (
                          <div className="border-b border-border bg-info-soft/50 px-4 py-3">
                            <button
                              onClick={() => setWhy(why === day.day ? null : day.day)}
                              className="focus-ring flex items-center gap-2 text-xs font-medium text-info"
                            >
                              <GitBranch className="h-3.5 w-3.5" />
                              Why this moved from {day.moved.from}?
                              <ChevronDown className={cn("h-3 w-3 transition-transform", why === day.day && "rotate-180")} />
                            </button>
                            {why === day.day && (
                              <p className="animate-rise mt-2 max-w-3xl text-[13px] leading-relaxed text-muted-foreground">
                                {day.moved.why}
                              </p>
                            )}
                          </div>
                        )}

                        <table className="w-full text-left text-[13px]">
                          <thead>
                            <tr className="border-b border-border text-muted-foreground">
                              <th className="px-4 py-2 font-medium">Task</th>
                              <th className="hidden px-4 py-2 font-medium sm:table-cell">Skill</th>
                              <th className="px-4 py-2 font-medium">Difficulty</th>
                              <th className="px-4 py-2 font-medium">Est.</th>
                              <th className="hidden px-4 py-2 font-medium lg:table-cell">Reason</th>
                              <th className="px-4 py-2 font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {day.tasks.map((t) => (
                              <tr key={t.id} className="hover:bg-surface-muted/60">
                                <td className="px-4 py-3 font-medium">{t.title}</td>
                                <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{t.skill}</td>
                                <td className="px-4 py-3">
                                  <Tag tone={difficultyTone(t.difficulty)}>{t.difficulty}</Tag>
                                </td>
                                <td className="num whitespace-nowrap px-4 py-3 text-muted-foreground">
                                  <Clock className="mr-1 inline h-3 w-3" />
                                  {t.minutes}m
                                </td>
                                <td className="hidden max-w-sm px-4 py-3 text-muted-foreground lg:table-cell">
                                  {t.reason}
                                </td>
                                <td className="px-4 py-3">
                                  {t.status === "done" ? (
                                    <Tag tone="success">done</Tag>
                                  ) : t.status === "active" ? (
                                    <Tag tone="primary">in progress</Tag>
                                  ) : t.status === "revision" ? (
                                    <Tag tone="info">revision</Tag>
                                  ) : (
                                    <Tag>to do</Tag>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </AppShell>
  );
}
