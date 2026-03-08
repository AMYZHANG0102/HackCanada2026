"use client";

/**
 * Reusable Text-to-Speech utility that prioritizes ElevenLabs
 * and falls back to native Browser Speech Synthesis.
 */

let currentAudio: HTMLAudioElement | null = null;

export async function speakText(text: string): Promise<void> {
  // Cancel any ongoing speech
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  window.speechSynthesis.cancel();

  if (!text) return;

  try {
    const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;

    if (!apiKey) {
      throw new Error("No ElevenLabs API key found. Falling back to native browser speech.");
    }

    // Default high-quality voice (Rachel)
    const voiceId = "21m00Tcm4TlvDq8ikWAM";
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_monolingual_v1",
        voice_settings: { stability: 0.5, similarity_boost: 0.5 },
      }),
    });

    if (!response.ok) throw new Error("ElevenLabs API failed");

    const blob = await response.blob();
    const audioUrl = URL.createObjectURL(blob);
    currentAudio = new Audio(audioUrl);
    
    return new Promise((resolve) => {
      if (!currentAudio) return resolve();
      currentAudio.onended = () => {
        currentAudio = null;
        resolve();
      };
      currentAudio.onerror = () => {
        currentAudio = null;
        resolve();
      };
      currentAudio.play().catch(() => {
        // Fallback if browser blocks auto-play
        fallbackToBrowser(text).then(resolve);
      });
    });

  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("TTS Error:", error);
    }
    return fallbackToBrowser(text);
  }
}

function fallbackToBrowser(text: string): Promise<void> {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  window.speechSynthesis.cancel();
}
