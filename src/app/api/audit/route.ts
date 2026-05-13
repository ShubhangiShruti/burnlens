import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { runAudit } from '@/lib/auditEngine'
import { TOOLS } from '@/lib/pricing'
import { supabase } from '@/lib/supabase'
import type { AuditInput, AuditResult, ToolInput } from '@/lib/types'

const AI_SUMMARY_PROMPT = `You are BurnLens, an AI spend audit tool for startups and engineering teams.

Write one personalized audit summary paragraph of about 100 words in second person.

Use this style:
- Direct, specific, and practical
- Say "you" and "your"
- Name specific tools
- Include specific dollar amounts
- Mention the biggest inefficiency first when there is one
- End with the total savings impact

Do not use bullets, markdown, headings, or disclaimers.

You will receive:
- The team's tool list with plan and monthly spend
- The audit recommendations with savings amounts
- Total monthly savings
- Team size
- Primary use case`

function toolLabel(tool: ToolInput): string {
  const pricingTool = TOOLS.find((item) => item.id === tool.toolId)
  const planLabel = pricingTool?.plans.find((plan) => plan.id === tool.plan)?.label ?? tool.plan

  return `${pricingTool?.name ?? tool.toolId} (${planLabel}) - $${Math.round(tool.monthlySpend).toLocaleString()}/month`
}

function formatAuditPrompt(input: AuditInput, auditResult: AuditResult): string {
  const tools = input.tools.map((tool) => `- ${toolLabel(tool)}`).join('\n')
  const recommendations = auditResult.recommendations
    .map(
      (recommendation) =>
        `- ${recommendation.toolName}: ${recommendation.recommendedAction}; saves $${Math.round(recommendation.monthlySaving).toLocaleString()}/month; current spend $${Math.round(recommendation.currentSpend).toLocaleString()}/month.`,
    )
    .join('\n')

  return `${AI_SUMMARY_PROMPT}

Team size: ${input.teamSize}
Primary use case: ${input.useCase}
Total monthly savings: $${Math.round(auditResult.monthlySavings).toLocaleString()}
Annual savings impact: $${Math.round(auditResult.annualSavings).toLocaleString()}

Tools:
${tools || '- No tools provided'}

Recommendations:
${recommendations || '- No recommendations generated'}`
}

function generateFallbackSummary(auditResult: AuditResult): string {
  const topRecommendation = [...auditResult.recommendations].sort(
    (a, b) => b.monthlySaving - a.monthlySaving,
  )[0]

  if (!topRecommendation) {
    return 'Your audit did not find any AI tools to evaluate yet. Add your current stack with monthly spend to see where BurnLens can identify savings for your team.'
  }

  return `Your audit identified $${Math.round(auditResult.monthlySavings).toLocaleString()}/month in potential savings across ${auditResult.recommendations.length} tools. Your biggest opportunity is ${topRecommendation.toolName}: ${topRecommendation.recommendedAction}. Annualized, these optimizations recover $${Math.round(auditResult.monthlySavings * 12).toLocaleString()}/year for your team.`
}

async function generateAiSummary(input: AuditInput, auditResult: AuditResult): Promise<string> {
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await anthropic.messages.create(
      {
        model: 'claude-haiku-4-5',
        max_tokens: 200,
        temperature: 0.7,
        messages: [{ role: 'user', content: formatAuditPrompt(input, auditResult) }],
      },
      { timeout: 10000 },
    )

    const textBlock = message.content.find((block) => block.type === 'text')

    if (textBlock?.type === 'text' && textBlock.text.trim()) {
      return textBlock.text.trim()
    }

    return generateFallbackSummary(auditResult)
  } catch {
    return generateFallbackSummary(auditResult)
  }
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as AuditInput
    const result = runAudit(input)
    const aiSummary = await generateAiSummary(input, result)
    const resultWithSummary: AuditResult = { ...result, aiSummary }
    const id = uuidv4()

    try {
      const { error } = await supabase.from('audits').insert({
        id,
        tools_data: input.tools,
        results_data: resultWithSummary,
        monthly_savings: resultWithSummary.monthlySavings,
        annual_savings: resultWithSummary.annualSavings,
        use_case: input.useCase,
        team_size: input.teamSize,
        tool_count: input.tools.length,
      })

      if (error) {
        console.warn('Failed to save audit to Supabase:', error.message)
      }
    } catch (error) {
      console.warn('Failed to save audit to Supabase:', error)
    }

    return NextResponse.json({ auditId: id, result: resultWithSummary, aiSummary })
  } catch {
    return NextResponse.json({ error: 'Failed to run audit' }, { status: 500 })
  }
}
