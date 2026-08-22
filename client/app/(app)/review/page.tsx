"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Zap,
  Target,
  Calendar,
  RefreshCw,
  ChevronRight,
  BarChart2,
} from "lucide-react";
import { useLoadSummary } from "../../../hooks/queries/useLoadSummary";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/* ─────────────────── helpers ─────────────────── */

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    ON_TRACK: {
      label: "On Track",
      cls: "bg-green-100 text-green-700 border border-green-200",
      icon: <CheckCircle size={14} />,
    },
    AT_RISK: {
      label: "At Risk",
      cls: "bg-orange-100 text-orange-700 border border-orange-200",
      icon: <AlertTriangle size={14} />,
    },
    OVERLOADED: {
      label: "Overloaded",
      cls: "bg-red-100 text-red-700 border border-red-200",
      icon: <AlertTriangle size={14} />,
    },
  };
  const cfg = map[status] ?? map["AT_RISK"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${cfg.cls}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function TopicStatusDot({ status }: { status: string }) {
  const cls =
    status === "COMPLETE"
      ? "bg-green-500"
      : status === "CRITICAL"
      ? "bg-red-500 animate-pulse"
      : status === "AT_RISK"
      ? "bg-orange-400"
      : "bg-blue-400";
  return <span className={`w-2 h-2 rounded-full shrink-0 ${cls}`} />;
}

/* ─────────────────── Circular Gauge ─────────────────── */

function CapacityGauge({ ratio }: { ratio: number }) {
  const clampedRatio = Math.min(ratio, 1.5);
  const pct = Math.min(clampedRatio / 1.5, 1); // normalise to 0-1 for display
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct);

  const color =
    ratio < 0.85
      ? "#22c55e"  // green
      : ratio <= 1.0
      ? "#f97316" // orange
      : "#ef4444"; // red

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width="160" height="160" className="-rotate-90">
        {/* Track */}
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
        {/* Arc */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.4s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-on-surface" style={{ color }}>
          {Math.round(ratio * 100)}%
        </span>
        <span className="text-xs text-secondary">Load / Capacity</span>
      </div>
    </div>
  );
}

/* ─────────────────── Topic Row ─────────────────── */

function TopicRow({ t }: { t: any }) {
  const pct = Math.round(t.current_mastery * 100);
  const barColor =
    t.status === "COMPLETE"
      ? "bg-green-500"
      : t.status === "CRITICAL"
      ? "bg-red-500"
      : t.status === "AT_RISK"
      ? "bg-orange-400"
      : "bg-blue-400";

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border-subtle last:border-none">
      <TopicStatusDot status={t.status} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-on-surface truncate">{t.topic_name}</span>
          <span className="text-xs text-secondary shrink-0 ml-2">{pct}% / 80%</span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-container-low overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className="text-xs text-secondary w-16 text-right shrink-0">
        {t.status === "COMPLETE" ? "Done" : `${t.daily_contribution_minutes}m/day`}
      </span>
    </div>
  );
}

/* ─────────────────── Main Page ─────────────────── */

export default function ReviewPanel() {
  const { data, isLoading, refetch } = useLoadSummary();
  const router = useRouter();

  const [budgetInput, setBudgetInput] = useState<number | "">("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleBudgetSave = async () => {
    if (!budgetInput || budgetInput < 15) return;
    setSaving(true);
    try {
      await axios.patch(
        `${API_BASE}/api/review/update-budget?user_id=usr_demo123&daily_budget_minutes=${budgetInput}`
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      refetch();
    } finally {
      setSaving(false);
    }
  };

  /* Loading */
  if (isLoading || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-screen bg-bg-page pt-16 gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-secondary text-sm">Computing your load index…</p>
      </div>
    );
  }

  const {
    name,
    capacity_minutes,
    daily_load_minutes,
    overload_ratio,
    load_status,
    remaining_days,
    projected_days_needed,
    deadline_met,
    ptg,
    topic_loads,
    top_bottlenecks,
    total_minutes_remaining,
    completed_topics,
    total_topics,
  } = data;

  return (
    <div className="flex-1 flex flex-col bg-bg-page pt-16 min-h-screen">
      {/* ── Header ── */}
      <div className="border-b border-border-subtle bg-surface px-8 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-on-surface flex items-center gap-2">
              <BarChart2 size={24} className="text-primary" />
              Load &amp; Capacity Review
            </h1>
            <p className="text-sm text-secondary mt-0.5">
              Preparation workload analysis for <span className="font-medium text-on-surface">{name}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={load_status} />
            <button
              onClick={() => refetch()}
              className="p-2 rounded-lg hover:bg-surface-container-low text-secondary transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-8 py-6 space-y-6">

        {/* ── PTG Warning ── */}
        {ptg > 0.20 && (
          <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl p-4">
            <AlertTriangle size={18} className="text-orange-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-orange-700">Practice Transfer Gap Detected</p>
              <p className="text-sm text-orange-600 mt-0.5">
                Your PTG is <strong>{Math.round(ptg * 100)}%</strong> — you're struggling to transfer practice skills to real problems. Load estimates are inflated to account for extra remedial time.
              </p>
            </div>
          </div>
        )}

        {/* ── Top Metrics Row ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Capacity Gauge */}
          <div className="md:col-span-1 bg-surface rounded-2xl border border-border-subtle p-6 flex flex-col items-center gap-2 shadow-sm">
            <CapacityGauge ratio={overload_ratio} />
            <p className="text-xs text-secondary text-center">
              {daily_load_minutes} min/day needed · {capacity_minutes} min/day available
            </p>
          </div>

          {/* Stats Cards */}
          <div className="md:col-span-3 grid grid-cols-3 gap-4">
            <div className="bg-surface rounded-2xl border border-border-subtle p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Clock size={16} className="text-blue-500" />
                </div>
                <span className="text-xs font-medium text-secondary uppercase tracking-wide">Daily Budget</span>
              </div>
              <p className="text-3xl font-bold text-on-surface">{capacity_minutes}<span className="text-base font-normal text-secondary ml-1">min</span></p>
              <p className="text-xs text-secondary mt-1">Your daily prep capacity</p>
            </div>

            <div className="bg-surface rounded-2xl border border-border-subtle p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Calendar size={16} className="text-purple-500" />
                </div>
                <span className="text-xs font-medium text-secondary uppercase tracking-wide">Deadline</span>
              </div>
              <p className="text-3xl font-bold text-on-surface">{remaining_days}<span className="text-base font-normal text-secondary ml-1">days</span></p>
              <p className={`text-xs mt-1 font-medium ${deadline_met ? "text-green-600" : "text-red-500"}`}>
                {deadline_met
                  ? `✓ Ready in ${projected_days_needed}d`
                  : `⚠ Needs ${projected_days_needed}d (${projected_days_needed - remaining_days}d over)`}
              </p>
            </div>

            <div className="bg-surface rounded-2xl border border-border-subtle p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <Target size={16} className="text-green-500" />
                </div>
                <span className="text-xs font-medium text-secondary uppercase tracking-wide">Progress</span>
              </div>
              <p className="text-3xl font-bold text-on-surface">{completed_topics}<span className="text-sm font-normal text-secondary ml-1">/ {total_topics}</span></p>
              <p className="text-xs text-secondary mt-1">topics at 80%+ mastery</p>
            </div>
          </div>
        </div>

        {/* ── Bottom Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Top Bottlenecks */}
          <div className="bg-surface rounded-2xl border border-border-subtle p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={18} className="text-red-500" />
              <h2 className="font-semibold text-on-surface">Top Bottlenecks</h2>
            </div>
            <p className="text-xs text-secondary mb-4">Your 3 highest-demand topics right now.</p>
            <div className="space-y-3">
              {top_bottlenecks.map((t: any) => (
                <div
                  key={t.topic_id}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-border-subtle hover:border-primary transition-colors group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <TopicStatusDot status={t.status} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-on-surface truncate">{t.topic_name}</p>
                      <p className="text-xs text-secondary">{Math.round(t.current_mastery * 100)}% mastery · {t.daily_contribution_minutes}m/day</p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push("/practice/default")}
                    className="shrink-0 flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Focus <ChevronRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Full Topic Breakdown */}
          <div className="lg:col-span-2 bg-surface rounded-2xl border border-border-subtle p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-primary" />
                <h2 className="font-semibold text-on-surface">Topic Load Breakdown</h2>
              </div>
              <span className="text-xs text-secondary bg-surface-container-low px-2 py-1 rounded-full">
                {total_minutes_remaining} min remaining total
              </span>
            </div>
            <div className="overflow-y-auto max-h-72 pr-1">
              {topic_loads.map((t: any) => (
                <TopicRow key={t.topic_id} t={t} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Budget Rebalance ── */}
        <div className="bg-surface rounded-2xl border border-border-subtle p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw size={18} className="text-secondary" />
            <h2 className="font-semibold text-on-surface">Rebalance Daily Budget</h2>
          </div>
          <p className="text-sm text-secondary mb-4">
            Adjust how many minutes per day you can dedicate to prep. The overload ratio and projected deadline will update immediately.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={15}
              max={600}
              step={15}
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder={`Current: ${capacity_minutes} min/day`}
              className="w-48 px-3 py-2 text-sm rounded-lg border border-border-subtle bg-surface-container-low focus:outline-none focus:border-primary transition-colors"
            />
            <button
              onClick={handleBudgetSave}
              disabled={saving || !budgetInput}
              className="px-4 py-2 bg-primary text-on-primary text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {saving ? "Saving…" : saved ? "✓ Saved!" : "Update Budget"}
            </button>
            <span className="text-xs text-secondary">
              {budgetInput && Number(budgetInput) > 0
                ? `New overload ratio: ${((daily_load_minutes / Number(budgetInput)) * 100).toFixed(0)}%`
                : ""}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
