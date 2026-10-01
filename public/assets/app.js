/* SI Academy — K-12 AI literacy SPA (no build step, no accounts). */
(() => {
"use strict";

const CFG = window.SI_CONFIG || {};
const API_BASE = String(CFG.apiBase || "").replace(/\/+$/, "");
const BUILD = String(CFG.build || "dev");
const IS_RELEASE = /^[0-9a-f]{7,40}$/.test(BUILD);
const REPO = "https://github.com/9lordisgod/ai-course";
const api = (p) => (API_BASE ? API_BASE + p : p.replace(/^\//, ""));
const versioned = (u) => `${u}?v=${encodeURIComponent(BUILD)}`;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

// ---------- Storage ----------
const store = {
  get(k, d) {
    try {
      const v = localStorage.getItem(k);
      if (v == null) return d;
      try { return JSON.parse(v); } catch { return v; }
    } catch { return d; }
  },
  set(k, v) { try { localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)); } catch { /* private mode */ } },
};

const prefersDark = () => window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
const state = {
  lang: "en",
  theme: ["light", "dark"].includes(store.get("theme")) ? store.get("theme") : prefersDark() ? "dark" : "light",
  i18n: null,
  courses: null,
  tracks: [],
  trackModules: [],
  library: null,
  policy: null,
  progress: store.get("progress", {}) || {},
  quiz: store.get("quiz", {}) || {},
  certName: store.get("certName", "") || "",
  filters: { grade: "all", area: "all", q: "" },
  lib: { section: "all", track: "all", hosting: "all", q: "" },
  teacherTab: "policy",
  planner: {},
};

// ---------- Icons (24x24 stroke set) ----------
const ICONS = {
  cpu: '<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
  sparkles: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/><path d="M4.5 3l.6 1.6 1.6.6-1.6.6L4.5 7l-.6-1.2L2.3 5.2l1.6-.6z"/>',
  scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="M3 12h4M17 12h4"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><circle cx="12" cy="16" r="1"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  feather: '<path d="M20.2 3.8a6 6 0 0 0-8.5 0L4 11.5V20h8.5l7.7-7.7a6 6 0 0 0 0-8.5z"/><path d="M16 8L2 22"/><path d="M17.5 15H9"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  rocket: '<path d="M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2"/><path d="M12 15l-3-3 3.5-5.5A7 7 0 0 1 21 3a7 7 0 0 1-3.5 8.5L12 15z"/><path d="M9 12l-4-1 3-3M12 15l1 4 3-3"/><circle cx="15" cy="9" r="1"/>',
  headphones: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>',
  map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20a7 7 0 0 1 14 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M17.5 13.5A6 6 0 0 1 22 20"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14L7 22l5-3 5 3-1.5-8"/>',
  graduation: '<path d="M2 9l10-4 10 4-10 4z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/><path d="M22 9v6"/>',
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  chevron: '<path d="M9 6l6 6-6 6"/>',
  chevronDown: '<path d="M6 9l6 6 6-6"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  check: '<path d="M5 12l5 5L20 7"/>',
  play: '<path d="M7 5v14l12-7z"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 1 2-2h14"/>',
  printer: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  file: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 4l-4 16"/>',
  flag: '<path d="M5 21V4"/><path d="M5 4h12l-2 4 2 4H5"/>',
  volume: '<path d="M4 10v4h4l5 4V6L8 10z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4-2v-4z"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v5h-5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  lightbulb: '<path d="M9 18h6M10 21h4"/><path d="M8.5 14a6 6 0 1 1 7 0c-.8.6-1.5 1.7-1.5 2.5v.5h-4v-.5c0-.8-.7-1.9-1.5-2.5z"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  crown: '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>',
  sigma: '<path d="M18 6H6l6 6-6 6h12"/>',
  scale: '<path d="M12 3v18M5 21h14"/><path d="M4 7h16"/><path d="M7 7l-3 7a3 3 0 0 0 6 0zM17 7l-3 7a3 3 0 0 0 6 0z"/>',
  library: '<path d="M4 4h4v16H4zM10 4h4v16h-4z"/><path d="M15.5 5l3.9-1 4 15.5-3.9 1z"/>',
};
const icon = (name, cls = "") => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.book}</svg>`;
const LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true"><g shape-rendering="crispEdges"><rect class="px" x="0.3" y="28.3" width="3.4" height="3.4" fill="#fff" opacity="0.28"/><rect class="px" x="4.3" y="24.3" width="3.4" height="3.4" fill="#fff" opacity="0.5"/><rect class="px" x="8.3" y="24.3" width="3.4" height="3.4" fill="#fff" opacity="0.56"/><rect class="px" x="12.3" y="24.3" width="3.4" height="3.4" fill="#fff" opacity="0.62"/><rect class="px" x="16.3" y="24.3" width="3.4" height="3.4" fill="#fff" opacity="0.68"/><rect class="px" x="20.3" y="24.3" width="3.4" height="3.4" fill="#fff" opacity="0.74"/><rect class="px" x="24.3" y="20.3" width="3.4" height="3.4" fill="#fff" opacity="0.8"/><rect class="px" x="20.3" y="16.3" width="3.4" height="3.4" fill="#fff" opacity="0.86"/><rect class="px" x="16.3" y="12.3" width="3.4" height="3.4" fill="#fff" opacity="0.92"/><rect class="px" x="12.3" y="12.3" width="3.4" height="3.4" fill="#fff" opacity="0.96"/><rect class="px" x="8.3" y="8.3" width="3.4" height="3.4" fill="#fff"/><rect class="px" x="12.3" y="4.3" width="3.4" height="3.4" fill="#fff"/><rect class="px" x="16.3" y="4.3" width="3.4" height="3.4" fill="#fff"/><rect class="px" x="20.3" y="4.3" width="3.4" height="3.4" fill="#fff"/><rect class="px" x="24.3" y="4.3" width="3.4" height="3.4" fill="#fff"/><rect class="px dither" x="21.2" y="1.2" width="1.6" height="1.6" fill="#fff" opacity="0.35"/><rect class="px dither" x="29.2" y="9.2" width="1.6" height="1.6" fill="#fff" opacity="0.45"/><rect class="px dither" x="5.2" y="17.2" width="1.6" height="1.6" fill="#fff" opacity="0.25"/><rect class="px spark" x="28.3" y="0.3" width="3.4" height="3.4" fill="#1865f2"/></g></svg>';

// ---------- Helpers ----------
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const t = (path) => path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), state.i18n[state.lang]) ?? path;
const L = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v.en ?? "" : v ?? "");
const pad = (n) => String(n).padStart(2, "0");
const allModules = () => state.courses.modules.concat(state.trackModules);
const findModule = (id) => allModules().find((m) => m.id === id);
const findTrack = (id) => state.tracks.find((tr) => tr.id === id);
const trackOf = (m) => (m.track ? findTrack(m.track) : null);
const trackModules = (tr) => tr.modules.map((id) => state.trackModules.find((m) => m.id === id)).filter(Boolean);
const siblings = (m) => (m.track ? trackModules(trackOf(m)) : state.courses.modules);
const modIndex = (m) => siblings(m).indexOf(m);
const thumbClass = (m) => `thumb-${esc(m.track || m.path)}`;
const pathOf = (m) => state.courses.paths.find((p) => p.id === m.path) || { id: m.path, title: { en: m.path } };
const modMinutes = (m) => m.lessons.reduce((s, l) => s + (l.minutes || 0), 0);
const trackMinutes = (tr) => trackModules(tr).reduce((s, m) => s + modMinutes(m), 0);
const libItems = () => state.library.sections.flatMap((s) => s.items.map((it) => ({ ...it, section: s.id })));
const gradeLabel = (g) => ({ k5: t("courses.k5"), 68: t("courses.68"), 912: t("courses.912"), adult: t("courses.adult") }[g] || g);
const areaOf = (c) => c.replace(/\s*(K[–-]\d+|\d+[–-]\d+)$/u, "").trim();
const wave = (n = 14) => `<div class="wave" aria-hidden="true">${Array.from({ length: n }, (_, i) => `<i style="--i:${i}"></i>`).join("")}</div>`;
const key = (mid, lid) => `${mid}/${lid}`;

function toast(msg, ic = "check", { action, sticky = false } = {}) {
  const el = $("#toast");
  el.innerHTML = `${icon(ic)}<span>${esc(msg)}</span>${action ? `<button type="button" class="toast-btn">${esc(action.label)}</button>` : ""}`;
  if (action) $(".toast-btn", el).onclick = action.onClick;
  el.hidden = false;
  requestAnimationFrame(() => el.classList.add("show"));
  clearTimeout(toast.timer);
  if (!sticky) toast.timer = setTimeout(() => { el.classList.remove("show"); }, 2200);
}

// ---------- Mastery ----------
const POINTS = { none: 0, attempted: 20, familiar: 50, proficient: 80, mastered: 100 };
const LEVELS = ["none", "attempted", "familiar", "proficient", "mastered"];
function lessonMastery(mid, lid) {
  const k = key(mid, lid);
  const done = Boolean(state.progress[k]);
  const q = state.quiz[k];
  const ratio = q && q.total ? q.correct / q.total : null;
  let level = "none";
  if (ratio === null) level = done ? "familiar" : "none";
  else if (ratio === 1) level = done ? "mastered" : "proficient";
  else if (ratio >= 0.5) level = done ? "proficient" : "familiar";
  else level = done ? "familiar" : "attempted";
  return { level, points: POINTS[level], done, ratio };
}
function moduleMastery(m) {
  const items = m.lessons.map((l) => ({ lesson: l, ...lessonMastery(m.id, l.id) }));
  const points = items.reduce((s, x) => s + x.points, 0);
  const total = m.lessons.length * 100;
  const done = items.filter((x) => x.done).length;
  return { items, points, total, pct: total ? Math.round((points / total) * 100) : 0, done, complete: done === m.lessons.length };
}
const allComplete = () => state.courses.modules.every((m) => moduleMastery(m).complete);
function trackMastery(tr) {
  const mods = trackModules(tr);
  const points = mods.reduce((s, m) => s + moduleMastery(m).points, 0);
  const total = mods.reduce((s, m) => s + moduleMastery(m).total, 0);
  const done = mods.filter((m) => moduleMastery(m).complete).length;
  return { points, total, pct: total ? Math.round((points / total) * 100) : 0, done, complete: mods.length > 0 && done === mods.length };
}
function lastActivity() {
  let best = null;
  for (const [k, v] of Object.entries(state.progress)) {
    const ts = typeof v === "number" ? v : Date.parse(v) || 0;
    if (!best || ts > best.ts) best = { k, ts };
  }
  if (!best) return null;
  const [mid, lid] = best.k.split("/");
  const m = findModule(mid);
  if (!m) return null;
  const idx = m.lessons.findIndex((l) => l.id === lid);
  const next = m.lessons[idx + 1];
  if (next) return { m, l: next, resume: true };
  const nextMod = siblings(m).find((x) => !moduleMastery(x).complete);
  return nextMod ? { m: nextMod, l: nextMod.lessons.find((l) => !lessonMastery(nextMod.id, l.id).done) || nextMod.lessons[0], resume: false } : null;
}
const mbox = (level, cls = "") => `<span class="mbox ${level} ${cls}" title="${esc(t(`ui.mastery.levels.${level}`))}">${level === "mastered" ? icon("check") : ""}</span>`;
const levelBadge = (level) => `<span class="badge badge-${level}">${esc(t(`ui.level.${level}`))}</span>`;

// ---------- Text-to-speech (ElevenLabs proxy with browser fallback) ----------
const tts = {
  audio: null,
  cache: new Map(),
  ui: null,
  async speak(text, lang, ui) {
    this.stop();
    this.ui = ui;
    ui.root.classList.add("loading");
    ui.root.classList.remove("fallback");
    ui.status.textContent = t("lesson.loading");
    ui.btn.innerHTML = icon("stop", "fill");
    ui.btn.dataset.playing = "1";
    const k = `${lang}|${text}`;
    try {
      let url = this.cache.get(k);
      if (!url) {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 25_000);
        const res = await fetch(api("/api/tts"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, lang }),
          signal: ctrl.signal,
        }).finally(() => clearTimeout(timer));
        if (!res.ok || !(res.headers.get("content-type") || "").includes("audio")) {
          throw new Error((await res.json().catch(() => ({}))).error || res.statusText || "TTS unavailable");
        }
        url = URL.createObjectURL(await res.blob());
        this.cache.set(k, url);
      }
      if (this.ui !== ui) return;
      ui.player.src = url;
      this.audio = ui.player;
      ui.root.classList.add("has-audio");
      ui.root.classList.remove("loading");
      ui.status.textContent = "ElevenLabs · English";
      await ui.player.play();
    } catch (err) {
      console.warn("TTS API unavailable, falling back to browser speech:", err.message);
      if (this.ui === ui) this.browserSpeak(text, lang, ui);
    }
  },
  browserSpeak(text, lang, ui) {
    ui.root.classList.remove("loading");
    if (!("speechSynthesis" in window)) {
      ui.status.textContent = "Speech not supported in this browser";
      return this.reset(ui);
    }
    ui.root.classList.add("playing", "fallback");
    ui.status.textContent = t("lesson.fallback");
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-CA";
    const voice = speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith("en"));
    if (voice) u.voice = voice;
    u.rate = 0.95;
    u.onend = () => this.reset(ui);
    u.onerror = () => this.reset(ui);
    speechSynthesis.speak(u);
  },
  stop() {
    if (this.audio) { this.audio.pause(); this.audio = null; }
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    if (this.ui) this.reset(this.ui);
  },
  reset(ui) {
    ui.root.classList.remove("playing", "loading");
    ui.btn.innerHTML = icon("play", "fill");
    delete ui.btn.dataset.playing;
    if (!ui.root.classList.contains("has-audio")) ui.status.textContent = ui.defaultStatus;
    if (this.ui === ui) this.ui = null;
  },
};

// ---------- Chrome (header / footer) ----------
function renderChrome() {
  const nav = ["courses", "tracks", "library", "teachers", "parents", "policy", "about"];
  const href = (k) => (k === "home" ? "#/" : `#/${k}`);
  $("#chrome").innerHTML = `
    <div class="topbar">
      <div class="wrap topbar-inner">
        <a class="brand" href="#/"><span class="logo">${LOGO}</span><span class="brand-text"><b>${esc(t("brand"))}</b></span></a>
        <nav class="nav" aria-label="Primary">${nav.map((k) => `<a href="${href(k)}" data-nav="${k}">${esc(t(`nav.${k}`))}</a>`).join("")}</nav>
        <div class="search" role="search">
          ${icon("search")}
          <input id="q" type="search" autocomplete="off" placeholder="${esc(t("ui.search"))}" aria-label="${esc(t("ui.search"))}" />
          <div class="search-results" id="searchResults" hidden></div>
        </div>
        <div class="actions">
          <button class="btn-icon search-btn" id="searchBtn" aria-label="${esc(t("ui.search"))}" aria-expanded="false" aria-controls="q">${icon("search")}</button>
          <button class="btn-icon" id="themeBtn" title="${esc(t("ui.theme"))}" aria-label="${esc(t("ui.theme"))}">${icon(state.theme === "dark" ? "sun" : "moon")}</button>
          <a class="btn btn-accent btn-sm hide-sm" href="#/courses">${esc(t("ui.startLearning"))}</a>
          <button class="btn-icon menu-btn" id="menuBtn" aria-label="${esc(t("ui.menu"))}" aria-expanded="false" aria-controls="mobileMenu">${icon("menu")}</button>
        </div>
      </div>
      <div class="mobile-menu" id="mobileMenu">
        ${["home", ...nav].map((k) => `<a href="${href(k)}">${esc(t(`nav.${k}`))}</a>`).join("")}
      </div>
    </div>`;

  const fl = t("ui.footerLinks");
  $("#footer").innerHTML = `
    <div class="footer">
      <div class="wrap footer-grid">
        <div class="footer-brand">
          <a class="brand" href="#/"><span class="logo">${LOGO}</span><span class="brand-text"><b>${esc(t("brand"))}</b></span></a>
          <p>${esc(t("tagline"))}</p>
        </div>
        <div><h4>${esc(fl.learn)}</h4><ul>
          <li><a href="#/courses">${esc(t("nav.courses"))}</a></li>
          ${state.courses.paths.map((p) => `<li><a href="#/courses#path-${p.id}">${esc(L(p.title))}</a></li>`).join("")}
          <li><a href="#/tracks">${esc(t("nav.tracks"))}</a></li>
          ${state.tracks.map((tr) => `<li><a href="#/tracks/${tr.id}">${esc(tr.title)}</a></li>`).join("")}
        </ul></div>
        <div><h4>${esc(fl.educators)}</h4><ul>
          <li><a href="#/teachers">${esc(t("nav.teachers"))}</a></li>
          <li><a href="#/parents">${esc(t("nav.parents"))}</a></li>
          <li><a href="#/policy">${esc(t("nav.policy"))}</a></li>
          <li><a href="#/certificate">${esc(t("certificate.title"))}</a></li>
        </ul></div>
        <div><h4>${esc(fl.resources)}</h4><ul>
          <li><a href="#/library">${icon("library")}${esc(t("library.title"))}</a></li>
          <li><a href="${REPO}" target="_blank" rel="noopener">${icon("code")}${esc(fl.github)}</a></li>
          <li><a href="${REPO}/blob/main/docs/research.md" target="_blank" rel="noopener">${icon("file")}${esc(fl.research)}</a></li>
        </ul></div>
      </div>
      <div class="wrap footer-bottom"><span>${esc(t("footer"))}</span><span>© ${new Date().getFullYear()} ${esc(t("brand"))} · ${esc(fl.openSource)} · ${IS_RELEASE
        ? `<a class="build" href="${REPO}/commit/${BUILD}" target="_blank" rel="noopener" title="${esc(fl.buildTitle)}">${esc(fl.build)} ${BUILD}</a>`
        : `<span class="build">${esc(fl.build)} ${esc(BUILD)}</span>`}</span></div>
    </div>`;

  $("#themeBtn").onclick = () => setTheme(state.theme === "dark" ? "light" : "dark");
  const menuBtn = $("#menuBtn"), menu = $("#mobileMenu"), searchBtn = $("#searchBtn"), topbar = $(".topbar");
  const setMenu = (open) => {
    menu.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.innerHTML = icon(open ? "close" : "menu");
  };
  // Phones hide the inline search box; this toggles it as a panel under the topbar.
  const setSearch = (open) => {
    topbar.classList.toggle("search-open", open);
    searchBtn.setAttribute("aria-expanded", String(open));
    searchBtn.innerHTML = icon(open ? "close" : "search");
    if (open) { setMenu(false); $("#q").focus(); } else { $("#searchResults").hidden = true; }
  };
  menuBtn.onclick = () => { setSearch(false); setMenu(!menu.classList.contains("open")); };
  searchBtn.onclick = () => setSearch(!topbar.classList.contains("search-open"));
  menu.onclick = () => setMenu(false);
  window.addEventListener("hashchange", () => { setMenu(false); setSearch(false); });
  wireSearch();
}

function setTheme(theme) {
  state.theme = theme;
  store.set("theme", theme);
  document.documentElement.dataset.theme = theme;
  $('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#0b0b0c" : "#0f1115");
  $("#themeBtn").innerHTML = icon(theme === "dark" ? "sun" : "moon");
}

// ---------- Search ----------
let searchIndex = null;
function buildIndex() {
  const out = [];
  for (const m of allModules()) {
    const tr = trackOf(m);
    out.push({ type: "module", href: `#/module/${m.id}`, title: m.title, sub: tr ? tr.title : m.summary, icon: m.icon, text: [m.title, m.summary, tr ? tr.title : "", ...m.curriculum].join(" ") });
    for (const l of m.lessons) {
      out.push({ type: "lesson", href: `#/module/${m.id}/${l.id}`, title: l.title, sub: m.title, icon: "book", text: [l.title, l.body, l.activity, ...(l.resources || []).map((r) => r.title)].join(" ") });
    }
  }
  for (const tr of state.tracks) {
    out.push({ type: "track", href: `#/tracks/${tr.id}`, title: tr.title, sub: tr.tagline, icon: tr.icon, text: [tr.title, tr.tagline, tr.description, ...tr.spine].join(" ") });
  }
  for (const it of libItems()) {
    out.push({ type: "library", href: `#/library#lib-${it.id}`, title: it.title, sub: `${it.by} · ${it.license}`, icon: "library", text: [it.title, it.by, it.note, it.license, ...it.tags].join(" ") });
  }
  for (const p of state.policy.provinces) {
    out.push({ type: "policy", href: "#/policy", title: p.name, sub: p.where, icon: "flag", text: [p.name, p.where, p.notes].join(" ") });
  }
  return out.map((x) => ({ ...x, text: x.text.toLowerCase() }));
}
const typeLabel = (type) => t({ module: "ui.module", lesson: "ui.lesson", track: "nav.tracks", library: "nav.library", policy: "nav.policy" }[type] || "ui.lesson");
function search(q, limit = 8) {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  searchIndex ??= buildIndex();
  const terms = needle.split(/\s+/);
  return searchIndex
    .map((x) => ({ x, score: terms.reduce((s, tm) => s + (L(x.title).toLowerCase().includes(tm) ? 3 : x.text.includes(tm) ? 1 : -100), 0) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.x);
}
function wireSearch() {
  const input = $("#q"), box = $("#searchResults");
  let sel = -1;
  const close = () => { box.hidden = true; sel = -1; };
  const render = () => {
    const q = input.value;
    if (!q.trim()) return close();
    const res = search(q);
    box.hidden = false;
    box.innerHTML = res.length
      ? res.map((r) => `<a href="${r.href}">${icon(r.icon)}<span><span class="sr-t">${esc(L(r.title))}</span><br><span class="sr-d">${esc(typeLabel(r.type))} · ${esc(L(r.sub)).slice(0, 80)}</span></span></a>`).join("") +
        `<a class="sr-all" href="#/courses?q=${encodeURIComponent(q.trim())}">${esc(t("ui.searchAll"))} ${icon("arrow")}</a>`
      : `<div class="sr-empty">${esc(t("ui.searchEmpty"))}</div>`;
  };
  input.oninput = render;
  input.onfocus = render;
  input.onkeydown = (e) => {
    const links = $$("a", box);
    if (e.key === "Escape") return close();
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;
      links.forEach((a, i) => a.classList.toggle("sel", i === sel));
    }
    if (e.key === "Enter") {
      const target = links[sel] || links[0];
      if (target) { location.hash = target.getAttribute("href"); close(); input.blur(); }
    }
  };
  box.onclick = () => { close(); input.value = ""; };
  if (!wireSearch.bound) {
    wireSearch.bound = true;
    document.addEventListener("click", (e) => { if (!e.target.closest(".search")) $("#searchResults").hidden = true; });
  }
}

// ---------- Shared fragments ----------
function crumbs(items) {
  return `<nav class="crumbs" aria-label="Breadcrumb"><a href="#/">${esc(t("nav.home"))}</a>${items.map((it) => `${icon("chevron")}${it.href ? `<a href="${it.href}">${esc(it.label)}</a>` : `<span>${esc(it.label)}</span>`}`).join("")}</nav>`;
}
function moduleCard(m, opts = {}) {
  const mm = moduleMastery(m);
  const idx = modIndex(m);
  const showStart = opts.startHere && idx === 0 && mm.points === 0;
  return `
    <a class="mcard card card-hover" href="#/module/${m.id}">
      <div class="thumb ${thumbClass(m)}">${icon(m.icon)}</div>
      <div class="mcard-body">
        <div class="mcard-meta"><span class="mono">${esc(t("ui.module"))} ${pad(idx + 1)}</span>${levelBadge(m.level)}${showStart ? `<span class="badge badge-start">${icon("star")}${esc(t("ui.startHere"))}</span>` : ""}${mm.complete ? `<span class="badge badge-mastered">${icon("check")}${esc(t("lesson.completed"))}</span>` : ""}</div>
        <h3>${esc(L(m.title))}</h3>
        <p>${esc(L(m.summary))}</p>
        <div class="mcard-foot"><span>${icon("book")}${m.lessons.length} ${esc(t("courses.lessons"))}</span><span>${icon("clock")}${modMinutes(m)} ${esc(t("courses.min"))}</span><span>${m.grades.map(gradeLabel).join(" · ")}</span></div>
        <div class="mastery-line"><div class="bar"><i style="width:${mm.pct}%"></i></div><span class="mono">${mm.points}/${mm.total}</span></div>
      </div>
    </a>`;
}
function tocCard(m, currentLid) {
  return `
    <div class="toc card">
      <a class="toc-mod" href="#/module/${m.id}"><span class="thumb ${thumbClass(m)} sm">${icon(m.icon)}</span><span>${esc(L(m.title))}</span></a>
      <h4>${esc(t("ui.contents"))}</h4>
      <ol>${m.lessons.map((l, i) => {
        const lm = lessonMastery(m.id, l.id);
        return `<li><a href="#/module/${m.id}/${l.id}" class="${l.id === currentLid ? "current" : ""}">${mbox(lm.level)}<span>${i + 1}. ${esc(L(l.title))}</span><small>${l.minutes} ${esc(t("courses.min"))}</small></a></li>`;
      }).join("")}</ol>
    </div>`;
}
function miniMastery(m) {
  const mm = moduleMastery(m);
  return `
    <div class="mini-mastery card">
      <div class="row"><span>${esc(t("ui.mastery.title"))}</span><b>${mm.points}/${mm.total}</b></div>
      <div class="bar"><i style="width:${mm.pct}%"></i></div>
      <div class="row muted small"><span>${mm.done}/${m.lessons.length} ${esc(t("courses.progress"))}</span><span>${esc(t("ui.mastery.points"))}</span></div>
    </div>`;
}
function trackCard(tr) {
  const tk = t("tracks"), tm = trackMastery(tr), mods = trackModules(tr);
  return `
    <a class="tcard card card-hover" href="#/tracks/${tr.id}">
      <div class="tcard-head"><span class="thumb thumb-${esc(tr.id)}">${icon(tr.icon)}</span><div class="mcard-meta">${levelBadge(tr.level)}${tm.complete ? `<span class="badge badge-mastered">${icon("check")}${esc(tk.complete)}</span>` : ""}</div></div>
      <h3>${esc(tr.title)}</h3>
      <p>${esc(tr.tagline)}</p>
      <ol class="spine">${tr.spine.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
      <div class="mcard-foot"><span>${icon("layers")}${mods.length} ${esc(tk.modules)}</span><span>${icon("clock")}~${tr.hours} ${esc(tk.hours)}</span><span>${icon("map")}${tr.weeks} ${esc(tk.weeks)}</span></div>
      <div class="mastery-line"><div class="bar"><i style="width:${tm.pct}%"></i></div><span class="mono">${tm.points}/${tm.total}</span></div>
    </a>`;
}
const hostBadge = (h) => `<span class="badge badge-${h === "fork" ? "fork" : "link"}">${icon(h === "fork" ? "code" : "link")}${esc(t(`library.${h}`))}</span>`;
function resourceList(resources) {
  return `<ul class="res-block">${resources.map((r) => `
    <li><a href="${esc(r.url)}" target="_blank" rel="noopener">
      <span class="res-main"><b>${esc(r.title)}</b><span class="muted">${esc(t("library.by"))} ${esc(r.by)}</span>${r.note ? `<span class="res-note">${esc(r.note)}</span>` : ""}</span>
      <span class="res-tags">${hostBadge(r.hosting)}<span class="badge badge-license">${esc(r.license)}</span>${icon("external")}</span>
    </a></li>`).join("")}</ul>`;
}

// ---------- Pages ----------
const pages = {
  home() {
    const h = t("hero"), ui = t("ui"), f = t("features"), tk = t("tracks");
    const counts = { modules: allModules().length, tracks: state.tracks.length, library: libItems().length };
    const cont = lastActivity();
    const contHtml = cont ? `
      <section class="continue"><div class="wrap">
        <div class="continue-card card">
          <div class="thumb ${thumbClass(cont.m)}">${icon(cont.m.icon)}</div>
          <div><p class="kicker">${esc(ui.continue)}</p><h3>${esc(L(cont.m.title))} · ${esc(L(cont.l.title))}</h3><div class="bar" style="max-width:320px"><i style="width:${moduleMastery(cont.m).pct}%"></i></div></div>
          <a class="btn btn-primary" href="#/module/${cont.m.id}/${cont.l.id}">${esc(ui.resume)} ${icon("arrow")}</a>
        </div>
      </div></section>` : "";
    return `
      <section class="hero"><div class="wrap hero-grid">
        <div class="hero-copy">
          <p class="kicker">${esc(h.kicker)}</p>
          <h1>${esc(h.title)}</h1>
          <p class="lead">${esc(h.subtitle)}</p>
          <div class="hero-actions"><a class="btn btn-primary btn-lg" href="#/courses">${esc(h.cta)} ${icon("arrow")}</a><a class="btn btn-ghost btn-lg" href="#/tracks">${esc(h.cta2)}</a></div>
          <ul class="stats">${h.stats.map((s) => `<li><b>${esc(s.k ? counts[s.k] : s.n)}</b><span>${esc(s.l)}</span></li>`).join("")}</ul>
        </div>
        <div class="preview playing" aria-hidden="true">
          <span class="preview-badge">${esc(ui.lesson)} · ${esc(ui.level.intermediate)}</span>
          <div class="preview-top"><span class="mono">${esc(h.preview.module)}</span>${mbox("proficient")}</div>
          <h3>${esc(h.preview.lesson)}</h3>
          <div class="player playing"><button class="play" tabindex="-1">${icon("stop", "fill")}</button>${wave(18)}<div class="player-meta"><b>${esc(ui.listen)}</b><span>${esc(h.preview.playing)}</span></div></div>
          <div class="preview-quiz">
            <p class="mono">${esc(ui.practice)}</p>
            <p class="q-text">${esc(h.preview.quiz)}</p>
            <div class="opt ok"><span class="dot"></span>${esc(h.preview.choice)}</div>
            <p class="ok-text">${icon("check")} ${esc(h.preview.correct)}</p>
          </div>
        </div>
      </div></section>
      <div class="trust"><div class="wrap"><span class="mono">${esc(ui.trust)}</span><span>National AI Literacy Initiative · Amii</span><span>B.C. ADST &amp; Career Education</span><span>New Brunswick K–12</span><span>OCAP® · FNIGC</span><span>ElevenLabs</span></div></div>
      ${contHtml}
      <section class="section"><div class="wrap">
        <div class="section-head"><h2>${esc(ui.audienceTitle)}</h2></div>
        <div class="grid-3">${ui.audience.map((a) => `<div class="acard card card-hover"><span class="icon-wrap">${icon(a.icon)}</span><h3>${esc(a.t)}</h3><p>${esc(a.d)}</p><a class="btn btn-ghost btn-sm" href="${esc(a.href)}">${esc(a.cta)} ${icon("arrow")}</a></div>`).join("")}</div>
      </div></section>
      <section class="section section-warm"><div class="wrap">
        <div class="section-head"><div><h2>${esc(ui.paths)}</h2><p>${esc(t("courses.subtitle"))}</p></div><a class="more" href="#/courses">${esc(ui.viewAll)} ${icon("arrow")}</a></div>
        <div class="paths-grid">${state.courses.paths.map((p, i) => {
          const mods = state.courses.modules.filter((m) => m.path === p.id);
          return `<div class="pcard card"><div class="pcard-head"><h3>${esc(L(p.title))}</h3><span class="mono">${esc(t("ui.results"))} · ${pad(mods.length)}</span></div><p>${esc(L(p.description))}</p>
            <ul>${mods.map((m) => `<li><a href="#/module/${m.id}"><span class="glyph ${thumbClass(m)}">${icon(m.icon)}</span><span class="t">${esc(L(m.title))}</span>${levelBadge(m.level)}${icon("chevron")}</a></li>`).join("")}</ul></div>`;
        }).join("")}</div>
      </div></section>
      <section class="section"><div class="wrap">
        <div class="section-head"><div><p class="kicker">${esc(tk.kicker)}</p><h2>${esc(tk.title)}</h2><p>${esc(tk.subtitle)}</p></div><a class="more" href="#/tracks">${esc(tk.viewAll)} ${icon("arrow")}</a></div>
        <div class="tracks-grid">${state.tracks.map(trackCard).join("")}</div>
        <div class="lib-teaser card"><span class="icon-wrap">${icon("library")}</span><div><h3>${esc(t("library.title"))}</h3><p>${esc(tk.libraryTeaser)}</p></div><a class="btn btn-dark" href="#/library">${esc(tk.libraryCta)} ${icon("arrow")}</a></div>
      </div></section>
      <section class="section section-warm"><div class="wrap">
        <div class="section-head"><h2>${esc(f.title)}</h2></div>
        <div class="grid-3">${f.items.map((x) => `<div class="feat card"><span class="icon-wrap">${icon(x.icon)}</span><h3>${esc(x.t)}</h3><p>${esc(x.d)}</p></div>`).join("")}</div>
      </div></section>
      <section class="section"><div class="wrap">
        <div class="section-head"><h2>${esc(ui.howTitle)}</h2></div>
        <div class="how-grid">
          <ol class="steps">${ui.how.map((s) => `<li><div><b>${esc(s.t)}</b><span>${esc(s.d)}</span></div></li>`).join("")}</ol>
          <div class="card"><h4>${esc(ui.mastery.title)}</h4><div class="legend">${LEVELS.map((lv) => `<div>${mbox(lv, "lg")}<span>${esc(ui.mastery.levels[lv])}</span><small>${POINTS[lv]} pts</small></div>`).join("")}</div><p class="muted small" style="margin:14px 0 0">${esc(ui.mastery.explain)}</p></div>
        </div>
      </div></section>
      <section class="cta-band"><div class="wrap">
        <h2>${esc(ui.ctaBand.title)}</h2><p>${esc(ui.ctaBand.body)}</p>
        <div class="hero-actions"><a class="btn btn-light btn-lg" href="#/courses">${esc(ui.ctaBand.cta)} ${icon("arrow")}</a></div>
      </div></section>`;
  },

  courses(query) {
    const c = t("courses"), ui = t("ui");
    const f = state.filters;
    if (query.has("q")) f.q = query.get("q");
    if (query.has("grade")) f.grade = query.get("grade");
    if ([...query.keys()].length) history.replaceState(null, "", "#/courses");
    const areas = [...new Set(state.courses.modules.flatMap((m) => m.curriculum.map(areaOf)))];
    const q = f.q.trim().toLowerCase();
    const matches = (m) =>
      (f.grade === "all" || m.grades.includes(f.grade)) &&
      (f.area === "all" || m.curriculum.some((x) => areaOf(x) === f.area)) &&
      (!q || [m.title, m.summary, ...m.curriculum, ...m.lessons.flatMap((l) => [l.title, l.body])].join(" ").toLowerCase().includes(q));
    const visible = state.courses.modules.filter(matches);
    const chips = (name, list, cur) => `<div class="chips">${list.map(([v, lbl]) => `<button class="chip ${cur === v ? "on" : ""}" data-filter="${name}" data-value="${esc(v)}">${esc(lbl)}</button>`).join("")}</div>`;
    return `
      <div class="wrap page-head"><p class="kicker">${esc(t("brand"))}</p><h1>${esc(c.title)}</h1><p class="lead">${esc(c.subtitle)}</p></div>
      <div class="wrap layout">
        <aside class="side">
          <div class="side-block"><h4>${esc(ui.gradeBand)}</h4>${chips("grade", [["all", c.all], ["k5", c.k5], ["68", c["68"]], ["912", c["912"]]], f.grade)}</div>
          <div class="side-block"><h4>${esc(ui.curriculumFilter)}</h4>${chips("area", [["all", c.all], ...areas.map((a) => [a, a])], f.area)}</div>
          <div class="side-block"><h4>${esc(ui.paths)}</h4><ul class="side-links">${state.courses.paths.map((p) => `<li><a href="#/courses#path-${p.id}" data-jump="path-${p.id}">${esc(L(p.title))}<small>${pad(state.courses.modules.filter((m) => m.path === p.id).length)}</small></a></li>`).join("")}</ul></div>
          <button class="btn btn-ghost btn-sm" id="resetFilters">${icon("refresh")} ${esc(ui.reset)}</button>
        </aside>
        <div class="content">
          <div class="results-bar"><input class="input" id="courseSearch" type="search" placeholder="${esc(c.search)}" value="${esc(f.q)}" aria-label="${esc(c.search)}" /><span class="count">${visible.length} ${esc(ui.results)}</span></div>
          ${visible.length ? state.courses.paths.map((p) => {
            const mods = visible.filter((m) => m.path === p.id);
            if (!mods.length) return "";
            return `<section class="path-section" id="path-${p.id}"><div class="section-head"><div><h2>${esc(L(p.title))}</h2><p>${esc(L(p.description))}</p></div></div><div class="mgrid">${mods.map((m) => moduleCard(m, { startHere: true })).join("")}</div></section>`;
          }).join("") : `<div class="empty">${esc(ui.searchEmpty)}</div>`}
        </div>
      </div>`;
  },

  module(mid) {
    const m = findModule(mid);
    if (!m) return pages.notFound();
    const ui = t("ui"), c = t("courses");
    const mm = moduleMastery(m);
    const tr = trackOf(m), p = pathOf(m);
    const crumbTrail = tr
      ? [{ label: t("nav.tracks"), href: "#/tracks" }, { label: tr.title, href: `#/tracks/${tr.id}` }, { label: L(m.title) }]
      : [{ label: t("nav.courses"), href: "#/courses" }, { label: L(p.title), href: `#/courses#path-${p.id}` }, { label: L(m.title) }];
    const nextLesson = m.lessons.find((l) => !lessonMastery(m.id, l.id).done) || m.lessons[0];
    return `
      <div class="wrap">${crumbs(crumbTrail)}</div>
      <div class="wrap layout">
        <aside class="side side-toc">${tocCard(m)}${miniMastery(m)}</aside>
        <div class="content">
          <header class="mod-hero">
            <div class="thumb ${thumbClass(m)} lg">${icon(m.icon)}</div>
            <div>
              <div class="mcard-meta"><span class="mono">${esc(ui.module)} ${pad(modIndex(m) + 1)}</span>${levelBadge(m.level)}${m.grades.map((g) => `<span class="badge badge-outline">${esc(gradeLabel(g))}</span>`).join("")}</div>
              <h1>${esc(L(m.title))}</h1>
              <p class="lead">${esc(L(m.summary))}</p>
              <div class="hero-actions"><a class="btn btn-primary" href="#/module/${m.id}/${nextLesson.id}">${esc(mm.points ? ui.resume : ui.startLearning)} ${icon("arrow")}</a><span class="muted small" style="align-self:center">${m.lessons.length} ${esc(c.lessons)} · ${modMinutes(m)} ${esc(c.min)}</span></div>
            </div>
          </header>
          <section class="mastery-panel card">
            <div>
              <p class="kicker">${esc(ui.mastery.title)}</p>
              <p class="big">${mm.points}<small> / ${mm.total} ${esc(ui.mastery.points)}</small></p>
              <div class="bar"><i style="width:${mm.pct}%"></i></div>
              <p class="explain">${esc(ui.mastery.explain)}</p>
            </div>
            <div class="mboxes">${mm.items.map(({ lesson, level, points }) => `<a href="#/module/${m.id}/${lesson.id}">${mbox(level, "lg")}<span><b>${esc(L(lesson.title))}</b><small>${esc(ui.mastery.levels[level])}</small></span><span class="pts">${points}/100</span></a>`).join("")}</div>
          </section>
          <section style="margin-bottom:36px"><h2>${esc(ui.aboutModule)}</h2><p class="lead">${esc(L(m.summary))}</p><p><b>${esc(tr ? t("tracks.topics") : t("lesson.curriculum"))}:</b> ${m.curriculum.map((x) => `<span class="tag">${esc(x)}</span>`).join(" ")}</p></section>
          <section>
            <div class="section-head"><h2>${esc(ui.contents)}</h2></div>
            <div class="lesson-list">${m.lessons.map((l, i) => {
              const lm = lessonMastery(m.id, l.id);
              return `<a class="lrow card card-hover" href="#/module/${m.id}/${l.id}"><span class="num">${pad(i + 1)}</span><div><h3>${esc(L(l.title))}</h3><div class="meta"><span>${icon("clock")}${l.minutes} ${esc(c.min)}</span><span>${icon("book")}${esc(ui.read)}</span><span>${icon("headphones")}${esc(ui.listen)}</span><span>${icon("target")}${esc(ui.practice)} · ${l.quiz.length}</span></div></div><span class="badge badge-${lm.level}">${esc(ui.mastery.levels[lm.level])}</span><span class="chev">${icon("chevron")}</span></a>`;
            }).join("")}</div>
          </section>
        </div>
      </div>`;
  },

  lesson(mid, lid) {
    const m = findModule(mid);
    const idx = m ? m.lessons.findIndex((x) => x.id === lid) : -1;
    if (!m || idx < 0) return pages.notFound();
    const l = m.lessons[idx];
    const lt = t("lesson"), ui = t("ui");
    const prev = m.lessons[idx - 1], next = m.lessons[idx + 1];
    const lm = lessonMastery(m.id, l.id);
    const tr = trackOf(m);
    const nextMod = siblings(m)[modIndex(m) + 1];
    const finishHref = tr ? `#/certificate?track=${tr.id}` : "#/certificate";
    const crumbTrail = tr
      ? [{ label: t("nav.tracks"), href: "#/tracks" }, { label: tr.title, href: `#/tracks/${tr.id}` }, { label: L(m.title), href: `#/module/${m.id}` }, { label: L(l.title) }]
      : [{ label: t("nav.courses"), href: "#/courses" }, { label: L(m.title), href: `#/module/${m.id}` }, { label: L(l.title) }];
    const saved = state.quiz[key(m.id, l.id)];
    return `
      <div class="wrap">${crumbs(crumbTrail)}</div>
      <div class="wrap layout">
        <aside class="side side-toc" id="lessonSide">${tocCard(m, l.id)}${miniMastery(m)}</aside>
        <div class="content article">
          <p class="kicker">${esc(ui.lesson)} ${idx + 1} ${esc(ui.of)} ${m.lessons.length}</p>
          <h1>${esc(L(l.title))}</h1>
          <div class="lesson-meta"><span>${icon("clock")}${l.minutes} ${esc(t("courses.min"))}</span><span>${icon("layers")}${esc(L(m.title))}</span><span>${icon("map")}${m.curriculum.map(esc).join(" · ")}</span><span class="badge badge-${lm.level}" id="lessonLevel">${esc(ui.mastery.levels[lm.level])}</span></div>
          <div class="player sticky-player" id="player">
            <button class="play" id="listen" aria-label="${esc(lt.listen)}">${icon("play", "fill")}</button>
            ${wave(22)}
            <div class="player-meta"><b>${esc(lt.listen)}</b><span id="ttsStatus">ElevenLabs · English</span><audio id="ttsPlayer" controls></audio></div>
          </div>
          <article class="prose" id="lessonText">${L(l.body).split(/\n\n+/).map((p) => `<p>${esc(p)}</p>`).join("")}</article>
          <aside class="callout"><span class="callout-icon">${icon("lightbulb")}</span><div><b>${esc(lt.activity)}</b><p>${esc(L(l.activity))}</p></div></aside>
          ${l.resources && l.resources.length ? `<section class="resources"><div class="section-head"><div><h2>${esc(lt.resources)}</h2><p>${esc(lt.resourcesHelp)}</p></div></div>${resourceList(l.resources)}</section>` : ""}
          <section class="quiz card" id="quiz">
            <div class="quiz-head"><p class="kicker">${esc(lt.quiz)}</p><span class="mono">${l.quiz.length} Q · ${saved ? `${esc(lt.score)} ${saved.correct}/${saved.total}` : "100 pts"}</span></div>
            ${l.quiz.map((q, qi) => `<div class="q" data-answer="${q.answer}"><p class="q-text"><span class="n">${pad(qi + 1)}</span>${esc(L(q.q))}</p><div class="opts">${L(q.options).map((o, oi) => `<label class="opt"><input type="radio" name="q${qi}" value="${oi}" /><span>${esc(o)}</span><span class="mark"></span></label>`).join("")}</div></div>`).join("")}
            <div class="quiz-actions"><button class="btn btn-primary" id="checkQuiz">${esc(lt.submit)}</button><span class="feedback" id="quizResult"></span></div>
          </section>
          <div class="lesson-nav">
            ${prev ? `<a class="btn btn-ghost" href="#/module/${m.id}/${prev.id}">${icon("arrowLeft")} ${esc(lt.prev)}</a>` : `<a class="btn btn-ghost" href="#/module/${m.id}">${icon("arrowLeft")} ${esc(lt.back)}</a>`}
            <button class="btn ${lm.done ? "btn-ghost" : "btn-accent"}" id="complete">${lm.done ? icon("check") : ""} ${esc(lm.done ? lt.completed : lt.complete)}</button>
            ${next ? `<a class="btn btn-primary" href="#/module/${m.id}/${next.id}">${esc(lt.next)} ${icon("arrow")}</a>` : nextMod ? `<a class="btn btn-primary" href="#/module/${nextMod.id}">${esc(ui.module)} ${pad(modIndex(nextMod) + 1)} ${icon("arrow")}</a>` : `<a class="btn btn-primary" href="${finishHref}">${esc(tr ? t("tracks.certificate") : t("certificate.title"))} ${icon("award")}</a>`}
          </div>
          ${next ? `<div class="upnext card"><div class="thumb ${thumbClass(m)} sm">${icon("book")}</div><div><p class="kicker">${esc(ui.upNext)}</p><a class="title" href="#/module/${m.id}/${next.id}">${esc(L(next.title))}</a><div class="muted small">${next.minutes} ${esc(t("courses.min"))}</div></div><a class="btn btn-ghost btn-sm" href="#/module/${m.id}/${next.id}">${icon("arrow")}</a></div>`
            : nextMod ? `<div class="upnext card"><div class="thumb ${thumbClass(nextMod)} sm">${icon(nextMod.icon)}</div><div><p class="kicker">${esc(ui.upNext)} · ${esc(ui.module)} ${pad(modIndex(nextMod) + 1)}</p><a class="title" href="#/module/${nextMod.id}">${esc(L(nextMod.title))}</a></div><a class="btn btn-ghost btn-sm" href="#/module/${nextMod.id}">${icon("arrow")}</a></div>` : ""}
        </div>
      </div>`;
  },

  teachers() {
    const th = t("teachers"), c = t("courses");
    const subjects = ["English Language Arts", "Social Studies", "Science", "Mathematics", "ADST / Technology", "Career Education", "Arts"];
    const tabs = [["policy", "shield"], ["template", "file"], ["modules", "table"], ["resources", "link"]];
    const tab = state.teacherTab;
    const plannerRows = state.courses.modules.map((m, i) => `<tr><td><input type="checkbox" data-plan="${m.id}" ${state.planner[m.id] ? "checked" : ""} aria-label="${esc(L(m.title))}" /></td><td><div class="mod-cell"><span class="thumb ${thumbClass(m)} sm">${icon(m.icon)}</span><span>${pad(i + 1)} · ${esc(L(m.title))}</span></div></td><td>${levelBadge(m.level)}</td><td>${m.grades.map(gradeLabel).join(" · ")}</td><td>${m.lessons.length}</td><td class="mono">${modMinutes(m)} ${esc(c.min)}</td></tr>`).join("");
    return `
      <div class="wrap page-head"><p class="kicker">${esc(t("nav.teachers"))}</p><h1>${esc(th.title)}</h1><p class="lead">${esc(th.subtitle)}</p></div>
      <div class="wrap" style="padding-bottom:72px">
        <div class="tabs" role="tablist">${tabs.map(([k, ic]) => `<button role="tab" data-tab="${k}" class="${tab === k ? "on" : ""}" aria-selected="${tab === k}">${icon(ic)}${esc(th.tabs[k])}</button>`).join("")}</div>

        <section class="tab-panel ${tab === "policy" ? "on" : ""}" data-panel="policy">
          <div class="card">
            <h2>${esc(th.generator)}</h2><p class="muted">${esc(th.genHelp)}</p>
            <form class="form" id="policyForm">
              <label>${esc(th.subject)}<select name="subject">${subjects.map((s) => `<option>${esc(s)}</option>`).join("")}</select></label>
              <label>${esc(th.grade)}<select name="grade">${Array.from({ length: 13 }, (_, i) => `<option ${i === 8 ? "selected" : ""}>${i === 0 ? "K" : i}</option>`).join("")}</select></label>
              <label>${esc(th.level)}<select name="level" id="levelSel"><option value="green">${esc(th.levels.green)}</option><option value="yellow" selected>${esc(th.levels.yellow)}</option><option value="red">${esc(th.levels.red)}</option></select></label>
              <label>${esc(th.tools)}<input type="text" name="tools" value="Microsoft Copilot (Enterprise Data Protection)" /></label>
              <div class="full" id="stagesWrap"><span style="font-weight:500;display:block;margin-bottom:8px">${esc(th.stages)}</span><div class="checks">${th.stageList.map((s, i) => `<label><input type="checkbox" name="stage" value="${esc(s)}" ${i < 2 ? "checked" : ""}/> ${esc(s)}</label>`).join("")}</div></div>
              <label class="row full"><input type="checkbox" name="disclosure" checked /> ${esc(th.disclosure)}</label>
              <div class="full tools-row"><button class="btn btn-primary" type="submit">${icon("sparkles")} ${esc(th.generate)}</button></div>
            </form>
            <div class="output"><button class="btn btn-ghost btn-sm copy" data-copy="#policyText">${icon("copy")} ${esc(th.copy)}</button><pre id="policyText"></pre></div>
          </div>
        </section>

        <section class="tab-panel ${tab === "template" ? "on" : ""}" data-panel="template">
          <div class="card">
            <h2>${esc(th.studentTitle)}</h2>
            <div class="output"><button class="btn btn-ghost btn-sm copy" data-copy="#studentTpl">${icon("copy")} ${esc(th.copy)}</button><pre id="studentTpl">${esc(studentTemplate())}</pre></div>
            <p class="muted small" style="margin-top:14px">${esc(th.genHelp)}</p>
          </div>
        </section>

        <section class="tab-panel ${tab === "modules" ? "on" : ""}" data-panel="modules">
          <div class="card" style="padding:8px 0 0">
            <div style="padding:16px 24px 8px"><h2 style="margin:0">${esc(th.tabs.modules)}</h2><p class="muted" style="margin:6px 0 0">${esc(th.planner)}</p></div>
            <div style="overflow-x:auto"><table class="table">
              <thead><tr><th></th><th>${esc(t("ui.module"))}</th><th>${esc(t("ui.levelLabel"))}</th><th>${esc(t("ui.gradeBand"))}</th><th>${esc(c.lessons)}</th><th>${esc(c.min)}</th></tr></thead>
              <tbody>${plannerRows}</tbody>
            </table></div>
            <div class="total-row"><span>${esc(th.total)}</span><b id="plannerTotal">0 ${esc(c.min)}</b></div>
          </div>
        </section>

        <section class="tab-panel ${tab === "resources" ? "on" : ""}" data-panel="resources">
          <div class="grid-2">
            <div class="card" style="grid-column:1/-1"><h2>${esc(th.resources)}</h2>
              <ul class="res-list">${state.policy.sources.map((s) => `<li><a href="${esc(s.u)}" target="_blank" rel="noopener">${icon("link")}<span>${esc(s.t)}</span>${icon("external")}</a></li>`).join("")}</ul></div>
            <div class="card"><h3>${esc(th.cert)}</h3><p class="muted">${esc(th.certHelp)}</p><a class="btn btn-ghost" href="#/certificate">${icon("award")} ${esc(t("certificate.title"))}</a></div>
          </div>
        </section>
      </div>`;
  },

  parents() {
    const p = t("parents");
    const k5 = state.courses.modules.filter((m) => m.grades.includes("k5"));
    return `
      <div class="wrap page-head"><p class="kicker">${esc(t("nav.parents"))}</p><h1>${esc(p.title)}</h1><p class="lead">${esc(p.subtitle)}</p></div>
      <div class="wrap" style="padding-bottom:72px">
        <div class="faq">${p.faq.map((f, i) => `<details ${i === 0 ? "open" : ""}><summary>${esc(f.q)}${icon("chevronDown")}</summary><p>${esc(f.a)}</p></details>`).join("")}</div>
        <section class="section" style="padding-bottom:0"><div class="section-head"><h2>${esc(p.recommended)}</h2><a class="more" href="#/courses?grade=k5">${esc(t("ui.viewAll"))} ${icon("arrow")}</a></div><div class="mgrid">${k5.map((m) => moduleCard(m)).join("")}</div></section>
      </div>`;
  },

  policy() {
    const p = t("policy");
    return `
      <div class="wrap page-head"><p class="kicker">${esc(t("nav.policy"))}</p><h1>${esc(p.title)}</h1><p class="lead">${esc(p.subtitle)}</p></div>
      <div class="wrap" style="padding-bottom:72px">
        <div class="chips" style="margin-bottom:24px">${Object.entries(p.statuses).map(([k, v]) => `<span class="badge badge-${k}">${esc(v)}</span>`).join("")}</div>
        <div class="prov-grid">${state.policy.provinces.map((pr) => `
          <article class="prov card">
            <div class="prov-head"><h3>${esc(L(pr.name))}</h3><span class="badge badge-${esc(pr.status)}">${esc(p.statuses[pr.status] || pr.status)}</span></div>
            <dl><dt>${esc(p.where)}</dt><dd>${esc(L(pr.where))}</dd><dt>${esc(p.notes)}</dt><dd>${esc(L(pr.notes))}</dd></dl>
            <div class="links">${pr.links.map((lk) => `<a href="${esc(lk.u)}" target="_blank" rel="noopener">${esc(lk.t)} ${icon("external")}</a>`).join("")}</div>
          </article>`).join("")}</div>
      </div>`;
  },

  about() {
    const a = t("about");
    return `
      <div class="wrap page-head"><p class="kicker">${esc(t("nav.about"))}</p><h1>${esc(a.title)}</h1></div>
      <div class="wrap about-grid" style="padding-bottom:72px">
        <div>
          <p class="lead">${esc(a.body)}</p>
          <div class="notice">${icon("info")} ${esc(t("policy.subtitle"))}</div>
          <div class="hero-actions" style="margin-top:24px"><a class="btn btn-dark" href="${REPO}" target="_blank" rel="noopener">${icon("code")} GitHub</a></div>
        </div>
        <div class="card"><h4>${esc(a.sources)}</h4><ul>${state.policy.sources.map((s) => `<li><a href="${esc(s.u)}" target="_blank" rel="noopener">${esc(s.t)} ${icon("external")}</a></li>`).join("")}</ul></div>
      </div>`;
  },

  tracks() {
    const tk = t("tracks");
    return `
      <div class="wrap page-head"><p class="kicker">${esc(tk.kicker)}</p><h1>${esc(tk.title)}</h1><p class="lead">${esc(tk.subtitle)}</p></div>
      <div class="wrap" style="padding-bottom:72px">
        <div class="tracks-grid">${state.tracks.map(trackCard).join("")}</div>
        <div class="licensing card"><span class="icon-wrap">${icon("shield")}</span><div><h3>${esc(tk.licensing)}</h3><p>${esc(tk.licensingBody)}</p><div class="chips" style="margin-top:12px">${hostBadge("fork")}${hostBadge("link")}</div></div><a class="btn btn-ghost" href="#/library">${esc(tk.libraryCta)} ${icon("arrow")}</a></div>
      </div>`;
  },

  track(tid) {
    const tr = findTrack(tid);
    if (!tr) return pages.notFound();
    const tk = t("tracks"), ui = t("ui"), c = t("courses");
    const mods = trackModules(tr), tm = trackMastery(tr);
    const firstMod = mods.find((m) => !moduleMastery(m).complete) || mods[0];
    const firstLesson = firstMod.lessons.find((l) => !lessonMastery(firstMod.id, l.id).done) || firstMod.lessons[0];
    const lessons = mods.reduce((s, m) => s + m.lessons.length, 0);
    return `
      <div class="wrap">${crumbs([{ label: t("nav.tracks"), href: "#/tracks" }, { label: tr.title }])}</div>
      <div class="wrap layout">
        <aside class="side side-toc">
          <div class="card side-card">
            <h4>${esc(tk.spine)}</h4>
            <ol class="spine lg">${tr.spine.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
          </div>
          <div class="mini-mastery card">
            <div class="row"><span>${esc(ui.mastery.title)}</span><b>${tm.points}/${tm.total}</b></div>
            <div class="bar"><i style="width:${tm.pct}%"></i></div>
            <div class="row muted small"><span>${tm.done}/${mods.length} ${esc(tk.modules)} ${esc(c.progress)}</span><span>${esc(ui.mastery.points)}</span></div>
            ${tm.complete ? `<a class="btn btn-accent btn-sm" style="margin-top:12px" href="#/certificate?track=${tr.id}">${icon("award")} ${esc(tk.certificate)}</a>` : ""}
          </div>
        </aside>
        <div class="content">
          <header class="mod-hero">
            <div class="thumb thumb-${esc(tr.id)} lg">${icon(tr.icon)}</div>
            <div>
              <div class="mcard-meta"><span class="mono">${esc(t("nav.tracks"))}</span>${levelBadge(tr.level)}<span class="badge badge-outline">${esc(gradeLabel("adult"))}</span></div>
              <h1>${esc(tr.title)}</h1>
              <p class="lead">${esc(tr.description)}</p>
              <div class="hero-actions"><a class="btn btn-primary" href="#/module/${firstMod.id}/${firstLesson.id}">${esc(tm.points ? tk.resume : tk.start)} ${icon("arrow")}</a><span class="muted small" style="align-self:center">${mods.length} ${esc(tk.modules)} · ${lessons} ${esc(c.lessons)} · ~${tr.hours} ${esc(tk.hours)} · ${tr.weeks} ${esc(tk.weeks)}</span></div>
            </div>
          </header>
          <div class="grid-2 track-facts">
            <div class="card"><p class="kicker">${esc(tk.outcome)}</p><p>${esc(tr.outcome)}</p></div>
            <div class="card"><p class="kicker">${esc(tk.audience)}</p><p>${esc(tr.audience)}</p></div>
          </div>
          <section>
            <div class="section-head"><h2>${esc(tk.syllabus)}</h2></div>
            <ol class="syllabus">${mods.map((m, i) => {
              const mm = moduleMastery(m);
              return `<li class="card">
                <div class="syl-head"><span class="thumb ${thumbClass(m)}">${icon(m.icon)}</span><div><div class="mcard-meta"><span class="mono">${esc(ui.module)} ${pad(i + 1)}</span>${levelBadge(m.level)}${mm.complete ? `<span class="badge badge-mastered">${icon("check")}${esc(t("lesson.completed"))}</span>` : ""}</div><h3><a href="#/module/${m.id}">${esc(m.title)}</a></h3><p>${esc(m.summary)}</p></div></div>
                <ul class="syl-lessons">${m.lessons.map((l, li) => { const lm = lessonMastery(m.id, l.id); return `<li><a href="#/module/${m.id}/${l.id}">${mbox(lm.level)}<span>${i + 1}.${li + 1} ${esc(l.title)}</span><small>${l.minutes} ${esc(c.min)}</small></a></li>`; }).join("")}</ul>
                <div class="syl-foot"><span class="muted small">${m.curriculum.map((x) => `<span class="tag">${esc(x)}</span>`).join(" ")}</span><div class="mastery-line"><div class="bar"><i style="width:${mm.pct}%"></i></div><span class="mono">${mm.points}/${mm.total}</span></div></div>
              </li>`;
            }).join("")}</ol>
          </section>
        </div>
      </div>`;
  },

  library(query) {
    const lb = t("library"), f = state.lib;
    if (query.has("track")) f.track = query.get("track");
    if (query.has("q")) f.q = query.get("q");
    if ([...query.keys()].length) history.replaceState(null, "", "#/library");
    const q = f.q.trim().toLowerCase();
    const matches = (it) =>
      (f.section === "all" || it.section === f.section) &&
      (f.track === "all" || it.tracks.includes(f.track)) &&
      (f.hosting === "all" || it.hosting === f.hosting) &&
      (!q || [it.title, it.by, it.note, it.license, ...it.tags].join(" ").toLowerCase().includes(q));
    const items = libItems();
    const visible = items.filter(matches);
    const chips = (name, list, cur) => `<div class="chips">${list.map(([v, lbl]) => `<button class="chip ${cur === v ? "on" : ""}" data-lib="${name}" data-value="${esc(v)}">${esc(lbl)}</button>`).join("")}</div>`;
    const sections = state.library.sections.filter((s) => visible.some((it) => it.section === s.id));
    return `
      <div class="wrap page-head"><p class="kicker">${esc(t("nav.library"))}</p><h1>${esc(lb.title)}</h1><p class="lead">${esc(lb.subtitle)}</p></div>
      <div class="wrap layout">
        <aside class="side">
          <div class="side-block"><h4>${esc(lb.type)}</h4>${chips("section", [["all", lb.all], ...state.library.sections.map((s) => [s.id, s.title])], f.section)}</div>
          <div class="side-block"><h4>${esc(lb.track)}</h4>${chips("track", [["all", lb.all], ...state.tracks.map((tr) => [tr.id, tr.title])], f.track)}</div>
          <div class="side-block"><h4>${esc(lb.hosting)}</h4>${chips("hosting", [["all", lb.all], ["fork", lb.fork], ["link", lb.link]], f.hosting)}</div>
          <button class="btn btn-ghost btn-sm" id="resetLib">${icon("refresh")} ${esc(t("ui.reset"))}</button>
        </aside>
        <div class="content">
          <div class="results-bar"><input class="input" id="libSearch" type="search" placeholder="${esc(lb.search)}" value="${esc(f.q)}" aria-label="${esc(lb.search)}" /><span class="count">${visible.length} ${esc(lb.results)}</span></div>
          <section class="rules card">
            <h3>${esc(lb.rulesTitle)}</h3>
            <div class="rules-grid">${state.library.rules.map((r) => `<div><b>${esc(r.t)}</b><p>${esc(r.d)}</p></div>`).join("")}</div>
          </section>
          ${sections.length ? sections.map((s) => `
            <section class="lib-section" id="lib-${s.id}">
              <div class="section-head"><div><h2>${esc(s.title)}</h2><p>${esc(s.summary)}</p></div></div>
              <div class="lib-grid">${visible.filter((it) => it.section === s.id).map((it) => `
                <article class="lib-item card" id="lib-${esc(it.id)}">
                  <div class="lib-top"><span class="badge badge-outline">${esc(lb.types[it.type] || it.type)}</span>${hostBadge(it.hosting)}</div>
                  <h3><a href="${esc(it.url)}" target="_blank" rel="noopener">${esc(it.title)} ${icon("external")}</a></h3>
                  <p class="muted small">${esc(lb.by)} ${esc(it.by)}</p>
                  <p>${esc(it.note)}</p>
                  <dl class="lib-meta"><dt>${esc(lb.license)}</dt><dd><span class="badge badge-license">${esc(it.license)}</span></dd>${it.tracks.length ? `<dt>${esc(lb.usedIn)}</dt><dd>${it.tracks.map((tid) => { const tr = findTrack(tid); return tr ? `<a class="tag" href="#/tracks/${tr.id}">${esc(tr.title)}</a>` : ""; }).join(" ")}</dd>` : ""}</dl>
                </article>`).join("")}</div>
            </section>`).join("") : `<div class="empty">${esc(t("ui.searchEmpty"))}</div>`}
        </div>
      </div>`;
  },

  certificate(query) {
    const c = t("certificate"), tk = t("tracks");
    const tr = query && query.has("track") ? findTrack(query.get("track")) : null;
    const mods = tr ? trackModules(tr) : state.courses.modules;
    const complete = tr ? trackMastery(tr).complete : allComplete();
    const title = tr ? tk.certificate : c.title;
    const body = tr ? tk.certBody.replace("{track}", tr.title) : c.body;
    const date = new Date().toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
    return `
      <div class="wrap page-head"><p class="kicker">${esc(t("ui.mastery.title"))}</p><h1>${esc(title)}</h1>
        <div class="chips" style="margin-bottom:16px"><a class="chip ${tr ? "" : "on"}" href="#/certificate">${esc(t("nav.courses"))}</a>${state.tracks.map((x) => `<a class="chip ${tr && tr.id === x.id ? "on" : ""}" href="#/certificate?track=${x.id}">${esc(x.title)}</a>`).join("")}</div>
        <div class="cert-tools"><input class="input" id="certName" type="text" placeholder="${esc(c.name)}" value="${esc(state.certName)}" /><button class="btn btn-primary" id="printCert">${icon("printer")} ${esc(c.print)}</button>${complete ? `<span class="badge badge-mastered">${icon("check")} ${esc(t("lesson.completed"))}</span>` : `<span class="badge badge-amber">${icon("info")} ${mods.filter((m) => moduleMastery(m).complete).length}/${mods.length} ${esc(t("courses.progress"))}</span>`}</div>
      </div>
      <div class="wrap" style="padding-bottom:72px">
        <div class="cert">
          <div class="cert-brand"><span class="logo">${LOGO}</span><span>${esc(t("brand"))}</span></div>
          <h1>${esc(title)}</h1>
          <div class="name" id="certNameOut">${esc(state.certName || "____________")}</div>
          <p class="cert-body">${esc(body)}</p>
          <div class="modules">${mods.map((m) => `<span class="badge ${moduleMastery(m).complete ? "badge-mastered" : "badge-outline"}">${esc(L(m.title))}</span>`).join("")}</div>
          <div class="cert-foot"><span>${esc(c.date)}: ${esc(date)}</span><span>${esc(t("brand"))} · 9lordisgod.github.io/ai-course</span></div>
        </div>
      </div>`;
  },

  notFound() {
    return `<div class="wrap page-head"><h1>404</h1><p class="lead">${esc(t("ui.searchEmpty"))}</p><a class="btn btn-primary" href="#/">${esc(t("nav.home"))}</a></div>`;
  },
};

// ---------- Teacher-hub text generators ----------
function studentTemplate() {
  return "AI-Use Statement\nAssignment: __________\nAI tool(s) I used: __________\nWhat I used it for: ☐ Brainstorming ☐ Outline ☐ Grammar feedback ☐ Translation ☐ Other: ____\nWhat I did NOT use it for: __________\nHow I verified / revised the output: __________\nSignature: __________ Date: ______";
}
function buildPolicy(fd) {
  const level = fd.get("level"), stages = fd.getAll("stage"), disc = fd.get("disclosure");
  const s = fd.get("subject"), g = fd.get("grade"), tools = fd.get("tools");
  const lv = { green: "🟢 GREEN: AI use is encouraged and permitted at all stages of this assignment.", yellow: `🟡 YELLOW: AI may be used ONLY for: ${stages.join(", ") || "(none)"}. The final work must be your own.`, red: "🔴 RED: No AI tools may be used for this assignment. Use will be treated under the academic-integrity policy." }[level];
  return `${s} · Grade ${g} — AI Use Policy\n\n${lv}\n\nApproved tools: ${tools}. Do not use AI tools that are not approved by the school, and never enter personal information.${disc ? "\n\nRequired: submit an AI-Use Statement naming the tool, what you used it for, and what you changed." : ""}\n\nAll AI output must be checked by the student for accuracy, bias and copyright. When in doubt, ask your teacher first.`;
}

// ---------- Router ----------
function parseHash() {
  const raw = location.hash.replace(/^#\/?/, "");
  const [pathPart, queryPart = ""] = raw.split("?");
  const [main, anchor] = pathPart.split("#");
  const parts = main.split("/").filter(Boolean);
  return { path: parts[0] || "home", parts: parts.slice(1), query: new URLSearchParams(queryPart), anchor };
}
function route() {
  const { path, parts, query, anchor } = parseHash();
  let html;
  if (path === "home") html = pages.home();
  else if (path === "module" && parts[1]) html = pages.lesson(parts[0], parts[1]);
  else if (path === "module") html = pages.module(parts[0]);
  else if (path === "courses") html = pages.courses(query);
  else if (path === "tracks" && parts[0]) html = pages.track(parts[0]);
  else if (path === "library") html = pages.library(query);
  else if (path === "certificate") html = pages.certificate(query);
  else html = (pages[path] || pages.notFound)();
  tts.stop();
  const app = $("#app");
  app.innerHTML = html;
  $$("[data-nav]").forEach((a) => a.classList.toggle("active", a.dataset.nav === path));
  wire(path, parts);
  if (anchor && $("#" + anchor)) $("#" + anchor).scrollIntoView({ block: "start" });
  else window.scrollTo({ top: 0 });
  app.focus({ preventScroll: true });
}

function wire(path, parts) {
  const app = $("#app");
  if (path === "courses") {
    $$("[data-filter]", app).forEach((b) => (b.onclick = () => { state.filters[b.dataset.filter] = b.dataset.value; route(); }));
    $("#resetFilters").onclick = () => { state.filters = { grade: "all", area: "all", q: "" }; location.hash = "#/courses"; route(); };
    const s = $("#courseSearch");
    s.oninput = () => { state.filters.q = s.value; const pos = s.selectionStart; route(); const s2 = $("#courseSearch"); s2.focus(); s2.setSelectionRange(pos, pos); };
    $$("[data-jump]", app).forEach((a) => (a.onclick = (e) => { e.preventDefault(); $("#" + a.dataset.jump)?.scrollIntoView({ behavior: "smooth", block: "start" }); }));
  }

  if (path === "library") {
    $$("[data-lib]", app).forEach((b) => (b.onclick = () => { state.lib[b.dataset.lib] = b.dataset.value; route(); }));
    $("#resetLib").onclick = () => { state.lib = { section: "all", track: "all", hosting: "all", q: "" }; location.hash = "#/library"; route(); };
    const s = $("#libSearch");
    s.oninput = () => { state.lib.q = s.value; const pos = s.selectionStart; route(); const s2 = $("#libSearch"); s2.focus(); s2.setSelectionRange(pos, pos); };
  }

  if (path === "module" && parts[1]) {
    const [mid, lid] = parts;
    const m = findModule(mid), l = m && m.lessons.find((x) => x.id === lid);
    if (!l || !$("#player")) return;
    const ui = { root: $("#player"), btn: $("#listen"), status: $("#ttsStatus"), player: $("#ttsPlayer"), defaultStatus: $("#ttsStatus").textContent };
    const text = `${L(l.title)}. ${L(l.body)}`;
    ui.btn.onclick = () => (ui.btn.dataset.playing ? tts.stop() : tts.speak(text, "en", ui));
    ui.player.onplay = () => {
      if ("speechSynthesis" in window) speechSynthesis.cancel();
      tts.audio = ui.player; tts.ui = ui;
      ui.root.classList.remove("loading", "fallback"); ui.root.classList.add("playing");
      ui.btn.dataset.playing = "1"; ui.btn.innerHTML = icon("stop", "fill");
    };
    ui.player.onpause = () => tts.reset(ui);

    const refresh = () => {
      $("#lessonSide").innerHTML = tocCard(m, l.id) + miniMastery(m);
      const lm = lessonMastery(m.id, l.id);
      const lvl = $("#lessonLevel");
      lvl.className = `badge badge-${lm.level}`;
      lvl.textContent = t(`ui.mastery.levels.${lm.level}`);
      const btn = $("#complete");
      btn.className = `btn ${lm.done ? "btn-ghost" : "btn-accent"}`;
      btn.innerHTML = `${lm.done ? icon("check") : ""} ${esc(lm.done ? t("lesson.completed") : t("lesson.complete"))}`;
    };
    const markDone = (silent) => {
      const k = key(mid, lid);
      if (!state.progress[k]) { state.progress[k] = Date.now(); store.set("progress", state.progress); }
      if (!silent) toast(t("lesson.completed"));
      refresh();
    };
    $$(".opt input", app).forEach((inp) => (inp.onchange = () => { inp.closest(".opts").querySelectorAll(".opt").forEach((o) => o.classList.remove("picked")); inp.closest(".opt").classList.add("picked"); }));
    $("#checkQuiz").onclick = () => {
      const qs = $$(".q", app);
      let correct = 0, answered = 0;
      qs.forEach((q) => {
        const ans = Number(q.dataset.answer);
        const opts = $$(".opt", q);
        opts.forEach((o) => { o.classList.remove("ok", "bad"); o.querySelector(".mark").textContent = ""; });
        const sel = q.querySelector("input:checked");
        if (sel) {
          answered++;
          const ok = Number(sel.value) === ans;
          sel.closest(".opt").classList.add(ok ? "ok" : "bad");
          sel.closest(".opt").querySelector(".mark").textContent = ok ? "✓" : "✗";
          if (ok) correct++;
        }
        opts[ans].classList.add("ok");
      });
      if (!answered) return;
      state.quiz[key(mid, lid)] = { correct, total: qs.length };
      store.set("quiz", state.quiz);
      const out = $("#quizResult");
      const perfect = correct === qs.length;
      out.className = `feedback ${perfect ? "ok" : "bad"}`;
      out.innerHTML = `${icon(perfect ? "check" : "info")} ${esc(t("lesson.score"))}: ${correct}/${qs.length} — ${esc(perfect ? t("lesson.correct") : t("lesson.incorrect"))}`;
      if (perfect) markDone(false); else refresh();
      toast(`+${lessonMastery(mid, lid).points} ${t("ui.mastery.points")}`, "target");
    };
    $("#complete").onclick = () => markDone(false);
  }

  if (path === "teachers") {
    $$("[data-tab]", app).forEach((b) => (b.onclick = () => {
      state.teacherTab = b.dataset.tab;
      $$("[data-tab]", app).forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-selected", String(x === b)); });
      $$("[data-panel]", app).forEach((p) => p.classList.toggle("on", p.dataset.panel === b.dataset.tab));
    }));
    const form = $("#policyForm");
    const sync = () => ($("#stagesWrap").style.display = $("#levelSel").value === "yellow" ? "" : "none");
    $("#levelSel").onchange = sync; sync();
    form.onsubmit = (e) => { e.preventDefault(); $("#policyText").textContent = buildPolicy(new FormData(form)); };
    form.requestSubmit();
    form.oninput = () => form.requestSubmit();
    $$("[data-copy]", app).forEach((b) => (b.onclick = () => navigator.clipboard.writeText($(b.dataset.copy).textContent).then(() => toast(t("teachers.copied"), "copy"))));
    const total = () => {
      const mins = $$("[data-plan]", app).filter((c) => c.checked).reduce((s, c) => s + modMinutes(findModule(c.dataset.plan)), 0);
      $("#plannerTotal").textContent = `${mins} ${t("courses.min")}`;
    };
    $$("[data-plan]", app).forEach((c) => (c.onchange = () => { state.planner[c.dataset.plan] = c.checked; total(); }));
    total();
  }

  if (path === "certificate") {
    const inp = $("#certName");
    inp.oninput = () => { state.certName = inp.value; store.set("certName", inp.value); $("#certNameOut").textContent = inp.value || "____________"; };
    $("#printCert").onclick = () => window.print();
  }
}

// ---------- Update check ----------
// GitHub Pages sits behind a CDN that caches every URL for 10 minutes and ignores the browser's
// no-cache/reload requests, and the hash router never reloads the page, so a tab can outlive
// several deploys. version.json (always fetched under a unique URL) is stamped per deploy; when
// it changes, offer a reload that navigates to a unique URL so neither the browser nor the CDN
// can answer from cache. boot() strips that marker once the fresh page is running.
const UPDATE_PARAM = "b";
function watchForUpdates() {
  if (!IS_RELEASE) return;
  let prompted = false;
  const reloadFresh = (build) => {
    const url = new URL(location.href);
    url.searchParams.set(UPDATE_PARAM, `${build}.${Date.now().toString(36)}`);
    location.replace(url.href);
  };
  const check = async (force) => {
    if (prompted || (force !== true && document.visibilityState === "hidden")) return;
    try {
      const r = await fetch(`version.json?t=${Date.now()}`, { cache: "no-store" });
      if (!r.ok) return;
      const { build } = await r.json();
      if (!build || build === BUILD) return;
      prompted = true;
      toast(t("ui.update.ready"), "refresh", { sticky: true, action: { label: t("ui.update.reload"), onClick: () => reloadFresh(build) } });
    } catch {}
  };
  setTimeout(() => check(true), 4000);
  setInterval(check, 15 * 60 * 1000);
  document.addEventListener("visibilitychange", check);
  window.addEventListener("focus", check);
}

// ---------- Boot ----------
function stripUpdateMarker() {
  const params = new URLSearchParams(location.search);
  if (!params.has(UPDATE_PARAM)) return;
  params.delete(UPDATE_PARAM);
  const rest = params.toString();
  history.replaceState(null, "", `${location.pathname}${rest ? `?${rest}` : ""}${location.hash}`);
}

async function boot() {
  stripUpdateMarker();
  const [i18n, courses, policy, tracks, library] = await Promise.all(["data/i18n.json", "data/courses.json", "data/policy.json", "data/tracks.json", "data/library.json"].map((u) => fetch(versioned(u)).then((r) => { if (!r.ok) throw new Error(u); return r.json(); })));
  Object.assign(state, { i18n, courses, policy, library, tracks: tracks.tracks, trackModules: tracks.modules });
  document.documentElement.dataset.theme = state.theme;
  document.documentElement.lang = "en-CA";
  document.title = `${t("brand")} — ${t("tagline")}`;
  renderChrome();
  route();
  window.addEventListener("hashchange", route);
  if ("speechSynthesis" in window) speechSynthesis.getVoices();
  watchForUpdates();
}
boot().catch((err) => {
  console.error(err);
  $("#app").innerHTML = `<div class="loading">Failed to load content (${esc(err.message)}). Serve this folder over HTTP.</div>`;
});
})();
