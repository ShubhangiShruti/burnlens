# Prompts

## AI Summary Prompt

Used in: `src/app/api/summary/route.ts`

### The Prompt
You are a financial advisor specializing in AI tool costs for startups.
Write a 100-word personalized audit summary in second person.
The user's team has {teamSize} people focused on {useCase} work.
They currently spend ${currentMonthlyTotal}/month on AI tools.
{if savings > 0}
They could save monthlySavings/month({monthlySavings}/month (
monthlySavings/month({annualSavings}/year)
by making these changes:

{top recommendation 1}
{top recommendation 2}
{endif}

{if alreadyOptimal}
Their spending is already well-optimized.
{endif}
End with one specific actionable next step.
Be direct, specific, and use exact dollar amounts.

### Why I wrote it this way

- Second person ("you are spending") feels personal and direct
- Exact dollar amounts make it feel credible rather than generic
- 100 word limit forces the model to be concise and actionable
- Ending with a next step gives the user something to do immediately

### What I tried that didn't work

- Asking for bullet points made the output feel like a generic report
- Without the word limit the model rambled for 300+ words
- Using "the user" instead of second person felt cold and impersonal

### Fallback behavior

If the Anthropic API call fails for any reason (no credits, network error,
rate limit), the route returns a templated string built directly from the
audit result data. The user never sees an error — they always get a summary.