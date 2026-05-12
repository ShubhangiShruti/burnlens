# ECONOMICS.md — BurnLens Unit Economics

## What BurnLens is economically

BurnLens is a free lead-generation tool. It has no direct revenue. Its purpose is to identify startups that are overspending on AI tools and surface Credex as the solution for high-savings cases. Every number in this file is about whether that funnel is economically justified for
Credex to operate and scale.

---

## 1. What is a converted Credex customer worth?

**Defining the average customer:**

Target user: a Series A startup, 6–12 engineers, paying retail for 2–4 AI tools. Based on PRICING_DATA.md verified pricing (May 2026):

| Tool | Plan | Monthly (retail) |
|------|------|-----------------|
| Cursor | Business (8 seats × $40) | $320 |
| Claude | Pro (3 seats × $20) | $60 |
| ChatGPT | Plus (3 seats × $20) | $60 |
| GitHub Copilot | Business (4 seats × $19) | $76 |
| **Total retail** | | **$516/mo** |

**Credex margin model:**
Credex sources unused/overforecast credits from companies that overbought. A reasonable conservative model:
- Credex buys at ~38% below retail (sourced from over-provisioned enterprise contracts and team pivots)
- Credex sells to customers at ~20% below retail (the customer's incentive to switch)
- Gross margin = 18 percentage points of the credit face value

On a $516/mo customer: **$516 × 0.18 = ~$93/month gross profit**

**Retention assumption:**
B2B SaaS tool retention in the dev tools category averages 14–18 months for small startups. Using a conservative 13 months (accounting for startup mortality and switching friction):

**LTV = $93 × 13 = ~$1,210 per converted customer**

This is a conservative floor. Larger teams (20+ devs) or customers who consolidate more tools through Credex will have LTVs of $3,000–$8,000.

---

## 2. CAC at each GTM channel

BurnLens operates with $0 paid ad budget. All channels are organic, outbound, or community-driven. CAC is calculated as (time cost in engineer-hours × assumed $40/hr blended rate) ÷ customers acquired per channel per month.

| Channel | Effort/mo | Customers/mo (est.) | CAC |
|---------|-----------|---------------------|-----|
| BurnLens viral/organic (audit → Credex CTA) | 4 hrs maintenance | 8–15 | ~$13–20 |
| HN / Reddit Show HN post | 6 hrs per post, 1/mo | 5–30 (one-time spike) | ~$8–48 |
| Twitter/X thread outreach to devs | 5 hrs/wk = 20 hrs/mo | 4–10 | ~$80–200 |
| Indie Hacker Slack/Discord communities | 4 hrs/wk = 16 hrs/mo | 3–8 | ~$80–213 |
| Cold email to YC W24/S24/W25 companies | 10 hrs/mo (list + email) | 2–6 | ~$67–200 |
| Referral from existing customers | ~0 incremental | 1–3 | ~$0–40 |

**Blended CAC target across all channels: $60–120**

At LTV of $1,210 and blended CAC of $90: **LTV:CAC = ~13.4x**

This is an exceptionally good ratio (B2B SaaS typically targets 3:1). The reason is that BurnLens itself is doing the qualification work — a user who completes an audit and sees >$300/mo savings is already primed. We are not paying to educate; we are paying to surface.

---

## 3. Conversion funnel math

The full funnel from a BurnLens visitor to a Credex paying customer:
10,000 monthly visitors to burnlens.vercel.app
↓ 32% complete the audit form
3,200 audits completed
↓ 20% submit their email (post-value, not pre-value — this is key)
640 email leads captured
↓ of these, ~40% show >$300/mo savings (the Credex-qualified segment)
256 high-savings leads
↓ 15% book a Credex consultation (via CTA on results page)
38 consultations booked/month
↓ 35% close as a paying Credex customer
~13 new customers/month from BurnLens alone

**What these rates assume:**
- 32% form completion: Justified because users arrived with intent (HN/Twitter), and the form is short (no login, 3–5 fields per tool). Industry benchmarks for intent-driven audit tools run 25–40%.
- 20% email rate: Conservative. Value is shown first, then email is asked. Users who saw real  savings ($200+/mo) have strong reason to save the report. Tested against Credex's own anecdotal data.
- 15% consultation booking: Only shown to high-savings users (>$300/mo), not every lead. The CTA appears contextually, not as a popup.
- 35% consultation close rate: Standard B2B close rate for a warm, inbound, qualified lead with a concrete savings number already shown.

**The funnel that matters for profitability:**
Even at pessimistic 50% of these rates (6–7 customers/month from BurnLens), at $1,210 LTV and ~$90 CAC, BurnLens pays back its development and maintenance cost within the first month of operation.

---

## 4. What would need to be true for $1M ARR in 18 months

**Defining ARR:** Credex's annual gross profit run rate (not GMV).

**Working backwards:**

$1,000,000 ARR ÷ $1,116/year per customer (= $93/mo × 12) = **896 active customers needed at month 18**

Accounting for monthly churn of ~6% (early-stage B2B, conservative):
To maintain 896 active customers at month 18, Credex needs to have acquired roughly 1,350 cumulative customers over 18 months, or an average of **75 new customers/month** (ramping from ~20 in month 1 to ~130 in month 18).

**Monthly customer acquisition ramp needed:**

| Month | New Customers/mo | Cumulative Active | Notes |
|-------|-----------------|-------------------|-------|
| 1–3 | 15–25 | ~55 | BurnLens launch, HN post, founder network |
| 4–6 | 30–45 | ~160 | Referrals kick in, second HN post |
| 7–12 | 55–80 | ~480 | Partnership channel, Product Hunt |
| 13–18 | 100–130 | ~900 | Paid acquisition justified at LTV:CAC |

**What has to be true for this to happen:**

1. **BurnLens reaches 30,000+ monthly visitors by month 6.** This requires 2–3 successful distribution moments (HN, a popular Twitter thread, or a Product Hunt launch). Each major moment historically drives 5,000–25,000 visitors for a tool of this type.

2. **The audit engine is accurate enough that users trust it.** If a user runs an audit and the savings estimate is obviously wrong (e.g. recommends downgrading a plan they're not on), trust collapses and the referral loop breaks. The audit logic quality is not a nice-to-have — it is the economic lever.

3. **The email → consultation flow is staffed.** At 38 consultations/mo by month 6, Credex needs at least one person who can close these synchronously. Response time under 24 hours is the minimum; under 4 hours doubles close rates in B2B.

4. **Credex has credit supply to match demand.** If a startup wants to buy $2,000/mo in Cursor credits but Credex can't source them, the customer churns immediately. Supply-side is the hidden constraint that revenue projections typically ignore.

5. **No large competitor enters the "AI spend audit" space.** Notion, Linear, or a well-funded YC startup could replicate BurnLens in 2 weeks. The moat is Credex's credit supply, the brand, and the SEO footprint from shareable audit URLs — not the tool itself.

---

## 5. Sensitivity analysis — what breaks this model

| Variable | Base case | Pessimistic | Impact |
|----------|-----------|-------------|--------|
| Email capture rate | 20% | 10% | Halves lead volume |
| Consultation close rate | 35% | 15% | Customers/mo: 13 → 6 |
| Customer LTV | $1,210 | $600 | Breaks paid acquisition math |
| Monthly churn | 6% | 12% | Active base caps at ~420, not 900 |
| Visitor growth | 3× per 6 months | Flat 10K/mo | Delays $1M ARR by 12+ months |

**Key insight:** The single most important lever is not conversion rate or CAC. It is the **accuracy and trustworthiness of the audit result**.
A user who shares their BurnLens audit URL because it "nailed" their situation creates organic referral loops that no paid channel can match. The referral loop is the only path to $1M ARR without paid acquisition spend — and it lives or dies on audit quality.

---

## 6. Is BurnLens worth building for Credex?

**Break-even analysis for the tool itself:**

Estimated build cost: 1 intern × 7 days × 8 hrs × $25/hr equivalent = $1,400 one-time. Ongoing maintenance: 2 hrs/week × $40/hr = $320/month.

At 13 customers/month at $1,210 LTV:
- Monthly gross profit from BurnLens-sourced customers: $1,573
- Minus maintenance cost: $320
- **Net monthly contribution: $1,253**
- Payback on build cost: **< 2 months**

BurnLens is worth building. The question is not whether to build it — it is whether Credex can scale the credit supply fast enough to absorb the leads it generates.