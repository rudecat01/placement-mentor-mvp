"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Terminal, 
  LayoutDashboard, 
  Network, 
  Map, 
  Code2, 
  Mic, 
  Building,
  FileText,
  BarChart2
} from "lucide-react";
import { useUIStore } from "@/hooks/use-ui-store";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Skill Graph", href: "/skill-graph", icon: Network },
  { name: "Roadmap", href: "/roadmap", icon: Map },
  { name: "Workspace", href: "/practice/default", icon: Code2 },
  { name: "Interviews", href: "/interview/new", icon: Mic },
  { name: "Company Prep", href: "/company-prep", icon: Building },
  { name: "Resume Doctor", href: "/resume-doctor", icon: FileText },
  { name: "Review Panel", href: "/review", icon: BarChart2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);

  if (!isSidebarOpen) return null; // Simple toggle for now, can be animated later

  return (
    <nav className="bg-surface dark:bg-on-background w-[260px] h-screen fixed left-0 top-0 border-r border-border-subtle dark:border-outline-variant flex flex-col py-8 z-50">
      {/* Brand Header */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-on-primary">
          <Terminal size={18} />
        </div>
        <div>
          <h2 className="font-headline-sm text-[20px] leading-[28px] font-bold text-primary dark:text-primary-fixed">placeMate</h2>
          <p className="font-label-sm text-[12px] leading-[16px] text-secondary">Ready for Google</p>
        </div>
      </div>

      {/* Main Navigation Links */}
      <ul className="flex flex-col gap-1 px-4 flex-grow">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? "text-primary dark:text-primary-fixed font-bold border-r-2 border-primary dark:border-primary-fixed bg-surface-container-low dark:bg-tertiary-container scale-[0.98]"
                    : "text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container-low dark:hover:bg-tertiary-container font-label-md"
                }`}
              >
                <Icon size={20} />
                <span className="text-[14px] leading-[20px]">{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      
      {/* User Profile / Settings (Placeholder from layout) */}
      <div className="px-6 mt-auto border-t border-border-subtle pt-4">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-surface-dim flex items-center justify-center font-bold text-secondary">
              M4
           </div>
           <div>
             <p className="text-sm font-bold text-primary dark:text-primary-fixed">Dhruv</p>
           </div>
        </div>
      </div>
    </nav>
  );
}
