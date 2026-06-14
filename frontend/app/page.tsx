"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const TOPICS: Record<string, string> = {
  arrays:"Arrays", strings:"Strings", trees:"Trees",
  graphs:"Graphs", dp:"Dynamic Programming", communication:"Communication",
};
const TOPIC_COLORS: Record<string, string> = {
  arrays:"#4AFFA4", strings:"#7B6FFF", trees:"#FF9F4A",
  graphs:"#FF5A5A", dp:"#4AAEFF", communication:"#FF70C8",
};

type Mastery = Record<string, number>;
type DayPlan = { day: number; problems: { id:string; title:string; topic:string; difficulty:string }[] };
type WeekPlan = { week: number; focus: string; daily_plan: DayPlan[] };

export default function Dashboard() {
  const router = useRouter();
  const [phase, setPhase] = useState<"onboard"|"analyzing"|"animating"|"ready">("onboard");
  const [resumeText, setResumeText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [mastery, setMastery] = useState<Mastery>({});
  const [roadmap, setRoadmap] = useState<WeekPlan[]>([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [streak, setStreak] = useState(0);
  const [threadId, setThreadId] = useState("");
  const [animStep, setAnimStep] = useState(0);
  const [profile, setProfile] = useState<Record<string,unknown>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let id = localStorage.getItem("pm_thread");
    if (!id) { id = crypto.randomUUID(); localStorage.setItem("pm_thread", id); }
    setThreadId(id);
    fetch(`${API}/state/${id}`).then(r=>r.json()).then(d=>{
      if (d.roadmap && d.roadmap.length > 0) {
        setMastery(d.skill_mastery||{}); setRoadmap(d.roadmap||[]);
        setCurrentDay(d.current_day||1); setProfile(d.user_profile||{});
        setPhase("ready");
      }
    }).catch(()=>{});
    fetch(`${API}/streak/${id}`).then(r=>r.json()).then(d=>setStreak(d.streak||0)).catch(()=>{});
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      const fd = new FormData(); fd.append("file", file);
      const r = await fetch(`${API}/upload-resume`, { method:"POST", body:fd });
      const d = await r.json();
      setResumeText(d.text || "");
    } else {
      setResumeText(await file.text());
    }
  }, []);

  const analyzeResume = async () => {
    if (!resumeText.trim()) return;
    setPhase("analyzing");
    // Step 1: resume analysis
    await fetch(`${API}/chat`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ thread_id: threadId, message: resumeText }),
    });
    // Step 2: generate roadmap
    const r2 = await fetch(`${API}/chat`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ thread_id: threadId, message: "Generate my study roadmap" }),
    });
    const d2 = await r2.json();
    setMastery(d2.skill_mastery||{}); setRoadmap(d2.roadmap||[]);
    setCurrentDay(d2.current_day||1); setProfile(d2.user_profile||{});
    setPhase("animating"); setAnimStep(0);
    // Animate steps 0→6
    let s = 0;
    const iv = setInterval(()=>{ s++; setAnimStep(s); if(s>=6){clearInterval(iv); setPhase("ready");}}, 600);
  };

  // ── Pie chart (SVG) ──────────────────────────────────────────────────────
  const PieChart = ({ data }: { data: Mastery }) => {
    const entries = Object.entries(data);
    if (!entries.length) return null;
    const total = entries.reduce((s,[,v])=>s+v,0);
    let angle = -Math.PI/2;
    const cx=80, cy=80, r=60, inner=32;
    const arcs = entries.map(([k,v])=>{
      const sweep = (v/total)*2*Math.PI;
      const x1=cx+r*Math.cos(angle), y1=cy+r*Math.sin(angle);
      angle+=sweep;
      const x2=cx+r*Math.cos(angle), y2=cy+r*Math.sin(angle);
      const xi1=cx+inner*Math.cos(angle-sweep), yi1=cy+inner*Math.sin(angle-sweep);
      const xi2=cx+inner*Math.cos(angle), yi2=cy+inner*Math.sin(angle);
      const large=sweep>Math.PI?1:0;
      return { k, v, color:TOPIC_COLORS[k]||"#888",
        d:`M${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} L${xi2},${yi2} A${inner},${inner} 0 ${large},0 ${xi1},${yi1}Z` };
    });
    const avg = total/entries.length;
    return (
      <svg viewBox="0 0 160 160" className="w-40 h-40">
        {arcs.map(a=><path key={a.k} d={a.d} fill={a.color} opacity={0.85} className="transition-all duration-700"/>)}
        <text x="80" y="76" textAnchor="middle" fill="#D6DCF0" fontSize="18" fontWeight="bold">{Math.round(avg*100)}%</text>
        <text x="80" y="94" textAnchor="middle" fill="#6B7A99" fontSize="9">avg mastery</text>
      </svg>
    );
  };

  // ── Onboarding screen ────────────────────────────────────────────────────
  if (phase === "onboard") return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{background:"radial-gradient(ellipse at 50% 20%, #0d1829 0%, #080B11 70%)"}}>
      <div className="fade-up text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-4"
          style={{background:"rgba(74,255,164,0.1)", border:"1px solid rgba(74,255,164,0.3)", color:"#4AFFA4"}}>
          ⚡ AI Placement Mentor
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">Crack your dream placement</h1>
        <p style={{color:"#6B7A99"}} className="text-base max-w-md mx-auto">
          Upload your resume — we'll build a personalised DSA roadmap, prep you for interviews, and track your progress.
        </p>
      </div>

      <div className="fade-up w-full max-w-lg" style={{animationDelay:"0.15s"}}>
        <div
          onClick={()=>fileRef.current?.click()}
          onDragOver={e=>{e.preventDefault();setDragOver(true)}}
          onDragLeave={()=>setDragOver(false)}
          onDrop={e=>{e.preventDefault();setDragOver(false);const f=e.dataTransfer.files[0];if(f)handleFile(f);}}
          className="rounded-2xl p-8 text-center cursor-pointer transition-all duration-300"
          style={{
            border: dragOver?"2px solid #4AFFA4":"2px dashed #1E2840",
            background: dragOver?"rgba(74,255,164,0.05)":"rgba(15,20,32,0.6)",
            boxShadow: dragOver?"0 0 30px rgba(74,255,164,0.15)":"none",
          }}>
          <div className="text-4xl mb-3">📄</div>
          <p className="text-white font-medium mb-1">Drop your resume here</p>
          <p style={{color:"#6B7A99"}} className="text-sm">PDF or plain text · or click to browse</p>
          <input ref={fileRef} type="file" accept=".pdf,.txt" className="hidden"
            onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f);}}/>
        </div>

        <div className="flex items-center gap-3 my-4">
          <div style={{height:"1px",flex:1,background:"#1E2840"}}/>
          <span style={{color:"#6B7A99"}} className="text-xs">or paste text</span>
          <div style={{height:"1px",flex:1,background:"#1E2840"}}/>
        </div>

        <textarea
          value={resumeText} onChange={e=>setResumeText(e.target.value)}
          placeholder="Paste your resume text here..."
          rows={6} className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition-all"
          style={{background:"#0F1420", border:"1px solid #1E2840", color:"#D6DCF0",
            fontFamily:"var(--font-sans)"}}
          onFocus={e=>{e.target.style.borderColor="#4AFFA4";}}
          onBlur={e=>{e.target.style.borderColor="#1E2840";}}/>

        <button onClick={analyzeResume} disabled={!resumeText.trim()}
          className="w-full mt-4 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300"
          style={{
            background: resumeText.trim()?"linear-gradient(135deg,#4AFFA4,#2BC87A)":"#1E2840",
            color: resumeText.trim()?"#080B11":"#6B7A99",
            cursor: resumeText.trim()?"pointer":"not-allowed",
          }}>
          Analyse & Build My Roadmap →
        </button>
      </div>
    </div>
  );

  // ── Analyzing / Animating screen ─────────────────────────────────────────
  if (phase === "analyzing" || phase === "animating") {
    const steps = ["Parsing your resume…","Identifying skill gaps…","Calibrating difficulty…","Building your roadmap…","Scheduling problem sets…","Finalising your plan…"];
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6"
        style={{background:"radial-gradient(ellipse at 50% 30%, #0d1829 0%, #080B11 70%)"}}>
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20" style={{animation:"spin-slow 2s linear infinite"}} viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" fill="none" stroke="#1E2840" strokeWidth="4"/>
            <circle cx="40" cy="40" r="36" fill="none" stroke="#4AFFA4" strokeWidth="4"
              strokeDasharray="60 166" strokeLinecap="round"/>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-2xl">🧠</div>
        </div>
        <div className="text-center">
          <p className="text-white font-semibold text-lg mb-2">Building your personalised plan</p>
          <p style={{color:"#4AFFA4"}} className="text-sm font-mono">{steps[Math.min(animStep, steps.length-1)]}</p>
        </div>
        <div className="w-72 space-y-3 mt-4">
          {steps.map((s,i)=>(
            <div key={i} className="flex items-center gap-3 text-sm" style={{opacity: i<=animStep?1:0.25, transition:"opacity 0.5s"}}>
              <span style={{color: i<animStep?"#4AFFA4": i===animStep?"#7B6FFF":"#6B7A99"}}>
                {i<animStep?"✓":i===animStep?"▶":"○"}
              </span>
              <span style={{color: i<=animStep?"#D6DCF0":"#6B7A99"}}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Ready: Main Dashboard ────────────────────────────────────────────────
  const masteryEntries = Object.entries(mastery);
  const avgMastery = masteryEntries.length ? masteryEntries.reduce((s,[,v])=>s+v,0)/masteryEntries.length : 0;
  const totalProblems = roadmap.reduce((s,w)=>s+w.daily_plan.reduce((ss,d)=>ss+d.problems.length,0),0);
  const currentWeek = roadmap.find(w=>w.daily_plan.some(d=>d.day===currentDay));
  const todayPlan = currentWeek?.daily_plan.find(d=>d.day===currentDay);

  return (
    <div className="min-h-screen" style={{background:"radial-gradient(ellipse at 60% 0%, #0d1829 0%, #080B11 60%)"}}>
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">⚡</span>
          <span className="font-mono font-bold text-white">PlacementMentor</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{background:"rgba(255,159,74,0.1)", border:"1px solid rgba(255,159,74,0.3)"}}>
            <span>🔥</span><span style={{color:"#FF9F4A"}} className="font-bold">{streak} day streak</span>
          </div>
          <div style={{color:"#6B7A99"}} className="hidden md:block">
            Day {currentDay} · {(profile.target_role as string)||"SWE"} track
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Hero stats */}
        <div className="fade-up grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {label:"Avg Mastery", value:`${Math.round(avgMastery*100)}%`, color:"#4AFFA4", icon:"📊"},
            {label:"Problems Done", value:`${Math.max(0,currentDay-1)}/${totalProblems}`, color:"#7B6FFF", icon:"✅"},
            {label:"Day Streak", value:`${streak}`, color:"#FF9F4A", icon:"🔥"},
            {label:"Week", value:`${currentWeek?.week||1} of ${roadmap.length||1}`, color:"#4AAEFF", icon:"📅"},
          ].map(s=>(
            <div key={s.label} className="rounded-2xl p-5 roadmap-card"
              style={{background:"#0F1420", border:"1px solid #1E2840"}}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold" style={{color:s.color}}>{s.value}</div>
              <div style={{color:"#6B7A99"}} className="text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Mastery + CTA */}
        <div className="fade-up grid md:grid-cols-2 gap-6" style={{animationDelay:"0.1s"}}>
          {/* Mastery */}
          <div className="rounded-2xl p-6" style={{background:"#0F1420", border:"1px solid #1E2840"}}>
            <h2 className="font-semibold text-white mb-4">Skill Mastery</h2>
            <div className="flex items-center gap-6">
              <PieChart data={mastery}/>
              <div className="flex-1 space-y-2.5">
                {masteryEntries.map(([topic,val])=>(
                  <div key={topic}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{color:"#D6DCF0"}}>{TOPICS[topic]||topic}</span>
                      <span style={{color:TOPIC_COLORS[topic]||"#888"}} className="font-mono">{Math.round(val*100)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{background:"#1E2840"}}>
                      <div className="h-1.5 rounded-full bar-fill transition-all"
                        style={{width:`${Math.min(100,val*100)}%`, background:TOPIC_COLORS[topic]||"#888"}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-4">
            {/* Today's problem preview */}
            {todayPlan && todayPlan.problems.length > 0 && (
              <div className="rounded-2xl p-5 flex-1" style={{background:"rgba(74,255,164,0.05)", border:"1px solid rgba(74,255,164,0.2)"}}>
                <p className="text-xs mb-2" style={{color:"#4AFFA4"}}>TODAY'S PROBLEM</p>
                <p className="font-semibold text-white text-sm">{todayPlan.problems[0].title}</p>
                <p className="text-xs mt-1" style={{color:"#6B7A99"}}>{todayPlan.problems[0].topic} · {todayPlan.problems[0].difficulty}</p>
              </div>
            )}
            <button onClick={()=>router.push("/dsa")}
              className="flex-1 rounded-2xl py-6 font-bold text-lg transition-all duration-300 hover:scale-[1.02]"
              style={{background:"linear-gradient(135deg,#4AFFA4 0%,#2BC87A 100%)", color:"#080B11", boxShadow:"0 8px 32px rgba(74,255,164,0.2)"}}>
              <div className="text-3xl mb-1">💻</div>
              Practice DSA
            </button>
            <button onClick={()=>router.push("/interview")}
              className="flex-1 rounded-2xl py-6 font-bold text-lg transition-all duration-300 hover:scale-[1.02]"
              style={{background:"linear-gradient(135deg,#7B6FFF 0%,#5A50D4 100%)", color:"white", boxShadow:"0 8px 32px rgba(123,111,255,0.2)"}}>
              <div className="text-3xl mb-1">🎤</div>
              Mock Interview
            </button>
          </div>
        </div>

        {/* Roadmap timeline */}
        <div className="fade-up" style={{animationDelay:"0.2s"}}>
          <h2 className="font-semibold text-white mb-4">Your 1-Week Roadmap</h2>
          <div className="space-y-4">
            {roadmap.map((week,wi)=>(
              <div key={wi} className="rounded-2xl p-5 roadmap-card"
                style={{background:"#0F1420", border:"1px solid #1E2840",
                  animationDelay:`${wi*0.12}s`}}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs px-2 py-1 rounded-full"
                    style={{background:"rgba(74,255,164,0.1)", color:"#4AFFA4"}}>Week {week.week}</span>
                  <span style={{color:"#FF9F4A"}} className="text-xs">{week.focus}</span>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {week.daily_plan.map(d=>{
                    const isToday=d.day===currentDay, isPast=d.day<currentDay;
                    return (
                      <div key={d.day} className="text-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-1 transition-all"
                          style={{
                            background: isToday?"#4AFFA4": isPast?"rgba(74,255,164,0.15)":"#1E2840",
                            color: isToday?"#080B11": isPast?"#4AFFA4":"#6B7A99",
                            border: isToday?"2px solid #4AFFA4":"2px solid transparent",
                            boxShadow: isToday?"0 0 12px rgba(74,255,164,0.5)":"none",
                          }}>
                          {isPast?"✓":d.day}
                        </div>
                        {d.problems[0] && <div className="text-[9px] leading-tight" style={{color:"#6B7A99"}}>{d.problems[0].title.split(" ").slice(0,2).join(" ")}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
