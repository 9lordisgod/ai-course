import { ttsConfig } from "../server/tts.js";
export default function handler(_req, res) {
  const cfg = ttsConfig();
  res.status(200).json({ ok: true, tts: Boolean(cfg.apiKey), model: cfg.model });
}
