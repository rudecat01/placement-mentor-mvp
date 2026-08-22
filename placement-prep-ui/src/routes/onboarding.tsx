import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Github, Code2, FileUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Meter } from "@/components/pm/primitives";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your plan · Placement Mentor" },
      {
        name: "description",
        content:
          "A guided seven-step setup: role, deadline, self-assessment, resume, GitHub and LeetCode — then your initial readiness profile.",
      },
      { property: "og:title", content: "Set up your plan · Placement Mentor" },
      {
        property: "og:description",
        content: "Guided onboarding that produces your first placement readiness profile.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Onboarding,
});

const steps = [
  "Account",
  "Role",
  "Timeline",
  "Self-assessment",
  "Resume",
  "GitHub",
  "LeetCode",
  "Profile",
];

function Onboarding() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const last = step === steps.length - 1;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 items-center justify-between border-b border-border px-5">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded bg-primary text-[11px] font-bold text-primary-foreground">
            PM
          </span>
          <span className="text-[13px] font-semibold">Placement Mentor</span>
        </Link>
        <span className="num text-xs text-muted-foreground">
          Step {step + 1} / {steps.length}
        </span>
      </header>

      <div className="mx-auto grid w-full max-w-5xl flex-1 gap-10 px-5 py-10 md:grid-cols-[190px_1fr]">
        <nav aria-label="Setup steps" className="hidden md:block">
          <ol className="space-y-1">
            {steps.map((s, i) => (
              <li key={s}>
                <button
                  onClick={() => setStep(i)}
                  className={cn(
                    "focus-ring flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-[13px]",
                    i === step
                      ? "bg-secondary font-medium"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "num grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full border text-[10px]",
                      i < step
                        ? "border-success bg-success text-success-foreground"
                        : i === step
                          ? "border-primary text-primary"
                          : "border-border text-muted-foreground",
                    )}
                    style={{ height: 18, width: 18 }}
                  >
                    {i < step ? <Check className="h-2.5 w-2.5" /> : i + 1}
                  </span>
                  {s}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0">
          <Meter value={((step + 1) / steps.length) * 100} className="mb-8 md:hidden" />
          <div key={step} className="animate-rise">
            <StepBody step={step} />
          </div>

          <div className="mt-10 flex items-center justify-between border-t border-border pt-5">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="focus-ring inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-[13px] text-muted-foreground disabled:opacity-40 hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={() => (last ? navigate({ to: "/dashboard" }) : setStep((s) => s + 1))}
              className="focus-ring inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90"
            >
              {last ? "Open my workspace" : "Continue"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Head({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="mb-7">
      <h1 className="text-[26px] font-semibold leading-tight tracking-tight">{title}</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}

function Field({
  label,
  children,
  note,
}: {
  label: string;
  children: React.ReactNode;
  note?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium">{label}</span>
      {children}
      {note ? <span className="mt-1 block text-xs text-muted-foreground">{note}</span> : null}
    </label>
  );
}

const inputCls =
  "focus-ring w-full rounded-md border border-input bg-surface px-3 py-2 text-sm placeholder:text-muted-foreground/70";

function Choice({
  options,
  value,
  onChange,
  columns = 2,
}: {
  options: { id: string; title: string; note?: string }[];
  value: string;
  onChange: (v: string) => void;
  columns?: number;
}) {
  return (
    <div className={cn("grid gap-2", columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3")}>
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "focus-ring rounded-md border p-3 text-left transition-colors",
            value === o.id
              ? "border-primary bg-primary-soft"
              : "border-border bg-surface hover:border-border-strong",
          )}
        >
          <div className="text-[13px] font-medium">{o.title}</div>
          {o.note ? <div className="mt-0.5 text-xs text-muted-foreground">{o.note}</div> : null}
        </button>
      ))}
    </div>
  );
}

function StepBody({ step }: { step: number }) {
  const [role, setRole] = useState("sde");
  const [timeline, setTimeline] = useState("12w");
  const [levels, setLevels] = useState<Record<string, number>>({
    DSA: 3,
    "CS Fundamentals": 2,
    "System Design": 1,
    Projects: 3,
    Communication: 2,
  });

  if (step === 0)
    return (
      <>
        <Head title="Create your account" hint="One account holds your graph, plans and reports." />
        <div className="grid max-w-md gap-4">
          <Field label="Full name">
            <input className={inputCls} defaultValue="Dhruv Mehta" />
          </Field>
          <Field label="College email">
            <input className={inputCls} placeholder="you@college.edu" />
          </Field>
          <Field label="Password" note="At least 8 characters.">
            <input type="password" className={inputCls} placeholder="••••••••" />
          </Field>
        </div>
      </>
    );

  if (step === 1)
    return (
      <>
        <Head title="What are you preparing for?" hint="This selects the graph and the rubric used to score you." />
        <Choice
          value={role}
          onChange={setRole}
          options={[
            { id: "sde", title: "SDE — Product companies", note: "DSA-heavy, CS core, system design basics" },
            { id: "service", title: "SDE — Service companies", note: "Aptitude, core CS, project defence" },
            { id: "data", title: "Data / ML engineer", note: "SQL, statistics, ML system design" },
            { id: "frontend", title: "Frontend engineer", note: "JS internals, browser, UI system design" },
          ]}
        />
      </>
    );

  if (step === 2)
    return (
      <>
        <Head title="How long do you have?" hint="Plans are day-level. The deadline drives density and replanning boundaries." />
        <Choice
          columns={3}
          value={timeline}
          onChange={setTimeline}
          options={[
            { id: "4w", title: "4 weeks", note: "Intense · 4-5 h/day" },
            { id: "12w", title: "12 weeks", note: "Balanced · 2-3 h/day" },
            { id: "24w", title: "6 months", note: "Steady · 1-2 h/day" },
          ]}
        />
        <div className="mt-6 max-w-xs">
          <Field label="Or set an exact deadline">
            <input type="date" className={inputCls} defaultValue="2026-09-12" />
          </Field>
        </div>
      </>
    );

  if (step === 3)
    return (
      <>
        <Head title="Self-assessment" hint="Rough is fine. The diagnosis will correct you within a week." />
        <div className="max-w-lg divide-y divide-border rounded-lg border border-border bg-surface">
          {Object.entries(levels).map(([k, v]) => (
            <div key={k} className="flex items-center gap-4 px-4 py-3">
              <span className="flex-1 text-[13px]">{k}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    aria-label={`${k} level ${n}`}
                    onClick={() => setLevels((s) => ({ ...s, [k]: n }))}
                    className={cn(
                      "num h-7 w-7 rounded border text-xs transition-colors",
                      n <= v
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-border-strong",
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </>
    );

  if (step === 4)
    return (
      <>
        <Head title="Upload your resume" hint="Parsed for projects, claims and measurable outcomes. Used by Resume Doctor and the project round." />
        <div className="max-w-lg rounded-lg border border-dashed border-border-strong bg-surface p-8 text-center">
          <FileUp className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="mt-3 text-[13px] font-medium">Drop a PDF here</p>
          <p className="mt-1 text-xs text-muted-foreground">or click to browse · max 5 MB</p>
        </div>
      </>
    );

  if (step === 5)
    return (
      <>
        <Head title="Connect GitHub" hint="Repository activity validates the project claims on your resume." />
        <div className="max-w-lg space-y-3">
          <button className="focus-ring flex w-full items-center gap-3 rounded-md border border-border bg-surface px-4 py-3 text-left hover:border-border-strong">
            <Github className="h-4 w-4" />
            <span className="text-[13px] font-medium">Connect GitHub account</span>
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
          </button>
          <p className="text-xs text-muted-foreground">Read-only. You can skip and add it later.</p>
        </div>
      </>
    );

  if (step === 6)
    return (
      <>
        <Head title="Link LeetCode" hint="Your solve history seeds the skill graph so the diagnosis starts warm." />
        <div className="max-w-lg space-y-3">
          <Field label="LeetCode username">
            <input className={inputCls} placeholder="dhruv_m" />
          </Field>
          <div className="flex items-center gap-2 rounded-md border border-border bg-surface-muted px-3 py-2 text-xs text-muted-foreground">
            <Code2 className="h-3.5 w-3.5" /> We import counts and topics only — never your solutions.
          </div>
        </div>
      </>
    );

  return (
    <>
      <Head
        title="Your initial profile"
        hint="Provisional until the diagnosis completes. Everything below is measured, not guessed."
      />
      <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
        {[
          { l: "Placement readiness", v: 34, note: "Baseline from imported signals" },
          { l: "Strongest area", v: "Arrays", note: "88 mastery · 41 problems" },
          { l: "Biggest risk", v: "Dynamic Programming", note: "31 mastery · blocked prerequisite" },
          { l: "Plan length", v: "31 days", note: "Ends 12 Sep 2026" },
        ].map((c) => (
          <div key={c.l} className="panel p-4">
            <div className="label-caps">{c.l}</div>
            <div className="num mt-1.5 text-xl font-semibold">{c.v}</div>
            <p className="mt-1 text-xs text-muted-foreground">{c.note}</p>
          </div>
        ))}
      </div>
    </>
  );
}
