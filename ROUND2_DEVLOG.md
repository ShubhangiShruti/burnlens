# Round 2 Devlog

## 2026-05-21 14:00 — Start
Received Round 2 assignment. Read it fully before writing a single
line. The task is clear: make audits live by detecting pricing changes
and notifying users. Planning approach: build in dependency order —
storage first, detection second, email third, diff UI last.

## 2026-05-21 14:30 — Branch created
Created `reaudit-addition` branch off main. Reviewed existing
`src/app/api/audit/route.ts` to understand what's already being saved
to Supabase. Found that `pricing_snapshot` and `user_email` are missing
from the insert. That's the first fix.

## 2026-05-21 14:45 — Supabase outage
Opened Supabase to add columns — hit a platform-wide outage.
"Restoration in progress." Kept building the code while waiting.
Lost about 20 minutes to this. Not our fault but the clock doesn't
care.

## 2026-05-21 15:10 — Feature 1 complete
Added `pricing_snapshot` and `user_email` to the Supabase insert in
`audit/route.ts`. Added `email?: string` to `AuditInput` in types.ts.
Supabase came back online, added two columns to the audits table
manually. Build passes. Committed.

## 2026-05-21 15:17 — Feature 2 complete
Built `src/app/api/detect-changes/route.ts`. Core logic: for each
stored audit, compare its `pricing_snapshot` against current TOOLS
prices. Exported `detectStaleAudits()` as a named function so Feature
3 can import it directly instead of duplicating logic. Build passes.

## 2026-05-21 15:21 — Feature 3 complete
Built `src/app/api/notify-changes/route.ts`. Groups affected audits
by email before sending — one consolidated email per user even if they
have multiple stale audits. Used Resend which was already configured
from Round 1. Build passes.

## 2026-05-21 15:33 — Feature 4 complete
Built `src/app/reaudit/[id]/page.tsx`. Server component fetches the
original audit from Supabase, re-runs the audit engine with current
pricing, renders side-by-side diff. Changed rows highlighted yellow.
Savings delta shown as headline. Build passes.

## 2026-05-21 15:50 — Bug found: email field missing from form
Tested on preview URL. Pricing snapshot was NULL on all rows because
`AuditForm.tsx` never had an email input — so `input.email` was always
undefined. Also found that preview URL had Vercel authentication
blocking API calls. Fixed both: added email field to AuditForm, turned
off Vercel preview authentication.

## 2026-05-21 16:08 — All 4 features verified end-to-end
Tested on preview URL:
- Audit saves with `pricing_snapshot` and `user_email` ✓
- `POST /api/detect-changes` returns `{"affectedAudits":[]}` ✓
- `POST /api/notify-changes` returns `{"emailsSent":0,"skipped":0}` ✓
- `/reaudit/[id]` renders diff view with correct data ✓

## 2026-05-21 17:30 — Bonus features added
Built three bonus features: unsubscribe endpoint at 
/api/unsubscribe that sets unsubscribed=true in Supabase, 
public pricing tracker page at /pricing-changes showing 
current tool rates, and admin dashboard at /admin with 
live stats and trigger buttons for detect/notify. Added 
unsubscribed column to Supabase audits table. All three 
pass build.

## 2026-05-21 18:00 — Documentation complete
Wrote ROUND2_PR.md, ROUND2_DEVLOG.md, ROUND2_REFLECTION.md.
Opened PR from reaudit-addition into main. Submitted 
Google Form before 10pm deadline.