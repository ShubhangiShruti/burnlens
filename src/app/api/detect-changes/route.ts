import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { TOOLS } from '@/lib/pricing'

interface AuditToolInput {
  toolId: string
  plan: string
  monthlySpend: number
  seats: number
}

export interface AuditRow {
  id: string
  user_email: string | null
  tools_data: AuditToolInput[]
  pricing_snapshot: Record<string, Record<string, number>> | null
  results_data: unknown
}

export interface AffectedAudit {
  id: string
  user_email: string | null
  changes: Array<{
    toolId: string
    toolName: string
    plan: string
    oldPrice: number
    newPrice: number
  }>
}

function currentPlanPrice(toolId: string, planId: string): { toolName: string; price: number } | null {
  const tool = TOOLS.find((item) => item.id === toolId)
  const plan = tool?.plans.find((item) => item.id === planId)

  if (!tool || !plan) {
    return null
  }

  return {
    toolName: tool.name,
    price: plan.pricePerSeat ?? plan.flatPrice ?? 0,
  }
}

export function detectStaleAudits(rows: AuditRow[]): AffectedAudit[] {
  const affectedAudits: AffectedAudit[] = []

  for (const row of rows) {
    if (!row.pricing_snapshot) {
      continue
    }

    const changes: AffectedAudit['changes'] = []

    for (const tool of row.tools_data) {
      const currentPlan = currentPlanPrice(tool.toolId, tool.plan)
      const snapshotPrice = row.pricing_snapshot[tool.toolId]?.[tool.plan] ?? null

      if (!currentPlan || snapshotPrice === null) {
        continue
      }

      if (currentPlan.price !== snapshotPrice) {
        changes.push({
          toolId: tool.toolId,
          toolName: currentPlan.toolName,
          plan: tool.plan,
          oldPrice: snapshotPrice,
          newPrice: currentPlan.price,
        })
      }
    }

    if (changes.length > 0) {
      affectedAudits.push({
        id: row.id,
        user_email: row.user_email,
        changes,
      })
    }
  }

  return affectedAudits
}

export async function POST() {
  try {
    const { data, error } = await supabase
      .from('audits')
      .select('id, user_email, tools_data, pricing_snapshot, results_data')
      .returns<AuditRow[]>()

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch audits' }, { status: 500 })
    }

    return NextResponse.json({ affectedAudits: detectStaleAudits(data ?? []) })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch audits' }, { status: 500 })
  }
}
