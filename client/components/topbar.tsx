"use client";

import { Search, Bell, Settings2 } from "lucide-react";

export function Topbar() {
  return (
    <header className="bg-surface dark:bg-on-background fixed top-0 right-0 w-[calc(100%-260px)] h-16 border-b border-border-subtle dark:border-outline-variant flex items-center justify-between px-8 z-40">
      {/* Search Bar */}
      <div className="flex-1 max-w-md relative flex items-center">
        <Search className="absolute left-3 text-secondary w-5 h-5" />
        <input 
          className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-border-subtle rounded-md font-body-sm text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-fixed transition-shadow placeholder:text-outline" 
          placeholder="Search resources, topics, or commands (⌘K)" 
          type="text" 
        />
      </div>

      {/* Trailing Actions */}
      <div className="flex items-center gap-4">
        <button className="text-on-surface-variant dark:text-on-tertiary-container hover:text-primary dark:hover:text-primary-fixed-dim transition-colors relative flex items-center justify-center w-8 h-8 rounded-full">
          <Bell className="w-[20px] h-[20px]" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-status-error rounded-full border border-surface"></span>
        </button>
        <button className="text-on-surface-variant dark:text-on-tertiary-container hover:text-primary dark:hover:text-primary-fixed-dim transition-colors flex items-center justify-center w-8 h-8 rounded-full border border-border-subtle bg-surface-container-low">
          <Settings2 className="w-[18px] h-[18px]" />
        </button>
        <div className="h-8 w-px bg-border-subtle mx-2"></div>
        <button className="flex items-center gap-2 focus:ring-2 focus:ring-primary dark:focus:ring-primary-fixed rounded-full">
          <div className="w-8 h-8 rounded-full bg-primary-fixed text-primary font-bold text-[12px] flex items-center justify-center border border-border-subtle">
            M4
          </div>
        </button>
      </div>
    </header>
  );
}
