# REFLECTION.md

## Question 1: The hardest bug I hit this week, and how I debugged it

The hardest bug was the Claude API never producing a real AI summary,
despite the feature being "implemented" from Day 1. The fallback
template kept running and I could not figure out why.

My first hypothesis was that the API key was not reaching Vercel. I
checked the environment variables dashboard, confirmed the key was
there, and redeployed. Still the fallback. My second hypothesis was
that the code was not reading the environment variable correctly. I
ran a search on the route file and confirmed it was reading
`process.env.ANTHROPIC_API_KEY` — that was fine. My third hypothesis
was that the Supabase write was somehow blocking the Anthropic call.
I checked the logs and saw the Supabase call was completing fine.

The breakthrough came when I opened the Vercel function logs and
expanded the POST /api/audit entry. Under "External APIs" I could
see `POST api.anthropic.com/v1/messages` — the call was actually
reaching Anthropic. I then checked what the API was returning and
found `"invalid_request_error": "Method Not Allowed"`. That was a
model string error, not an authentication error.

The model string in my code was `claude-haiku-4-5`. The correct
string is `claude-haiku-4-5-20251001`. One word wrong. The try/catch
was swallowing the error silently — no console output, no crash,
just the fallback running. I would never have found it without
looking at the raw Vercel logs rather than just the function output.

The deeper issue is that the account has $0 balance, so even with
the correct model string the API fails at the billing stage. The
fallback summary is accurate and meets the assignment's graceful
degradation requirement — but the root cause was a silent failure
that took far too long to diagnose because I was looking at the
wrong layer of the stack.

---

## Question 2: A decision I reversed mid-week, and what made me reverse it

The assignment requires three real user interviews. My initial
instinct was that I did not have many connections in the startup
world who are responsible for buying AI tools at a company level,
so I considered submitting with one or two interviews rather than
three, noting the limitation honestly.

I reversed this when I re-read the assignment PDF more carefully.
It says "faking this is an instant reject" but it also says the
conversations can be informal — "cold DM founders on X, ask in
indie hacker Slacks, use your college network, talk to friends
running side projects." The bar was not "interview a CTO at a
Series B startup." It was "talk to three humans who use AI tools."

Once I reframed the question from "who do I know that buys AI tools
for a company" to "who do I know that pays for any AI tool at all,"
the pool opened up significantly. Students using ChatGPT Plus,
freelancers using Claude Pro, friends at small companies where
everyone shares one account — these are all valid and interesting
subjects. A person who shares one account across a team is actually
more insightful than a person with a clean per-seat setup, because
it reveals how real small teams work around pricing.

The lesson was not to let the formal framing of a requirement narrow
the scope of who counts as a valid subject. The assignment wanted
real conversations about AI spending. That is a much broader
category than "enterprise procurement decisions."

---

## Question 3: What I would build in week 2

The first thing I would build is a benchmark mode. Right now,
BurnLens tells a user whether they are overspending in absolute
terms — but it does not tell them whether their spending is unusual
relative to similar teams. A founder paying $200/month on AI tools
might be a heavy spender or an under-investor depending on their
industry, team size, and use case. Without comparative context, the
audit is a snapshot with no frame of reference.

To build this, I would aggregate anonymized data from completed
audits — tool name, plan, monthly spend, team size, use case — and
compute percentile benchmarks. After 500 audits the data becomes
meaningful. The results page would add one line per tool: "Your
Cursor spend is in the 71st percentile for a 4-person engineering
team." That single addition changes BurnLens from a one-time audit
into something people return to quarterly as their team grows.

The second thing I would invest in is UI and UX polish. The current
interface is clean and functional, but it was built under time
pressure and it shows. The form could be more guided — a step-by-step
wizard rather than an open-ended list. The results page could use
better visual hierarchy to draw the eye to the most important number
first. The mobile experience, while passing Lighthouse thresholds,
has room to feel more native on a phone screen.

From a technical standpoint, I would move the AI summary generation
to a background queue so the audit result appears instantly and the
Claude paragraph loads in a few seconds asynchronously. This removes
the only remaining perceived latency in the current experience.

---

## Question 4: How I used AI tools

I used four AI tools throughout this project, each serving a
distinct purpose.

**Claude** was my primary thinking and documentation partner. I used
it for planning the architecture, writing all documentation files
(ECONOMICS.md, ARCHITECTURE.md, REFLECTION.md), structuring prompts
for Codex, and working through decisions like whether to use AI for
the audit engine or hardcoded logic. Claude was most useful when I
needed something to sound coherent and well-reasoned rather than
just technically correct. I also used Claude to debug the API issue
— it was Claude that identified the model string mismatch from the
error pattern I described.

**ChatGPT Codex** wrote the actual code files. Based on detailed
prompts I provided (themselves structured with Claude's help), Codex
generated the initial audit engine, form components, API routes,
CI workflow, and results page. I then edited and extended this code
myself — the homepage explainer section, the seat over-provisioning
fix, and the jsPDF export layout were all written or heavily modified
by me.

**ChatGPT and Gemini** I used for research — verifying pricing pages,
cross-referencing tool plans, and strategic analysis. I used Gemini
specifically to generate images: the BurnLens logo and the hero
image on the homepage. The favicon was created by running the logo
through Remove.bg.

One specific time an AI was wrong and I caught it: when I asked
Claude to help me verify pricing data for the audit engine, it
provided numbers that were slightly outdated — Windsurf Pro was
listed at $15/month when the actual current price on the vendor page
was $20/month. I caught this because I have a habit of opening the
official pricing page for every number I use, even when an AI has
"verified" it. Pricing changes frequently and no AI training data
is current enough to be trusted without manual verification.

---

## Question 5: Self-rating (1–10 with one-sentence reason each)

**Discipline: 7/10**
I worked consistently through the week and even on the day I did
not write code, I was thinking through the project and planning
what needed to change — though losing Day 3 entirely to other
commitments compressed the documentation work uncomfortably into
the final 48 hours.

**Code quality: 6/10**
The TypeScript is strict, the audit engine logic is defensible,
and the component structure is clean — but the core code was
generated by Codex and I did not add enough inline comments
explaining the reasoning behind key decisions like the best-effort
write pattern or the BurnLens Score penalty weights.

**Design sense: 7/10**
I iterated on the UI twice — once to add the explainer sections
and once to restructure them into a cleaner three-section layout —
and the final result is significantly more intuitive than what
launched on Day 1, though a proper week-2 polish pass would
improve the form UX substantially.

**Problem-solving: 7/10**
Every blocker I hit this week — the Vercel build failure, the
share URL bug, the audit engine returning $0 savings, the silent
API failure — I diagnosed methodically rather than randomly
changing things, and I always found the actual root cause rather
than papering over the symptom.

**Entrepreneurial thinking: 7/10**
I understand why BurnLens works as a lead-generation asset for
Credex, I can model the unit economics, and I made product
decisions (show value before asking for email, honest messaging
for already-optimal stacks, shareable URL as viral loop) that
reflect genuine thinking about user behavior — but I validated
this with too few real conversations to be fully confident in
the conversion assumptions.