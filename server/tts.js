import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ELEVEN_API = "https://api.elevenlabs.io/v1";
const MAX_CHARS = 4000;

// Default premade ElevenLabs voices; override with ELEVENLABS_VOICE_EN / ELEVENLABS_VOICE_ZH.
const DEFAULT_VOICES = {
  en: "EXAVITQu4vr4xnSDxMaL", // Sarah
  zh: "pFZP5JQG7iQjIQuC4Bku", // Lily (multilingual)
};

export function ttsConfig(env = process.env) {
  return {
    apiKey: env.ELEVENLABS_API_KEY || "",
    model: env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2",
    voices: {
      en: env.ELEVENLABS_VOICE_EN || DEFAULT_VOICES.en,
      zh: env.ELEVENLABS_VOICE_ZH || DEFAULT_VOICES.zh,
    },
    cacheDir: env.TTS_CACHE_DIR || path.join(process.cwd(), ".cache", "tts"),
    cacheEnabled: env.TTS_CACHE !== "0" && !env.VERCEL,
  };
}

export function normalizeRequest(body) {
  const text = String(body?.text ?? "").trim();
  const lang = body?.lang === "zh" ? "zh" : "en";
  if (!text) throw Object.assign(new Error("text is required"), { status: 400 });
  if (text.length > MAX_CHARS) {
    throw Object.assign(new Error(`text exceeds ${MAX_CHARS} characters`), { status: 413 });
  }
  return { text, lang };
}

export function cacheKey({ text, lang }, cfg) {
  return createHash("sha256")
    .update(`${cfg.model}|${cfg.voices[lang]}|${lang}|${text}`)
    .digest("hex");
}

export async function synthesize(body, cfg = ttsConfig()) {
  const req = normalizeRequest(body);
  if (!cfg.apiKey) {
    throw Object.assign(new Error("ELEVENLABS_API_KEY is not configured"), { status: 503 });
  }

  const key = cacheKey(req, cfg);
  const file = path.join(cfg.cacheDir, `${key}.mp3`);
  if (cfg.cacheEnabled && existsSync(file)) {
    return { audio: await readFile(file), cached: true };
  }

  const res = await fetch(`${ELEVEN_API}/text-to-speech/${cfg.voices[req.lang]}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: {
      "xi-api-key": cfg.apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: req.text,
      model_id: cfg.model,
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw Object.assign(new Error(`ElevenLabs error ${res.status}: ${detail.slice(0, 300)}`), {
      status: res.status === 401 ? 502 : res.status,
    });
  }

  const audio = Buffer.from(await res.arrayBuffer());
  if (cfg.cacheEnabled) {
    await mkdir(cfg.cacheDir, { recursive: true });
    await writeFile(file, audio).catch(() => {});
  }
  return { audio, cached: false };
}

export async function listVoices(cfg = ttsConfig()) {
  if (!cfg.apiKey) return { voices: [], configured: false };
  const res = await fetch(`${ELEVEN_API}/voices`, { headers: { "xi-api-key": cfg.apiKey } });
  if (!res.ok) throw Object.assign(new Error("Unable to list voices"), { status: 502 });
  const data = await res.json();
  return {
    configured: true,
    voices: (data.voices || []).map((v) => ({ id: v.voice_id, name: v.name, labels: v.labels })),
  };
}
