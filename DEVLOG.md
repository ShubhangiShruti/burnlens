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

**Hours worked:** 0

**What I did:** No work done today. Had other commitments that 
could not be moved.

**What I learned:** —

**Blockers / what I'm stuck on:** Falling behind on documentation 
files — ECONOMICS.md, ARCHITECTURE.md, REFLECTION.md, and 
USER_INTERVIEWS.md all still need to be written.

**Plan for tomorrow:** Compress Day 3 and Day 4 work into one 
long session. Write all remaining documentation files, fix 
remaining bugs, take screenshots, run Lighthouse check.


## Day 4 (Sitting 1) — 2026-05-12 (4am)

**Hours worked:** 2

**What I did:** 
 - Code workflow study
 - Created logo.png and favicon.png from gemini and added to the code

**What I learned:** — if not created vercel gives its own favicon

**Blockers / what I'm stuck on:** Falling behind on documentation 
files — ECONOMICS.md, ARCHITECTURE.md, REFLECTION.md, and 
USER_INTERVIEWS.md all still need to be written.

**Plan for Today:** Compress Day 3 and Day 4 work into one 
long session. Write all remaining documentation files, fix 
remaining bugs, take screenshots, run Lighthouse check.