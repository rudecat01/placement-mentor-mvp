"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Mode = "behavioral"|"technical"|"mixed";
type Phase = "pick"|"intro"|"active"|"done";
type QA = { q: string; a: string };

declare global {
  interface Window {
    SpeechRecognition: unknown;
    webkitSpeechRecognition: unknown;
  }
}

export default function InterviewPage() {
  const router = useRouter();
  const [threadId, setThreadId] = useState("");
  const [mode, setMode] = useState<Mode>("behavioral");
  const [phase, setPhase] = useState<Phase>("pick");
  const [question, setQuestion] = useState("");
  const [transcript, setTranscript] = useState("");
  const [qaLog, setQaLog] = useState<QA[]>([]);
  const [turn, setTurn] = useState(0);
  const [maxTurns, setMaxTurns] = useState(4);
  const [report, setReport] = useState<string>("");
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mastery, setMastery] = useState<Record<string,number>>({});
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const recogRef = useRef<SpeechRecognition|null>(null);
  const audioRef = useRef<HTMLAudioElement|null>(null);
  const baseTranscriptRef = useRef("");

  useEffect(() => {
    const id = localStorage.getItem("pm_thread") || "";
    if (!id) { router.push("/"); return; }
    setThreadId(id);
    fetch(`${API}/state/${id}`).then(r=>r.json()).then(d=>setMastery(d.skill_mastery||{}));
  }, []);

  const speak = async (text: string) => {
    if (!voiceEnabled) return;
    setSpeaking(true);
    try {
      const r = await fetch(`${API}/elevenlabs/speak?text=${encodeURIComponent(text)}`, { method:"POST" });
      if (r.ok) {
        const blob = await r.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => setSpeaking(false);
        audio.play();
      } else {
        // fallback to browser TTS
        browserSpeak(text);
      }
    } catch {
      browserSpeak(text);
    }
  };

  const browserSpeak = (text: string) => {
    if (!window.speechSynthesis) { setSpeaking(false); return; }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.95; utt.pitch = 1.0;
    utt.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
  };

  const startListening = () => {
    const SR = (window.SpeechRecognition || window.webkitSpeechRecognition) as (new () => SpeechRecognition) | undefined;
    if (!SR) { alert("Speech recognition not supported in this browser. Type your answer instead."); return; }
    const r = new SR();
    r.continuous = true; r.interimResults = true; r.lang = "en-US";
    baseTranscriptRef.current = transcript ? transcript + " " : "";
    r.onresult = (e: SpeechRecognitionEvent) => {
      let finalT = "", interimT = "";
      for (let i = 0; i < e.results.length; i++) {
        const piece = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalT += piece; else interimT += piece;
      }
      setTranscript((baseTranscriptRef.current + finalT + interimT).trim());
      if (finalT) baseTranscriptRef.current = (baseTranscriptRef.current + finalT).trim() + " ";
    };
    r.onend = () => setListening(false);
    r.start();
    recogRef.current = r;
    setListening(true);
  };

  const stopListening = () => {
    recogRef.current?.stop();
    setListening(false);
  };

  const startInterview = async () => {
    setPhase("intro");
    const r = await fetch(`${API}/interview/start`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ thread_id: threadId, mode }),
    });
    const d = await r.json();
    setQuestion(d.question||""); setTurn(d.turn||1); setMaxTurns(d.max_turns||4);
    setPhase("active");
    speak(d.question||"");
  };

  const submitAnswer = async () => {
    if (!transcript.trim() || submitting) return;
    setSubmitting(true);
    const ans = transcript.trim();
    setQaLog(prev=>[...prev, {q:question, a:ans}]);
    setTranscript("");

    const r = await fetch(`${API}/interview/answer`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ thread_id: threadId, answer: ans }),
    });
    const d = await r.json();
    setMastery(d.skill_mastery||mastery);

    if (d.is_done) {
      setReport(d.response); setPhase("done");
    } else {
      setQuestion(d.response); setTurn(d.turn||turn+1);
      speak(d.response);
    }
    setSubmitting(false);
  };

  const stopSpeaking = () => {
    audioRef.current?.pause();
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  const MODE_INFO: Record<Mode,{icon:string,title:string,desc:string,color:string}> = {
    behavioral: {icon:"🗣️", title:"Behavioral", desc:"STAR-method answers, leadership, conflict resolution", color:"#7B6FFF"},
    technical:  {icon:"💡", title:"Technical",  desc:"System design, CS fundamentals, coding concepts", color:"#4AAEFF"},
    mixed:      {icon:"🎯", title:"Mixed",       desc:"Combination of behavioral and technical questions",  color:"#4AFFA4"},
  };

  // ── Mode picker ──────────────────────────────────────────────────────────
  if (phase==="pick") return (
    <div className="min-h-screen flex flex-col" style={{background:"#080B11"}}>
      <header className="glass sticky top-0 z-50 px-6 py-3.5 flex items-center gap-4">
        <button onClick={()=>router.push("/")} style={{color:"#6B7A99"}} className="text-sm hover:opacity-70">← Dashboard</button>
        <span style={{color:"#1E2840"}}>|</span>
        <span className="font-mono font-bold" style={{color:"#7B6FFF"}}>Mock Interview</span>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="fade-up text-center mb-10">
          <div className="text-5xl mb-4">🎤</div>
          <h1 className="text-3xl font-bold text-white mb-2">Choose Interview Mode</h1>
          <p style={{color:"#6B7A99"}} className="text-sm max-w-sm mx-auto">
            The interviewer will speak questions aloud. Answer by voice or type below.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4 w-full max-w-2xl mb-8 fade-up" style={{animationDelay:"0.1s"}}>
          {(Object.entries(MODE_INFO) as [Mode, typeof MODE_INFO[Mode]][]).map(([m,info])=>(
            <button key={m} onClick={()=>setMode(m)}
              className="rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: mode===m?`${info.color}15`:"#0F1420",
                border: `2px solid ${mode===m?info.color:"#1E2840"}`,
                boxShadow: mode===m?`0 0 20px ${info.color}30`:"none",
              }}>
              <div className="text-3xl mb-3">{info.icon}</div>
              <div className="font-bold text-white mb-1">{info.title}</div>
              <div className="text-xs" style={{color:"#6B7A99"}}>{info.desc}</div>
            </button>
          ))}
        </div>
        <div className="fade-up flex items-center gap-4 mb-6" style={{animationDelay:"0.2s"}}>
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{color:"#6B7A99"}}>
            <div onClick={()=>setVoiceEnabled(v=>!v)}
              className="w-10 h-5 rounded-full transition-all cursor-pointer relative"
              style={{background:voiceEnabled?"#7B6FFF":"#1E2840"}}>
              <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all"
                style={{left:voiceEnabled?"22px":"2px"}}/>
            </div>
            AI Voice {voiceEnabled?"ON":"OFF"}
          </label>
          <span className="text-xs" style={{color:"#6B7A99"}}>(requires ElevenLabs key, falls back to browser TTS)</span>
        </div>
        <button onClick={startInterview}
          className="fade-up px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105"
          style={{background:"linear-gradient(135deg,#7B6FFF,#5A50D4)", color:"white",
            boxShadow:"0 8px 32px rgba(123,111,255,0.3)", animationDelay:"0.25s"}}>
          Start {MODE_INFO[mode].title} Interview →
        </button>
      </div>
    </div>
  );

  // ── Intro loading ────────────────────────────────────────────────────────
  if (phase==="intro") return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{background:"#080B11"}}>
      <div className="text-5xl mb-4 animate-bounce">🎤</div>
      <p className="text-white font-semibold">Preparing your interviewer…</p>
    </div>
  );

  // ── Done: report ─────────────────────────────────────────────────────────
  if (phase==="done") return (
    <div className="min-h-screen" style={{background:"#080B11"}}>
      <header className="glass sticky top-0 z-50 px-6 py-3.5 flex items-center gap-4">
        <button onClick={()=>router.push("/")} style={{color:"#6B7A99"}} className="text-sm">← Dashboard</button>
        <span style={{color:"#1E2840"}}>|</span>
        <span className="font-mono font-bold" style={{color:"#4AFFA4"}}>Interview Complete</span>
      </header>
      <div className="max-w-2xl mx-auto px-6 py-10 fade-up space-y-6">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🏆</div>
          <h2 className="text-2xl font-bold text-white">Interview Report</h2>
        </div>
        <div className="rounded-2xl p-6 whitespace-pre-wrap text-sm leading-relaxed"
          style={{background:"#0F1420", border:"1px solid #1E2840", color:"#D6DCF0"}}>
          {report}
        </div>
        <div className="rounded-2xl p-5" style={{background:"#0F1420", border:"1px solid #1E2840"}}>
          <h3 className="font-semibold text-white mb-3 text-sm">Transcript</h3>
          <div className="space-y-3">
            {qaLog.map((qa,i)=>(
              <div key={i} className="border-l-2 pl-3" style={{borderColor:"#7B6FFF"}}>
                <p className="text-xs font-medium mb-1" style={{color:"#7B6FFF"}}>Q{i+1}: {qa.q}</p>
                <p className="text-xs" style={{color:"#D6DCF0"}}>{qa.a}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={()=>{setPhase("pick");setQaLog([]);setReport("");setTranscript("");setQuestion("");}}
            className="flex-1 py-3 rounded-xl font-semibold text-sm"
            style={{background:"rgba(123,111,255,0.15)", color:"#7B6FFF", border:"1px solid rgba(123,111,255,0.3)"}}>
            Try Again
          </button>
          <button onClick={()=>router.push("/")}
            className="flex-1 py-3 rounded-xl font-semibold text-sm"
            style={{background:"linear-gradient(135deg,#4AFFA4,#2BC87A)", color:"#080B11"}}>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  // ── Active interview ─────────────────────────────────────────────────────
  const progress = (turn/maxTurns)*100;

  return (
    <div className="min-h-screen flex flex-col" style={{background:"#080B11"}}>
      <header className="glass sticky top-0 z-50 px-6 py-3.5 flex items-center gap-4">
        <button onClick={()=>router.push("/")} style={{color:"#6B7A99"}} className="text-sm">← Dashboard</button>
        <span style={{color:"#1E2840"}}>|</span>
        <span className="font-mono font-bold" style={{color:"#7B6FFF"}}>Mock Interview</span>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs" style={{color:"#6B7A99"}}>{turn}/{maxTurns} questions</span>
          <div className="w-24 h-1.5 rounded-full" style={{background:"#1E2840"}}>
            <div className="h-1.5 rounded-full transition-all" style={{width:`${progress}%`, background:"#7B6FFF"}}/>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-8 flex flex-col gap-6">
        {/* Interviewer bubble */}
        <div className="fade-up">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg relative"
              style={{background:"linear-gradient(135deg,#7B6FFF,#5A50D4)"}}>
              🤖
              {speaking && (
                <div className="absolute -inset-1 rounded-full border-2 animate-ping" style={{borderColor:"#7B6FFF50"}}/>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-white">AI Interviewer</p>
              <p className="text-xs" style={{color:"#6B7A99"}}>{MODE_INFO[mode]?.title} Mode · Q{turn}</p>
            </div>
            <div className="ml-auto flex gap-2">
              {speaking ? (
                <button onClick={stopSpeaking} className="text-xs px-3 py-1.5 rounded-lg"
                  style={{background:"rgba(255,90,90,0.1)", color:"#FF5A5A", border:"1px solid rgba(255,90,90,0.2)"}}>
                  ⏹ Stop
                </button>
              ) : (
                <button onClick={()=>speak(question)} className="text-xs px-3 py-1.5 rounded-lg"
                  style={{background:"rgba(123,111,255,0.1)", color:"#7B6FFF", border:"1px solid rgba(123,111,255,0.2)"}}>
                  🔊 Replay
                </button>
              )}
            </div>
          </div>
          <div className="rounded-2xl p-5" style={{background:"#0F1420", border:"1px solid rgba(123,111,255,0.25)"}}>
            <p className="text-base leading-relaxed text-white">{question}</p>
          </div>
        </div>

        {/* Previous Q&As */}
        {qaLog.length > 0 && (
          <div className="space-y-3">
            {qaLog.map((qa,i)=>(
              <div key={i} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.02)", border:"1px solid #1E2840"}}>
                <p className="text-xs mb-1" style={{color:"#7B6FFF"}}>Q{i+1}: {qa.q.slice(0,80)}{qa.q.length>80?"…":""}</p>
                <p className="text-xs" style={{color:"#6B7A99"}}>{qa.a.slice(0,120)}{qa.a.length>120?"…":""}</p>
              </div>
            ))}
          </div>
        )}

        {/* Answer area */}
        <div className="mt-auto">
          <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(74,255,164,0.2)"}}>
            <div className="flex items-center gap-2 px-4 py-2.5" style={{background:"#0F1420", borderBottom:"1px solid #1E2840"}}>
              <span className="text-xs" style={{color:"#6B7A99"}}>Your Answer</span>
              {listening && <span className="text-xs animate-pulse" style={{color:"#FF5A5A"}}>● Recording…</span>}
            </div>
            <textarea
              value={transcript} onChange={e=>setTranscript(e.target.value)}
              placeholder="Speak your answer (or type here)…"
              rows={5} className="w-full px-4 py-3 text-sm resize-none outline-none"
              style={{background:"#0A0D14", color:"#D6DCF0"}}/>
            <div className="flex items-center gap-3 px-4 py-3" style={{background:"#0F1420"}}>
              {!listening ? (
                <button onClick={startListening}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                  style={{background:"rgba(255,90,90,0.15)", color:"#FF5A5A", border:"1px solid rgba(255,90,90,0.3)"}}>
                  🎤 Start Speaking
                </button>
              ) : (
                <button onClick={stopListening}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold animate-pulse"
                  style={{background:"rgba(255,90,90,0.25)", color:"#FF5A5A", border:"1px solid rgba(255,90,90,0.5)"}}>
                  ⏹ Stop Recording
                </button>
              )}
              <button onClick={()=>setTranscript("")} className="text-xs px-3 py-2 rounded-lg"
                style={{background:"#1E2840", color:"#6B7A99"}}>Clear</button>
              <button onClick={submitAnswer} disabled={!transcript.trim()||submitting}
                className="ml-auto px-5 py-2 rounded-xl font-bold text-sm transition-all hover:scale-105 disabled:opacity-40"
                style={{background:"linear-gradient(135deg,#7B6FFF,#5A50D4)", color:"white"}}>
                {submitting?"Evaluating…":"Submit Answer →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
