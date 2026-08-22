"use client";

import { 
  Building2, 
  Calendar, 
  SlidersHorizontal, 
  TrendingUp, 
  AlertTriangle, 
  ArrowRight, 
  Braces, 
  Cpu, 
  BrainCircuit, 
  CheckCircle2, 
  PlayCircle, 
  Clock, 
  Code 
} from "lucide-react";
import { useRoadmap } from "../../../hooks/queries/useRoadmap";
import { useStudent } from "../../../hooks/queries/useStudent";

export default function CompanyPrep() {
  const { data: roadmap, isLoading: isRoadmapLoading } = useRoadmap();
  const { data: student, isLoading: isStudentLoading } = useStudent();
  
  if (isRoadmapLoading || isStudentLoading) {
    return <div className="p-24 text-center">Loading Company Plan...</div>;
  }

  const todayTasks = roadmap?.[0]?.tasks || [];

  return (
    <div className="flex-1 overflow-y-auto pt-24 pb-margin-desktop px-margin-desktop max-w-[1200px] mx-auto w-full space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-subtle pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-surface-container-low border border-border-subtle px-2 py-1 rounded font-label-sm text-[12px] text-secondary flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              Target: {student?.profile?.targetCompanies?.join(', ') || 'Google'}
            </span>
            <span className="bg-primary/10 text-primary px-2 py-1 rounded font-label-sm text-[12px] flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              {student?.remainingDays || 45} Days Left
            </span>
          </div>
          <h2 className="font-display-lg-mobile md:text-[48px] font-bold text-[36px] text-on-surface leading-tight tracking-tight">Company Dashboard</h2>
        </div>
        <button className="bg-surface border border-border-subtle text-on-surface px-4 py-2 rounded-lg font-label-md text-[14px] font-medium hover:bg-surface-container-low transition-colors shadow-sm flex items-center gap-2">
          <SlidersHorizontal className="w-[18px] h-[18px]" />
          Adjust Strategy
        </button>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Readiness Score Card (Span 4) */}
        <div className="md:col-span-4 bg-surface border border-border-subtle rounded-xl p-6 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-0"></div>
          <h3 className="font-headline-sm text-[20px] font-bold text-on-surface mb-1 relative z-10">Company Readiness</h3>
          <p className="font-body-sm text-[14px] text-secondary mb-6 relative z-10">Current aggregate score for {student?.profile?.targetCompanies?.[0] || 'your target'}.</p>
          
          <div className="flex-1 flex flex-col items-center justify-center relative z-10">
            {/* Circular Progress Indicator */}
            <div className="relative w-40 h-40 flex items-center justify-center mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle className="text-surface-container-high" cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeWidth="8"></circle>
                <circle className="text-primary transition-all duration-1000 ease-in-out" cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeDasharray="282.7" strokeDashoffset="79.15" strokeWidth="8"></circle>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-display-lg-mobile text-[36px] font-bold text-on-surface leading-none">72</span>
                <span className="font-label-sm text-[12px] text-secondary uppercase tracking-wider mt-1">/ 100</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-status-success bg-status-success/10 px-3 py-1 rounded-full">
              <TrendingUp className="w-4 h-4" />
              <span className="font-label-sm text-[12px] font-medium">+4 pts this week</span>
            </div>
          </div>
        </div>

        {/* Breakdown & PTG Alert (Span 8) */}
        <div className="md:col-span-8 flex flex-col gap-6">
          {/* PTG Alert Card */}
          <div className="bg-error-container/30 border border-status-error/20 rounded-xl p-5 flex items-start gap-4">
            <div className="bg-status-error text-on-error p-2 rounded-full flex-shrink-0 mt-1">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-label-md text-[14px] text-[#93000a] font-bold mb-1 flex items-center gap-2">
                System Design Gap
              </h4>
              <p className="font-body-sm text-[14px] text-secondary mb-3">Your practice volume in System Design is currently below the expected threshold for {student?.profile?.targetCompanies?.[0] || 'your target'}. Your PTG (Practice-To-Goal) score is {student?.ptg || 0}.</p>
              <div className="flex gap-3">
                <button className="bg-surface border border-status-error/30 text-status-error px-3 py-1.5 rounded font-label-sm text-[12px] font-medium hover:bg-error-container/50 transition-colors">Start Design Drill</button>
              </div>
            </div>
          </div>

          {/* Round Breakdown */}
          <div className="bg-surface border border-border-subtle rounded-xl p-6 flex-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline-sm text-[20px] font-bold text-on-surface">Round Breakdown</h3>
              <button className="text-primary hover:text-primary-container font-label-sm text-[12px] font-medium flex items-center gap-1 transition-colors">
                View Details <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-5">
              {/* DSA */}
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="font-label-md text-[14px] font-medium text-on-surface flex items-center gap-2">
                    <Braces className="w-[18px] h-[18px] text-secondary" />
                    Data Structures & Algorithms
                  </span>
                  <span className="font-label-sm text-[12px] text-on-surface font-bold">85/100</span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                  <div className="bg-primary h-2 rounded-full transition-all duration-1000" style={{ width: "85%" }}></div>
                </div>
              </div>
              {/* CS Core */}
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="font-label-md text-[14px] font-medium text-on-surface flex items-center gap-2">
                    <Cpu className="w-[18px] h-[18px] text-secondary" />
                    CS Core (OS, Networks)
                  </span>
                  <span className="font-label-sm text-[12px] text-on-surface font-bold">68/100</span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                  <div className="bg-primary h-2 rounded-full transition-all duration-1000" style={{ width: "68%" }}></div>
                </div>
              </div>
              {/* Behavioral */}
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="font-label-md text-[14px] font-medium text-on-surface flex items-center gap-2">
                    <BrainCircuit className="w-[18px] h-[18px] text-secondary" />
                    Behavioral (Googliness)
                  </span>
                  <span className="font-label-sm text-[12px] text-on-surface font-bold">60/100</span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                  <div className="bg-status-warning h-2 rounded-full transition-all duration-1000" style={{ width: "60%" }}></div>
                </div>
                <p className="text-[11px] text-status-warning mt-1 font-medium">Needs attention before mock interviews.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Plan (Span 12) */}
        <div className="md:col-span-12 bg-surface border border-border-subtle rounded-xl p-6">
          <div className="flex items-center justify-between mb-6 border-b border-border-subtle pb-4">
            <h3 className="font-headline-sm text-[20px] font-bold text-on-surface flex items-center gap-2">
              <CheckCircle2 className="text-primary w-5 h-5" />
              Today&apos;s Company Plan
            </h3>
            <span className="bg-surface-container-low px-2 py-1 rounded font-label-sm text-[12px] font-medium text-secondary">Auto-generated based on gaps</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayTasks.map((task) => (
              <div key={task.id} className="border border-border-subtle rounded-lg p-4 hover:border-primary/50 hover:bg-surface-container-low transition-all cursor-pointer group flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-0.5 rounded font-label-sm text-[10px] uppercase tracking-wider font-bold ${
                    task.difficulty === "HARD" ? "bg-status-warning/10 text-status-warning" : "bg-primary/10 text-primary"
                  }`}>
                    {task.difficulty === "HARD" ? "Gap Focus" : "Priority High"}
                  </span>
                  <PlayCircle className="text-secondary group-hover:text-primary w-[18px] h-[18px] transition-colors" />
                </div>
                <h4 className="font-label-md text-[14px] font-bold text-on-surface mb-1">{task.title}</h4>
                <p className="font-body-sm text-[14px] text-secondary flex-1 line-clamp-2">Task allocated for today&apos;s drill based on performance.</p>
                <div className="mt-4 flex items-center gap-3 text-secondary font-label-sm text-[11px]">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {task.allocatedMinutes} mins</span>
                  <span className="flex items-center gap-1"><Code className="w-3.5 h-3.5" /> {task.difficulty}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
