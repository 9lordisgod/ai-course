import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeRequest, cacheKey, ttsConfig, synthesize } from "../server/tts.js";

test("normalizeRequest defaults lang to en and trims text", () => {
  assert.deepEqual(normalizeRequest({ text: "  hi  " }), { text: "hi", lang: "en" });
  assert.deepEqual(normalizeRequest({ text: "你好", lang: "zh" }), { text: "你好", lang: "zh" });
});

test("normalizeRequest rejects empty and oversized text", () => {
  assert.throws(() => normalizeRequest({}), /required/);
  assert.throws(() => normalizeRequest({ text: "a".repeat(5000) }), /exceeds/);
});

test("cacheKey is stable and language-sensitive", () => {
  const cfg = ttsConfig({});
  const a = cacheKey({ text: "x", lang: "en" }, cfg);
  assert.equal(a, cacheKey({ text: "x", lang: "en" }, cfg));
  assert.notEqual(a, cacheKey({ text: "x", lang: "zh" }, cfg));
});

test("synthesize returns 503 when API key missing", async () => {
  await assert.rejects(synthesize({ text: "hi" }, ttsConfig({})), (e) => e.status === 503);
});
