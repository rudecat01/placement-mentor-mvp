"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Problem = {
  id: string; title: string; topic: string; difficulty: string;
  statement: string; leetcode_url: string; hints: string[];
};
type Mastery = Record<string, number>;

const DIFF_COLOR: Record<string,string> = { easy:"#4AFFA4", medium:"#FF9F4A", hard:"#FF5A5A" };
const TOPIC_COLORS: Record<string,string> = {
  arrays:"#4AFFA4", strings:"#7B6FFF", trees:"#FF9F4A", graphs:"#FF5A5A", dp:"#4AAEFF", communication:"#FF70C8",
};

export default function DSAPage() {
  const router = useRouter();
  const [threadId, setThreadId] = useState("");
  const [problem, setProblem] = useState<Problem|null>(null);
  const [code, setCode] = useState("# Write your solution here\n\n");
  const [mastery, setMastery] = useState<Mastery>({});
  const [hintLevel, setHintLevel] = useState(0);
  const [hint, setHint] = useState("");
  const [verdict, setVerdict] = useState<{verdict:string;feedback:string;complexity_estimate:string}|null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [masteryAnim, setMasteryAnim] = useState<string|null>(null);
  const [tab, setTab] = useState<"problem"|"code">("problem");
  const [currentDay, setCurrentDay] = useState(1);

  useEffect(() => {
    const id = localStorage.getItem("pm_thread") || "";
    setThreadId(id);
    if (!id) { router.push("/"); return; }
    loadProblem(id);
    fetch(`${API}/state/${id}`).then(r=>r.json()).then(d=>{
      setMastery(d.skill_mastery||{}); setCurrentDay(d.current_day||1);
    });
  }, []);

  const loadProblem = async (tid: string) => {
    setLoading(true); setVerdict(null); setHint(""); setHintLevel(0);
    try {
      const r = await fetch(`${API}/dsa/next`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ thread_id: tid }),
      });
      const d = await r.json();
      if (d.problem) { setProblem(d.problem); setCurrentDay(d.current_day||1); }
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const getHint = async () => {
    if (!problem) return;
    const next = hintLevel + 1;
    const r = await fetch(`${API}/dsa/hint?problem_id=${problem.id}&level=${next}`, { method:"POST" });
    const d = await r.json();
    setHint(d.hint || ""); setHintLevel(next);
  };

  const submitCode = async () => {
    if (!problem || !code.trim() || submitting) return;
    setSubmitting(true); setVerdict(null);
    const r = await fetch(`${API}/dsa/submit`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ thread_id: threadId, problem_id: problem.id, code }),
    });
    const d = await r.json();
    setVerdict({ verdict: d.verdict, feedback: d.feedback, complexity_estimate: d.complexity_estimate });
    if (d.skill_mastery) {
      setMastery(d.skill_mastery);
      setMasteryAnim(problem.topic);
      setTimeout(()=>setMasteryAnim(null), 2000);
    }
    setSubmitting(false);
  };

  const nextProblem = () => { setProblem(null); setVerdict(null); setCode("# Write your solution here\n\n"); setHint(""); setHintLevel(0); loadProblem(threadId); };

  const VERDICT_STYLE: Record<string,{bg:string,border:string,color:string,icon:string}> = {
    correct:         {bg:"rgba(74,255,164,0.08)", border:"rgba(74,255,164,0.3)", color:"#4AFFA4", icon:"✅"},
    partially_correct:{bg:"rgba(255,159,74,0.08)", border:"rgba(255,159,74,0.3)", color:"#FF9F4A", icon:"🔶"},
    incorrect:       {bg:"rgba(255,90,90,0.08)",  border:"rgba(255,90,90,0.3)",  color:"#FF5A5A", icon:"❌"},
  };

  return (
    <div className="min-h-screen" style={{background:"#080B11"}}>
      {/* Nav */}
      <header className="glass sticky top-0 z-50 px-6 py-3.5 flex items-center gap-4">
        <button onClick={()=>router.push("/")} className="text-sm hover:opacity-70 transition-opacity"
          style={{color:"#6B7A99"}}>← Dashboard</button>
        <span style={{color:"#1E2840"}}>|</span>
        <span className="font-mono font-bold" style={{color:"#4AFFA4"}}>DSA Practice</span>
        <span className="ml-auto text-xs" style={{color:"#6B7A99"}}>Day {currentDay}</span>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Left: problem + code */}
        <div className="flex-1 min-w-0 space-y-4">
          {loading ? (
            <div className="rounded-2xl p-12 text-center" style={{background:"#0F1420", border:"1px solid #1E2840"}}>
              <div className="text-4xl mb-3 animate-bounce">🧠</div>
              <p style={{color:"#6B7A99"}}>Loading today's problem…</p>
            </div>
          ) : problem ? (<>
            {/* Mobile tab switcher */}
            <div className="flex rounded-xl overflow-hidden border lg:hidden" style={{borderColor:"#1E2840"}}>
              {(["problem","code"] as const).map(t=>(
                <button key={t} onClick={()=>setTab(t)} className="flex-1 py-2 text-sm font-medium transition-colors"
                  style={{background: tab===t?"#4AFFA4":  "#0F1420", color: tab===t?"#080B11":"#6B7A99"}}>
                  {t==="problem"?"Problem":"Code Editor"}
                </button>
              ))}
            </div>

            {/* Problem panel */}
            <div className={`rounded-2xl p-6 ${tab==="code"?"hidden lg:block":""}`}
              style={{background:"#0F1420", border:"1px solid #1E2840"}}>
              <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full font-mono"
                      style={{background:DIFF_COLOR[problem.difficulty]+"20", color:DIFF_COLOR[problem.difficulty]}}>
                      {problem.difficulty}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{background:TOPIC_COLORS[problem.topic]+"20", color:TOPIC_COLORS[problem.topic]}}>
                      {problem.topic}
                    </span>
                  </div>
                  <h1 className="text-xl font-bold text-white">{problem.title}</h1>
                </div>
                {problem.leetcode_url ? (
                  <a href={problem.leetcode_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
                    style={{background:"rgba(255,159,74,0.1)", color:"#FF9F4A", border:"1px solid rgba(255,159,74,0.2)"}}>
                    Open LeetCode ↗
                  </a>
                ) : (
                  <span className="text-xs px-3 py-1.5 rounded-lg cursor-not-allowed"
                    style={{background:"rgba(255,159,74,0.05)", color:"#6B7A99", border:"1px solid rgba(255,159,74,0.1)"}}
                    title="No LeetCode link available for this problem">
                    Open LeetCode ↗
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed" style={{color:"#D6DCF0"}}>{problem.statement}</p>

              {/* Hints */}
              <div className="mt-5">
                {hint && (
                  <div className="rounded-xl p-4 mb-3 text-sm" style={{background:"rgba(123,111,255,0.08)", border:"1px solid rgba(123,111,255,0.2)", color:"#D6DCF0"}}>
                    <span style={{color:"#7B6FFF"}} className="font-medium">Hint {hintLevel}:</span> {hint}
                  </div>
                )}
                {hintLevel < (problem.hints?.length||0) && (
                  <button onClick={getHint} className="text-xs px-4 py-2 rounded-lg transition-all hover:opacity-80"
                    style={{background:"rgba(123,111,255,0.1)", color:"#7B6FFF", border:"1px solid rgba(123,111,255,0.2)"}}>
                    💡 Hint {hintLevel+1} of {problem.hints.length}
                  </button>
                )}
              </div>
            </div>

            {/* Code editor */}
            <div className={`rounded-2xl overflow-hidden ${tab==="problem"?"hidden lg:block":""}`}
              style={{border:"1px solid #1E2840"}}>
              <div className="flex items-center gap-2 px-4 py-2.5" style={{background:"#141926"}}>
                <span className="w-3 h-3 rounded-full bg-red-500/60"/>
                <span className="w-3 h-3 rounded-full bg-yellow-500/60"/>
                <span className="w-3 h-3 rounded-full bg-green-500/60"/>
                <span className="ml-3 text-xs font-mono" style={{color:"#6B7A99"}}>solution.py</span>
              </div>
              <textarea
                value={code} onChange={e=>setCode(e.target.value)}
                rows={16} spellCheck={false}
                className="w-full px-5 py-4 text-sm font-mono resize-none outline-none"
                style={{background:"#0A0D14", color:"#D6DCF0", lineHeight:"1.7", tabSize:4}}
                onKeyDown={e=>{
                  if(e.key==="Tab"){e.preventDefault(); const s=e.currentTarget; const v=s.value;
                    const st=s.selectionStart,en=s.selectionEnd;
                    s.value=v.substring(0,st)+"    "+v.substring(en);
                    s.selectionStart=s.selectionEnd=st+4; setCode(s.value);}
                }}/>
              <div className="flex items-center gap-3 px-4 py-3" style={{background:"#141926", borderTop:"1px solid #1E2840"}}>
                <button onClick={submitCode} disabled={submitting}
                  className="px-5 py-2 rounded-lg font-semibold text-sm transition-all hover:scale-105 disabled:opacity-50"
                  style={{background:"linear-gradient(135deg,#4AFFA4,#2BC87A)", color:"#080B11"}}>
                  {submitting?"Evaluating…":"▶ Submit Solution"}
                </button>
                <button onClick={nextProblem} className="px-4 py-2 rounded-lg text-sm transition-colors hover:opacity-80"
                  style={{background:"#1E2840", color:"#6B7A99"}}>
                  Next Problem →
                </button>
              </div>
            </div>

            {/* Verdict */}
            {verdict && (() => {
              const s = VERDICT_STYLE[verdict.verdict] || VERDICT_STYLE.incorrect;
              return (
                <div className="rounded-2xl p-5 fade-up" style={{background:s.bg, border:`1px solid ${s.border}`}}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{s.icon}</span>
                    <span className="font-bold" style={{color:s.color}}>{verdict.verdict.replace("_"," ").toUpperCase()}</span>
                    <span className="ml-auto text-xs font-mono" style={{color:"#6B7A99"}}>{verdict.complexity_estimate}</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{color:"#D6DCF0"}}>{verdict.feedback}</p>
                  {verdict.verdict==="correct" && (
                    <button onClick={nextProblem} className="mt-3 px-4 py-2 rounded-lg text-sm font-semibold"
                      style={{background:"rgba(74,255,164,0.15)", color:"#4AFFA4"}}>
                      Next Problem →
                    </button>
                  )}
                </div>
              );
            })()}
          </>) : null}
        </div>

        {/* Right: mastery sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-4">
          <div className="rounded-2xl p-5 sticky top-20" style={{background:"#0F1420", border:"1px solid #1E2840"}}>
            <h3 className="font-semibold text-white text-sm mb-4">Skill Mastery</h3>
            <div className="space-y-3">
              {Object.entries(mastery).map(([topic,val])=>{
                const isAnimating = masteryAnim===topic;
                return (
                  <div key={topic} className={isAnimating?"scale-105":""} style={{transition:"transform 0.3s"}}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{color:isAnimating?TOPIC_COLORS[topic]:"#D6DCF0"}}>{topic}</span>
                      <span className="font-mono" style={{color:TOPIC_COLORS[topic]||"#888"}}>
                        {Math.round(val*100)}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{background:"#1E2840"}}>
                      <div className="h-1.5 rounded-full transition-all duration-700"
                        style={{
                          width:`${Math.min(100,val*100)}%`,
                          background: isAnimating?`linear-gradient(90deg,${TOPIC_COLORS[topic]},#fff)`:TOPIC_COLORS[topic]||"#888",
                          boxShadow: isAnimating?`0 0 8px ${TOPIC_COLORS[topic]}`:"none",
                        }}/>
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={()=>router.push("/")} className="w-full mt-5 py-2 rounded-xl text-xs font-medium transition-colors hover:opacity-80"
              style={{background:"#1E2840", color:"#6B7A99"}}>
              ← Dashboard
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
