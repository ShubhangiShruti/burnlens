import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import type { AuditResult } from '@/lib/types'

interface SummaryRequestBody {
  result: AuditResult
  useCase: string
  teamSize: number
}

function fallbackSummary(result: AuditResult, useCase: string, teamSize: number): string {
  if (result.alreadyOptimal) {
    return `Your ${teamSize}-person team focused on ${useCase} work is already spending efficiently on AI tools at $${Math.round(result.currentMonthlyTotal).toLocaleString()}/month. Keep reviewing seat usage before renewals, especially when adding new tools or API spend.`
  }

  const topRecommendation = result.recommendations
    .filter((recommendation) => recommendation.monthlySaving > 0)
    .sort((a, b) => b.monthlySaving - a.monthlySaving)[0]

  const nextStep = topRecommendation
    ? `Start with ${topRecommendation.toolName}: ${topRecommendation.recommendedAction}.`
    : 'Start by reviewing the tools marked for further evaluation.'

  return `Your ${teamSize}-person team focused on ${useCase} work currently spends $${Math.round(result.currentMonthlyTotal).toLocaleString()}/month on AI tools. BurnLens found potential savings of $${Math.round(result.monthlySavings).toLocaleString()}/month, or $${Math.round(result.annualSavings).toLocaleString()}/year. ${nextStep}`
}

export async function POST(request: Request) {
  let body: SummaryRequestBody | null = null

  try {
    body = (await request.json()) as SummaryRequestBody
    const { result, useCase, teamSize } = body
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const topRecommendations = result.recommendations
      .filter((recommendation) => recommendation.monthlySaving > 0)
      .sort((a, b) => b.monthlySaving - a.monthlySaving)
      .slice(0, 2)
      .map(
        (recommendation) =>
          `${recommendation.toolName}: ${recommendation.recommendedAction}, saving $${recommendation.monthlySaving}/month.`,
      )
      .join(' ')

    const savingsSentence =
      result.monthlySavings > 0
        ? `They could save $${result.monthlySavings}/month ($${result.annualSavings}/year) by making these changes: ${topRecommendations}`
        : 'Their spending is already well-optimized.'

    const prompt = `You are a financial advisor specializing in AI tool costs for startups. Write a 100-word personalized audit summary in second person. The user's team has ${teamSize} people focused on ${useCase} work. They currently spend $${result.currentMonthlyTotal}/month on AI tools. ${savingsSentence} End with one specific actionable next step. Be direct, specific, and use exact dollar amounts.`

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 220,
      messages: [{ role: 'user', content: prompt }],
    })

    const textBlock = message.content.find((block) => block.type === 'text')
    const summary = textBlock?.type === 'text' ? textBlock.text : fallbackSummary(result, useCase, teamSize)

    return NextResponse.json({ summary })
  } catch {
    const summary = body
      ? fallbackSummary(body.result, body.useCase, body.teamSize)
      : 'Your BurnLens audit is ready. Review the recommendations and start with the highest-savings action first.'

    return NextResponse.json({ summary })
  }
}
