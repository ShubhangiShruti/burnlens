import { TOOLS } from './pricing'
import type { AuditInput, AuditResult, Recommendation, Severity, ToolInput } from './types'

function toolName(toolId: string): string {
  return TOOLS.find((tool) => tool.id === toolId)?.name ?? toolId
}

function planLabel(toolId: string, planId: string): string {
  return TOOLS.find((tool) => tool.id === toolId)?.plans.find((plan) => plan.id === planId)?.label ?? planId
}

function makeRecommendation(
  tool: ToolInput,
  recommendedAction: string,
  monthlySaving: number,
  reasoning: string,
  severity: Severity,
): Recommendation {
  return {
    toolId: tool.toolId,
    toolName: toolName(tool.toolId),
    currentPlan: planLabel(tool.toolId, tool.plan),
    currentSpend: tool.monthlySpend,
    recommendedAction,
    monthlySaving: Math.max(0, Math.round(monthlySaving * 100) / 100),
    reasoning,
    severity,
  }
}

function isTeamOrBusinessPlan(plan: string): boolean {
  return ['team', 'teams', 'business'].includes(plan)
}

function individualEquivalent(tool: ToolInput): { label: string; monthlyCost: number } | null {
  if (tool.toolId === 'cursor') return { label: 'Cursor Pro', monthlyCost: 20 * tool.seats }
  if (tool.toolId === 'github-copilot') return { label: 'GitHub Copilot Individual', monthlyCost: 10 * tool.seats }
  if (tool.toolId === 'claude') return { label: 'Claude Pro', monthlyCost: 20 }
  if (tool.toolId === 'chatgpt') return { label: 'ChatGPT Plus', monthlyCost: 20 }
  if (tool.toolId === 'gemini') return { label: 'Gemini Premium', monthlyCost: 19.99 }
  if (tool.toolId === 'windsurf') return { label: 'Windsurf Pro', monthlyCost: 20 * tool.seats }

  return null
}

function keepRecommendation(tool: ToolInput): Recommendation {
  return makeRecommendation(
    tool,
    'No changes needed',
    0,
    'This tool is well-priced for your usage.',
    'keep',
  )
}

function isRedundantRecommendation(recommendation: Recommendation): boolean {
  const text = `${recommendation.recommendedAction} ${recommendation.reasoning}`.toLowerCase()

  return text.includes('redundant') || text.includes('overlap') || text.includes('consolidate')
}

export function calculateBurnScore(recommendations: Recommendation[]): number {
  const penalty = recommendations.reduce((scorePenalty, recommendation) => {
    let nextPenalty = scorePenalty

    if (recommendation.severity === 'switch') {
      nextPenalty += 15
    }

    if (recommendation.severity === 'consider') {
      nextPenalty += 8
    }

    if (isRedundantRecommendation(recommendation)) {
      nextPenalty += 5
    }

    return nextPenalty
  }, 0)

  return Math.max(0, Math.round(100 - penalty))
}

export function runAudit(input: AuditInput): AuditResult {
  const recommendations: Recommendation[] = []
  const coveredToolIds = new Set<string>()
  const tools = input.tools
  const currentMonthlyTotal = tools.reduce((sum, tool) => sum + tool.monthlySpend, 0)

  for (const tool of tools) {
    let recommendation: Recommendation | null = null

    if (tool.plan === 'enterprise' && tool.monthlySpend === 0) {
      recommendation = makeRecommendation(
        tool,
        'Enter your actual enterprise spend to get a full evaluation',
        0,
        'Enterprise pricing is custom, so BurnLens needs the real monthly cost before estimating savings.',
        'consider',
      )
    } else if (isTeamOrBusinessPlan(tool.plan) && tool.seats < 3) {
      const equivalent = individualEquivalent(tool)

      if (equivalent) {
        recommendation = makeRecommendation(
          tool,
          `Switch to ${equivalent.label}`,
          tool.monthlySpend - equivalent.monthlyCost,
          'Team and business plans are usually inefficient for teams with fewer than 3 active seats.',
          'switch',
        )
      }
    } else if (
      ['anthropic-api', 'openai-api'].includes(tool.toolId) ||
      tool.plan === 'api' ||
      tool.plan === 'direct'
    ) {
      if (tool.monthlySpend > 200) {
        recommendation = makeRecommendation(
          tool,
          'Evaluate whether a flat plan would cover this usage for less',
          0,
          'API spend above $200/month is worth reviewing against fixed-seat plans and committed-use credits.',
          'consider',
        )
      }
    }

    if (!recommendation && input.useCase === 'coding') {
      if (tool.toolId === 'cursor' && tool.plan === 'pro' && tool.monthlySpend > 20 * tool.seats) {
        recommendation = makeRecommendation(
          tool,
          'Compare against GitHub Copilot Individual at $10/seat',
          tool.monthlySpend - 10 * tool.seats,
          'Your Cursor Pro spend is above the expected per-seat baseline for this plan.',
          'switch',
        )
      }

      if (!recommendation && tool.toolId === 'windsurf' && tool.plan === 'teams') {
        recommendation = makeRecommendation(
          tool,
          'Switch to Windsurf Pro at $20/seat',
          tool.monthlySpend - 20 * tool.seats,
          'Windsurf Teams is often unnecessary for smaller coding teams that only need core AI coding support.',
          'switch',
        )
      }

      if (!recommendation && tool.toolId === 'github-copilot' && tool.plan === 'business' && tool.seats < 5) {
        recommendation = makeRecommendation(
          tool,
          'Consider Cursor Pro as a comparable lateral option',
          0,
          'For coding teams under 5 seats, Cursor Pro and Copilot Business are close enough to compare workflow fit.',
          'consider',
        )
      }
    }

    if (!recommendation && input.useCase === 'writing' && tool.toolId === 'chatgpt' && tool.plan === 'plus') {
      recommendation = makeRecommendation(
        tool,
        'Compare Claude Pro as a lateral writing option',
        0,
        'Claude Pro is comparable at the same price and may be a better fit for long-form writing workflows.',
        'consider',
      )
    }

    if (
      !recommendation &&
      ['writing', 'mixed'].includes(input.useCase) &&
      tool.toolId === 'chatgpt' &&
      tool.plan === 'team' &&
      tool.seats > 5
    ) {
      recommendation = makeRecommendation(
        tool,
        'Audit active seat usage before renewing ChatGPT Team',
        0,
        'Larger ChatGPT Team workspaces often include inactive seats that quietly inflate monthly spend.',
        'consider',
      )
    }

    if (recommendation) {
      recommendations.push(recommendation)
      coveredToolIds.add(tool.toolId)
    }
  }

  const claude = tools.find((tool) => tool.toolId === 'claude')
  const chatgpt = tools.find((tool) => tool.toolId === 'chatgpt')
  const anthropicApi = tools.find((tool) => tool.toolId === 'anthropic-api')
  const openaiApi = tools.find((tool) => tool.toolId === 'openai-api')
  const geminiPremium = tools.find((tool) => tool.toolId === 'gemini' && tool.plan === 'premium')

  if (claude && chatgpt && ['mixed', 'research'].includes(input.useCase)) {
    recommendations.push(
      makeRecommendation(
        chatgpt,
        'Pick one primary chat assistant and remove the redundant subscription',
        Math.min(chatgpt.monthlySpend, claude.monthlySpend),
        'Claude and ChatGPT overlap heavily for mixed or research workflows, creating redundancy in your AI stack.',
        'switch',
      ),
    )
    coveredToolIds.add(chatgpt.toolId)
    coveredToolIds.add(claude.toolId)
  }

  if (anthropicApi && claude && ['pro', 'team'].includes(claude.plan)) {
    recommendations.push(
      makeRecommendation(
        anthropicApi,
        'Review overlap between Anthropic API usage and Claude seats',
        0,
        'Anthropic API spend and Claude subscriptions may be serving the same workflows.',
        'consider',
      ),
    )
    coveredToolIds.add(anthropicApi.toolId)
  }

  if (openaiApi && chatgpt && chatgpt.plan === 'team') {
    recommendations.push(
      makeRecommendation(
        openaiApi,
        'Review overlap between OpenAI API usage and ChatGPT Team seats',
        0,
        'OpenAI API spend and ChatGPT Team subscriptions can duplicate research, writing, and prototyping usage.',
        'consider',
      ),
    )
    coveredToolIds.add(openaiApi.toolId)
  }

  if (geminiPremium && (claude || chatgpt)) {
    recommendations.push(
      makeRecommendation(
        geminiPremium,
        'Cancel Gemini Premium unless it has a distinct workflow owner',
        geminiPremium.monthlySpend,
        'Gemini Premium is likely redundant when Claude or ChatGPT is already active.',
        'switch',
      ),
    )
    coveredToolIds.add(geminiPremium.toolId)
  }

  const chatWritingToolCount = tools.filter((tool) =>
    ['claude', 'chatgpt', 'gemini', 'anthropic-api', 'openai-api'].includes(tool.toolId),
  ).length

  if (chatWritingToolCount >= 3) {
    recommendations.push({
      toolId: 'ai-stack',
      toolName: 'AI Stack',
      currentPlan: 'Multiple tools',
      currentSpend: currentMonthlyTotal,
      recommendedAction: 'Consolidate overlapping chat, writing, and API tools',
      monthlySaving: 0,
      reasoning: 'You have 3 or more chat or writing tools, which is a strong signal of redundant AI spend.',
      severity: 'consider',
    })
  }

  for (const tool of tools) {
    if (!coveredToolIds.has(tool.toolId)) {
      recommendations.push(keepRecommendation(tool))
    }
  }

  const rawSavings = recommendations.reduce((sum, recommendation) => sum + recommendation.monthlySaving, 0)
  const monthlySavings = Math.min(currentMonthlyTotal, Math.max(0, Math.round(rawSavings * 100) / 100))
  const recommendedMonthlyTotal = Math.max(0, Math.round((currentMonthlyTotal - monthlySavings) * 100) / 100)
  const annualSavings = Math.round(monthlySavings * 12 * 100) / 100
  const alreadyOptimal = monthlySavings < 100 && recommendations.every((recommendation) => recommendation.severity === 'keep')

  return {
    recommendations,
    currentMonthlyTotal,
    recommendedMonthlyTotal,
    monthlySavings,
    annualSavings,
    burnScore: calculateBurnScore(recommendations),
    credexRecommended: monthlySavings > 500,
    alreadyOptimal,
  }
}
