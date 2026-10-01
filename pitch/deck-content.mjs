// Source of truth for the HTML + Markdown pitch deck (pitch/index.html, pitch/pitch-deck.md).
// Mirrors the 16 slides of the committed pitch/SI-Academy-Pitch-Deck.pptx, slide for slide.
//
// Bullet grammar understood by build-deck.mjs:
//   "LABEL — text"  → label rendered as a card heading (slides where every bullet has a label become a card grid)
//   plain text      → ordinary bullet
export const deck = {
  title: "Teach the machine. Keep the mind.",
  subtitle: "Pitch deck · September 2026 · github.com/9lordisgod/ai-course",
  footer: "Open source · Privacy first · Canada aligned",
  slides: [
    {
      kicker: "SI Academy · Super Intelligence Academy",
      title: "Teach the machine. Keep the mind.",
      lead: "Open-source K–12 AI literacy for British Columbia, Canada, and the world. Aligned to AI for All. Built to ship in classrooms, community halls, and browsers.",
      tags: ["K–12 paths", "4 build tracks", "Teacher Hub", "Richmond + online", "MIT license"],
      bullets: [],
    },
    {
      kicker: "The gap",
      title: "Canada just declared AI literacy a national project. Most classrooms still do not have a complete one.",
      stats: [
        ["65%", "of sampled B.C. secondary schools still lack AI-specific content in public codes of conduct (O'Keefe, 2026)."],
        ["3 HRS", "Federal Essentials for Students is a free three-hour course — necessary, not sufficient for K–12 depth."],
        ["SD38", "Richmond already approved a Grade 11 BAA AI literacy course for 2026/27 and runs district AI PLT blocks."],
        ["K–12", "Federal literacy push is strongest at post-secondary. High-school implementation is still local and uneven."],
      ],
      bullets: [],
    },
    {
      kicker: "The product",
      title: "SI Academy is the missing classroom layer.",
      lead: "A living platform, not a PDF. Mastery points. Teacher tools. Voice. Policy explorer. Zero accounts.",
      bullets: [
        "4 K–12 PATHS — Foundations · Critical Thinking · Ethics & Responsibility · Futures & Careers. 8 modules, 12 lessons.",
        "4 BUILD TRACKS — Intro · Practitioner ML · AI Engineer · Academic. 16 modules, 48 lessons on open curricula.",
        "TEACHER HUB — Traffic-light AI-use policy generator, disclosure templates, module planner, official sources.",
        "MASTERY + VOICE — Khan-style levels, instant quizzes, printable certificates, ElevenLabs narration with browser fallback.",
        "POLICY EXPLORER — B.C., N.B., Ontario, Alberta, Manitoba, Quebec + federal programs, with live source links.",
        "PRIVACY FIRST — No accounts. No tracking. Progress lives in the browser. MIT licensed. Deploy on Pages or a Node host.",
      ],
    },
    {
      kicker: "Curriculum architecture",
      title: "Understand. Use. Build.",
      lead: "Same progression as the National AI Literacy Initiative — then we go further.",
      columns: [
        ["K–12 paths", ["How AI works", "Generative AI & offloading", "Bias, deepfakes, misinfo", "Privacy & data", "Academic integrity", "Indigenous data · OCAP®", "Responsible classroom use", "Future-ready careers"]],
        ["Intro → Engineer", ["Elements of AI", "Generative AI for Beginners", "RAG capstone", "ML for Beginners / fast.ai", "Hugging Face LLM Course", "Karpathy + nanoGPT", "Agents + local evals", "Open Resource Library"]],
        ["Academic spine", ["Mathematics for ML", "CS229 / MIT 6.390", "d2l.ai", "CS231n / CS224n", "Prince · Understanding DL", "Quizzes + activities", "License-tagged sources", "Track certificates"]],
      ],
      bullets: [],
    },
    {
      kicker: "Federal policy now",
      title: "AI for All is the operating system.",
      lead: "Launched 4 June 2026. Literacy arm launched 9 September 2026 with Amii.",
      bullets: [
        "STRATEGY — AI for All — trust, opportunity, sovereignty. Target: +$200B growth, 250k AI-related jobs, adoption 12% → 60% by 2034.",
        "LITERACY — National AI Literacy Initiative · $13M with Amii. Understand / Use / Build. 1M post-secondary students. 50k+ K–12 educators.",
        "STREAMS — Essentials for Students (3-hour free course) · Essentials for Educators (ch. 1 live 21 Sep 2026) · Essentials for Canadians (community, later 2026).",
        "SKILLS $ — CanCode $30M for K–12 digital + AI training via not-for-profits. Mitacs up to $162M / 10k AI work placements. 90k youth placements by 2031.",
        "RULE — Education is provincial. Ottawa funds resources, educators, and youth skills — it does not write the B.C. curriculum.",
      ],
    },
    {
      kicker: "How we match policy",
      title: "Do not pretend we are Amii. Become the local delivery layer they need.",
      bullets: [
        "UNDERSTAND — K–12 Foundations + Critical Thinking map onto Essentials. Bias, deepfakes, privacy, integrity — already written as classroom lessons, not a 3-hour survey.",
        "USE — Teacher Hub + responsible-use modules give schools a policy generator and student disclosure template that sit next to B.C. Ministry AI guidance.",
        "BUILD — Intro → Engineer → Academic tracks are the missing depth after Essentials. Open curricula. Local models. Agents with evals.",
        "PROTECT — Privacy-first design, no student accounts, OCAP® module, academic integrity. Matches the strategy's child-protection and sovereignty language.",
        "REACH — Bilingual-ready i18n file. Grade bands K–5 / 6–8 / 9–12. Parent FAQ. Voice-over for accessibility. Works offline-ish in the browser.",
        "COMPLEMENT — Position as a classroom implementation kit for Essentials for Educators + a community partner for Essentials for Canadians — not a rival national course.",
      ],
    },
    {
      kicker: "Grant map",
      title: "Money follows eligible vehicles. Build the vehicle first.",
      bullets: [
        "CANCODE ($30M) — Best federal fit. Funds NFPs to deliver free K–12 coding + AI to youth and educators, with equity reach. Apply as a registered not-for-profit or as a delivery partner of an eligible org.",
        "NALI / AMII ($13M) — Not an open RFP for a rival curriculum. Path: map SI lessons to Essentials for Educators, offer Richmond as a community pilot for Essentials for Canadians, request co-branded local delivery.",
        "MITACS AI PLACEMENTS — Up to $162M / 10k co-funded placements. Use for curriculum engineering, evaluation, and bilingual content once a Canadian host org + academic partner exists.",
        "STRONGERBC FSG — Up to $3,500 per eligible B.C. resident 19+ at public post-secondaries. Partner with a college/institute so the adult Richmond bootcamp becomes grant-eligible short training.",
        "WORKBC / ITA YOUTH — District + community-centre after-school delivery can sit under youth skills and career-education wraparounds already used by SD38 community schools.",
        "PACIFIC / MUNICIPAL — City of Richmond community grants, United Way BC community-schools lineage, and Pacific economic-development youth-STEM calls for the in-person site costs.",
      ],
    },
    {
      kicker: "How to get funded",
      title: "A 5-move compliance sequence.",
      steps: [
        ["Stand up a Canadian vehicle", "B.C. society + CRA charity application, or nest under an existing education NFP / community centre. CanCode and most youth grants will not pay a personal GitHub repo."],
        ["Lock curriculum crosswalks", "Publish a one-pager mapping every SI module to B.C. ADST + Career Education + Digital Literacy Framework + NALI Understand/Use/Build + SD38 Policy 104-G."],
        ["Collect evidence, not vibes", "Pilot 2–3 Richmond schools. Pre/post literacy rubric. Teacher hours saved. Attendance. Privacy DPIA. Letters from principals. That package is the grant."],
        ["Stack, don't chase one cheque", "CanCode for youth delivery. City/United Way for venue. College partner for StrongerBC adult seats. Mitacs later for product + evaluation talent."],
        ["Stay inside the rules", "No student PII. FIPPA-aware. No paid model training on school data. Disclose AI voice. Keep OCAP® accurate and attributed. Open-source the classroom layer."],
      ],
      bullets: [],
    },
    {
      kicker: "B.C. high school implementation",
      title: "Enter through curriculum that already exists.",
      bullets: [
        "ADST + CAREER ED — Ministry already points AI learning to ADST (required K–9, electives 10–12) and Career Education. SI modules drop into existing blocks — no new provincial course required.",
        "BAA COURSE HOOK — SD38 approved Digital Literacy for an AI Enabled World (Gr. 11 BAA) for 2026/27. Offer SI as the open practice layer + Teacher Hub underneath that course and copies in other districts.",
        "POLICY, NOT PRODUCT — Lead with the traffic-light AI-use generator and student disclosure template. Boards buy risk reduction first. Curriculum rides second.",
        "TEACHER TIME — Give a 90-minute PL package that mirrors district PLT structure. Printable lesson + quiz + activity. Total class time printed in the planner. Teachers will not rebuild your JSON.",
        "PILOT SHAPE — 2 secondary + 1 middle. One ADST teacher-lead per site. 6-week sprint. Principal letter + parent FAQ. FIPPA review with district learning-services.",
        "THEN SCALE — Package as a district resource, not a vendor LMS. GitHub Pages + optional Node TTS. Board IT can whitelist a single domain. Zero student logins.",
      ],
    },
    {
      kicker: "Richmond face-to-face bootcamp",
      title: "A Saturday academy the city can walk to.",
      bullets: [
        "WHO — Grades 8–12 first. Then a 19+ evening cohort once a public post-secondary partner makes StrongerBC seats possible.",
        "WHERE — School lab after hours, community centre (Cambie / South Arm / Steveston), or Richmond Public Library meeting rooms. SD38 already runs community-schools partnerships on site.",
        "FORMAT — 6 Saturdays × 3 hours. Cap 20. One lead + one TA. Laptops provided or BYOD with a local-tool track so no student is forced onto a US cloud model.",
      ],
      steps: [
        ["What AI is — systems, not magic"],
        ["Generate, verify, cite"],
        ["Bias, deepfakes, persuasion"],
        ["Privacy, data, OCAP®"],
        ["Build a tiny local agent"],
        ["Demo day + career map"],
      ],
      stepsLabel: "Six Saturdays",
    },
    {
      kicker: "Online bootcamp · Canada + global",
      title: "Same spine. Three doors.",
      steps: [
        ["Self-paced Canada", "The existing SPA. Free. No login. Mastery in localStorage. French pass as soon as i18n is filled. Position as the always-on companion to Essentials for Students / Educators / Canadians."],
        ["Cohort Canada", "8-week live cohort. Weekly 90-min seminar + async lessons. Teachers and senior secondary first. Certificates signed by the NFP. Waitlist via a single form. Zoom or Jitsi. No student LMS accounts required."],
        ["Global open", "GitHub Pages is already worldwide. Keep the Canadian policy explorer as a first-class module, add a Global track that swaps OCAP® context notes rather than erasing them. Time-zone office hours twice a week."],
      ],
      bullets: [
        "LAUNCH STACK — GitHub Pages for the course · Beehiiv or Buttondown for cohort mail · Stripe later for optional global certificates · never for K–12 Canadian core.",
        "GUARDRAILS — Free K–12 core stays free. Paid tracks only above age 18 or outside Canadian public-school hours. No ads. No student data brokerage. WCAG-minded dark UI already ships.",
      ],
    },
    {
      kicker: "Operating system",
      title: "How SI Academy runs.",
      bullets: [
        "PRODUCT — Vanilla JS SPA + JSON curriculum. Node / serverless TTS. CI on every push. Pages deploy with commit-stamped assets.",
        "CLASSROOM — Teacher Hub planner, printable certificates, policy generator, parent FAQ. Designed for a Thursday PLT block.",
        "TRUST — No accounts. localStorage only. Open licenses on every library item. OCAP® named and linked, not appropriated.",
        "TALENT — One curriculum lead, one classroom lead, rotating TAs from local CS / ADST teachers and senior students.",
        "COST SHAPE — Near-zero marginal cost online. In-person cost is rooms, TAs, and laptops — fundable as youth programming.",
        "BRAND — Plan B × Khan grammar. Black, orange, grey. Pixel-S mark. Frontier academy, not edtech pastel.",
      ],
    },
    {
      kicker: "Twelve-month roll out",
      title: "Four quarters, one classroom at a time.",
      timeline: [
        ["Q4 2026", "Foundation", "NFP / host org. Curriculum crosswalk PDF. FIPPA note. Two Richmond teacher champions. Public live site polish. First Saturday cohort waitlist."],
        ["Q1 2027", "Pilot", "6-week school pilot + first Richmond Saturday academy. Teacher PL session. Evidence pack. CanCode partner conversation. French strings pass 1."],
        ["Q2 2027", "Fund + widen", "CanCode or partner submission. Second district conversation (Delta / Vancouver). Adult evening track with a college if StrongerBC eligible."],
        ["Q3 2027", "National door", "Online Canada cohort 1. Community-stream conversations for Essentials for Canadians. Mitacs scoping with a university lab."],
      ],
      bullets: [],
    },
    {
      kicker: "What good looks like",
      title: "Year-one scoreboard. Small on purpose.",
      stats: [
        ["3", "Richmond school sites in a documented pilot"],
        ["120", "Saturday academy seats across two youth cohorts"],
        ["40", "Teachers through a 90-minute PL package"],
        ["1", "CanCode or equivalent partnership in motion"],
        ["8 WK", "First national online cohort shipped"],
        ["0", "Student accounts. Zero is the feature."],
      ],
      bullets: [],
    },
    {
      kicker: "The ask",
      title: "We need rooms, champions, and a legal wrapper.",
      bullets: [
        "SCHOOLS — Two secondary ADST or Career Ed teachers and one administrator willing to run a 6-week pilot under existing B.C. curriculum connections.",
        "DISTRICT — A learning-services conversation on Policy 104-G alignment, a domain whitelist, and a community-schools room on Saturdays.",
        "HOST ORG — An existing B.C. education NFP, library, or society that can carry CanCode eligibility while SI Academy remains the open curriculum.",
        "COLLEGE — A public post-secondary willing to explore a StrongerBC-eligible adult short course built on the Intro + Practitioner tracks.",
        "FUNDERS — Seed for 12 months of classroom lead + TA stipends + laptops. Not a Series A. A youth-skills grant.",
        "BUILDERS — French translation, lesson QA, and local-model lab support. The repo is public. PRs are the application.",
      ],
    },
    {
      kicker: "SI Academy",
      title: "The country funded the spark. We built the classroom.",
      lead: "Open curriculum. Teacher tools. A Richmond room. A browser that works in Iqaluit and Lagos. Match the federal story. Serve the provincial timetable. Keep student data at home.",
      tags: ["github.com/9lordisgod/ai-course", "MIT license", "Black / orange / grey", "September 2026"],
      bullets: [],
    },
  ],
};
