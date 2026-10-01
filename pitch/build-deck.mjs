// Builds pitch/index.html (scroll-snap web deck) and pitch/pitch-deck.md from deck-content.mjs.
// The PowerPoint file pitch/SI-Academy-Pitch-Deck.pptx is the committed source deck and is NOT
// generated here; deck-content.mjs mirrors it so the web + Markdown versions stay in sync.
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deck } from "./deck-content.mjs";

const dir = path.dirname(fileURLToPath(import.meta.url));
const OUT = "SI-Academy-Pitch-Deck.pptx";
const N = deck.slides.length;
const last = N - 1;
const LOGO = `<svg viewBox="0 0 32 32" aria-hidden="true"><g shape-rendering="crispEdges"><rect x="0.3" y="28.3" width="3.4" height="3.4" fill="#fff" opacity="0.28"/><rect x="4.3" y="24.3" width="3.4" height="3.4" fill="#fff" opacity="0.5"/><rect x="8.3" y="24.3" width="3.4" height="3.4" fill="#fff" opacity="0.56"/><rect x="12.3" y="24.3" width="3.4" height="3.4" fill="#fff" opacity="0.62"/><rect x="16.3" y="24.3" width="3.4" height="3.4" fill="#fff" opacity="0.68"/><rect x="20.3" y="24.3" width="3.4" height="3.4" fill="#fff" opacity="0.74"/><rect x="24.3" y="20.3" width="3.4" height="3.4" fill="#fff" opacity="0.8"/><rect x="20.3" y="16.3" width="3.4" height="3.4" fill="#fff" opacity="0.86"/><rect x="16.3" y="12.3" width="3.4" height="3.4" fill="#fff" opacity="0.92"/><rect x="12.3" y="12.3" width="3.4" height="3.4" fill="#fff" opacity="0.96"/><rect x="8.3" y="8.3" width="3.4" height="3.4" fill="#fff"/><rect x="12.3" y="4.3" width="3.4" height="3.4" fill="#fff"/><rect x="16.3" y="4.3" width="3.4" height="3.4" fill="#fff"/><rect x="20.3" y="4.3" width="3.4" height="3.4" fill="#fff"/><rect x="24.3" y="4.3" width="3.4" height="3.4" fill="#fff"/><rect x="21.2" y="1.2" width="1.6" height="1.6" fill="#fff" opacity="0.35"/><rect x="29.2" y="9.2" width="1.6" height="1.6" fill="#fff" opacity="0.45"/><rect x="5.2" y="17.2" width="1.6" height="1.6" fill="#fff" opacity="0.25"/><rect x="28.3" y="0.3" width="3.4" height="3.4" fill="#1865f2"/></g></svg>`;

const esc = (t) => String(t).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
const pad = (n) => String(n).padStart(2, "0");
// "LABEL — text" → { label, text }; anything else → { text }
const split = (b) => {
  const i = b.indexOf(" — ");
  return i > 1 && i <= 40 ? { label: b.slice(0, i), text: b.slice(i + 3) } : { text: b };
};

// ---- Markdown ----
const md = [`# ${deck.title}\n\n_${deck.subtitle}_\n`];
deck.slides.forEach((s, i) => {
  const out = [`\n---\n\n## ${i + 1}. ${s.title}\n\n*${s.kicker}*\n`];
  if (s.lead) out.push(`\n${s.lead}\n`);
  if (s.tags) out.push(`\n${s.tags.map((t) => `\`${t}\``).join(" · ")}\n`);
  if (s.stats) out.push(`\n${s.stats.map(([n, t]) => `- **${n}** — ${t}`).join("\n")}\n`);
  if (s.columns) s.columns.forEach(([h, items]) => out.push(`\n**${h}**\n\n${items.map((x) => `- ${x}`).join("\n")}\n`));
  if (s.steps) out.push(`\n${s.stepsLabel ? `**${s.stepsLabel}**\n\n` : ""}${s.steps.map(([h, t], k) => `${k + 1}. **${h}**${t ? ` — ${t}` : ""}`).join("\n")}\n`);
  if (s.timeline) out.push(`\n| When | Phase | What |\n| --- | --- | --- |\n${s.timeline.map(([q, h, t]) => `| ${q} | ${h} | ${t} |`).join("\n")}\n`);
  if (s.bullets.length) out.push(`\n${s.bullets.map((b) => { const { label, text } = split(b); return label ? `- **${label}** — ${text}` : `- ${text}`; }).join("\n")}\n`);
  if (s.notes) out.push(`\n> **Speaker notes:** ${s.notes}\n`);
  md.push(out.join(""));
});
await writeFile(path.join(dir, "pitch-deck.md"), md.join(""));

// ---- HTML deck ----
const bullets = (s) => {
  if (!s.bullets.length) return "";
  const items = s.bullets.map(split);
  const cards = items.length >= 3 && items.every((x) => x.label);
  return `<ul class="${cards ? "cards" : "list"}">${items.map((x) => `<li>${x.label ? `<b>${esc(x.label)}</b>` : ""}<span>${esc(x.text)}</span></li>`).join("")}</ul>`;
};
const body = (s) => [
  s.lead ? `<p class="lead">${esc(s.lead)}</p>` : "",
  s.stats ? `<div class="stats">${s.stats.map(([n, t]) => `<div><strong>${esc(n)}</strong><span>${esc(t)}</span></div>`).join("")}</div>` : "",
  s.columns ? `<div class="cols">${s.columns.map(([h, items]) => `<div><h3>${esc(h)}</h3><ol>${items.map((x) => `<li>${esc(x)}</li>`).join("")}</ol></div>`).join("")}</div>` : "",
  s.steps ? `${s.stepsLabel ? `<h3 class="sub-h">${esc(s.stepsLabel)}</h3>` : ""}<ol class="steps${s.steps.every(([, t]) => !t) ? " compact" : ""}">${s.steps.map(([h, t]) => `<li><b>${esc(h)}</b>${t ? `<span>${esc(t)}</span>` : ""}</li>`).join("")}</ol>` : "",
  s.timeline ? `<div class="timeline">${s.timeline.map(([q, h, t]) => `<div><em>${esc(q)}</em><b>${esc(h)}</b><span>${esc(t)}</span></div>`).join("")}</div>` : "",
  bullets(s),
  s.tags ? `<div class="tags">${s.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>` : "",
].join("");

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light dark"><meta name="theme-color" content="#0f1115">
<title>${esc(deck.title)} — SI Academy pitch deck</title>
<link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" sizes="180x180" href="../assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{--orange:#ff5c00;--blue:#1865f2;--ink:#0f1115;--ink-2:#3a3f4b;--bg:#f7f6f4;--paper:#fff;--muted:#6b7080;--line:#e3e0db;--mono:"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,monospace;--px:clamp(16px,6vw,7.5vw);--py:clamp(20px,4vh,5vh)}
*{box-sizing:border-box;min-width:0}html,body{margin:0;height:100%}
html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
body{font-family:"IBM Plex Sans",system-ui,-apple-system,"Segoe UI",sans-serif;background:#0b0b0c;color:var(--ink);line-height:1.5;-webkit-font-smoothing:antialiased}
a{color:inherit}
.deck{height:100vh;height:100dvh;overflow-y:auto;scroll-snap-type:y mandatory;overscroll-behavior-y:contain;scroll-behavior:smooth}
@media (prefers-reduced-motion:reduce){.deck{scroll-behavior:auto}}
section{min-height:100vh;min-height:100dvh;scroll-snap-align:start;display:flex;flex-direction:column;padding:var(--py) var(--px) calc(var(--py) + 56px);background:var(--paper);border-top:6px solid var(--orange)}
section:nth-child(even){background:var(--bg)}
section.dark{background:var(--ink);color:#fff;--ink-2:#d6d2cc;--muted:#a7a39e;--line:rgba(255,255,255,.14)}
.top,.bottom{display:flex;align-items:center;justify-content:space-between;gap:16px;font-family:var(--mono);font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.top{margin-bottom:clamp(16px,3vh,32px)}.bottom{margin-top:auto;padding-top:clamp(16px,3vh,32px)}
.brand{display:flex;align-items:center;gap:10px;min-width:0}.brand span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.brand i{flex:none;width:26px;height:26px;border-radius:7px;background:var(--orange);display:grid;place-items:center}.brand i svg{width:18px;height:18px}
.n{flex:none;letter-spacing:.1em}
.main{flex:1;display:flex;flex-direction:column;justify-content:center;max-width:1240px;width:100%}
.kicker{color:var(--orange);font-weight:600;letter-spacing:.14em;font-size:.78rem;text-transform:uppercase;font-family:var(--mono);display:flex;align-items:center;gap:10px}
.kicker::before{content:"";flex:none;width:18px;height:2px;background:var(--orange)}
h1{font-size:clamp(1.7rem,4.2vw,3.3rem);margin:.35em 0 .35em;line-height:1.08;letter-spacing:-.03em;font-weight:700;max-width:22ch;text-wrap:balance}
section:first-child h1{font-size:clamp(2.3rem,7vw,5.2rem);max-width:16ch}
section:last-child h1{font-size:clamp(2rem,5.5vw,4.4rem);max-width:18ch}
.lead{font-size:clamp(1.02rem,1.6vw,1.3rem);color:var(--ink-2);max-width:62ch;margin:0 0 clamp(16px,3vh,28px)}
section.dark .lead{font-size:clamp(1.08rem,1.8vw,1.45rem)}
ul,ol{margin:0;padding:0;list-style:none}
.list li{position:relative;padding-left:1.1em;margin:.45em 0;font-size:clamp(1rem,1.45vw,1.2rem);color:var(--ink-2);max-width:66ch}
.list li::before{content:"";position:absolute;left:0;top:.62em;width:.5em;height:.5em;background:var(--orange)}
.list li b{color:inherit;font-weight:600}.list li b::after{content:" — "}
section.dark .list li b{color:#fff}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:clamp(10px,1.4vw,18px)}
.cards li{border:1px solid var(--line);border-radius:14px;padding:clamp(14px,1.6vw,20px);background:rgba(255,255,255,.55);display:flex;flex-direction:column;gap:6px}
section:nth-child(odd) .cards li{background:var(--bg)}
section.dark .cards li{background:rgba(255,255,255,.05)}
.cards b{font-family:var(--mono);font-size:.74rem;letter-spacing:.1em;text-transform:uppercase;color:var(--orange);font-weight:600}
.cards span{font-size:clamp(.92rem,1.15vw,1.02rem);color:var(--ink-2)}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:clamp(12px,1.6vw,22px)}
.stats div{border-top:3px solid var(--orange);padding-top:12px}
.stats strong{display:block;font-size:clamp(2.2rem,4.5vw,3.6rem);line-height:1;letter-spacing:-.03em;font-family:var(--mono);font-weight:600;margin-bottom:8px}
.stats span{display:block;font-size:clamp(.92rem,1.15vw,1.02rem);color:var(--ink-2)}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:clamp(14px,2vw,32px)}
.cols h3,.sub-h{font-family:var(--mono);font-size:.74rem;letter-spacing:.12em;text-transform:uppercase;color:var(--orange);margin:0 0 10px;font-weight:600}
.sub-h{margin-top:clamp(14px,2.4vh,24px)}
.cols ol{counter-reset:c}.cols li{counter-increment:c;display:flex;gap:10px;padding:7px 0;border-bottom:1px solid var(--line);font-size:clamp(.92rem,1.15vw,1.02rem);color:var(--ink-2)}
.cols li::before{content:counter(c,decimal-leading-zero);font-family:var(--mono);font-size:.72rem;color:var(--muted);padding-top:.25em;flex:none}
.steps{display:grid;gap:clamp(10px,1.4vw,16px);counter-reset:s}
.steps li{counter-increment:s;display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto;column-gap:14px;align-items:start;border:1px solid var(--line);border-radius:14px;padding:clamp(12px,1.4vw,18px) clamp(14px,1.6vw,20px);background:rgba(255,255,255,.55)}
section:nth-child(odd) .steps li{background:var(--bg)}
.steps li::before{content:counter(s,decimal-leading-zero);grid-row:1/span 2;font-family:var(--mono);font-weight:600;font-size:clamp(1.3rem,2.2vw,1.8rem);color:var(--orange);line-height:1.1}
.steps b{font-weight:600;font-size:clamp(1rem,1.3vw,1.12rem)}.steps span{font-size:clamp(.92rem,1.15vw,1.02rem);color:var(--ink-2)}
@media (min-width:1000px){.steps:not(.compact){grid-template-columns:1fr 1fr}.steps:not(.compact) li:last-child:nth-child(odd){grid-column:1/-1}}
.steps.compact{grid-template-columns:repeat(auto-fit,minmax(min(100%,210px),1fr))}.steps.compact li{grid-template-rows:auto;padding:10px 14px}.steps.compact li::before{grid-row:1;font-size:1rem}
.timeline{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:clamp(12px,1.6vw,22px)}
.timeline div{border-top:3px solid var(--blue);padding-top:12px;display:flex;flex-direction:column;gap:6px}
.timeline em{font-style:normal;font-family:var(--mono);font-size:.74rem;letter-spacing:.12em;text-transform:uppercase;color:var(--blue);font-weight:600}
.timeline b{font-size:clamp(1.05rem,1.5vw,1.25rem)}.timeline span{font-size:clamp(.92rem,1.15vw,1.02rem);color:var(--ink-2)}
.tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:clamp(14px,3vh,28px)}
.tags span{font-family:var(--mono);font-size:.74rem;letter-spacing:.08em;text-transform:uppercase;padding:8px 12px;border:1px solid var(--line);border-radius:999px;color:var(--ink-2)}
.rule{width:64px;height:4px;background:var(--blue);flex:none}section.dark .rule{background:var(--orange)}
.sub{min-width:0;overflow-wrap:anywhere}
.help{position:fixed;left:50%;bottom:max(12px,env(safe-area-inset-bottom));transform:translateX(-50%);display:flex;flex-wrap:wrap;justify-content:center;gap:4px 14px;max-width:calc(100vw - 24px);color:#cfcbc6;font-size:.75rem;z-index:9;font-family:var(--mono);background:rgba(15,17,21,.9);padding:9px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.help a{color:#fff;text-decoration:none;font-weight:600;padding:4px 0}.help a:hover{color:var(--orange)}
.help .keys{display:none}
@media (min-width:900px){.help{left:auto;right:16px;transform:none}.help .keys{display:inline}}
@media (max-width:640px){
  .deck{scroll-snap-type:y proximity}
  section{padding-bottom:calc(var(--py) + 64px)}
  .top{font-size:.66rem;letter-spacing:.08em}.brand span{display:none}
  .bottom{font-size:.66rem;letter-spacing:.06em;text-transform:none;flex-direction:column;align-items:flex-start;gap:12px}
  .list li{max-width:none}
}
@media print{.deck{height:auto;overflow:visible;scroll-snap-type:none}section{min-height:0;height:auto;page-break-after:always;padding-bottom:var(--py)}.help{display:none}}
</style></head><body>
<div class="help"><span class="keys">↑↓ / space ·</span> <a href="${OUT}" download>Download .pptx</a> · <a href="pitch-deck.md">Markdown</a> · <a href="../">Back to SI Academy</a></div>
<main class="deck" id="deck">
${deck.slides.map((s, i) => `<section class="${i === 0 || i === last ? "dark" : ""}" id="s${i + 1}" aria-label="Slide ${i + 1} of ${N}">
<div class="top"><div class="brand"><i>${LOGO}</i><span>SI Academy · Super Intelligence Academy</span></div><div class="n">${pad(i + 1)} / ${pad(N)}</div></div>
<div class="main"><div class="kicker">${esc(s.kicker)}</div><h1>${esc(s.title)}</h1>${body(s)}</div>
<div class="bottom"><div class="sub">${esc(i === 0 ? deck.subtitle : i === last ? "github.com/9lordisgod/ai-course" : deck.footer)}</div><div class="rule"></div></div></section>`).join("\n")}
</main>
<script>
const d=document.getElementById('deck'),S=[...d.querySelectorAll('section')];
const cur=()=>S.reduce((b,s,i)=>Math.abs(s.offsetTop-d.scrollTop)<Math.abs(S[b].offsetTop-d.scrollTop)?i:b,0);
const go=i=>d.scrollTo({top:S[Math.max(0,Math.min(S.length-1,i))].offsetTop,behavior:'smooth'});
addEventListener('keydown',e=>{if(e.metaKey||e.ctrlKey||e.altKey)return;
if(['ArrowDown','ArrowRight',' ','PageDown'].includes(e.key)){e.preventDefault();go(cur()+1)}
else if(['ArrowUp','ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(cur()-1)}
else if(e.key==='Home'){e.preventDefault();go(0)}else if(e.key==='End'){e.preventDefault();go(S.length-1)}});
</script></body></html>`;
await writeFile(path.join(dir, "index.html"), html);
console.log(`Built ${N} slides → index.html, pitch-deck.md (${OUT} is the committed source deck, left untouched)`);
