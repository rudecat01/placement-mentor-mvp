import os
import io
import sys

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from langchain_core.messages import HumanMessage

# Startup check — fail fast with a clear message
if not os.environ.get("GOOGLE_API_KEY") and not os.path.exists(".env"):
    print("\n⚠️  WARNING: GOOGLE_API_KEY not found. Copy .env.example to .env and add your key.\n", file=sys.stderr)

from graph import compiled_graph
from state import INITIAL_STATE
from tools import problem_bank

app = FastAPI(title="Placement Mentor MVP")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    thread_id: str
    message: str


class RoadmapDay(BaseModel):
    day: int
    problems: list[dict]   # [{id, title, topic, difficulty, leetcode_url}]


class RoadmapWeek(BaseModel):
    week: int
    focus: str
    daily_plan: list[RoadmapDay]


class ChatResponse(BaseModel):
    reply: str
    skill_mastery: dict
    roadmap: Optional[list] = None
    current_day: int
    suggested_roles: Optional[list[str]] = None
    user_profile: Optional[dict] = None


def _resolve_roadmap(raw_roadmap: list) -> list:
    """Convert raw roadmap (problem_ids as strings) into enriched dicts with titles."""
    if not raw_roadmap:
        return raw_roadmap
    resolved = []
    for week in raw_roadmap:
        week_out = {
            "week": week.get("week", 1),
            "focus": week.get("focus", ""),
            "daily_plan": [],
        }
        for day in week.get("daily_plan", []):
            problems = []
            for pid in day.get("problem_ids", []):
                p = problem_bank.get(pid)
                if p:
                    problems.append({
                        "id": p["id"],
                        "title": p["title"],
                        "topic": p["topic"],
                        "difficulty": p["difficulty"],
                        "leetcode_url": p["leetcode_url"],
                    })
                else:
                    problems.append({"id": pid, "title": pid, "topic": "", "difficulty": "", "leetcode_url": f"https://leetcode.com/problems/{pid}/"})
            week_out["daily_plan"].append({"day": day["day"], "problems": problems})
        resolved.append(week_out)
    return resolved


@app.get("/")
def health():
    return {"status": "ok"}


@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    """Accept a PDF or text resume file and return its extracted text."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    content = await file.read()

    if file.filename.endswith(".pdf"):
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(content))
            text = "\n".join(page.extract_text() or "" for page in reader.pages)
            if not text.strip():
                raise HTTPException(status_code=422, detail="Could not extract text from PDF. Try a text-based PDF.")
        except ImportError:
            raise HTTPException(status_code=500, detail="pypdf not installed. Run: pip install pypdf")
    else:
        # treat as plain text
        try:
            text = content.decode("utf-8")
        except UnicodeDecodeError:
            raise HTTPException(status_code=422, detail="File must be a PDF or UTF-8 text file.")

    return {"text": text, "filename": file.filename}


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    config = {"configurable": {"thread_id": req.thread_id}}
    existing = compiled_graph.get_state(config)

    if not existing.values:
        input_state = {**INITIAL_STATE, "messages": [HumanMessage(content=req.message)]}
    else:
        input_state = {"messages": [HumanMessage(content=req.message)]}

    result = compiled_graph.invoke(input_state, config=config)
    last_ai = result["messages"][-1].content

    raw_roadmap = result.get("roadmap")
    resolved = _resolve_roadmap(raw_roadmap) if raw_roadmap else None

    profile = result.get("user_profile", {})

    return ChatResponse(
        reply=last_ai,
        skill_mastery=result.get("skill_mastery", {}),
        roadmap=resolved,
        current_day=result.get("current_day", 1),
        suggested_roles=profile.get("suggested_roles"),
        user_profile=profile,
    )


@app.get("/state/{thread_id}")
def get_state(thread_id: str):
    config = {"configurable": {"thread_id": thread_id}}
    existing = compiled_graph.get_state(config)

    if not existing.values:
        return {
            "skill_mastery": INITIAL_STATE["skill_mastery"],
            "roadmap": None,
            "current_day": 1,
            "suggested_roles": None,
            "user_profile": {},
        }

    v = existing.values
    profile = v.get("user_profile", {})
    raw_roadmap = v.get("roadmap")
    resolved = _resolve_roadmap(raw_roadmap) if raw_roadmap else None

    return {
        "skill_mastery": v.get("skill_mastery", {}),
        "roadmap": resolved,
        "current_day": v.get("current_day", 1),
        "suggested_roles": profile.get("suggested_roles"),
        "user_profile": profile,
    }


@app.post("/set-role/{thread_id}")
def set_role(thread_id: str, role: str):
    """Set the target role for this session (called after role selection in onboarding)."""
    config = {"configurable": {"thread_id": thread_id}}
    existing = compiled_graph.get_state(config)

    if not existing.values:
        return {"ok": False, "error": "No session found"}

    profile = dict(existing.values.get("user_profile", {}))
    profile["target_role"] = role

    compiled_graph.update_state(config, {"user_profile": profile})
    return {"ok": True, "target_role": role}

# ─── NEW ENDPOINTS ────────────────────────────────────────────────────────────

class DSANextRequest(BaseModel):
    thread_id: str

class DSASubmitRequest(BaseModel):
    thread_id: str
    problem_id: str
    code: str
    language: str = "python"

class InterviewStartRequest(BaseModel):
    thread_id: str
    mode: str = "behavioral"  # behavioral | technical | mixed

class InterviewAnswerRequest(BaseModel):
    thread_id: str
    answer: str

class InterviewEndRequest(BaseModel):
    thread_id: str


@app.post("/dsa/next")
def dsa_next(req: DSANextRequest):
    """Return the next problem for today from the roadmap (auto-assigned, no prompting needed)."""
    config = {"configurable": {"thread_id": req.thread_id}}
    existing = compiled_graph.get_state(config)
    if not existing.values:
        return {"error": "No session. Upload resume first."}

    v = existing.values
    mastery = v.get("skill_mastery", {})
    current_day = v.get("current_day", 1)
    raw_roadmap = v.get("roadmap")

    problem = None
    if raw_roadmap:
        resolved = _resolve_roadmap(raw_roadmap)
        for week in resolved:
            for d in week["daily_plan"]:
                if d["day"] == current_day and d["problems"]:
                    problem = d["problems"][0]
                    break

    if not problem:
        # pick from weakest topic, difficulty adjusted by mastery
        weakest = min(
            ((k, v2) for k, v2 in mastery.items() if k != "communication"),
            key=lambda x: x[1],
        )
        topic, score = weakest
        difficulty = "hard" if score > 0.7 else ("medium" if score > 0.4 else "easy")
        p = problem_bank.find(topic=topic, difficulty=difficulty)
        if not p:
            p = problem_bank.find(topic=topic)
        problem = {
            "id": p["id"], "title": p["title"], "topic": p["topic"],
            "difficulty": p["difficulty"], "leetcode_url": p["leetcode_url"],
            "statement": p["statement"], "hints": p.get("hints", [])
        }
    else:
        # enrich with statement + hints
        p = problem_bank.get(problem["id"])
        if p:
            problem["statement"] = p["statement"]
            problem["hints"] = p.get("hints", [])

    return {"problem": problem, "current_day": current_day}


@app.post("/dsa/submit")
def dsa_submit(req: DSASubmitRequest):
    """Evaluate submitted code and update mastery."""
    from tools.code_eval import evaluate_code
    result = evaluate_code.invoke({"problem_id": req.problem_id, "code": req.code})

    config = {"configurable": {"thread_id": req.thread_id}}
    existing = compiled_graph.get_state(config)
    if existing.values:
        from agents.progress import VERDICT_SCORES
        mastery = dict(existing.values.get("skill_mastery", {}))
        current_day = existing.values.get("current_day", 1)
        p = problem_bank.get(req.problem_id)
        if p:
            topic = p["topic"]
            outcome = VERDICT_SCORES.get(result.get("verdict"), 0.0)
            mastery[topic] = round(mastery.get(topic, 0.3) + 0.15 * (outcome - mastery.get(topic, 0.3)), 2)
            if result.get("verdict") == "correct":
                current_day += 1
        compiled_graph.update_state(config, {"skill_mastery": mastery, "current_day": current_day})

    return {**result, "skill_mastery": existing.values.get("skill_mastery", {}) if existing.values else {}}


@app.post("/dsa/hint")
def dsa_hint(problem_id: str, level: int = 1):
    from tools.code_eval import give_hint
    hint = give_hint.invoke({"problem_id": problem_id, "hint_level": level})
    return {"hint": hint}


@app.post("/interview/start")
def interview_start(req: InterviewStartRequest):
    """Start a new interview session, return first question."""
    config = {"configurable": {"thread_id": req.thread_id}}
    existing = compiled_graph.get_state(config)

    sess = {
        "active": True, "type": req.mode, "turn": 0,
        "qa_log": [], "max_turns": 4,
    }
    compiled_graph.update_state(config, {"interview_session": sess})

    from agents.interview_agent import interview_agent_node
    existing2 = compiled_graph.get_state(config)
    from langchain_core.messages import HumanMessage as HM
    compiled_graph.update_state(config, {"messages": [HM(content=f"start {req.mode} interview")]})
    result = compiled_graph.invoke({"messages": [HM(content=f"start {req.mode} interview")]}, config=config)
    last = result["messages"][-1].content
    sess2 = result.get("interview_session", sess)
    return {"question": last, "turn": sess2.get("turn", 1), "max_turns": sess2.get("max_turns", 4)}


@app.post("/interview/answer")
def interview_answer(req: InterviewAnswerRequest):
    """Submit an answer, get the next question or final report."""
    config = {"configurable": {"thread_id": req.thread_id}}
    from langchain_core.messages import HumanMessage as HM
    result = compiled_graph.invoke({"messages": [HM(content=req.answer)]}, config=config)
    last = result["messages"][-1].content
    sess = result.get("interview_session", {})
    mastery = result.get("skill_mastery", {})
    is_done = not sess.get("active", True)
    return {
        "response": last,
        "is_done": is_done,
        "turn": sess.get("turn", 0),
        "max_turns": sess.get("max_turns", 4),
        "skill_mastery": mastery,
    }


@app.post("/elevenlabs/speak")
async def elevenlabs_speak(text: str, voice_id: str = "21m00Tcm4TlvDq8ikWAM"):
    """Proxy ElevenLabs TTS so the API key never hits the browser."""
    import httpx
    api_key = os.environ.get("ELEVENLABS_API_KEY", "")
    if not api_key:
        raise HTTPException(status_code=503, detail="ELEVENLABS_API_KEY not configured. Voice disabled.")
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
            headers={"xi-api-key": api_key, "Content-Type": "application/json"},
            json={"text": text, "model_id": "eleven_monolingual_v1", "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}},
            timeout=20,
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail="ElevenLabs error")
    from fastapi.responses import Response
    return Response(content=resp.content, media_type="audio/mpeg")


@app.get("/streak/{thread_id}")
def get_streak(thread_id: str):
    """Return current streak (days practiced in a row). Stored in user_profile."""
    config = {"configurable": {"thread_id": thread_id}}
    existing = compiled_graph.get_state(config)
    if not existing.values:
        return {"streak": 0}
    profile = existing.values.get("user_profile", {})
    return {"streak": profile.get("streak", 0)}
