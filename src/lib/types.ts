export type UseCase = 'coding' | 'writing' | 'data' | 'research' | 'mixed'
export type Severity = 'keep' | 'consider' | 'switch'

export interface ToolInput {
  toolId: string
  plan: string
  monthlySpend: number
  seats: number
}

export interface AuditInput {
  tools: ToolInput[]
  teamSize: number
  useCase: UseCase
}

export interface Recommendation {
  toolId: string
  toolName: string
  currentPlan: string
  currentSpend: number
  recommendedAction: string
  monthlySaving: number
  reasoning: string
  severity: Severity
}

export interface AuditResult {
  recommendations: Recommendation[]
  currentMonthlyTotal: number
  recommendedMonthlyTotal: number
  monthlySavings: number
  annualSavings: number
  credexRecommended: boolean
  alreadyOptimal: boolean
  summary?: string
}

export interface Lead {
  email: string
  companyName?: string
  role?: string
  auditId: string
  monthlySavings: number
  isHighSavings: boolean
}
