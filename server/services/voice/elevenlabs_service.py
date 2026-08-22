"""
Placement Mentor 2.0 - ElevenLabs Voice Synthesis Service
[OWNED BY MEMBER 3 - AI & AGENTS]

Provides:
- High-fidelity natural voice streaming for AI Interviewers (Rachel / Adam / Antoni)
- Low-latency TTS using ElevenLabs Turbo v2.5
- Base64 & Streaming MP3 response generators
- Automatic fallback to Web Speech Synthesis if API key is not configured
"""

import os
import io
import base64
from typing import Optional, Dict, Any, AsyncGenerator
import httpx

ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech"

# High-quality standard voice IDs
DEFAULT_VOICES = {
    "interviewer_female": "21m00Tcm4TlvDq8ikWAM",  # Rachel (Professional, Articulate)
    "interviewer_male": "pNInz6obpgDQGcFmaJgB",    # Adam (Senior Tech Lead)
    "interviewer_pro": "ErXwobaYiN019PkySvjV",     # Antoni (Warm, Balanced)
}


class ElevenLabsService:
    def __init__(self):
        self.api_key = os.getenv("ELEVENLABS_API_KEY", "").strip()
        self.default_voice_id = os.getenv("ELEVENLABS_VOICE_ID", DEFAULT_VOICES["interviewer_male"]).strip()
        self.model_id = os.getenv("ELEVENLABS_MODEL_ID", "eleven_turbo_v2_5").strip()

    def is_configured(self) -> bool:
        """Returns True if ELEVENLABS_API_KEY is present in environment."""
        key = os.getenv("ELEVENLABS_API_KEY", "").strip() or self.api_key
        return bool(key and len(key) > 10)

    async def generate_speech_bytes(
        self,
        text: str,
        voice_id: Optional[str] = None,
        stability: float = 0.5,
        similarity_boost: float = 0.75
    ) -> Optional[bytes]:
        """
        Calls ElevenLabs TTS API to synthesize text into MP3 audio bytes.
        Returns None if API key is missing or request fails.
        """
        api_key = os.getenv("ELEVENLABS_API_KEY", "").strip() or self.api_key
        if not api_key:
            return None

        target_voice = voice_id or self.default_voice_id or DEFAULT_VOICES["interviewer_male"]
        url = f"{ELEVENLABS_API_URL}/{target_voice}"

        headers = {
            "xi-api-key": api_key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg"
        }

        payload = {
            "text": text,
            "model_id": self.model_id,
            "voice_settings": {
                "stability": stability,
                "similarity_boost": similarity_boost
            }
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(url, headers=headers, json=payload)
                if response.status_code == 200:
                    return response.content
                else:
                    print(f"[ElevenLabs] TTS error {response.status_code}: {response.text}")
                    return None
        except Exception as e:
            print(f"[ElevenLabs] Exception during speech synthesis: {e}")
            return None

    async def generate_speech_base64(
        self,
        text: str,
        voice_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Synthesizes speech and returns Base64 data URL for direct frontend HTML5 Audio playback.
        Includes fallback flag if ElevenLabs is not configured.
        """
        if not self.is_configured():
            return {
                "audio_base64": None,
                "use_browser_tts": True,
                "text": text,
                "voice_provider": "browser_speech_synthesis"
            }

        audio_bytes = await self.generate_speech_bytes(text, voice_id=voice_id)
        if audio_bytes:
            b64_str = base64.b64encode(audio_bytes).decode("utf-8")
            return {
                "audio_base64": f"data:audio/mpeg;base64,{b64_str}",
                "use_browser_tts": False,
                "text": text,
                "voice_provider": "elevenlabs"
            }

        return {
            "audio_base64": None,
            "use_browser_tts": True,
            "text": text,
            "voice_provider": "browser_speech_synthesis"
        }


elevenlabs_service = ElevenLabsService()
