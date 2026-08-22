import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { Meter, Tag } from "@/components/pm/primitives";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Placement Mentor — Adaptive placement preparation" },
      {
        name: "description",
        content:
          "Placement Mentor measures how you actually perform, builds an adaptive preparation plan, and closes the gap between practice and interviews.",
      },
      { property: "og:title", content: "Placement Mentor — Adaptive placement preparation" },
      {
        property: "og:description",
        content:
          "Diagnosis, skill graph, adaptive roadmap, mock interviews and the Practice-to-Interview Transfer Gap in one workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-5">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded bg-primary text-[11px] font-bold text-primary-foreground">
              PM
            </span>
            <span className="text-[13px] font-semibold tracking-tight">Placement Mentor</span>
          </Link>
          <nav className="ml-4 hidden items-center gap-5 text-[13px] text-muted-foreground md:flex">
            <a href="#loop" className="hover:text-foreground">How it works</a>
            <a href="#ptg" className="hover:text-foreground">Transfer gap</a>
            <a href="#interview" className="hover:text-foreground">Interviews</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/dashboard"
              className="focus-ring rounded-md px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              to="/onboarding"
              className="focus-ring rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground transition-colors hover:opacity-90"
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-8 pt-16 md:pt-24">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Now measuring the Practice-to-Interview Transfer Gap
            </div>
            <h1 className="mt-5 text-[40px] font-semibold leading-[1.06] tracking-tight md:text-[54px]">
              Preparation that adapts to how you
              <span className="text-primary"> actually perform</span>.
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Placement Mentor continuously analyses your placement readiness, builds your
              preparation plan, measures real performance in mock interviews, and rewrites the plan
              when your results say it should change.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/onboarding"
                className="focus-ring inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
              >
                Build my plan <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/dashboard"
                className="focus-ring inline-flex items-center gap-2 rounded-md border border-border-strong px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
              >
                See a live workspace
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Free diagnosis · no card required · plan generated in under 4 minutes
            </p>
          </div>

          <ProductMock />
        </div>
      </section>

      {/* Outcomes */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-border md:grid-cols-4">
          {[
            { v: "31,400", l: "plans generated" },
            { v: "68%", l: "median readiness lift in 8 weeks" },
            { v: "2.1×", l: "faster weakness detection vs self-study" },
            { v: "14,900", l: "mock interviews evaluated" },
          ].map((s) => (
            <div key={s.l} className="px-5 py-7">
              <div className="num text-xl font-semibold">{s.v}</div>
              <div className="mt-1 text-xs leading-snug text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Loop */}
      <section id="loop" className="mx-auto max-w-6xl px-5 py-20">
        <div className="max-w-2xl">
          <div className="label-caps">The closed loop</div>
          <h2 className="mt-3 text-[30px] font-semibold leading-tight">
            Nine steps that keep correcting each other
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            Most tools stop at content. Placement Mentor runs a loop: what it measures changes what
            you do tomorrow.
          </p>
        </div>

        <ol className="mt-10 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Profile", "Resume, GitHub, LeetCode and self-assessment become one structured signal."],
            ["Diagnosis", "A cold-start assessment separates what you know from what you can perform."],
            ["Skill graph", "Prerequisites, mastery and decay tracked per topic, not per playlist."],
            ["Roadmap", "Day-level plan with reasons attached to every task."],
            ["Practice", "IDE workspace with a Socratic mentor that refuses to hand you answers."],
            ["Evaluation", "Complexity, correctness, approach quality and time-to-insight scored."],
            ["Interview", "Five-stage mock with an interviewer that follows up on weakness."],
            ["Transfer gap", "The distance between what you can solve and what you can defend."],
            ["Replanning", "The roadmap rewrites itself at defined boundaries — never mid-day."],
          ].map(([title, body], i) => (
            <li key={title} className="bg-surface p-5">
              <div className="num text-[11px] text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-2 text-sm font-semibold">{title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* PTG */}
      <section id="ptg" className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="label-caps">Practice-to-Interview Transfer Gap</div>
            <h2 className="mt-3 text-[30px] font-semibold leading-tight">
              Solving it alone is not the same as defending it live
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              A student with 400 solved problems can still fail round one. PTG quantifies how much
              of your practice survives interview conditions — time pressure, follow-ups, ambiguity
              and having to think out loud. Every roadmap change is justified against it.
            </p>
            <ul className="mt-6 space-y-2.5 text-[13px]">
              {[
                "Topic-level breakdown of where transfer fails",
                "Root-cause labels, not generic 'revise more' advice",
                "Blue Team rebuilds the concept, Red Team stress-tests it",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="panel p-6">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold">Sliding Window</span>
              <Tag tone="danger">Transfer failing</Tag>
            </div>
            <div className="mt-6 space-y-5">
              {[
                { l: "Practice score", v: 82, tone: "success" as const },
                { l: "Interview score", v: 48, tone: "warning" as const },
                { l: "PTG", v: 34, tone: "danger" as const },
              ].map((r) => (
                <div key={r.l}>
                  <div className="flex items-baseline justify-between text-[13px]">
                    <span className="text-muted-foreground">{r.l}</span>
                    <span className="num font-semibold">{r.v}</span>
                  </div>
                  <Meter value={r.v} tone={r.tone} className="mt-2" />
                </div>
              ))}
            </div>
            <p className="mt-6 border-t border-border pt-4 text-[13px] leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">Root cause:</span> you derive the shrink
              condition by trial and error. Under a 20-minute clock, that costs you the round.
            </p>
          </div>
        </div>
      </section>

      {/* Interview */}
      <section id="interview" className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <div className="label-caps">Mock interviews</div>
            <h2 className="mt-3 text-[30px] font-semibold leading-tight">
              Five rounds. Real follow-ups. A written assessment at the end.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              Behavioral, CS fundamentals, DSA with a live editor, project deep dive and HR. The
              interviewer probes where your graph says you are weak — and the report reads like one
              a hiring panel would write.
            </p>
            <Link
              to="/interview"
              className="focus-ring mt-7 inline-flex items-center gap-2 rounded-md border border-border-strong px-4 py-2.5 text-sm font-medium hover:bg-secondary"
            >
              Preview an interview <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5 text-xs">
              <span className="font-medium">Round 3 of 5 · DSA</span>
              <span className="num text-muted-foreground">18:42</span>
            </div>
            <div className="space-y-4 p-5 text-[13px] leading-relaxed">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Interviewer:</span> What exactly stays
                true about the window at every step?
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">You:</span> That there are no
                duplicates inside it.
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Interviewer:</span> Good. So why is
                moving left to <span className="num">lastSeen + 1</span> safe, and not{" "}
                <span className="num">left + 1</span>?
              </p>
              <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary pulse-ring" />
                Listening
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center">
          <h2 className="text-[32px] font-semibold leading-tight">
            Stop preparing on instinct.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            Get a measured diagnosis, a day-level plan and an honest readiness number — before a
            company gives you one.
          </p>
          <Link
            to="/onboarding"
            className="focus-ring mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Start my diagnosis <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-xs text-muted-foreground">
          <span>© 2026 Placement Mentor</span>
          <span>Built for students who want a measured answer, not a motivational one.</span>
        </div>
      </footer>
    </div>
  );
}

function ProductMock() {
  return (
    <div className="panel overflow-hidden shadow-raised">
      <div className="flex items-center gap-1.5 border-b border-border bg-surface-muted px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-border-strong" />
        <span className="h-2 w-2 rounded-full bg-border-strong" />
        <span className="h-2 w-2 rounded-full bg-border-strong" />
        <span className="ml-3 text-[11px] text-muted-foreground">Today · Day 13 of 31</span>
      </div>
      <div className="grid grid-cols-[132px_1fr]">
        <div className="hidden space-y-1 border-r border-border p-3 sm:block">
          {["Today", "Roadmap", "Skill graph", "Practice", "Interview"].map((l, i) => (
            <div
              key={l}
              className={`rounded px-2 py-1.5 text-[11px] ${i === 0 ? "bg-secondary font-medium" : "text-muted-foreground"}`}
            >
              {l}
            </div>
          ))}
        </div>
        <div className="p-4">
          <div className="text-[11px] text-muted-foreground">Today&apos;s mission</div>
          <div className="mt-1 text-sm font-semibold">Sliding window recovery · 110 min</div>
          <div className="mt-4 space-y-2">
            {[
              ["Variable-size window drill", "45m", 100],
              ["Longest substring, no repeats", "25m", 40],
              ["Think-aloud: caching layer", "10m", 0],
            ].map(([t, m, p]) => (
              <div key={t as string} className="rounded-md border border-border p-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium">{t}</span>
                  <span className="num text-muted-foreground">{m}</span>
                </div>
                <Meter value={p as number} size="sm" className="mt-2" />
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-3">
            {[
              ["Readiness", "61"],
              ["Interview", "48"],
              ["PTG", "34"],
            ].map(([l, v]) => (
              <div key={l}>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{l}</div>
                <div className="num text-base font-semibold">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
