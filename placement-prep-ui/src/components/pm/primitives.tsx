import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Panel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("panel", className)} {...props}>
      {children}
    </div>
  );
}

export function SectionTitle({
  children,
  action,
  className,
}: {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4", className)}>
      <h2 className="text-sm font-semibold tracking-tight text-foreground">{children}</h2>
      {action}
    </div>
  );
}

export function Meter({
  value,
  tone = "primary",
  className,
  size = "md",
}: {
  value: number;
  tone?: "primary" | "success" | "warning" | "danger" | "neutral";
  className?: string;
  size?: "sm" | "md";
}) {
  const bg = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    neutral: "bg-border-strong",
  }[tone];
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-full bg-muted",
        size === "sm" ? "h-1" : "h-1.5",
        className,
      )}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-700 ease-out", bg)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function Stat({
  label,
  value,
  suffix,
  delta,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: number | string;
  suffix?: string;
  delta?: number;
  tone?: "primary" | "success" | "warning" | "danger" | "neutral";
  hint?: string;
}) {
  const color = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    neutral: "text-foreground",
  }[tone];
  return (
    <div className="min-w-0">
      <div className="label-caps">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className={cn("num text-2xl font-semibold", color)}>{value}</span>
        {suffix ? <span className="text-xs text-muted-foreground">{suffix}</span> : null}
        {typeof delta === "number" ? (
          <span
            className={cn(
              "num text-[11px] font-medium",
              delta >= 0 ? "text-success" : "text-danger",
            )}
          >
            {delta >= 0 ? "+" : ""}
            {delta}
          </span>
        ) : null}
      </div>
      {hint ? <p className="mt-1 text-xs leading-snug text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

const toneMap = {
  neutral: "bg-muted text-muted-foreground border-border",
  primary: "bg-primary-soft text-primary border-transparent",
  success: "bg-success-soft text-success border-transparent",
  warning: "bg-warning-soft text-warning-foreground border-transparent",
  danger: "bg-danger-soft text-danger border-transparent",
  info: "bg-info-soft text-info border-transparent",
  outline: "bg-transparent text-foreground border-border-strong",
} as const;

export function Tag({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof toneMap;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-4",
        toneMap[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="h-8 w-8 rounded-md border border-dashed border-border-strong" />
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function difficultyTone(d: string) {
  if (d.toLowerCase() === "easy") return "success" as const;
  if (d.toLowerCase() === "hard") return "danger" as const;
  return "warning" as const;
}
