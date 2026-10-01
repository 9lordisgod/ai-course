# Research summary — AI education in Canadian K–12 (2026)

Compiled from the source briefing `Canada_AI_Education_K12_EN_ZH.pdf` (EN/ZH) and supplementary checks of public sources in September 2026. Items marked **[briefing]** come from the PDF; **[verified]** were independently confirmed online; **[partial]** were only partly confirmable by automated fetch (the official sites are JS-rendered).

## 1. Federal landscape

| Program | Facts | Status |
|---|---|---|
| **National AI Literacy Initiative** | Launched 9 Sept 2026 in Edmonton; $13M; delivered with Amii (Alberta Machine Intelligence Institute); part of the "AI for All" strategy; reach up to 1M post-secondary students and 50,000+ K–12 educators | [briefing] [partial — Amii announcement dated 9 Sept 2026 and `educators.ailiteracyforall.ca` ("AI for All: Essentials for Educators · Powered by Amii") confirmed] |
| — Essentials for Educators | Chapter 1 open 21 Sept 2026, five more chapters fall 2026; topics: how AI/ML work, generative AI & cognitive offloading, student privacy, academic integrity, Indigenous data sovereignty, responsible classroom use, future-ready literacy | [briefing] [partial] |
| — Essentials for Students | 3-hour bilingual (EN/FR) course for post-secondary students | [briefing] |
| — Essentials for Canadians | General-public course, later 2026 | [briefing] |
| **CanCode Phase 5** | $30M, 2026–2028; ~1.1M students and 76,000 teachers; applications closed 6 Aug 2026 | [briefing] |

**Implication:** Education is a provincial responsibility. Federal money funds *resources and educator training*; it does not mandate a curriculum. A ready-to-teach content layer is the missing piece.

## 2. Provincial picture

- **No Canada-wide mandatory AI class.** [briefing]
- **British Columbia:** AI literacy embedded in Applied Design, Skills & Technologies (required K–9, electives 10–12) and Career Education; Ministry page "Digital literacy and the use of AI in education". Vancouver School Board approved Microsoft Copilot with Enterprise Data Protection. [briefing] [ADST curriculum site verified]
- **New Brunswick:** first province to weave AI literacy across K–12 (Sept 2026). [briefing]
- **Manitoba:** school-led modules, e.g. a Winnipeg collegiate 2-hour AI module. [briefing]
- **Ontario / Alberta / Quebec:** board-level guidance and digital-competency frameworks rather than a stand-alone course. [general knowledge — verify locally]

## 3. Typical school restrictions [briefing]

1. Academic integrity — AI-generated work submitted as one's own = plagiarism.
2. Approved tools only (district-vetted for privacy).
3. Age gates — most consumer AI tools require 13+.
4. Privacy — no personal information in prompts.
5. Acceptable-use policies apply to AI.
6. Students must check output for bias, hallucinations and copyright issues.

These six rules are encoded in the platform's **5-Question Checklist** lesson and the **Teacher Hub policy generator**.

## 4. Competitive landscape [partial]

| Player | Focus | Gap vs. this project |
|---|---|---|
| Code.org AI, Day of AI (MIT RAISE), Experience AI (Google/RPi) | Free AI-literacy curricula | US/UK-centric, English-only, no Canadian policy mapping |
| Khanmigo, MagicSchool | AI tutors / teacher productivity | Tools *using* AI, not curricula *about* AI |
| aiEDU | US K–12 AI readiness curriculum & PD | English-only, US standards [verified active] |
| Amii Essentials for Educators | Canadian educator PD | Educator-facing; not student lessons; EN/FR |

**White space:** Canada-specific, student-facing, bilingual EN/ZH, voice-narrated, with built-in policy tooling. Chinese is the most common non-official mother tongue in Canada, concentrated in Metro Vancouver and the GTA — the same regions leading AI-policy adoption.

## 5. ElevenLabs TTS [verified]

- Endpoint: `POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}`; header `xi-api-key`.
- Models: `eleven_multilingual_v2` (29 languages incl. Mandarin, 10k chars), `eleven_flash_v2_5` (low latency, 40k chars), `eleven_v3` (70+ languages, 5k chars). Newer `eleven_v4` family also available.
- Free tier: 10,000 credits/month.
- Design decisions: server-side proxy only (never expose the key), SHA-256 cache per (model, voice, lang, text), 4,000-char cap per request, IP rate limit, graceful fallback to `speechSynthesis`.

## 6. Open questions to validate with pilots

- Exact chapter list and licensing of Essentials for Educators once fully published.
- District procurement requirements (FOIPPA in B.C., MFIPPA in Ontario) for hosted audio generation.
- Demand for French (mandatory for Quebec and francophone boards) — planned for phase 3.
- Community-consent process for any Indigenous-language narration.
