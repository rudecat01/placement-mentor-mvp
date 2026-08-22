"use client";

import { useUIStore } from "@/hooks/use-ui-store";
import { Check, PenTool, UploadCloud, ChevronRight, FileCode2, Globe, Loader2 } from "lucide-react";

import { useState } from "react";
import { api } from "@/lib/api";

export default function OnboardingFlow() {
  const step = useUIStore((state) => state.onboardingStep);
  const nextStep = useUIStore((state) => state.nextOnboardingStep);
  const prevStep = useUIStore((state) => state.prevOnboardingStep);

  const [targetRole, setTargetRole] = useState("SDE");
  const [deadline, setDeadline] = useState(45);
  const [timeBudget, setTimeBudget] = useState(120);
  const [githubUsername, setGithubUsername] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [sliderValues, setSliderValues] = useState<Record<string, number>>({
    "Arrays & Hashing": 0.5,
    "Two Pointers": 0.5,
    "Stack": 0.5,
    "Binary Search": 0.5,
    "Sliding Window": 0.5,
    "Linked List": 0.5,
    "Trees": 0.5,
    "Tries": 0.5,
    "Heap / Priority Queue": 0.5,
    "Backtracking": 0.5,
    "Graphs": 0.5,
    "1-D Dynamic Programming": 0.5,
    "Intervals": 0.5,
    "Greedy": 0.5,
    "Advanced Graphs": 0.5,
    "2-D Dynamic Programming": 0.5,
    "Bit Manipulation": 0.5,
    "Math & Geometry": 0.5,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  return (
    <div className="bg-bg-page text-on-surface font-body-md h-screen w-screen overflow-hidden flex flex-col md:flex-row antialiased">
      {/* Left Panel: Context & Progress */}
      <aside className="hidden md:flex w-[340px] lg:w-[400px] bg-surface border-r border-border-subtle flex-col justify-between p-8 relative z-10">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
            <PenTool className="text-on-primary w-5 h-5" />
          </div>
          <span className="font-headline-sm text-[20px] leading-[28px] text-primary tracking-tight font-bold">placeMate</span>
        </div>

        {/* Progress Stepper */}
        <div className="flex-1 mt-16 flex flex-col gap-8">
          <div>
            <h1 className="font-headline-md text-[24px] font-bold text-on-surface mb-2">Initialize Your State</h1>
            <p className="font-body-sm text-[14px] text-on-surface-variant">Calibrate the system to generate your adaptive preparation roadmap.</p>
          </div>

          <div className="flex flex-col gap-6 relative">
            <div className="absolute left-[11px] top-8 bottom-4 w-px bg-border-subtle z-0"></div>
            
            {/* Step 1 */}
            <div className={`flex gap-4 items-start relative z-10 ${step > 1 ? '' : (step === 1 ? '' : 'opacity-50')}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ring-4 ring-surface ${step > 1 ? 'bg-status-success/10 border border-status-success/20 text-status-success' : (step === 1 ? 'bg-primary text-on-primary' : 'border-2 border-border-subtle bg-surface text-on-surface-variant')}`}>
                {step > 1 ? <Check size={14} /> : <span className="text-[12px]">1</span>}
              </div>
              <div>
                <p className={`font-label-md text-[14px] font-medium ${step === 1 ? 'text-primary font-bold' : 'text-on-surface'}`}>Target & Constraints</p>
                <p className="font-body-sm text-[14px] text-on-surface-variant mt-1">Role, deadline, and daily budget.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className={`flex gap-4 items-start relative z-10 ${step > 2 ? '' : (step === 2 ? '' : 'opacity-50')}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ring-4 ring-surface ${step > 2 ? 'bg-status-success/10 border border-status-success/20 text-status-success' : (step === 2 ? 'bg-primary text-on-primary' : 'border-2 border-border-subtle bg-surface text-on-surface-variant')}`}>
                {step > 2 ? <Check size={14} /> : <span className="text-[12px]">2</span>}
              </div>
              <div>
                <p className={`font-label-md text-[14px] font-medium ${step === 2 ? 'text-primary font-bold' : 'text-on-surface'}`}>Skill Assessment</p>
                <p className="font-body-sm text-[14px] text-on-surface-variant mt-1">Self-reported technical baseline.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className={`flex gap-4 items-start relative z-10 ${step > 3 ? '' : (step === 3 ? '' : 'opacity-50')}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ring-4 ring-surface ${step > 3 ? 'bg-status-success/10 border border-status-success/20 text-status-success' : (step === 3 ? 'bg-primary text-on-primary' : 'border-2 border-border-subtle bg-surface text-on-surface-variant')}`}>
                {step > 3 ? <Check size={14} /> : <span className="text-[12px]">3</span>}
              </div>
              <div>
                <p className={`font-label-md text-[14px] font-medium ${step === 3 ? 'text-primary font-bold' : 'text-on-surface'}`}>Evidence Upload</p>
                <p className="font-body-sm text-[14px] text-on-surface-variant mt-1">Resume and external profiles.</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Right Panel: Form Canvas */}
      <main className="flex-1 h-full overflow-y-auto bg-bg-page flex justify-center relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>
        
        <div className="max-w-[760px] w-full px-4 md:px-8 py-12 md:py-16 relative z-10 flex flex-col gap-12">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <PenTool className="text-on-primary w-4 h-4" />
            </div>
            <span className="font-headline-sm text-[20px] font-bold text-primary tracking-tight">placeMate</span>
          </div>

          {/* Form Content based on Step */}
          {step === 1 && (
             <section className="bg-surface border border-border-subtle rounded-xl p-6 md:p-8">
               <div className="mb-8">
                 <h2 className="font-headline-md text-[24px] font-bold text-on-surface">1. Define Target Profile</h2>
                 <p className="font-body-sm text-[14px] text-on-surface-variant mt-2">Select the role you are targeting to load the correct competency map.</p>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {/* Option 1 */}
                  <label className="cursor-pointer group">
                    <input 
                      checked={targetRole === "SDE"}
                      onChange={() => setTargetRole("SDE")}
                      className="peer sr-only" 
                      name="role" 
                      type="radio" 
                      value="sde" 
                    />
                    <div className="h-full border border-border-subtle bg-surface hover:border-outline-variant peer-checked:border-2 peer-checked:border-primary peer-checked:bg-primary-fixed peer-checked:bg-opacity-10 rounded-lg p-4 flex flex-col gap-3 transition-colors">
                      <FileCode2 className="text-on-surface-variant group-hover:text-primary peer-checked:text-primary" />
                      <div>
                        <h3 className="font-label-md text-[14px] font-bold text-on-surface">Software Engineer</h3>
                        <p className="font-body-sm text-[13px] text-on-surface-variant mt-1 leading-tight">Generalist SDE (DSA + Core CS)</p>
                      </div>
                    </div>
                  </label>
                  {/* ... other options would go here */}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block font-label-md text-[14px] font-medium text-on-surface mb-2">Preparation Deadline</label>
                   <select 
                     value={deadline}
                     onChange={(e) => setDeadline(Number(e.target.value))}
                     className="w-full bg-surface border border-border-subtle rounded-lg py-2.5 px-3 font-body-md text-[16px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                   >
                     <option value={45}>Next 45 Days</option>
                     <option value={90}>Next 3 Months</option>
                     <option value={180}>Next 6 Months</option>
                   </select>
                 </div>
                 <div>
                   <label className="block font-label-md text-[14px] font-medium text-on-surface mb-2">Daily Time Budget</label>
                   <select 
                     value={timeBudget}
                     onChange={(e) => setTimeBudget(Number(e.target.value))}
                     className="w-full bg-surface border border-border-subtle rounded-lg py-2.5 px-3 font-body-md text-[16px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                   >
                     <option value={60}>1 Hour / Day</option>
                     <option value={120}>2 Hours / Day</option>
                     <option value={240}>4 Hours / Day</option>
                   </select>
                 </div>
               </div>
             </section>
          )}

          {step === 2 && (
             <section className="bg-surface border border-border-subtle rounded-xl p-6 md:p-8">
               <div className="mb-6 flex justify-between items-end">
                 <div>
                   <h2 className="font-headline-md text-[24px] font-bold text-on-surface">2. Initial Skill Assessment</h2>
                   <p className="font-body-sm text-[14px] text-on-surface-variant mt-2">Estimate current mastery to initialize the graph.</p>
                 </div>
                 <span className="hidden sm:inline-block font-label-sm text-[12px] font-medium text-primary bg-primary-fixed bg-opacity-20 px-2 py-1 rounded">SDE Track Loaded</span>
               </div>
               
                <div className="space-y-6 pt-4 border-t border-border-subtle">
                  {Object.entries(sliderValues).map(([skill, value]) => (
                    <div key={skill}>
                      <div className="flex justify-between items-center mb-2">
                        <label className="font-label-md text-[14px] font-medium text-on-surface">{skill}</label>
                        <span className="font-code-block text-[14px] text-secondary">{value.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={value}
                        onChange={(e) => setSliderValues(prev => ({ ...prev, [skill]: parseFloat(e.target.value) }))}
                        className="w-full accent-primary"
                      />
                      <div className="flex justify-between text-[11px] text-secondary mt-1">
                        <span>Beginner</span><span>Intermediate</span><span>Expert</span>
                      </div>
                    </div>
                  ))}
                </div>
             </section>
          )}

          {step === 3 && (
             <section className="bg-surface border border-border-subtle rounded-xl p-6 md:p-8">
               <div className="mb-8">
                 <h2 className="font-headline-md text-[24px] font-bold text-on-surface">3. Connect Evidence</h2>
                 <p className="font-body-sm text-[14px] text-on-surface-variant mt-2">Provide your historical data for accurate placement.</p>
               </div>
               
               <div className="flex flex-col gap-4">
                 <label className="border border-border-subtle border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-surface-variant transition-colors cursor-pointer relative overflow-hidden">
                    <UploadCloud className="w-8 h-8 text-secondary mb-2" />
                    <p className="font-label-md text-[14px] font-medium text-on-surface">
                      {resumeFileName || "Upload Resume (PDF or TXT)"}
                    </p>
                    <p className="text-[12px] text-on-surface-variant mt-1">
                      {resumeFileName ? "File ready for parsing" : "Extracts projects and tech stack"}
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.txt"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setResumeFileName(file.name);
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const content = event.target?.result as string;
                          setResumeText(content);
                          if (typeof window !== "undefined") {
                            try {
                              localStorage.setItem("placement_mentor_resume_full_text", content);
                            } catch {}
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                 </label>

                 <div className="border border-border-subtle rounded-lg p-4 flex items-center gap-4">
                    <Globe className="w-6 h-6 text-on-surface flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="GitHub Username (optional)"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-[16px] text-on-surface placeholder:text-secondary"
                    />
                 </div>
               </div>
             </section>
          )}

          {/* Error Banner */}
          {error && (
            <div className="bg-error-container/30 border border-status-error/20 text-status-error text-[14px] px-4 py-3 rounded-lg font-body-sm">
              {error}
            </div>
          )}

          {/* Actions Footer */}
          <div className="flex items-center justify-between pb-12 mt-4">
            <button 
              onClick={prevStep}
              disabled={step === 1}
              className={`px-6 py-2.5 rounded-lg border border-border-subtle bg-surface text-on-surface font-label-md text-[14px] font-medium transition-colors ${step === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface-variant'}`}
            >
              Back
            </button>
            <button 
              onClick={async () => {
                if (step < 3) {
                  nextStep();
                } else {
                  setIsLoading(true);
                  setError("");
                  try {
                    // 1. Submit Onboarding Data (parses resume & computes baseline telemetry)
                    const submitPayload = {
                      full_name: resumeFileName ? resumeFileName.replace(/\.[^/.]+$/, "") : "Student",
                      email: "student@placement.ai",
                      target_role: targetRole,
                      target_companies: ["Google", "Microsoft"],
                      daily_time_budget_minutes: timeBudget,
                      target_deadline_days: deadline,
                      preferred_language: "python",
                      self_assessment_sliders: sliderValues,
                      resume_text: resumeText || null,
                      github_username: githubUsername || null,
                    };

                    let initializedState = null;
                    try {
                      const onboardRes = await api.post("/api/onboarding/submit", submitPayload);
                      initializedState = onboardRes.data;
                    } catch {
                      try {
                        const onboardRes = await api.post("/onboarding/submit", submitPayload);
                        initializedState = onboardRes.data;
                      } catch (err2) {
                        console.warn("Backend onboarding submit fallback:", err2);
                      }
                    }

                    // 2. Generate Initial Roadmap with actual student state & parsed resume skills
                    let roadmapData = null;
                    const roadmapPayload = {
                      student_state: initializedState || {
                        profile: { target_role: targetRole, target_companies: ["Google", "Microsoft"] },
                        telemetry: { resume_signals: { extracted_skills: [] } }
                      },
                      skill_graph: {},
                      day_number: 1,
                      daily_budget_minutes: timeBudget,
                      target_role: targetRole,
                      target_companies: ["Google", "Microsoft"]
                    };

                    try {
                      const { data } = await api.post("/roadmap/generate", roadmapPayload);
                      roadmapData = data?.data;
                    } catch {
                      try {
                        const { data } = await api.post("/api/roadmap/generate", roadmapPayload);
                        roadmapData = data?.data;
                      } catch (rErr2) {
                        console.warn("Backend roadmap generation fallback:", rErr2);
                      }
                    }

                    // 3. Fallback roadmap if API was unreachable
                    if (!roadmapData) {
                      roadmapData = {
                        day_number: 1,
                        total_budget_minutes: timeBudget,
                        allocated_minutes: timeBudget,
                        tasks: [
                          {
                            id: `task_${Date.now()}_1`,
                            title: "Dynamic Programming: 1D & 2D Memoization Patterns",
                            topic_id: "dp",
                            topic_name: "Dynamic Programming",
                            track: "DSA",
                            type: "CODING_PRACTICE",
                            difficulty: "MEDIUM",
                            allocated_minutes: Math.round(timeBudget * 0.45),
                            rationale: "Core interview filter topic calibrated for Google and Microsoft technical rounds."
                          },
                          {
                            id: `task_${Date.now()}_2`,
                            title: "Project Architecture & Scalability Deep Dive",
                            topic_id: "system_design",
                            topic_name: "System Architecture",
                            track: "SYSTEM_DESIGN",
                            type: "CONCEPT_REVISION",
                            difficulty: "MEDIUM",
                            allocated_minutes: Math.round(timeBudget * 0.35),
                            rationale: "Analysis of database partitioning, caching layers, and bottlenecks for your resume projects."
                          },
                          {
                            id: `task_${Date.now()}_3`,
                            title: "Live Mock Interview: Stage 1 Background Narrative",
                            topic_id: "interview_prep",
                            topic_name: "Technical Communication",
                            track: "INTERVIEW",
                            type: "MOCK_INTERVIEW",
                            difficulty: "EASY",
                            allocated_minutes: Math.round(timeBudget * 0.20),
                            rationale: "Calibrate your baseline PTG score and verbalize your personal contributions."
                          }
                        ]
                      };
                    }

                    // 4. Invalidate old cache and save new personalized roadmap
                    try {
                      localStorage.removeItem("placement_mentor_roadmap_cache");
                      const roadmapArray = Array.isArray(roadmapData) ? roadmapData : [roadmapData];
                      localStorage.setItem("placement_mentor_roadmap_cache", JSON.stringify(roadmapArray));
                    } catch {}

                    window.location.href = '/dashboard';
                  } catch (e: unknown) {
                    console.error("Onboarding failed", e);
                    // Seamless redirect to dashboard so the user is never blocked
                    window.location.href = '/dashboard';
                  }
                }
              }}
              disabled={isLoading}
              className="px-6 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-[14px] font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isLoading ? (
                <>Generating Roadmap <Loader2 className="w-4 h-4 animate-spin" /></>
              ) : (
                <>{step === 3 ? "Generate Roadmap" : "Continue"} <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
