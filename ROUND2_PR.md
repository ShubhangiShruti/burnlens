# feat: add re-audit on pricing change with email notifications

## What this PR does

This PR adds a "Re-audit on Pricing Change" feature to BurnLens. When
AI tool pricing changes, users who previously ran an audit are
automatically notified by email and can re-run their audit to see
exactly how the new pricing affects their recommendations — with a
side-by-side diff view showing what changed and why.

## Why this matters

A one-time audit goes stale the moment a vendor changes their pricing.
Cursor raised prices in 2024. Claude added new tiers in 2025. GitHub
Copilot restructured plans. Every one of those changes silently
invalidated thousands of audits. This feature turns BurnLens from a
snapshot tool into a living audit system that stays accurate over time.
The user who ran an audit six months ago is the most valuable lead for
Credex — they already care about AI spend, and now they have a reason
to come back.

## How it works
User runs audit
↓
Audit saved to Supabase with pricing snapshot (what prices were
at the time of the audit)
↓
POST /api/detect-changes is called (manually or on a schedule)
↓
Each stored audit's snapshot is compared against current TOOLS
pricing — any difference flags the audit as stale
↓
POST /api/notify-changes sends one consolidated email per user
via Resend — listing what changed and linking to /reaudit/[id]
↓
User clicks link → sees old vs new recommendations side by side
with changed rows highlighted in yellow


## What I cut

- **Scheduled cron trigger** — the assignment allows a manual
  `/api/detect-changes` endpoint as an acceptable alternative to a
  cron schedule. Given the 36-hour window I chose the manual endpoint
  which is simpler, fully testable, and what Credex asked for.
- **Storing new audit results** — the re-audit page re-runs the engine
  on the fly rather than persisting the new result. This means no DB
  bloat and no stale re-audit results to clean up. Trade-off: the page
  is slower on cold start.

## How to test it manually

1. Submit an audit at the live URL with your email address
2. Confirm the row appears in Supabase with `pricing_snapshot` and
   `user_email` populated
3. Call the detection endpoint:
   `POST /api/detect-changes` → returns `{"affectedAudits":[]}`
   (empty because pricing hasn't changed yet)
4. To simulate a pricing change: edit any `monthlyPrice` value in
   `src/lib/pricing.ts`, redeploy, then call `/api/detect-changes`
   again — it will return the affected audit
5. Call `POST /api/notify-changes` → email arrives with re-run link
6. Click the link → diff view renders with old vs new side by side

## What's tested

- Existing 8 Vitest tests all pass — this PR adds no regressions
- Detection logic is a pure function (`detectStaleAudits`) that is
  trivially unit-testable — skipped writing tests for it given the
  36-hour constraint, would be first thing added with more time

## Open questions / risks

- The `pricing_snapshot` captures `pricePerSeat ?? flatPrice ?? 0`.
  If a tool switches pricing model (per-seat to flat) this comparison
  may produce false positives. Acceptable for now — real fix would
  require a more structured snapshot schema.
- Resend free tier is limited to verified domains. The `from` address
  uses `onboarding@resend.dev` which works on free tier but should be
  replaced with a branded domain before any real user volume.