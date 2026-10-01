// Vercel serverless function: POST /api/tts  { text, lang?: "en" (default) | "zh" }
import { synthesize } from "../server/tts.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { audio } = await synthesize(req.body);
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.status(200).send(audio);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message, fallback: "browser-speech" });
  }
}
