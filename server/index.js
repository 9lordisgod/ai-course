import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { synthesize, listVoices, ttsConfig } from "./tts.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "64kb" }));

  // Allow a static front-end (e.g. GitHub Pages) to call this API. Restrict with ALLOWED_ORIGIN.
  app.use("/api", (req, res, next) => {
    res.set({
      "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    });
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });

  // Simple in-memory rate limit per IP for the TTS endpoint.
  const hits = new Map();
  const RATE = { windowMs: 60_000, max: 30 };
  const limiter = (req, res, next) => {
    const now = Date.now();
    const ip = req.ip || "anon";
    const entry = hits.get(ip) || { count: 0, start: now };
    if (now - entry.start > RATE.windowMs) Object.assign(entry, { count: 0, start: now });
    entry.count += 1;
    hits.set(ip, entry);
    if (entry.count > RATE.max) return res.status(429).json({ error: "Too many requests" });
    next();
  };

  app.get("/api/health", (_req, res) => {
    const cfg = ttsConfig();
    res.json({ ok: true, tts: Boolean(cfg.apiKey), model: cfg.model });
  });

  app.get("/api/voices", async (_req, res) => {
    try {
      res.json(await listVoices());
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  });

  app.post("/api/tts", limiter, async (req, res) => {
    try {
      const { audio, cached } = await synthesize(req.body);
      res.set({
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
        "X-TTS-Cache": cached ? "HIT" : "MISS",
      });
      res.send(audio);
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message, fallback: "browser-speech" });
    }
  });

  app.use(express.static(path.join(root, "public"), { extensions: ["html"] }));
  app.use("/pitch", express.static(path.join(root, "pitch")));
  app.use("/docs", express.static(path.join(root, "docs")));
  app.use((_req, res) => res.sendFile(path.join(root, "public", "index.html")));
  return app;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { config } = await import("dotenv");
  config();
  const port = Number(process.env.PORT) || 3000;
  createApp().listen(port, () => {
    const cfg = ttsConfig();
    console.log(`SI Academy running at http://localhost:${port}`);
    console.log(cfg.apiKey ? `ElevenLabs TTS enabled (${cfg.model})` : "ElevenLabs key missing — using browser speech fallback");
  });
}
