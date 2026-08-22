#
# Gemini SDK Client — google-genai / google-generativeai client
# [OWNED BY MEMBER 3 - AI & AGENTS]
#

from __future__ import annotations

import asyncio
import json
import os
import re
from typing import Any, AsyncGenerator

from dotenv import load_dotenv

load_dotenv()

API_KEY = os.environ.get("GEMINI_API_KEY", "")

MODELS: dict[str, str] = {
    "FLASH": "gemini-flash-latest",
    "PRO": "gemini-pro-latest",
}

FALLBACK_MODELS = [
    "gemini-flash-latest",
    "gemini-3.5-flash",
    "gemini-3.6-flash",
    "gemini-2.5-flash"
]

_client = None
_legacy_configured = False


def get_client():
    global _client, _legacy_configured
    if _client is not None:
        return _client
    key = os.environ.get("GEMINI_API_KEY", "")
    if not key:
        return None
    try:
        from google import genai  # type: ignore[import]
        _client = genai.Client(api_key=key)
        return _client
    except Exception:
        try:
            import google.generativeai as legacy_genai
            if not _legacy_configured:
                legacy_genai.configure(api_key=key)
                _legacy_configured = True
            return legacy_genai
        except Exception:
            return None


def _clean_json_string(raw: str) -> str:
    """Removes markdown code fences if model enclosed JSON in ```json ... ```."""
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        # Remove opening ```json or ```
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        # Remove closing ```
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()


async def call_gemini_json(
    model_name: str,
    system_instruction: str,
    user_prompt: str,
    temperature: float = 0.4,
) -> Any:
    """Call Gemini and return a parsed JSON dict/list with multi-model fallback resilience."""
    key = os.environ.get("GEMINI_API_KEY", "")
    if not key or key.startswith("mock-") or "mock" in key.lower():
        return {}

    candidate_models = [model_name] + [m for m in FALLBACK_MODELS if m != model_name]

    for model_id in candidate_models:
        # 1. Try google.genai Client
        try:
            from google import genai  # type: ignore[import]
            from google.genai import types  # type: ignore[import]
            client = genai.Client(api_key=key)
            response = await asyncio.wait_for(
                client.aio.models.generate_content(
                    model=model_id,
                    contents=user_prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        response_mime_type="application/json",
                        temperature=temperature,
                    ),
                ),
                timeout=8.0
            )
            raw = response.text or "{}"
            parsed = json.loads(_clean_json_string(raw))
            if parsed:
                return parsed
        except Exception:
            pass

        # 2. Try google.generativeai (legacy) SDK
        try:
            import google.generativeai as legacy_genai
            legacy_genai.configure(api_key=key)
            model = legacy_genai.GenerativeModel(
                model_name=model_id,
                system_instruction=system_instruction
            )
            
            response = await asyncio.wait_for(
                asyncio.to_thread(
                    model.generate_content,
                    user_prompt,
                    generation_config={"response_mime_type": "application/json", "temperature": temperature}
                ),
                timeout=8.0
            )
            raw = response.text or "{}"
            parsed = json.loads(_clean_json_string(raw))
            if parsed:
                return parsed
        except Exception:
            pass

    return {}


async def stream_gemini_text(
    model_name: str,
    system_instruction: str,
    turns: list[dict[str, str]],
    temperature: float = 0.7,
) -> AsyncGenerator[str, None]:
    """Stream a conversational Gemini response token by token."""
    key = os.environ.get("GEMINI_API_KEY", "")
    
    if key and not key.startswith("mock-") and "mock" not in key.lower():
        # Try google.genai streaming
        try:
            from google import genai  # type: ignore[import]
            from google.genai import types  # type: ignore[import]
            client = genai.Client(api_key=key)
            contents = [
                types.Content(
                    role=t["role"],
                    parts=[types.Part(text=t["text"])],
                )
                for t in turns
            ]
            async for chunk in await client.aio.models.generate_content_stream(
                model=model_name,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=temperature,
                ),
            ):
                if chunk.text:
                    yield chunk.text
            return
        except Exception:
            pass

        # Try google.generativeai streaming
        try:
            import google.generativeai as legacy_genai
            legacy_genai.configure(api_key=key)
            model = legacy_genai.GenerativeModel(
                model_name=model_name,
                system_instruction=system_instruction
            )
            chat_turns = []
            for t in turns:
                role = "user" if t["role"] == "user" else "model"
                chat_turns.append({"role": role, "parts": [t["text"]]})

            chat = model.start_chat(history=chat_turns[:-1])
            last_prompt = turns[-1]["text"] if turns else "Hello"
            response = chat.send_message(last_prompt, stream=True)
            for chunk in response:
                if chunk.text:
                    yield chunk.text
            return
        except Exception:
            pass

    # No fallback token injection to prevent unwanted technical override
    return
