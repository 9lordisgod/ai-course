import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createApp } from "../server/index.js";

const courses = JSON.parse(await readFile(new URL("../public/data/courses.json", import.meta.url)));
const i18n = JSON.parse(await readFile(new URL("../public/data/i18n.json", import.meta.url)));

test("every lesson has complete English content and valid quizzes", () => {
  for (const m of courses.modules) {
    assert.ok(typeof m.title === "string" && m.title, m.id);
    for (const l of m.lessons) {
      for (const k of ["title", "body", "activity"]) assert.ok(typeof l[k] === "string" && l[k], `${m.id}/${l.id}.${k}`);
      for (const q of l.quiz) {
        assert.ok(typeof q.q === "string" && q.q, `${m.id}/${l.id} quiz question`);
        assert.ok(Array.isArray(q.options) && q.options.length >= 2);
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
      }
    }
  }
});

test("i18n ships English strings only and every leaf is non-empty", () => {
  assert.deepEqual(Object.keys(i18n), ["en"]);
  const leaves = (o) => Object.values(o).flatMap((v) => (v && typeof v === "object" ? leaves(v) : [v]));
  for (const v of leaves(i18n.en)) assert.ok(typeof v === "number" || (typeof v === "string" && v.trim()), String(v));
  assert.ok(!JSON.stringify(i18n).includes("中文"));
});

test("server serves pages, data and reports TTS status", async () => {
  const server = createApp().listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    assert.equal((await fetch(`${base}/`)).status, 200);
    assert.equal((await fetch(`${base}/pitch/`)).status, 200);
    assert.equal((await fetch(`${base}/data/courses.json`)).status, 200);
    const health = await (await fetch(`${base}/api/health`)).json();
    assert.equal(health.ok, true);
    const tts = await fetch(`${base}/api/tts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: "hi" }) });
    assert.ok([200, 503].includes(tts.status));
    if (tts.status === 503) assert.equal((await tts.json()).fallback, "browser-speech");
  } finally {
    server.close();
  }
});
