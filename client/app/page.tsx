"use client";

import { Rocket, Award, CheckCircle2, ArrowRight, Search, Map, Code2, BarChart3, Repeat } from "lucide-react";
import { motion } from "framer-motion";
import { useUIStore } from "../hooks/use-ui-store";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  const { openModal } = useUIStore();

  return (
    <div className="bg-bg-page flex flex-col min-h-screen relative w-full">
      {/* Global Navigation (Landing Page Variant) */}
      <nav className="fixed top-0 left-0 w-full h-16 bg-bg-surface border-b border-border-subtle z-50 flex items-center justify-between px-margin-desktop shadow-sm">
        <div className="flex items-center gap-2">
          <Rocket className="text-primary w-6 h-6" />
          <span className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight">placeMate</span>
        </div>
        
        <div className="hidden md:flex items-center font-label-md text-label-md text-on-surface-variant gap-6">
          <div className="flex items-center bg-surface-container p-1 rounded-lg mr-4">
            <button className="px-4 py-1.5 rounded-md bg-surface-container-lowest text-primary font-bold shadow-sm transition-all">
              Role Prep
            </button>
            <Link href="/company-prep-landing" className="px-4 py-1.5 rounded-md text-on-surface-variant hover:text-on-surface transition-all flex items-center gap-1">
              Company Prep
              <Award className="w-[14px] h-[14px] text-status-warning" />
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => openModal("auth")} className="font-label-md text-label-md text-on-surface hover:text-primary transition-colors">Sign In</button>
          <button onClick={() => openModal("auth")} className="bg-primary text-on-primary px-4 py-2 rounded font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm">
            Start Preparing
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16 flex-grow">
        {/* Hero Section */}
        <section className="py-24 px-margin-desktop flex flex-col items-center justify-center text-center max-w-[1200px] mx-auto overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-surface border border-border-subtle rounded-full mb-8"
          >
            <CheckCircle2 className="text-status-success w-4 h-4" />
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">The Standard for placement Readiness</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display-lg text-display-lg md:text-[64px] md:leading-[72px] text-on-surface mb-6 max-w-[900px] text-balance"
          >
            A placement mentor that continuously measures <span className="text-primary relative inline-block">what you can do
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-secondary-container opacity-50" preserveAspectRatio="none" viewBox="0 0 100 10">
                <path d="M0,5 Q50,10 100,5" fill="none" stroke="currentColor" strokeWidth="4"></path>
              </svg>
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-body-lg text-body-lg text-on-surface-variant max-w-[700px] mb-10 text-balance"
          >
            Stop guessing your readiness. Connect your learning, practice, and interview simulations into a single adaptive intelligence engine designed for serious candidates.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center"
          >
            <button onClick={() => openModal("auth")} className="bg-primary text-on-primary h-12 px-8 rounded-lg font-label-md text-label-md flex items-center gap-2 hover:bg-primary-container transition-all hover:scale-[1.02]">
              Start Preparing
              <ArrowRight className="w-[18px] h-[18px]" />
            </button>
          </motion.div>

          {/* Hero Visual Canvas */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-20 w-full max-w-[1024px] h-[500px] bg-surface border border-border-subtle rounded-xl shadow-[0_12px_48px_rgba(0,0,0,0.08)] relative overflow-hidden flex"
          >
            {/* Mockup Left Sidebar */}
            <div className="w-[200px] border-r border-border-subtle bg-surface-container-lowest hidden md:flex flex-col p-4 gap-4">
              <div className="w-24 h-4 bg-surface-variant rounded"></div>
              <div className="space-y-3 mt-4">
                <div className="w-full h-8 bg-surface-variant rounded opacity-50"></div>
                <div className="w-3/4 h-8 bg-surface-variant rounded opacity-30"></div>
                <div className="w-5/6 h-8 bg-surface-variant rounded opacity-30"></div>
              </div>
            </div>
            
            {/* Mockup Main Area */}
            <div className="flex-grow relative bg-page">
              <div className="absolute inset-0 z-10 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>
              <div className="relative z-0 w-full h-full flex items-center justify-center bg-black">
                 <Image src="/dag-mockup.jpg" alt="Skill Graph DAG" fill className="object-cover opacity-90 mix-blend-screen" />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Core Loop Section */}
        <section className="py-24 bg-surface border-y border-border-subtle" id="core-loop">
          <div className="max-w-[1200px] mx-auto px-margin-desktop">
            <div className="text-center mb-16">
              <h2 className="font-display-lg-mobile text-display-lg-mobile md:font-headline-md md:text-[32px] text-on-surface mb-4">The Evidence-Based Loop</h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">Move beyond generic roadmaps. Every action you take feeds back into an adaptive system that replans your strategy daily.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-[40px] left-[10%] right-[10%] h-[2px] bg-border-subtle z-0"></div>
              
              {/* Steps */}
              {[
                { icon: Search, title: "Diagnose", desc: "Multi-source skill extraction." },
                { icon: Map, title: "Plan", desc: "Time-boxed daily roadmaps." },
                { icon: Code2, title: "Practice", desc: "IDE-grade isolated sandbox.", active: true },
                { icon: BarChart3, title: "Evaluate", desc: "BKT mastery & transfer gaps." },
                { icon: Repeat, title: "Adapt", desc: "Red/Blue team interventions." }
              ].map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="relative z-10 flex flex-col items-center text-center group">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-sm transition-colors ${step.active ? "bg-primary-fixed border border-primary-fixed-dim" : "bg-surface border border-border-subtle group-hover:border-primary"}`}>
                      <Icon className={`w-8 h-8 ${step.active ? "text-primary" : "text-on-surface-variant group-hover:text-primary transition-colors"}`} />
                    </div>
                    <h3 className="font-label-md text-label-md font-bold text-on-surface mb-2">{step.title}</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
