"use client";

import { Award, Search, Rocket, Lock, PlayCircle, Code2, Users, Target } from "lucide-react";
import Link from "next/link";
import { useUIStore } from "../../hooks/use-ui-store";

export default function CompanyPrepLanding() {
  const { openModal } = useUIStore();

  return (
    <div className="bg-bg-page flex flex-col min-h-screen relative w-full pt-16">
      {/* Global Navigation (Landing Page Variant) */}
      <nav className="fixed top-0 left-0 w-full h-16 bg-bg-surface border-b border-border-subtle z-50 flex items-center justify-between px-margin-desktop shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <Rocket className="text-primary w-6 h-6" />
          <span className="font-headline-sm text-[20px] font-bold text-primary tracking-tight">placeMate</span>
        </Link>
        <div className="flex items-center gap-4">
          <button onClick={() => openModal("auth")} className="font-label-md text-[14px] font-medium text-on-surface hover:text-primary transition-colors">Sign In</button>
          <button onClick={() => openModal("auth")} className="bg-primary text-on-primary px-4 py-2 rounded font-label-md text-[14px] font-medium hover:bg-primary-container transition-colors shadow-sm">
            Upgrade to Premium
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-margin-desktop flex flex-col md:flex-row items-center gap-12 max-w-[1200px] mx-auto w-full">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-low border border-status-warning/30 rounded-full">
            <Award className="text-status-warning w-4 h-4" />
            <span className="font-label-sm text-[12px] font-medium text-status-warning uppercase tracking-wider">Premium Feature</span>
          </div>
          
          <h1 className="font-display-lg text-[48px] font-bold text-on-surface leading-tight">
            Crack <span className="text-primary relative inline-block">MAANG
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-secondary-container opacity-50" preserveAspectRatio="none" viewBox="0 0 100 10">
                <path d="M0,5 Q50,10 100,5" fill="none" stroke="currentColor" strokeWidth="4"></path>
              </svg>
            </span> Interviews.
          </h1>
          
          <p className="font-body-lg text-[18px] text-on-surface-variant max-w-xl leading-relaxed">
            Stop generic practice. Unlock company-specific roadmaps, exact interview patterns, and AI-simulated behavioral rounds tailored for Google, Amazon, Microsoft, and more.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button onClick={() => openModal("auth")} className="bg-primary text-on-primary h-12 px-8 rounded-lg font-label-md text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-primary-container transition-all shadow-sm">
              Unlock Company Prep
              <Lock className="w-4 h-4" />
            </button>
            <button className="bg-surface text-on-surface border border-border-subtle h-12 px-8 rounded-lg font-label-md text-[14px] font-medium flex items-center justify-center hover:bg-surface-container transition-colors">
              View Supported Companies
            </button>
          </div>
        </div>
        
        {/* Right side graphic placeholder */}
        <div className="flex-1 w-full max-w-md bg-surface border border-border-subtle rounded-2xl p-6 shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-0"></div>
           <div className="flex items-center gap-4 mb-6 relative z-10">
             <div className="w-12 h-12 bg-surface-container-highest rounded-lg flex items-center justify-center">
               <span className="font-display-lg-mobile text-[24px] font-bold text-secondary">G</span>
             </div>
             <div>
               <h3 className="font-headline-sm text-[20px] font-bold text-on-surface">Target: Google</h3>
               <p className="font-label-sm text-[12px] text-secondary">Software Engineer, L4</p>
             </div>
           </div>
           
           <div className="space-y-4 relative z-10">
             <div className="flex justify-between items-center bg-surface-container-low p-3 rounded-lg border border-border-subtle">
               <div className="flex items-center gap-3">
                 <div className="bg-primary/10 p-2 rounded-full text-primary"><Code2 className="w-4 h-4" /></div>
                 <div>
                   <p className="font-label-md text-[14px] font-bold text-on-surface">System Design</p>
                   <p className="font-label-sm text-[11px] text-secondary">25 hours needed</p>
                 </div>
               </div>
               <span className="font-label-md text-[14px] text-status-warning font-bold">Gap</span>
             </div>
             
             <div className="flex justify-between items-center bg-surface-container-low p-3 rounded-lg border border-border-subtle opacity-50">
               <div className="flex items-center gap-3">
                 <div className="bg-surface-container-highest p-2 rounded-full text-secondary"><Users className="w-4 h-4" /></div>
                 <div>
                   <p className="font-label-md text-[14px] font-bold text-on-surface">Googliness</p>
                   <p className="font-label-sm text-[11px] text-secondary">Locked</p>
                 </div>
               </div>
               <Lock className="w-4 h-4 text-secondary" />
             </div>
           </div>
           
           <div className="mt-6 pt-6 border-t border-border-subtle">
             <button className="w-full bg-surface-container text-secondary h-10 rounded font-label-md text-[14px] flex items-center justify-center gap-2 cursor-not-allowed">
               Start Today&apos;s Plan <Lock className="w-4 h-4" />
             </button>
           </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-surface border-t border-border-subtle py-20 px-margin-desktop">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-headline-md text-[32px] font-bold text-on-surface mb-4">What&apos;s inside Premium?</h2>
            <p className="font-body-md text-[16px] text-on-surface-variant max-w-2xl mx-auto">Everything you need to cross the finish line for specific tier-1 companies.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface-container-lowest border border-border-subtle p-6 rounded-xl hover:border-primary/50 transition-colors">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center text-primary mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-headline-sm text-[20px] font-bold text-on-surface mb-2">Targeted PTG Analysis</h3>
              <p className="font-body-sm text-[14px] text-secondary">We compare your current mastery graph against the specific historical bar for your target company and level.</p>
            </div>
            
            <div className="bg-surface-container-lowest border border-border-subtle p-6 rounded-xl hover:border-primary/50 transition-colors">
              <div className="bg-blue-team/10 w-12 h-12 rounded-lg flex items-center justify-center text-blue-team mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-headline-sm text-[20px] font-bold text-on-surface mb-2">Company Question Banks</h3>
              <p className="font-body-sm text-[14px] text-secondary">Access highly probable questions filtered by recency and frequency for your specific target role.</p>
            </div>
            
            <div className="bg-surface-container-lowest border border-border-subtle p-6 rounded-xl hover:border-primary/50 transition-colors">
              <div className="bg-status-warning/10 w-12 h-12 rounded-lg flex items-center justify-center text-status-warning mb-4">
                <PlayCircle className="w-6 h-6" />
              </div>
              <h3 className="font-headline-sm text-[20px] font-bold text-on-surface mb-2">Behavioral Simulators</h3>
              <p className="font-body-sm text-[14px] text-secondary">Practice Leadership Principles and specific cultural fit questions with an AI interviewer tuned to their rubrics.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
