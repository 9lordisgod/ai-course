// Builds pitch/SI-Academy-Pitch-Deck.pptx, pitch/index.html and pitch/pitch-deck.md from deck-content.mjs
import pptxgen from "pptxgenjs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deck } from "./deck-content.mjs";

const dir = path.dirname(fileURLToPath(import.meta.url));
const ORANGE = "FF5C00", BLUE = "1865F2", INK = "0F1115", MUTED = "6B7080", BG = "F7F6F4", PAPER = "FFFFFF";
const FONT = "IBM Plex Sans", MONO = "IBM Plex Mono";
const OUT = "SI-Academy-Pitch-Deck.pptx";
const last = deck.slides.length - 1;
const LOGO = `<svg viewBox="0 0 32 32" aria-hidden="true"><g shape-rendering="crispEdges"><rect class="px" x="0.3" y="28.3" width="3.4" height="3.4" fill="#fff" opacity="0.28"/><rect class="px" x="4.3" y="24.3" width="3.4" height="3.4" fill="#fff" opacity="0.5"/><rect class="px" x="8.3" y="24.3" width="3.4" height="3.4" fill="#fff" opacity="0.56"/><rect class="px" x="12.3" y="24.3" width="3.4" height="3.4" fill="#fff" opacity="0.62"/><rect class="px" x="16.3" y="24.3" width="3.4" height="3.4" fill="#fff" opacity="0.68"/><rect class="px" x="20.3" y="24.3" width="3.4" height="3.4" fill="#fff" opacity="0.74"/><rect class="px" x="24.3" y="20.3" width="3.4" height="3.4" fill="#fff" opacity="0.8"/><rect class="px" x="20.3" y="16.3" width="3.4" height="3.4" fill="#fff" opacity="0.86"/><rect class="px" x="16.3" y="12.3" width="3.4" height="3.4" fill="#fff" opacity="0.92"/><rect class="px" x="12.3" y="12.3" width="3.4" height="3.4" fill="#fff" opacity="0.96"/><rect class="px" x="8.3" y="8.3" width="3.4" height="3.4" fill="#fff"/><rect class="px" x="12.3" y="4.3" width="3.4" height="3.4" fill="#fff"/><rect class="px" x="16.3" y="4.3" width="3.4" height="3.4" fill="#fff"/><rect class="px" x="20.3" y="4.3" width="3.4" height="3.4" fill="#fff"/><rect class="px" x="24.3" y="4.3" width="3.4" height="3.4" fill="#fff"/><rect class="px dither" x="21.2" y="1.2" width="1.6" height="1.6" fill="#fff" opacity="0.35"/><rect class="px dither" x="29.2" y="9.2" width="1.6" height="1.6" fill="#fff" opacity="0.45"/><rect class="px dither" x="5.2" y="17.2" width="1.6" height="1.6" fill="#fff" opacity="0.25"/><rect class="px spark" x="28.3" y="0.3" width="3.4" height="3.4" fill="#1865f2"/></g></svg>`;

// ---- PPTX ----
const pptx = new pptxgen();
pptx.layout = "LAYOUT_16x9";
pptx.author = "SI Academy";
pptx.company = "SI Academy";
pptx.title = deck.title;
pptx.subject = deck.subtitle;

deck.slides.forEach((s, i) => {
  const dark = i === 0 || i === last;
  const slide = pptx.addSlide();
  slide.background = { color: dark ? INK : i % 2 ? BG : PAPER };
  // Top accent rule + brand mark
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.08, fill: { color: ORANGE } });
  slide.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 0.32, w: 0.34, h: 0.34, rectRadius: 0.08, fill: { color: ORANGE } });
  slide.addText("SI", { x: 0.6, y: 0.32, w: 0.34, h: 0.34, fontSize: 10, bold: true, color: "FFFFFF", align: "center", valign: "middle", fontFace: MONO });
  slide.addText("SI ACADEMY  ·  SUPER INTELLIGENCE ACADEMY", { x: 1.05, y: 0.32, w: 6, h: 0.34, fontSize: 9, color: dark ? "A7A39E" : MUTED, fontFace: MONO, charSpacing: 2, valign: "middle" });
  slide.addText(`${String(i + 1).padStart(2, "0")} / ${String(deck.slides.length).padStart(2, "0")}`, { x: 8.2, y: 0.32, w: 1.2, h: 0.34, fontSize: 9, color: dark ? "A7A39E" : MUTED, fontFace: MONO, align: "right", valign: "middle" });

  slide.addText(s.kicker.toUpperCase(), { x: 0.6, y: 0.95, w: 8.8, h: 0.35, fontSize: 11, bold: true, color: ORANGE, fontFace: MONO, charSpacing: 3 });
  slide.addText(s.title, { x: 0.6, y: 1.3, w: 8.8, h: i === 0 ? 1.1 : 0.85, fontSize: i === 0 ? 44 : 32, bold: true, color: dark ? "FFFFFF" : INK, fontFace: FONT, valign: "top" });
  slide.addText(
    s.bullets.map((b) => ({ text: b, options: { bullet: { code: "25A0" }, breakLine: true } })),
    { x: 0.6, y: i === 0 ? 2.5 : 2.2, w: 8.8, h: 2.7, fontSize: i === 0 ? 17 : 14.5, color: dark ? "E8E4DF" : "21242C", fontFace: FONT, paraSpaceAfter: 7, valign: "top", bullet: { indent: 18 } }
  );
  if (i === 0) slide.addText(deck.subtitle, { x: 0.6, y: 5.0, w: 8.8, h: 0.35, fontSize: 11, color: "A7A39E", fontFace: MONO });
  // Blue footer rule on light slides, orange on dark
  slide.addShape(pptx.ShapeType.rect, { x: 0.6, y: 5.35, w: 1.2, h: 0.04, fill: { color: dark ? ORANGE : BLUE } });
  if (s.notes) slide.addNotes(s.notes);
});
await pptx.writeFile({ fileName: path.join(dir, OUT) });

// ---- Markdown ----
const md = [`# ${deck.title}\n\n_${deck.subtitle}_\n`];
deck.slides.forEach((s, i) => {
  md.push(`\n---\n\n## ${i + 1}. ${s.title}\n\n*${s.kicker}*\n\n${s.bullets.map((b) => `- ${b}`).join("\n")}\n`);
  if (s.notes) md.push(`\n> **Speaker notes:** ${s.notes}\n`);
});
await writeFile(path.join(dir, "pitch-deck.md"), md.join(""));

// ---- HTML deck ----
const esc = (t) => t.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(deck.title)} — Pitch Deck</title>
<link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{--orange:#ff5c00;--blue:#1865f2;--ink:#0f1115;--bg:#f7f6f4;--paper:#fff;--muted:#6b7080;--mono:"IBM Plex Mono",ui-monospace,monospace}
*{box-sizing:border-box}html,body{margin:0;height:100%}body{font-family:"IBM Plex Sans",system-ui,-apple-system,sans-serif;background:#0b0b0c;color:var(--ink)}
.deck{height:100vh;overflow-y:scroll;scroll-snap-type:y mandatory}
section{height:100vh;scroll-snap-align:start;display:flex;flex-direction:column;justify-content:center;padding:8vh 10vw;background:var(--paper);position:relative;border-top:6px solid var(--orange)}
section:nth-child(even){background:var(--bg)}
section.dark{background:var(--ink);color:#fff}
.brand{position:absolute;top:4vh;left:10vw;display:flex;align-items:center;gap:10px;font-family:var(--mono);font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
.brand i{width:26px;height:26px;border-radius:7px;background:var(--orange);display:grid;place-items:center}.brand i svg{width:18px;height:18px}
section.dark .brand{color:#a7a39e}
.kicker{color:var(--orange);font-weight:600;letter-spacing:.14em;font-size:.78rem;text-transform:uppercase;font-family:var(--mono);display:flex;align-items:center;gap:10px}
.kicker::before{content:"";width:18px;height:2px;background:var(--orange)}
h1{font-size:clamp(2rem,5vw,3.8rem);margin:.3em 0 .5em;line-height:1.05;letter-spacing:-.03em;font-weight:700}
ul{font-size:clamp(1rem,1.55vw,1.3rem);line-height:1.55;padding-left:1.2em;max-width:64ch;margin:0}li{margin:.4em 0;padding-left:.2em}li::marker{color:var(--orange)}
section.dark li{color:#e8e4df}
.sub{position:absolute;bottom:6vh;left:10vw;font-family:var(--mono);font-size:.78rem;color:#a7a39e;letter-spacing:.04em}
.n{position:absolute;top:4vh;right:10vw;color:var(--muted);font-size:.75rem;font-family:var(--mono);letter-spacing:.1em}
section.dark .n{color:#a7a39e}
.rule{position:absolute;bottom:6vh;right:10vw;width:64px;height:4px;background:var(--blue)}section.dark .rule{background:var(--orange)}
.help{position:fixed;bottom:14px;right:16px;color:#cfcbc6;font-size:.75rem;z-index:9;font-family:var(--mono);background:rgba(15,17,21,.85);padding:8px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.12)}
.help a{color:#fff;text-decoration:none;font-weight:600}.help a:hover{color:var(--orange)}
@media print{.deck{height:auto;overflow:visible}section{height:auto;min-height:90vh;page-break-after:always}.help{display:none}}
</style></head><body>
<div class="help">↑↓ / space · <a href="${OUT}">Download .pptx</a> · <a href="pitch-deck.md">Markdown</a> · <a href="../">Back to SI Academy</a></div>
<div class="deck" id="deck">
${deck.slides.map((s, i) => `<section class="${i === 0 || i === last ? "dark" : ""}" id="s${i + 1}">
<div class="brand"><i>${LOGO}</i>SI Academy · Super Intelligence Academy</div><div class="n">${String(i + 1).padStart(2, "0")} / ${String(deck.slides.length).padStart(2, "0")}</div>
<div class="kicker">${esc(s.kicker)}</div><h1>${esc(s.title)}</h1>
<ul>${s.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
${i === 0 ? `<div class="sub">${esc(deck.subtitle)}</div>` : ""}<div class="rule"></div></section>`).join("\n")}
</div>
<script>
const d=document.getElementById('deck'),n=${deck.slides.length};
addEventListener('keydown',e=>{const i=Math.round(d.scrollTop/innerHeight);if(['ArrowDown','ArrowRight',' ','PageDown'].includes(e.key)){e.preventDefault();d.scrollTo({top:Math.min(i+1,n-1)*innerHeight,behavior:'smooth'})}
if(['ArrowUp','ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();d.scrollTo({top:Math.max(i-1,0)*innerHeight,behavior:'smooth'})}});
</script></body></html>`;
await writeFile(path.join(dir, "index.html"), html);
console.log(`Built ${deck.slides.length} slides → ${OUT}, pitch-deck.md, index.html`);
