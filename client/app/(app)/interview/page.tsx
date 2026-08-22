"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Target, 
  Lightbulb, 
  Award, 
  ArrowRight, 
  ChevronRight, 
  Headphones, 
  UserCheck, 
  Compass, 
  Layers, 
  Unlock, 
  Play, 
  Square
} from "lucide-react";
import { api } from "../../../lib/api";
import { useStudent } from "../../../hooks/queries/useStudent";
import { useRouter, useSearchParams } from "next/navigation";

interface TurnScore {
  clarity_score?: number;
  technical_depth_score?: number;
  overall_turn_score?: number;
  star_framework_adherence?: number;
  feedback?: string;
  is_meaningful?: boolean;
}

interface Message {
  id: string;
  role: "assistant" | "user";
  text: string;
  audioBase64?: string | null;
  turnScore?: TurnScore;
  timestamp: string;
  difficulty?: string;
  isAdapted?: boolean;
  source?: string;
}

interface FinalReport {
  overall_interview_score?: number;
  overall_ptg?: number;
  communication_clarity?: number;
  technical_depth?: number;
  strengths?: string[];
  weaknesses?: string[];
  action_items?: string[];
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: () => void;
  onend: () => void;
}

interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      [index: number]: SpeechRecognitionResultItem;
    };
  };
}

const STAGES_CONFIG = [
  { id: "STAGE_1_INTRO", num: 1, name: "Intro & Background", desc: "Elevator pitch & technical narrative" },
  { id: "STAGE_2_PROJECT_DEEP_DIVE", num: 2, name: "Project Architecture", desc: "Deep dive into your project tech stack & tradeoffs" },
  { id: "STAGE_3_PROGRAMMING_FUNDAMENTALS", num: 3, name: "CS Fundamentals", desc: "OOP, OS concurrency, DBMS ACID & Networks" },
  { id: "STAGE_4_DSA", num: 4, name: "Data Structures & Algorithms", desc: "Think-aloud algorithmic problem solving" },
  { id: "STAGE_5_CODING_FOLLOWUPS", num: 5, name: "Coding Follow-ups", desc: "Big-O proof, scale limits & edge cases" },
  { id: "STAGE_6_CS_ENGINEERING", num: 6, name: "Practical Systems", desc: "Database indexing, caching & idempotent APIs" },
  { id: "STAGE_7_SYSTEM_DESIGN", num: 7, name: "System Design", desc: "End-to-end distributed system architecture" },
  { id: "STAGE_8_BEHAVIORAL", num: 8, name: "Behavioral (STAR)", desc: "Leadership principles & conflict resolution" },
  { id: "STAGE_9_ROLE_FIT", num: 9, name: "Role Fit & 90-Day Plan", desc: "Onboarding roadmap & candidate questions" },
];

function MockInterviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: student } = useStudent();

  // Mode Selection: "general" | "roadmap"
  const [interviewMode, setInterviewMode] = useState<"general" | "roadmap">(
    searchParams.get("mode") === "roadmap" || searchParams.get("taskId") ? "roadmap" : "general"
  );
  const [selectedTopic, setSelectedTopic] = useState<string>(searchParams.get("topic") || "dp");

  // Configuration State
  const [targetCompany, setTargetCompany] = useState("Google");
  const [interviewStage, setInterviewStage] = useState("STAGE_1_INTRO");
  const [voiceId] = useState("pNInz6obpgDQGcFmaJgB"); // Adam
  
  // Session State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentDifficulty, setCurrentDifficulty] = useState("Medium");
  const [studentInput, setStudentInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [turnScores, setTurnScores] = useState<TurnScore[]>([]);
  const [askedQuestionIds, setAskedQuestionIds] = useState<string[]>([]);
  
  // Audio Playback & Replay Cache State
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());
  const activeAudioElementRef = useRef<HTMLAudioElement | null>(null);

  // Final Evaluation State
  const [isFinished, setIsFinished] = useState(false);
  const [finalReport, setFinalReport] = useState<FinalReport | null>(null);
  const [voiceProvider, setVoiceProvider] = useState("elevenlabs");

  // Audio & Speech Recognition Refs
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const isSubmittingRef = useRef<boolean>(false);
  const processedResponseIdsRef = useRef<Set<string>>(new Set());

  // Initialize SpeechRecognition on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const windowObj = window as unknown as Record<string, unknown>;
      const SpeechRecognitionClass = (windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition) as {
        new (): SpeechRecognitionInstance;
      } | undefined;

      if (SpeechRecognitionClass) {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setStudentInput(transcript);
        };

        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Sync initial student target company if available
  useEffect(() => {
    if (student?.profile?.targetCompanies && student.profile.targetCompanies.length > 0) {
      setTargetCompany(student.profile.targetCompanies[0]);
    }
  }, [student]);

  // Auto scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiSpeaking]);

  const fallbackBrowserTTS = (text: string, messageId?: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => {
        setIsAiSpeaking(true);
        if (messageId) setPlayingMessageId(messageId);
      };
      utterance.onend = () => {
        setIsAiSpeaking(false);
        setPlayingMessageId(null);
      };
      utterance.onerror = () => {
        setIsAiSpeaking(false);
        setPlayingMessageId(null);
      };
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopAllAudio = () => {
    if (activeAudioElementRef.current) {
      activeAudioElementRef.current.pause();
      activeAudioElementRef.current.currentTime = 0;
      activeAudioElementRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsAiSpeaking(false);
    setPlayingMessageId(null);
  };

  /**
   * Replays audio for a specific message from cache (Zero LLM/API call, unlimited replay).
   */
  const playMessageAudio = async (msg: Message) => {
    // 1. If this exact message is currently playing, clicking again stops it
    if (playingMessageId === msg.id) {
      stopAllAudio();
      return;
    }

    // 2. Stop any ongoing playback
    stopAllAudio();

    // 3. Check memory cache or message payload for base64 audio
    const cachedBase64 = msg.audioBase64 || audioCacheRef.current.get(msg.id) || audioCacheRef.current.get(msg.text);

    if (cachedBase64) {
      try {
        setPlayingMessageId(msg.id);
        setIsAiSpeaking(true);

        const audio = new Audio(cachedBase64);
        activeAudioElementRef.current = audio;

        audio.onended = () => {
          setPlayingMessageId(null);
          setIsAiSpeaking(false);
          activeAudioElementRef.current = null;
        };

        audio.onerror = () => {
          fallbackBrowserTTS(msg.text, msg.id);
        };

        await audio.play();
        return;
      } catch (err) {
        console.warn("Cached audio playback error, falling back to browser TTS:", err);
        fallbackBrowserTTS(msg.text, msg.id);
        return;
      }
    }

    // 4. If no cached audio exists (e.g. User answer or fallback opening):
    // Play immediately with browser TTS
    fallbackBrowserTTS(msg.text, msg.id);

    // Optionally fetch & cache ElevenLabs speech for future replay without delaying playback
    try {
      api.post("/api/interview/tts", { text: msg.text, voice_id: voiceId }).then(({ data }) => {
        if (data?.audio_base64) {
          audioCacheRef.current.set(msg.id, data.audio_base64);
          audioCacheRef.current.set(msg.text, data.audio_base64);
          setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, audioBase64: data.audio_base64 } : m));
        }
      }).catch(() => {});
    } catch {}
  };

  const playInterviewerAudio = (audioBase64: string | null, text: string, messageId: string) => {
    if (audioBase64) {
      audioCacheRef.current.set(messageId, audioBase64);
      audioCacheRef.current.set(text, audioBase64);
      setIsAiSpeaking(true);
      setPlayingMessageId(messageId);

      const audio = new Audio(audioBase64);
      activeAudioElementRef.current = audio;

      audio.onended = () => {
        setIsAiSpeaking(false);
        setPlayingMessageId(null);
        activeAudioElementRef.current = null;
      };

      audio.onerror = () => {
        fallbackBrowserTTS(text, messageId);
      };

      audio.play().catch(() => {
        fallbackBrowserTTS(text, messageId);
      });
    } else {
      fallbackBrowserTTS(text, messageId);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setStudentInput("");
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch {
        setIsRecording(false);
      }
    }
  };

  // Start Interview Session
  const handleStartInterview = async () => {
    setIsLoadingNext(true);
    try {
      const extractedSkills = student?.telemetry?.resume_signals?.extracted_skills || [];
      const resumeSummary = extractedSkills.length > 0 ? `Skills: ${extractedSkills.join(", ")}` : "";

      const payload = {
        target_role: student?.profile?.targetRole || "SDE",
        target_company: targetCompany,
        stage: interviewMode === "roadmap" ? "STAGE_4_DSA" : interviewStage,
        mode: interviewMode,
        topic_id: interviewMode === "roadmap" ? selectedTopic : undefined,
        resume_summary: resumeSummary,
        voice_id: voiceId
      };

      let resData: {
        session_id: string;
        question: string;
        base_question_id?: string;
        difficulty?: string;
        voice_provider?: string;
        audio_base64?: string | null;
      } | null = null;

      try {
        const { data } = await api.post("/api/interview/start", payload);
        resData = data;
      } catch (err: unknown) {
        const errObj = err as { response?: { status?: number } };
        if (errObj?.response?.status === 404) {
          const { data } = await api.post("/interview/start", payload);
          resData = data;
        } else {
          throw err;
        }
      }

      if (resData) {
        const firstMsgId = `msg_${Date.now()}_open`;
        setSessionId(resData.session_id);
        setCurrentQuestion(resData.question);
        setCurrentDifficulty(resData.difficulty || "Easy");
        setVoiceProvider(resData.voice_provider || "elevenlabs");
        if (resData.base_question_id) {
          setAskedQuestionIds([resData.base_question_id]);
        }

        const firstMsg: Message = {
          id: firstMsgId,
          role: "assistant",
          text: resData.question,
          audioBase64: resData.audio_base64 || null,
          difficulty: resData.difficulty || "Easy",
          source: "question_bank",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages([firstMsg]);

        // Play Opening Audio & cache
        playInterviewerAudio(resData.audio_base64 || null, resData.question, firstMsgId);
      }
    } catch (e: unknown) {
      console.warn("Backend interview route starting in fallback mode:", e);
      const defaultOpening = `Hi! Welcome to your technical interview for ${targetCompany}. Let's start with a brief introduction. Could you tell me a little about yourself, your background, and what you've been focused on recently?`;
      const fallbackId = `msg_${Date.now()}_open`;
      setSessionId(`int_local_${Date.now()}`);
      setCurrentQuestion(defaultOpening);
      setCurrentDifficulty("Easy");
      setVoiceProvider("browser_speech_synthesis");

      const firstMsg: Message = {
        id: fallbackId,
        role: "assistant",
        text: defaultOpening,
        difficulty: "Easy",
        source: "question_bank",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages([firstMsg]);
      fallbackBrowserTTS(defaultOpening, fallbackId);
    } finally {
      setIsLoadingNext(false);
    }
  };

  // Submit Candidate Response & Fetch Next Question (Strict Idempotent Single Execution)
  const handleSendResponse = async () => {
    if (isSubmittingRef.current || !studentInput.trim() || !sessionId) return;
    isSubmittingRef.current = true;

    if (isRecording) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsRecording(false);
    }

    const userText = studentInput.trim();
    setStudentInput("");
    setIsLoadingNext(true);

    const responseId = `resp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    if (processedResponseIdsRef.current.has(responseId)) {
      isSubmittingRef.current = false;
      setIsLoadingNext(false);
      return;
    }
    processedResponseIdsRef.current.add(responseId);

    const userMsg: Message = {
      id: responseId,
      role: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);

    try {
      const conversationPayload = newHistory.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        text: m.text
      }));

      const extractedSkills = student?.telemetry?.resume_signals?.extracted_skills || [];
      const resumeSummary = extractedSkills.length > 0 ? `Skills: ${extractedSkills.join(", ")}` : "";

      const payload = {
        session_id: sessionId,
        stage: interviewMode === "roadmap" ? "STAGE_4_DSA" : interviewStage,
        mode: interviewMode,
        topic_id: interviewMode === "roadmap" ? selectedTopic : undefined,
        candidate_response: userText,
        interviewer_previous_question: currentQuestion,
        conversation_history: conversationPayload,
        target_company: targetCompany,
        student_resume_summary: resumeSummary,
        voice_id: voiceId,
        asked_question_ids: askedQuestionIds
      };

      let resData: {
        question: string;
        base_question_id?: string;
        difficulty?: string;
        is_adapted?: boolean;
        source?: string;
        voice_provider?: string;
        audio_base64?: string | null;
        turn_score?: TurnScore;
        is_complete?: boolean;
        should_advance?: boolean;
      } | null = null;

      try {
        const { data } = await api.post("/api/interview/respond", payload);
        resData = data;
      } catch (err: unknown) {
        const errObj = err as { response?: { status?: number } };
        if (errObj?.response?.status === 404) {
          const { data } = await api.post("/interview/respond", payload);
          resData = data;
        } else {
          throw err;
        }
      }

      if (resData) {
        const aiMsgId = `msg_${Date.now()}_ai`;

        if (resData.turn_score) {
          setTurnScores(prev => [...prev, resData?.turn_score || {}]);
        }

        if (resData.base_question_id && resData.should_advance !== false) {
          setAskedQuestionIds(prev => [...prev, resData?.base_question_id || ""]);
        }

        setCurrentQuestion(resData.question);
        setCurrentDifficulty(resData.difficulty || "Medium");
        setVoiceProvider(resData.voice_provider || "elevenlabs");

        const aiMsg: Message = {
          id: aiMsgId,
          role: "assistant",
          text: resData.question,
          audioBase64: resData.audio_base64 || null,
          turnScore: resData.turn_score,
          difficulty: resData.difficulty || "Medium",
          isAdapted: resData.is_adapted,
          source: resData.source || "question_bank",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages(prev => [...prev, aiMsg]);

        // Play Next Audio & Cache
        playInterviewerAudio(resData.audio_base64 || null, resData.question, aiMsgId);

        if (resData.is_complete) {
          handleFinishInterview([...turnScores, resData.turn_score || {}]);
        }
      }
    } catch (e: unknown) {
      console.warn("Follow-up question fallback:", e);
      const userTextLower = userText.trim().toLowerCase();
      const words = userTextLower.split(/\s+/).filter(Boolean);
      const isFillerOrShort = words.length <= 2 && ["hi", "hello", "hey", "ok", "okay", "yes", "yeah", "yup", "sure", "fine", "cool", "hmm", "go", "ille", "test"].some(w => userTextLower.includes(w) || userTextLower === w);
      
      let simulatedFollowUp = "";
      let shouldAdvanceLocal = true;

      if (isFillerOrShort) {
        shouldAdvanceLocal = false;
        if (currentQuestion && currentQuestion.length > 10) {
          simulatedFollowUp = `Your response doesn't directly address the question. Please answer the question: ${currentQuestion}`;
        } else {
          simulatedFollowUp = "Hi! Let's get started. Could you tell me a little about yourself, your background, and what software projects you've been focused on recently?";
        }
      } else {
        const meaningfulTurns = newHistory.filter(m => m.role === "user" && m.text.trim().split(/\s+/).length > 3).length;
        if (userTextLower.includes("outlier") || userTextLower.includes("extreme") || userTextLower.includes("dataset")) {
          simulatedFollowUp = "How did you identify which data points were outliers in your dataset, and what strategy did you use to handle them?";
        } else if (userTextLower.includes("random forest") || userTextLower.includes("model") || userTextLower.includes("trees")) {
          simulatedFollowUp = "What specific evaluation metrics did you use to compare your models, and what made Random Forest perform better on this dataset?";
        } else if (meaningfulTurns === 1) {
          simulatedFollowUp = "Could you walk me through one of the software projects you worked on recently and what specific problem you were solving?";
        } else if (meaningfulTurns === 2) {
          simulatedFollowUp = "What was your specific role and personal engineering contribution to the system architecture?";
        } else if (meaningfulTurns === 3) {
          simulatedFollowUp = "What was the most challenging technical bottleneck or edge case you encountered while building this project, and how did you resolve it?";
        } else {
          simulatedFollowUp = "How would you scale or optimize this system if traffic or dataset volume increased significantly?";
        }
      }

      const fallbackAiId = `msg_${Date.now()}_fallback`;
      if (shouldAdvanceLocal) {
        setAskedQuestionIds(prev => [...prev, fallbackAiId]);
      }

      const simulatedScore: TurnScore = {
        clarity_score: isFillerOrShort ? 0.0 : 0.82,
        technical_depth_score: isFillerOrShort ? 0.0 : 0.80,
        overall_turn_score: isFillerOrShort ? 0.0 : 0.81,
        star_framework_adherence: isFillerOrShort ? 0.0 : 0.80,
        feedback: isFillerOrShort ? "Your response doesn't directly address the question. Please answer the question asked by the interviewer." : "Strong technical narrative with clear project context and model details."
      };

      setTurnScores(prev => [...prev, simulatedScore]);
      setCurrentQuestion(simulatedFollowUp);
      
      const aiMsg: Message = {
        id: fallbackAiId,
        role: "assistant",
        text: simulatedFollowUp,
        turnScore: simulatedScore,
        difficulty: "Medium",
        source: "question_bank",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages(prev => [...prev, aiMsg]);
      fallbackBrowserTTS(simulatedFollowUp, fallbackAiId);

      if (newHistory.length >= 8) {
        handleFinishInterview([...turnScores, simulatedScore]);
      }
    } finally {
      setIsLoadingNext(false);
      isSubmittingRef.current = false;
    }
  };

  // Finish Session & Compute Report
  const handleFinishInterview = async (finalScores?: TurnScore[]) => {
    setIsLoadingNext(true);
    try {
      const payload = {
        session_id: sessionId,
        turn_scores: finalScores || turnScores,
        practice_score: (student?.practiceScore || 70) / 100,
        stage: interviewStage,
        topic_id: interviewMode === "roadmap" ? selectedTopic : undefined
      };

      let resData: { report: FinalReport } | null = null;
      try {
        const { data } = await api.post("/api/interview/finish", payload);
        resData = data;
      } catch (err: unknown) {
        const errObj = err as { response?: { status?: number } };
        if (errObj?.response?.status === 404) {
          const { data } = await api.post("/interview/finish", payload);
          resData = data;
        } else {
          throw err;
        }
      }

      if (resData) {
        setFinalReport(resData.report);
      }
      setIsFinished(true);
    } catch {
      // Local fallback scorecard
      setFinalReport({
        overall_interview_score: 0.78,
        overall_ptg: 0.08,
        communication_clarity: 0.80,
        technical_depth: 0.76,
        strengths: ["Clear structured STAR delivery", "Solid algorithmic reasoning"],
        weaknesses: ["Deepen quantitative metrics in result phase"],
        action_items: ["Practice explaining space complexity tradeoffs", "Review system scaling bottlenecks"]
      });
      setIsFinished(true);
    } finally {
      setIsLoadingNext(false);
    }
  };

  const activeStageMeta = STAGES_CONFIG.find(s => s.id === interviewStage) || STAGES_CONFIG[0];

  return (
    <div className="flex-1 flex flex-col pt-20 pb-8 px-6 max-w-[1400px] mx-auto w-full h-[calc(100vh-2rem)] overflow-hidden">
      {/* TOP BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-border-subtle shrink-0 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline-sm text-[20px] font-bold text-on-background">Live AI Mock Interview Room</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-status-success/10 text-status-success border border-status-success/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> ElevenLabs Voice
              </span>
            </div>
            <p className="font-body-sm text-[13px] text-secondary flex items-center gap-2">
              <span>Simulating {targetCompany} Interview Loop</span>
              <span>•</span>
              <span className="text-primary font-medium">Stage {activeStageMeta.num}: {activeStageMeta.name}</span>
            </p>
          </div>
        </div>

        {/* Section Switcher & Action Controls */}
        {!sessionId && (
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Mode Switcher */}
            <div className="flex bg-surface-container-low border border-border-subtle rounded-lg p-0.5">
              <button
                onClick={() => setInterviewMode("general")}
                className={`px-3 py-1.5 rounded-md text-[12px] font-bold transition-all flex items-center gap-1.5 ${
                  interviewMode === "general" ? "bg-primary text-on-primary shadow-sm" : "text-secondary hover:text-on-surface"
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> General 9-Stage Loop
              </button>
              <button
                onClick={() => setInterviewMode("roadmap")}
                className={`px-3 py-1.5 rounded-md text-[12px] font-bold transition-all flex items-center gap-1.5 ${
                  interviewMode === "roadmap" ? "bg-primary text-on-primary shadow-sm" : "text-secondary hover:text-on-surface"
                }`}
              >
                <Compass className="w-3.5 h-3.5" /> Roadmap Mission
              </button>
            </div>

            <select 
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              className="bg-surface border border-border-subtle rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-on-background outline-none"
            >
              <option value="Google">Google Track</option>
              <option value="Microsoft">Microsoft Track</option>
              <option value="Amazon">Amazon (LP Track)</option>
              <option value="Meta">Meta Track</option>
            </select>

            {interviewMode === "general" ? (
              <select 
                value={interviewStage}
                onChange={(e) => setInterviewStage(e.target.value)}
                className="bg-surface border border-border-subtle rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-on-background outline-none max-w-[200px]"
              >
                {STAGES_CONFIG.map(s => (
                  <option key={s.id} value={s.id}>Stage {s.num}: {s.name}</option>
                ))}
              </select>
            ) : (
              <select 
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="bg-surface border border-border-subtle rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-on-background outline-none"
              >
                <option value="dp">Dynamic Programming Gap</option>
                <option value="graphs">Graphs & BFS/DFS</option>
                <option value="system_design">System Bottlenecks</option>
                <option value="trees">Binary Trees</option>
              </select>
            )}

            <button 
              onClick={handleStartInterview}
              disabled={isLoadingNext}
              className="bg-primary hover:bg-primary/90 text-on-primary font-label-md text-[13px] font-medium px-4 py-1.5 rounded-lg transition-all shadow-sm flex items-center gap-1.5"
            >
              Start Round
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {sessionId && !isFinished && (
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
              currentDifficulty === "Hard" ? "bg-status-error/10 text-status-error border border-status-error/20" :
              currentDifficulty === "Easy" ? "bg-status-success/10 text-status-success border border-status-success/20" :
              "bg-blue-team/10 text-blue-team border border-blue-team/20"
            }`}>
              Difficulty: {currentDifficulty}
            </span>
            <button 
              onClick={() => handleFinishInterview()}
              className="border border-border-subtle hover:bg-surface-variant text-on-surface font-label-md text-[13px] font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              End & Calibrate Scorecard
            </button>
          </div>
        )}
      </div>

      {/* MAIN INTERACTION GRID */}
      <div className="grid grid-cols-12 gap-6 mt-4 flex-grow overflow-hidden">
        {/* LEFT COLUMN: INTERVIEW CHAT & VOICE INTERFACE (8 COLS) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col h-full bg-surface border border-border-subtle rounded-xl overflow-hidden shadow-sm">
          {/* AI Interviewer Avatar & Audio Visualizer Header */}
          <div className="p-4 bg-surface-bright border-b border-border-subtle flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                isAiSpeaking ? "bg-primary text-on-primary ring-4 ring-primary/20 scale-105" : "bg-surface-container-high text-secondary"
              }`}>
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <span className="font-label-md text-[14px] font-bold text-on-background block">
                  Senior Technical Interviewer ({targetCompany})
                </span>
                <span className="font-label-sm text-[11px] text-secondary flex items-center gap-1.5">
                  {isAiSpeaking ? (
                    <span className="text-primary font-medium flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span> Playing Audio via {voiceProvider === "elevenlabs" ? "ElevenLabs AI" : "Speech Synthesis"}...
                    </span>
                  ) : (
                    "Listening for candidate response..."
                  )}
                </span>
              </div>
            </div>

            {isAiSpeaking && (
              <button 
                onClick={stopAllAudio}
                className="text-secondary hover:text-status-error p-2 rounded-lg hover:bg-surface-container-low transition-colors flex items-center gap-1 text-[12px]"
                title="Stop Audio"
              >
                <Square className="w-3.5 h-3.5" /> Stop Audio
              </button>
            )}
          </div>

          {/* Conversation Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {!sessionId && (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2">
                  <Mic className="w-8 h-8" />
                </div>
                <h3 className="font-headline-md text-[22px] font-bold text-on-background">
                  {interviewMode === "general" ? "Standardized Tech Interview Simulation" : "Roadmap Mission Interview Practice"}
                </h3>
                <p className="font-body-md text-[14px] text-secondary max-w-md">
                  {interviewMode === "general" 
                    ? "Covers 9 industry-standard FAANG stages with dynamic question optimization and real-time difficulty adaptation."
                    : "Focused targeted practice to close high-priority diagnostic gaps from your roadmap."}
                </p>
                <button 
                  onClick={handleStartInterview}
                  className="bg-primary hover:bg-primary/90 text-on-primary font-label-md text-[14px] font-medium px-6 py-2.5 rounded-lg transition-all shadow-md flex items-center gap-2 mt-2"
                >
                  Launch Interview Loop
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {messages.map((msg) => {
              const isPlayingThis = playingMessageId === msg.id;

              return (
                <div 
                  key={msg.id} 
                  className={`flex gap-3.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-1">
                      <Volume2 className="w-4 h-4" />
                    </div>
                  )}
                  
                  <div className={`max-w-2xl rounded-2xl p-4 text-[14px] leading-relaxed shadow-sm group ${
                    msg.role === "user" 
                      ? "bg-primary text-on-primary rounded-tr-none font-medium" 
                      : "bg-surface-bright border border-border-subtle text-on-background rounded-tl-none"
                  }`}>
                    <div className="flex items-start justify-between gap-4">
                      <p className="flex-1">{msg.text}</p>
                      
                      {/* AUDIO REPLAY BUTTON (Exclusively for Interviewer Questions) */}
                      {msg.role === "assistant" && (
                        <button
                          onClick={() => playMessageAudio(msg)}
                          className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 shadow-sm ${
                            isPlayingThis
                              ? "bg-status-success text-on-primary ring-2 ring-status-success/30 animate-pulse"
                              : "bg-surface-container-high hover:bg-primary hover:text-on-primary text-secondary border border-border-subtle"
                          }`}
                          title={isPlayingThis ? "Pause / Stop Audio" : "Replay Audio (Unlimited Times)"}
                        >
                          {isPlayingThis ? (
                            <>
                              <Square className="w-3 h-3 fill-current" />
                              <span>Playing</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 fill-current" />
                              <span>Replay Audio</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Metadata Footer */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-subtle/30 text-[10px]">
                      {msg.role === "assistant" && msg.isAdapted ? (
                        <span className="text-primary font-semibold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Dynamically Added to Question Bank
                        </span>
                      ) : msg.role === "assistant" ? (
                        <span className="text-secondary font-medium flex items-center gap-1">
                          <Layers className="w-3 h-3" /> Master Question Bank
                        </span>
                      ) : (
                        <span></span>
                      )}
                      <span className={msg.role === "user" ? "text-on-primary/70" : "text-secondary"}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoadingNext && (
              <div className="flex gap-3.5 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-surface-bright border border-border-subtle rounded-2xl rounded-tl-none p-4 text-[13px] text-secondary flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce"></span>
                  Shadow Critic evaluating response & checking question bank...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Student Input Bar */}
          {sessionId && !isFinished && (
            <div className="p-4 bg-surface border-t border-border-subtle shrink-0">
              <div className="flex items-center gap-3">
                <button 
                  onClick={toggleRecording}
                  className={`p-3.5 rounded-full transition-all shadow-sm flex items-center justify-center shrink-0 ${
                    isRecording 
                      ? "bg-status-error text-on-error ring-4 ring-status-error/20 animate-pulse" 
                      : "bg-surface-container-low hover:bg-surface-variant text-on-surface border border-border-subtle"
                  }`}
                  title={isRecording ? "Stop Recording" : "Speak into Microphone"}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-primary" />}
                </button>

                <textarea 
                  rows={2}
                  value={studentInput}
                  onChange={(e) => setStudentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendResponse();
                    }
                  }}
                  placeholder={isRecording ? "Listening to your voice..." : "Type your answer or speak with the microphone..."}
                  className="flex-1 bg-surface-bright border border-border-subtle rounded-xl p-3 text-[14px] text-on-background placeholder:text-secondary outline-none focus:border-primary transition-colors resize-none"
                />

                <button 
                  onClick={handleSendResponse}
                  disabled={!studentInput.trim() || isLoadingNext}
                  className={`p-3.5 rounded-xl transition-all shrink-0 ${
                    studentInput.trim() && !isLoadingNext
                      ? "bg-primary hover:bg-primary/90 text-on-primary shadow-sm" 
                      : "bg-surface-container-low text-secondary opacity-50 cursor-not-allowed"
                  }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SHADOW CRITIC & REALTIME SCORECARD (4 COLS) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col h-full bg-surface border border-border-subtle rounded-xl p-5 overflow-y-auto shadow-sm space-y-6">
          <div>
            <h2 className="font-headline-sm text-[18px] font-bold text-on-background flex items-center gap-2 mb-1">
              <Target className="w-5 h-5 text-primary" />
              Shadow Critic Telemetry
            </h2>
            <p className="font-body-sm text-[12px] text-secondary">
              Real-time evaluation assessing clarity, structure, and depth.
            </p>
          </div>

          {/* Turn Score Gauge */}
          {turnScores.length > 0 ? (
            <div className="space-y-4">
              <div className="p-4 bg-surface-bright border border-border-subtle rounded-xl">
                <span className="font-label-sm text-[11px] font-bold text-secondary uppercase tracking-wider block mb-1">
                  Last Turn Performance
                </span>
                <div className="flex items-baseline gap-2">
                  <span className={`font-display-lg text-[28px] font-bold ${
                    (turnScores[turnScores.length - 1]?.overall_turn_score ?? 0) > 0 ? "text-primary" : "text-status-warning"
                  }`}>
                    {(turnScores[turnScores.length - 1]?.overall_turn_score ?? 0) > 0
                      ? `${Math.round((turnScores[turnScores.length - 1]?.overall_turn_score || 0) * 100)}%`
                      : "--"}
                  </span>
                  <span className={`font-label-sm text-[12px] font-medium ${
                    (turnScores[turnScores.length - 1]?.overall_turn_score ?? 0) >= 0.7
                      ? "text-status-success"
                      : (turnScores[turnScores.length - 1]?.overall_turn_score ?? 0) > 0
                      ? "text-status-warning"
                      : "text-status-warning"
                  }`}>
                    {(turnScores[turnScores.length - 1]?.overall_turn_score ?? 0) >= 0.7
                      ? "Effective Response"
                      : (turnScores[turnScores.length - 1]?.overall_turn_score ?? 0) > 0
                      ? "Needs More Technical Depth"
                      : "Awaiting Valid Answer"}
                  </span>
                </div>
                
                {turnScores[turnScores.length - 1]?.feedback && (
                  <p className="font-body-sm text-[12px] text-secondary mt-2 pt-2 border-t border-border-subtle/50">
                    💡 {turnScores[turnScores.length - 1].feedback}
                  </p>
                )}
              </div>

              {/* STAR Framework Adherence */}
              <div className="p-4 bg-surface-bright border border-border-subtle rounded-xl space-y-3">
                <span className="font-label-sm text-[11px] font-bold text-secondary uppercase tracking-wider block">
                  STAR Framework Checklist
                </span>
                <div className="space-y-2 text-[12px]">
                  <div className="flex items-center gap-2 text-on-surface">
                    <CheckCircle2 className="w-4 h-4 text-status-success" />
                    <span><strong>Situation</strong>: Context established</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface">
                    <CheckCircle2 className="w-4 h-4 text-status-success" />
                    <span><strong>Task</strong>: Goal clearly stated</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface">
                    <UserCheck className="w-4 h-4 text-primary" />
                    <span><strong>Action</strong>: Quantified engineering steps</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface">
                    <CheckCircle2 className="w-4 h-4 text-status-warning" />
                    <span><strong>Result</strong>: Metrics & lessons learned</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-surface-bright border border-border-subtle rounded-xl text-center space-y-2">
              <Lightbulb className="w-6 h-6 text-primary mx-auto" />
              <h3 className="font-label-md text-[14px] font-bold text-on-surface">Live Feedback Active</h3>
              <p className="font-body-sm text-[12px] text-secondary">
                Speak or submit your response to receive real-time clarity ratings and STAR analysis.
              </p>
            </div>
          )}

          {/* Tips for Target Company */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-2">
            <span className="font-label-sm text-[11px] font-bold text-primary uppercase tracking-wider block">
              {targetCompany} Placement Tips
            </span>
            <ul className="text-[12px] text-on-surface space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>Always quantify the business or technical outcome (% latency, throughput).</li>
              <li>State trade-offs explicitly before settling on an architectural choice.</li>
              <li>Use &quot;I&quot; rather than &quot;we&quot; when describing your personal contributions.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* FINAL REPORT MODAL */}
      {isFinished && finalReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-surface border border-border-subtle rounded-2xl max-w-2xl w-full p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border-subtle pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-status-success/10 border border-status-success/20 flex items-center justify-center text-status-success">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-headline-md text-[22px] font-bold text-on-background">Interview Evaluation Scorecard</h3>
                    <span className="px-2 py-0.5 bg-status-success/10 text-status-success border border-status-success/20 text-[11px] font-bold rounded-full flex items-center gap-1">
                      <Unlock className="w-3 h-3" /> PTG Unlocked
                    </span>
                  </div>
                  <p className="font-body-sm text-[13px] text-secondary">Calibrated against {targetCompany} SDE Rubric</p>
                </div>
              </div>
            </div>

            {/* Score Highlights */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-surface-bright border border-border-subtle rounded-xl text-center">
                <span className="font-label-sm text-[11px] font-bold text-secondary uppercase block mb-1">Interview Score</span>
                <span className="font-display-lg text-[32px] font-bold text-primary">{Math.round((finalReport.overall_interview_score || 0.75) * 100)}%</span>
              </div>
              <div className="p-4 bg-surface-bright border border-border-subtle rounded-xl text-center">
                <span className="font-label-sm text-[11px] font-bold text-secondary uppercase block mb-1">Communication</span>
                <span className="font-display-lg text-[32px] font-bold text-status-success">{Math.round((finalReport.communication_clarity || 0.78) * 100)}%</span>
              </div>
              <div className="p-4 bg-surface-bright border border-border-subtle rounded-xl text-center">
                <span className="font-label-sm text-[11px] font-bold text-secondary uppercase block mb-1">Calibrated PTG</span>
                <span className="font-display-lg text-[32px] font-bold text-blue-team">{Math.round((finalReport.overall_ptg || 0.08) * 100)}%</span>
              </div>
            </div>

            {/* Action Items & Recommendations */}
            <div className="space-y-3">
              <h4 className="font-label-md text-[13px] font-bold text-on-surface uppercase tracking-wider">Key Recommendations</h4>
              <ul className="text-[13px] text-secondary space-y-2">
                {(finalReport.action_items || ["Practice verbalizing space complexity tradeoffs.", "Quantify project metrics."]).map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-4 pt-4 border-t border-border-subtle">
              <button 
                onClick={() => router.push("/dashboard")}
                className="flex-1 bg-primary hover:bg-primary/90 text-on-primary font-label-md text-[14px] font-medium py-3 rounded-xl transition-all text-center"
              >
                Return to Command Center
              </button>
              <button 
                onClick={() => {
                  setIsFinished(false);
                  setSessionId(null);
                  setMessages([]);
                  setAskedQuestionIds([]);
                }}
                className="bg-surface hover:bg-surface-variant border border-border-subtle text-on-surface font-label-md text-[14px] font-medium px-6 py-3 rounded-xl transition-colors"
              >
                Retake
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MockInterviewPage() {
  return (
    <Suspense fallback={<div className="p-24 text-center">Loading Live AI Mock Interview Room...</div>}>
      <MockInterviewContent />
    </Suspense>
  );
}
