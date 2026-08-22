import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Route as RouteIcon,
  Network,
  Code2,
  Mic,
  FileText,
  Library,
  Building2,
  ShieldHalf,
  Search,
  Flame,
  ChevronRight,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { student } from "@/lib/mock-data";
import { Meter } from "@/components/pm/primitives";

const nav = [
  {
    section: "Prepare",
    items: [
      { to: "/dashboard", label: "Today", icon: LayoutDashboard },
      { to: "/roadmap", label: "Roadmap", icon: RouteIcon },
      { to: "/skills", label: "Skill graph", icon: Network },
      { to: "/practice", label: "Practice", icon: Code2 },
    ],
  },
  {
    section: "Evaluate",
    items: [
      { to: "/interview", label: "Interview", icon: Mic },
      { to: "/report", label: "Reports", icon: FileText },
      { to: "/teams", label: "Blue / Red team", icon: ShieldHalf },
    ],
  },
  {
    section: "Target",
    items: [
      { to: "/companies", label: "Company prep", icon: Building2 },
      { to: "/resources", label: "Resources", icon: Library },
      { to: "/resume", label: "Resume doctor", icon: FileText },
    ],
  },
];

const allItems = nav.flatMap((g) => g.items);

export function AppShell({
  children,
  breadcrumb,
  actions,
}: {
  children: ReactNode;
  breadcrumb: string[];
  actions?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] flex-col border-r border-border bg-sidebar lg:flex">
        <div className="flex h-14 items-center gap-2 px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded bg-primary text-[11px] font-bold text-primary-foreground">
              PM
            </span>
            <span className="text-[13px] font-semibold tracking-tight">Placement Mentor</span>
          </Link>
        </div>

        <div className="px-3">
          <button
            onClick={() => setOpen(true)}
            className="focus-ring flex w-full items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-border-strong"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1">Search or jump to…</span>
            <kbd className="num rounded border border-border px-1 text-[10px]">⌘K</kbd>
          </button>
        </div>

        <nav className="mt-5 flex-1 space-y-6 overflow-y-auto px-3 pb-4">
          {nav.map((group) => (
            <div key={group.section}>
              <div className="label-caps px-2.5 pb-1.5">{group.section}</div>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname.startsWith(item.to);
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className={cn(
                          "focus-ring group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
                          active
                            ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                            : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                        )}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r bg-primary" />
                        )}
                        <item.icon className={cn("h-4 w-4", active && "text-primary")} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-baseline justify-between">
            <span className="label-caps">Readiness</span>
            <span className="num text-xs font-semibold">{student.placementReadiness}</span>
          </div>
          <Meter value={student.placementReadiness} size="sm" className="mt-2" />
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Flame className="h-3.5 w-3.5 text-primary" />
            {student.streak}-day streak · {student.deadlineDays} days left
          </div>
        </div>
      </aside>

      <div className="lg:pl-[232px]">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur md:px-8">
          <Link to="/dashboard" className="text-[13px] font-semibold lg:hidden">
            PM
          </Link>
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[13px]">
            {breadcrumb.map((crumb, i) => (
              <span key={crumb} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />}
                <span
                  className={cn(
                    "truncate",
                    i === breadcrumb.length - 1
                      ? "font-medium text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {crumb}
                </span>
              </span>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {actions}
            <button
              onClick={() => setOpen(true)}
              className="focus-ring grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground lg:hidden"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-foreground text-[11px] font-semibold text-background">
              {student.name.slice(0, 1)}
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>

        <nav className="sticky bottom-0 z-20 flex items-center justify-around border-t border-border bg-surface px-2 py-1.5 lg:hidden">
          {allItems.slice(0, 5).map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-md px-2 py-1 text-[10px]",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Jump to a screen, skill or action…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Navigate">
            {allItems.map((item) => (
              <CommandItem
                key={item.to}
                value={item.label}
                onSelect={() => {
                  setOpen(false);
                  navigate({ to: item.to });
                }}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => { setOpen(false); navigate({ to: "/practice" }); }}>
              Start today&apos;s mission
            </CommandItem>
            <CommandItem onSelect={() => { setOpen(false); navigate({ to: "/interview" }); }}>
              Run a mock interview
            </CommandItem>
            <CommandItem onSelect={() => { setOpen(false); navigate({ to: "/resume" }); }}>
              Review my resume
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  right,
}: {
  title: string;
  description?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border px-4 py-6 md:px-8">
      <div className="max-w-2xl">
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {right}
    </div>
  );
}
