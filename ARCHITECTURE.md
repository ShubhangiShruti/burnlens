# ARCHITECTURE.md — BurnLens System Design

## What this document covers

This explains the technical decisions behind BurnLens: why we chose this stack, how data flows from user input to audit result, and what we would change at 10,000 audits/day.

---

## Stack rationale

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 15 (App Router) | Server components reduce JS bundle size. API routes handle email + DB writes without a separate backend process. Vercel deploy is one command. |
| Language | TypeScript strict mode | The audit engine is pure financial logic. Strict types prevent the class of bugs where `undefined` silently becomes `NaN` in a savings calculation. |
| Styling | Tailwind CSS | No CSS files to maintain. Constraint-based spacing eliminates pixel-pushing. Purged in production so bundle impact is negligible. |
| Database | Supabase (Postgres) | Free tier, instant REST API, no backend server required. No RLS needed because BurnLens has no user accounts — audits are public by design. |
| Email | Resend | Developer-first API, generous free tier (3,000 emails/month), React Email templates. Chosen over SendGrid because the API surface is minimal and the Next.js integration is first-class. |
| AI summary | Anthropic Claude API (claude-haiku-3-5) | Cheapest model in the Claude family. A 100-word summary paragraph costs ~$0.0004 per audit. Fallback to a deterministic template on API failure or $0 balance. |
| Charts | Recharts | React-native, SSR-compatible, lightweight. No D3 complexity needed for a single donut chart. |
| Hosting | Vercel | Zero-config Next.js deployment. Edge CDN. Preview deployments per PR. Free tier covers BurnLens traffic at launch. |
| IDs | uuid v4 | Each audit gets a universally unique ID on the client before the DB write. This means the shareable URL is known before the DB write completes — the audit page renders even if Supabase is down. |

---

## System diagram

```mermaid
flowchart TD
    subgraph Client ["Browser (Next.js Client Components)"]
        A[User fills spend form] -->|localStorage persists state| B[Form state hook]
        B --> C[Submit button]
    end

    subgraph AuditEngine ["Audit Engine (Pure TypeScript — no AI)"]
        C -->|form data| D[runAudit function]
        D --> E{For each tool}
        E --> F[Check: wrong plan for seat count?]
        E --> G[Check: cheaper same-vendor plan exists?]
        E --> H[Check: cheaper alternative tool?]
        E --> I[Check: paying retail vs credit price?]
        F & G & H & I --> J[Per-tool recommendation + savings delta]
        J --> K[Aggregate: total monthly savings, BurnLens Score]
    end

    subgraph NextAPI ["Next.js API Routes (Server)"]
        K --> L[POST /api/audit]
        L --> M[Write audit row to Supabase\naudit_id, tools, savings, timestamp]
        L --> N[Call Anthropic API\nclaude-haiku-3-5\n~100 word summary]
        N -->|success| O[Return AI summary]
        N -->|fail / $0 balance| P[Return fallback template summary]
        O & P --> Q[Return full audit result to client]
    end

    subgraph EmailFlow ["Email Flow (triggered on lead capture)"]
        Q --> R{User submits email}
        R -->|POST /api/lead| S[Write lead row to Supabase\nemail, audit_id, company, role]
        S --> T[Resend API: send confirmation email\n+ Credex CTA if savings > $300/mo]
    end

    subgraph ShareURL ["Shareable URL"]
        Q --> U[/audit/uuid — public page]
        U --> V[Open Graph meta tags\nTwitter card\nNo PII — company + email stripped]
    end

    subgraph DB ["Supabase (Postgres)"]
        M --> W[(audits table\naudit_id, data, created_at)]
        S --> X[(leads table\nid, audit_id, email, role, company)]
    end
```

---

## Data flow: how a user input becomes an audit result

**Step 1 — Form input (client-side)**
The user selects tools, plans, seat counts, and monthly spend. This state is saved to `localStorage` via a custom `useFormPersistence` hook on every keystroke. If the user closes the tab and returns, all inputs are pre-filled. No server call happens at this stage.

**Step 2 — Audit calculation (client-side, pure TypeScript)**
When the user clicks "Run Audit", the `runAudit()` function runs synchronously in the browser. It takes the form state, loops over each
tool, and applies four rules in order:

1. **Seat over-provisioning**: Is the team on a per-seat plan with more seats than active users? (e.g., Cursor Business × 10 for a 4-person team → downgrade to 4 seats, save $240/mo)
2. **Wrong tier**: Is there a cheaper plan from the same vendor that covers the stated use case?
3. **Cheaper alternative**: Is there a meaningfully cheaper tool with equivalent capability for the stated use case?
4. **Credits arbitrage**: Is the tool available through Credex at a lower price than retail?

The function returns a typed `AuditResult` object with per-tool recommendations and a total monthly savings figure. No API call is made at this point — the result is shown immediately.

**Step 3 — Server write (best-effort, async)**
A `POST /api/audit` call fires in the background. It:
- Writes the audit data to Supabase (the `audits` table)
- Calls the Anthropic API for a personalized 100-word summary
- Returns the summary to the client

If Supabase is unavailable, the audit result is still shown (the DB write failure is logged but does not block the UI). If the Anthropic API fails or returns an error, a deterministic fallback summary is used instead. This is the "best-effort write" design decision.

**Step 4 — Shareable URL**
The audit is accessible at `/audit/[uuid]`. The UUID was generated client-side (via `uuid` library) before any server call, so the URL is known immediately. The public page strips email and company name; it shows tool names, plan recommendations, and total savings. Open Graph meta tags are populated server-side so Twitter/LinkedIn link previews work correctly.

**Step 5 — Lead capture (optional, post-value)**
After the audit result is shown, a non-blocking prompt asks for the user's email to "save and receive" the report. This fires a `POST /api/lead` call that writes to the `leads` table and triggers a Resend transactional email. For audits showing >$300/mo savings, the email includes a Credex consultation CTA.

---

## What I would change at 10,000 audits/day

**Current design works fine at <500 audits/day** (Vercel serverless functions, Supabase free tier, Resend free tier). At 10,000 audits/day, three things break:

1. **Supabase free tier limit.** The free tier allows 500MB storage and limited row inserts. At 10,000 audits/day, storage fills in weeks.
   Fix: upgrade to Supabase Pro ($25/mo) or migrate to a pooled connection on Railway Postgres.

2. **Anthropic API rate limits.** At 10,000 audits/day, AI summary requests would hit rate limits unless the account is on a paid tier
   with high throughput. Fix: move summary generation to a background queue (e.g. Vercel Edge Queue or a simple Redis-backed queue), so
   the audit result page renders instantly from the deterministic engine and the AI summary loads in ~2–4 seconds asynchronously.

3. **Resend free tier (3,000 emails/month).** 10,000 audits × 20% email capture = 2,000 emails/day. Fix: upgrade to Resend paid or migrate to AWS SES ($0.10 per 1,000 emails).

**What would NOT change:**
The audit engine itself is pure TypeScript with no I/O. It runs in <5ms regardless of traffic. This was a deliberate design decision — by keeping the core logic deterministic and server-independent, BurnLens degrades gracefully under load. Users always see their audit result. Database writes and AI summaries are the only things that can fail silently.

---

## Security decisions

- **No RLS on Supabase**: BurnLens has no user accounts. Audits are intentionally public (that's the shareable URL feature). PII (email, company) is stored in the `leads` table, which is not exposed client-side. All API routes use server-side writes only.
- **No secrets in the repo**: Anthropic API key, Supabase URL/anon key, and Resend API key are all in `.env.local` (gitignored). Vercel
  environment variables hold production values.
- **Rate limiting on API routes**: Basic rate limiting via Vercel's built-in Edge middleware on `/api/lead` to prevent email capture abuse. Documented as the honeypot-alternative approach in the codebase.

---

## Frontend framework choice justification

Next.js was chosen over plain React + Vite for three specific reasons:

1. **API routes** eliminate the need for a separate Express or Fastify backend. All server logic (Supabase writes, Anthropic calls, Resend emails) lives in `app/api/` as serverless functions. One repo, one deploy, zero ops overhead.

2. **Server-side Open Graph tags** for the shareable audit URL. The `/audit/[uuid]` page needs dynamic `<meta>` tags so Twitter and
   LinkedIn show a proper link preview. This requires server-side rendering, which Next.js App Router handles natively.

3. **Vercel native deploy**. Vercel was built for Next.js. Preview URLs per branch, instant rollbacks, and Edge CDN are all zero-config with Next.js. The same deployment on any other framework requires non-trivial configuration.