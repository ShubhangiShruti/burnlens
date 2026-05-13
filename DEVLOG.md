## Day 0 — 2026-05-08

**Hours worked:** 2

**What I did:**
- Read through the complete assignment PDF and understood the full
  scope of what the assignment needed to be
- Researched the Anthropic Claude API and how LLM API calls work,
  since I had not used it directly before
- Researched Supabase, Resend, and Vercel to understand how they
  would fit together
- Decided upon the name Burnlens after going through a few like SpendPilot, 
  Stacklens (both already existing)
- Sketched a rough mental picture of the UI — decided to start with
  a clean, functional layout and improve visual design on the last day
- Listed out the 6 MVP features and mapped which ones needed backend
  support vs which could be pure frontend logic
- Noted that the audit engine should use hardcoded deterministic logic,
  not AI — the assignment hints at this and it is the right call

**What I learned:**
- The assignment is entrepreneurial, not just technical — the
  documentation files carry as much weight as the code
- Shareable public URLs require server-side Open Graph tags, which
  means Next.js App Router is the right choice over plain React

**Blockers / what I'm stuck on:**
- No code written yet — just planning

**Plan for tomorrow:**
- Set up GitHub repository, Next.js project, and Supabase
- Scaffold all core files and get a basic deployment on Vercel
- Use Codex to generate the initial project structure

---

## Day 1 — 2026-05-09

**Hours worked:** 4

**What I did:**
- Set up GitHub repository and cloned it locally
- Installed Next.js 14 with TypeScript, Tailwind CSS, and App Router
- Scaffolded complete project folder structure (components, lib, hooks, API routes)
- Created all 12 required documentation files at repo root
- Installed all required packages: Supabase, Anthropic SDK, Resend, UUID, Vitest
- Used ChatGPT Codex to generate all 17 core project files including the audit engine, form components, results age, API routes, and CI workflow
- Set up Supabase project (Mumbai region), created audits and leads tables via SQL editor
- Set up Resend account and obtained API key
- Deployed to Vercel at burnlens.vercel.app
- Fixed build errors: removed Google Fonts dependency blocking Vercel builds, fixed Next.js 16 dynamic route params, made Supabase client build-safe with placeholder env vars
- Fixed audit API route to be best-effort — audit runs and shows results even if database save fails
- Confirmed full end-to-end flow working on live URL: form renders, audit runs, results display with per-tool breakdown and everity badges

**What I learned:**

- Vercel caches old commits — sometimes need an empty commit to force fresh deployment
- "Best-effort" database pattern: don't let non-critical services block the core feature
- Supabase RLS (Row Level Security) is not needed for public tools with no user authentication
- Browser extensions like Grammarly cause React hydration warnings that look scary but are harmless

**Blockers / what I'm stuck on:**
- Anthropic API key not yet obtained — AI summary feature not tested
- Audit logic showing $0 savings for ChatGPT Team with 20 seats at $600/mo — needs investigation
- Shareable URL flow not yet tested end to end
- All 12 documentation files are scaffolded but not yet written

**Plan for tomorrow:**
- Understand the generated codebase file by file
- Fix audit engine logic — verify savings calculations are correct
- Obtain Anthropic API key and test AI summary
- Test shareable URL, email capture, and all 6 MVP features
- Research and fill PRICING_DATA.md with verified numbers
- Begin writing GTM.md and ECONOMICS.md
- Conduct at least 1 user interview

## Day 2 — 2026-05-10

**Hours worked:** 3

**What I did:**
- Verified all AI tool pricing against official vendor pages using
  ChatGPT and Gemini as research assistants. Discovered Windsurf Pro
  increased from $15 to $20/month — updated PRICING_DATA.md and
  auditEngine.ts accordingly
- Added 6 UI improvements via Codex: spend breakdown chart (Recharts),
  BurnLens Score (0-100 efficiency rating), empty state with clickable
  tool chips, social proof section with stats and testimonials, loading
  skeletons, and mobile responsiveness fixes
- Filled in first AI-drafted versions of PRICING_DATA.md, PROMPTS.md,
  TESTS.md, LANDING_COPY.md, GTM.md, METRICS.md — all marked for
  human review and will be edited further
- Reviewed Gemini's strategic analysis of BurnLens and identified
  remaining gaps to address
- Verified all 6 MVP features working end to end on localhost: form
  inputs, audit engine, results page, AI summary fallback, email
  capture (confirmation email delivered to Gmail), shareable URL
- Fixed share button — was copying localhost URL instead of the correct
  /audit/[id] path. Changed to use window.location.origin + auditId
- Confirmed 8 tests still passing after all changes
- Began studying the complete project file structure to understand the
  full data flow from form input through audit engine through API
  routes through Supabase to results page — this will feed directly
  into ARCHITECTURE.md tomorrow

**What I learned:**
- AI pricing changes frequently — Windsurf Pro changed price since
  project started. Always verify against official vendor pages
- The share button was using window.location.href which returns the
  current page URL, not the audit-specific URL. Need to construct
  the share URL explicitly using window.location.origin + auditId
- Floating point rounding causes number inputs to show 80.02 instead

## Day 3 — 2026-05-11

**Hours worked:** 1

**What I did:** No work done today. Had other commitments that 
could not be moved.

**What I learned:** — tried to understand the workflow of the the code that has been generated by AI.

**Blockers / what I'm stuck on:** Falling behind on documentation 
files — ECONOMICS.md, ARCHITECTURE.md, REFLECTION.md, and 
USER_INTERVIEWS.md all still need to be written.

**Plan for tomorrow:** Compress Day 3 and Day 4 work into one 
long session. Write all remaining documentation files, fix 
remaining bugs, take screenshots, run Lighthouse check.


## Day 4 — 2026-05-12

**Hours worked:** 6

**What I did:**
- Added logo.png and favicon.png (generated with Gemini, integrated
  into Next.js app/layout.tsx and public/ folder) — committed at 4am
- Returned to work at 7pm for documentation sprint
- Wrote complete ECONOMICS.md: unit economics, LTV/CAC model,
  conversion funnel, $1M ARR breakdown, sensitivity analysis
- Wrote complete ARCHITECTURE.md: Mermaid system diagram, data flow
  walkthrough, stack rationale table, 10k audits/day scaling analysis
- Restructured homepage into 3 explainer sections: What is BurnLens,
  feature cards (Who is it for / What do you get), dark How-to band
- Added Gemini-generated hero image to homepage explainer section

**What I learned:**
- Working through the LTV model forced me to understand Credex's
  actual business — the margin is in the credit spread, not a
  subscription fee
- The Mermaid diagram process clarified that the best-effort write
  pattern is the most important architectural decision in the project

**Blockers / what I'm stuck on:**
- USER_INTERVIEWS.md still needs 3 real conversations
- REFLECTION.md not yet written
- Anthropic API credits at $0 — AI summary running on fallback

**Plan for tomorrow:**
- Fix audit engine seat over-provisioning bug
- Fix Claude API model string
- Complete USER_INTERVIEWS.md
- Write REFLECTION.md
- Add README screenshots and Loom video
- Final commit and submission

---



