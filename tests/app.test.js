import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createApp } from "../server/index.js";

const courses = JSON.parse(await readFile(new URL("../public/data/courses.json", import.meta.url)));
const i18n = JSON.parse(await readFile(new URL("../public/data/i18n.json", import.meta.url)));
const tracks = JSON.parse(await readFile(new URL("../public/data/tracks.json", import.meta.url)));
const library = JSON.parse(await readFile(new URL("../public/data/library.json", import.meta.url)));
const CJK = /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/;

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

test("learning tracks are complete, consistent and link every lesson to licensed open resources", () => {
  const trackIds = tracks.tracks.map((tr) => tr.id);
  assert.deepEqual(trackIds, ["intro", "practitioner", "engineer", "academic"]);
  const byId = new Map(tracks.modules.map((m) => [m.id, m]));
  assert.equal(byId.size, tracks.modules.length, "module ids are unique");
  const k12Ids = new Set(courses.modules.map((m) => m.id));
  for (const id of byId.keys()) assert.ok(!k12Ids.has(id), `${id} collides with a K-12 module`);

  for (const tr of tracks.tracks) {
    for (const k of ["title", "tagline", "description", "level", "audience", "outcome", "icon"]) assert.ok(typeof tr[k] === "string" && tr[k], `${tr.id}.${k}`);
    assert.ok(tr.hours > 0 && tr.weeks > 0, `${tr.id} duration`);
    assert.ok(Array.isArray(tr.spine) && tr.spine.length >= 3, `${tr.id}.spine`);
    assert.ok(tr.modules.length >= 3, `${tr.id} has modules`);
    for (const mid of tr.modules) {
      const m = byId.get(mid);
      assert.ok(m, `${tr.id} references missing module ${mid}`);
      assert.equal(m.track, tr.id, `${mid}.track`);
    }
  }

  const lessonIds = new Set();
  for (const m of tracks.modules) {
    assert.ok(trackIds.includes(m.track), `${m.id}.track`);
    assert.ok(typeof m.title === "string" && m.title && typeof m.summary === "string" && m.summary, m.id);
    assert.ok(Array.isArray(m.curriculum) && m.curriculum.length, `${m.id}.curriculum`);
    assert.deepEqual(m.grades, ["adult"], `${m.id}.grades`);
    assert.ok(m.lessons.length >= 3, `${m.id} lessons`);
    for (const l of m.lessons) {
      assert.ok(!lessonIds.has(l.id), `duplicate lesson id ${l.id}`);
      lessonIds.add(l.id);
      for (const k of ["title", "body", "activity"]) assert.ok(typeof l[k] === "string" && l[k], `${m.id}/${l.id}.${k}`);
      assert.ok(l.body.split("\n\n").length >= 3, `${l.id} body has several paragraphs`);
      assert.ok(l.minutes >= 10, `${l.id}.minutes`);
      assert.ok(l.quiz.length >= 2, `${l.id} quiz`);
      for (const q of l.quiz) {
        assert.ok(typeof q.q === "string" && q.q, `${l.id} quiz question`);
        assert.ok(Array.isArray(q.options) && q.options.length >= 2);
        assert.ok(q.answer >= 0 && q.answer < q.options.length);
      }
      assert.ok(l.resources.length >= 1 && l.resources.length <= 3, `${l.id} resources`);
      for (const r of l.resources) {
        assert.ok(typeof r.title === "string" && r.title && typeof r.by === "string" && r.by, `${l.id} resource`);
        assert.match(r.url, /^https?:\/\//, `${l.id} resource url`);
        assert.ok(typeof r.license === "string" && r.license, `${l.id} resource license`);
        assert.ok(["fork", "link"].includes(r.hosting), `${l.id} resource hosting`);
      }
    }
  }
  assert.ok(!CJK.test(JSON.stringify(tracks)), "tracks are English only");
});

test("open resource library is well-formed and cross-references tracks", () => {
  const trackIds = new Set(tracks.tracks.map((tr) => tr.id));
  const types = new Set(Object.keys(i18n.en.library.types));
  assert.ok(library.rules.length >= 3);
  for (const r of library.rules) assert.ok(r.t && r.d);
  const ids = new Set();
  let count = 0;
  for (const s of library.sections) {
    assert.ok(s.id && s.title && s.summary, "section metadata");
    assert.ok(s.items.length, `${s.id} has items`);
    for (const it of s.items) {
      count++;
      assert.ok(!ids.has(it.id), `duplicate library id ${it.id}`);
      ids.add(it.id);
      for (const k of ["title", "by", "license", "note"]) assert.ok(typeof it[k] === "string" && it[k], `${it.id}.${k}`);
      assert.match(it.url, /^https?:\/\//, `${it.id}.url`);
      assert.ok(types.has(it.type), `${it.id}.type ${it.type}`);
      assert.ok(["fork", "link"].includes(it.hosting), `${it.id}.hosting`);
      assert.ok(Array.isArray(it.tags) && Array.isArray(it.tracks), `${it.id} arrays`);
      for (const tid of it.tracks) assert.ok(trackIds.has(tid), `${it.id} references track ${tid}`);
    }
  }
  assert.ok(count >= 30, "library has a substantial catalogue");
  assert.ok(!CJK.test(JSON.stringify(library)), "library is English only");
});

test("index.html carries the deploy-stamp contract that pages.yml rewrites", async () => {
  const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
  const workflow = await readFile(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8");
  assert.match(html, /href="assets\/styles\.css\?v=dev"/);
  assert.match(html, /src="assets\/app\.js\?v=dev"/);
  assert.match(html, /window\.SI_CONFIG = \{ apiBase: "", build: "dev" \}/);
  for (const needle of ["?v=dev", 'build: \\"dev\\"', "_site/version.json"]) assert.ok(workflow.includes(needle), needle);
});

test("server serves pages, data and reports TTS status", async () => {
  const server = createApp().listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    assert.equal((await fetch(`${base}/`)).status, 200);
    assert.equal((await fetch(`${base}/pitch/`)).status, 200);
    assert.equal((await fetch(`${base}/data/courses.json`)).status, 200);
    assert.equal((await fetch(`${base}/data/tracks.json`)).status, 200);
    assert.equal((await fetch(`${base}/data/library.json`)).status, 200);
    const health = await (await fetch(`${base}/api/health`)).json();
    assert.equal(health.ok, true);
    const tts = await fetch(`${base}/api/tts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: "hi" }) });
    assert.ok([200, 503].includes(tts.status));
    if (tts.status === 503) assert.equal((await tts.json()).fallback, "browser-speech");
  } finally {
    server.close();
  }
});
