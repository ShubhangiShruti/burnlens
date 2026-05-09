import { describe, expect, it } from 'vitest'
import { runAudit } from './auditEngine'
import type { AuditInput } from './types'

describe('runAudit', () => {
  it('returns zero savings for empty tool list', () => {
    const input: AuditInput = { tools: [], teamSize: 1, useCase: 'mixed' }

    const result = runAudit(input)

    expect(result.monthlySavings).toBe(0)
    expect(result.recommendations).toHaveLength(0)
  })

  it('recommends individual plan when team plan has fewer than 3 seats', () => {
    const input: AuditInput = {
      tools: [{ toolId: 'cursor', plan: 'business', monthlySpend: 80, seats: 2 }],
      teamSize: 2,
      useCase: 'coding',
    }

    const result = runAudit(input)

    expect(result.recommendations.some((recommendation) => recommendation.severity === 'switch')).toBe(true)
  })

  it('flags redundancy when user has both claude and chatgpt', () => {
    const input: AuditInput = {
      tools: [
        { toolId: 'claude', plan: 'pro', monthlySpend: 20, seats: 1 },
        { toolId: 'chatgpt', plan: 'plus', monthlySpend: 20, seats: 1 },
      ],
      teamSize: 1,
      useCase: 'mixed',
    }

    const result = runAudit(input)

    expect(
      result.recommendations.some((recommendation) =>
        recommendation.reasoning.toLowerCase().includes('redundancy'),
      ),
    ).toBe(true)
  })

  it('sets credexRecommended true when savings exceed 500', () => {
    const input: AuditInput = {
      tools: [
        { toolId: 'chatgpt', plan: 'team', monthlySpend: 700, seats: 10 },
        { toolId: 'claude', plan: 'team', monthlySpend: 600, seats: 10 },
        { toolId: 'gemini', plan: 'premium', monthlySpend: 19.99, seats: 1 },
      ],
      teamSize: 10,
      useCase: 'mixed',
    }

    const result = runAudit(input)

    expect(result.credexRecommended).toBe(true)
  })

  it('sets alreadyOptimal true when all tools are well-priced', () => {
    const input: AuditInput = {
      tools: [
        { toolId: 'cursor', plan: 'hobby', monthlySpend: 0, seats: 1 },
        { toolId: 'windsurf', plan: 'free', monthlySpend: 0, seats: 1 },
      ],
      teamSize: 1,
      useCase: 'coding',
    }

    const result = runAudit(input)

    expect(result.alreadyOptimal).toBe(true)
  })

  it('calculates annual savings as 12x monthly savings', () => {
    const input: AuditInput = {
      tools: [{ toolId: 'windsurf', plan: 'teams', monthlySpend: 70, seats: 2 }],
      teamSize: 2,
      useCase: 'coding',
    }

    const result = runAudit(input)

    expect(result.annualSavings).toBe(result.monthlySavings * 12)
  })

  it('respects user-entered spend over plan default', () => {
    const input: AuditInput = {
      tools: [{ toolId: 'claude', plan: 'pro', monthlySpend: 150, seats: 1 }],
      teamSize: 1,
      useCase: 'writing',
    }

    const result = runAudit(input)

    expect(result.currentMonthlyTotal).toBe(150)
  })

  it('recommends windsurf pro over windsurf teams for small teams', () => {
    const input: AuditInput = {
      tools: [{ toolId: 'windsurf', plan: 'teams', monthlySpend: 70, seats: 2 }],
      teamSize: 2,
      useCase: 'coding',
    }

    const result = runAudit(input)

    expect(
      result.recommendations.some(
        (recommendation) => recommendation.severity === 'switch' && recommendation.monthlySaving > 0,
      ),
    ).toBe(true)
  })
})
