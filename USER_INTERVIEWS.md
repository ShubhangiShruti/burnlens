# USER_INTERVIEWS.md

Three informal interviews conducted on May 13, 2026 via WhatsApp.
Each conversation was 10–15 minutes. Participants were asked about
their AI tool usage, spending awareness, and reactions to BurnLens.

---

## Interview 1 — Abhishek S., Team Lead, Trigent Software

**Background:**
Abhishek is a Team Lead at Trigent, a mid-size technology services
firm. He has been working in software development and team management
for several years. He does not personally pay for AI tools — his
company handles procurement centrally, which means he uses tools
without direct visibility into what they cost per seat.

**Tools and spend:**
AI tool costs are managed at the firm level. Abhishek uses whatever
is provisioned for his team but does not have direct access to
invoice data.

**Direct quotes:**
- "I don't pay — my firm handles this."
- "I would try to figure out first on what algorithms I am getting
  the report, then I'll do a self-evaluation. If it matches with
  the result, I'll be trusting and recommending it to others."
- "The idea of choosing the best combination of tools to use —
  eventually saving your time and money — that is the most
  interesting thing about this."

**Most surprising thing he said:**
Abhishek's instinct before trusting any audit tool was to validate
it against his own judgment first. He would not take a recommendation
at face value — he would run a self-assessment in parallel and only
recommend the tool to others if the outputs aligned. This was a
useful signal: the audit engine's reasoning needs to be visible and
defensible, not just a number. Users with technical backgrounds will
interrogate the logic before they trust the conclusion.

**What it changed about the design:**
Abhishek's response reinforced the decision to show per-tool
reasoning on the results page — not just a savings number, but a
one-line explanation of why each recommendation was made. Showing
the logic is what converts a skeptical technical user into a
recommender.

---

## Interview 2 — Anurag B., Cloud Engineer / Backend Developer, EXL

**Background:**
Anurag is a backend developer and cloud engineer at EXL, a large
analytics and digital operations company. He works extensively with
cloud infrastructure and uses AI tools primarily for development
workflows. He personally subscribes to GitHub Copilot.

**Tools and spend:**
- GitHub Copilot (individual plan, personally subscribed)

**Direct quotes:**
- "Yes, I do think about whether I'm getting value from the tools
  I pay for."
- "The speed at which it gives the report — that stood out to me."
- "When I first opened the website, I could not understand what the
  tool actually does. I didn't understand what I was supposed to do."

**Most surprising thing he said:**
Anurag's candid feedback that he did not understand what BurnLens
was or what he was supposed to do when he first landed on the page
was the most valuable — and uncomfortable — thing I heard all week.
He is a developer, the exact target user, and the homepage was still
unclear enough that he had to ask what it was for before he could
use it.

**What it changed about the design:**
Anurag's confusion was the direct reason I added the three explainer
sections to the homepage: "What is BurnLens," "Who is it for / What
do you get," and the dark "How to run your audit" band with numbered
steps. Before his feedback, the page opened directly into a form
with no context. After the change, a first-time visitor understands
the tool's purpose, who it serves, and exactly what to do — before
they fill in a single field. This was the most impactful UI change
made during the entire project.

---

## Interview 3 — Selwyne M., Media Manager and Analyst, Bored Panda

**Background:**
Selwyne works as a Media Manager and Analyst at Bored Panda, a
large viral media company. His work involves content production,
analytics, and media workflows — he is a regular user of multiple
AI tools across creative and analytical tasks. Unlike the other
two interviewees, Selwyne uses AI tools with real creative switching
decisions: he moves between tools based on their technical
limitations for specific tasks.

**Tools and spend:**
- ChatGPT and Gemini (writing, research, general tasks)
- Google Flow (AI video generation)
- Kling AI (video generation for scenes with complex physics or
  movement that Flow handles poorly)

Selwyne does not pay per seat individually — his entire team
operates from one shared account.

**Direct quotes:**
- "Flow sometimes restricts the scenes and also ignores the physics
  behind an object's behaviour while generating a video — that is
  why Kling AI is being used as per the needs."
- "Most AI tools are pretty transparent on costs and the features
  they provide. So if the tool is suggesting a cheaper alternative
  with the same features, that will be great."
- "This tool amazingly does the analysis of our AI tools' usage and
  recommends certain actions which can be taken to optimize the cost
  spent on AI tools. Really great work."

**Most surprising thing he said:**
The most unexpected insight from the entire interview process came
from Selwyne. When I asked about seat count and team size, he
mentioned that his entire team uses a single shared account rather
than individual seats. This is a real and common workaround in
media and content companies — they are not over-provisioning seats,
they are under-licensing in a way that avoids per-seat costs
entirely. This means BurnLens's seat over-provisioning logic would
show them as perfectly optimised, when the more interesting
conversation is about whether this arrangement creates workflow
friction or compliance risk. It revealed a gap in the audit engine:
it is calibrated for companies paying retail per-seat pricing, not
for teams that have already worked around the pricing model
informally.

**What it changed about the design:**
Selwyne's usage pattern — switching between Flow and Kling based on
specific technical capabilities rather than price — highlighted that
for creative AI tools, the switching logic in the audit engine needs
to account for capability fit, not just cost. A cheaper tool is not
always a valid alternative if it cannot handle the specific use case.
This is a limitation of the current engine that a week-2 build would
need to address with more granular use-case tagging.

---

## Summary of key findings across all three interviews

1. **Trust requires visible reasoning.** Technical users will not
   recommend a tool they cannot validate. Showing the per-tool logic
   is not optional — it is what converts skeptics.

2. **First-time clarity is the biggest conversion lever.** Even
   developers in the exact target audience did not understand the
   tool without context. The explainer sections were a direct
   response to this.

3. **Real teams work around per-seat pricing.** Shared accounts are
   more common than the audit engine assumes, particularly in media
   and small creative teams. The over-provisioning check is correct
   for its target segment but does not capture this pattern.