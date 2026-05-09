import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { runAudit } from '@/lib/auditEngine'
import { supabase } from '@/lib/supabase'
import type { AuditInput } from '@/lib/types'

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as AuditInput
    const result = runAudit(input)
    const id = uuidv4()

    try {
      const { error } = await supabase.from('audits').insert({
        id,
        tools_data: input.tools,
        results_data: result,
        monthly_savings: result.monthlySavings,
        annual_savings: result.annualSavings,
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

    return NextResponse.json({ auditId: id, result })
  } catch {
    return NextResponse.json({ error: 'Failed to run audit' }, { status: 500 })
  }
}
