# Round 2 Reflection

## 1. What was the most uncomfortable trade-off you made because of time pressure?

I did not write unit tests for the new detection logic. The
`detectStaleAudits` function is a pure function that takes rows and
returns affected audits — it is exactly the kind of function that
should have 5-6 focused unit tests covering edge cases: null snapshots,
tools that no longer exist in the pricing data, users with multiple
stale audits. I skipped this entirely. The trade-off was uncomfortable
because Round 1 already had 8 passing tests and I actively made the
test coverage worse relative to the new surface area I added. If this
were a real production system and a pricing comparison bug sent 10,000
wrong emails, the missing tests would be the first thing anyone asked
about in the post-mortem.

## 2. If the deadline extended by another 24 hours, what is the 
single first thing you would do?

Move pricing data out of the static `pricing.ts` file and into a 
Supabase `pricing` table. Right now, detecting a price change requires 
a developer to manually edit `pricing.ts` and redeploy the entire 
application — which is the accepted approach for this assignment, but 
not a viable production system. With 24 more hours I would create a 
`pricing` table in Supabase with columns for `tool_id`, `plan_id`, and 
`monthly_price`, seed it with current data, and update the audit engine 
and detect-changes logic to read from DB instead of the static file. 
This would mean price updates happen via a single DB row edit — no code 
change, no redeploy, and the detect-changes endpoint immediately picks 
up the difference on the next run. The unsubscribe flow and admin 
dashboard would come after this, because they're only valuable if the 
core detection mechanism is production-grade.

## 3. Looking back at your Round 1 codebase as a now-experienced user of it, what is one thing your Round 1 self made harder for your Round 2 self?

The `AuditInput` type did not have an `email` field. Round 1 collected
email separately through a `LeadCaptureModal` that fired after the
audit result was shown — completely decoupled from the audit submission
itself. This made sense for Round 1's goal of not blocking the audit
behind a login wall. But for Round 2, I needed the email at audit time
so it could be stored with the pricing snapshot. I had to add
`email?: string` to `AuditInput`, update the form, and thread it
through the API route. A small amount of Round 1 foresight — even just
an optional email field in the audit payload — would have made Feature 1
a 10-minute task instead of a debugging session.