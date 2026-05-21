import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabase } from '@/lib/supabase'
import { detectStaleAudits, type AuditRow } from '@/app/api/detect-changes/route'

interface ChangeNotification {
  auditId: string
  toolName: string
  plan: string
  oldPrice: number
  newPrice: number
}

interface EmailGroup {
  email: string
  firstAuditId: string
  changes: ChangeNotification[]
}

function formatPrice(value: number): string {
  return Math.round(value).toLocaleString()
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function buildEmailHtml(group: EmailGroup): string {
  const changes = group.changes
    .map(
      (change) =>
        `<li>${escapeHtml(change.toolName)} (${escapeHtml(change.plan)}): was $${formatPrice(change.oldPrice)}/mo &rarr; now $${formatPrice(change.newPrice)}/mo</li>`,
    )
    .join('')
  const auditUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://burnlens.vercel.app'}/reaudit/${encodeURIComponent(group.firstAuditId)}`

  return `
    <p>Hi, pricing has changed for tools in your previous audit.</p>
    <ul>${changes}</ul>
    <p>
      <a href="${auditUrl}">Re-run your audit with updated pricing</a>
    </p>
    <p>&mdash; The BurnLens Team</p>
  `
}

function groupAuditsByEmail(affectedAudits: ReturnType<typeof detectStaleAudits>): {
  groups: EmailGroup[]
  skipped: number
} {
  const groupsByEmail = new Map<string, EmailGroup>()
  let skipped = 0

  for (const audit of affectedAudits) {
    if (!audit.user_email) {
      skipped += 1
      continue
    }

    const existingGroup = groupsByEmail.get(audit.user_email)
    const group =
      existingGroup ??
      ({
        email: audit.user_email,
        firstAuditId: audit.id,
        changes: [],
      } satisfies EmailGroup)

    group.changes.push(
      ...audit.changes.map((change) => ({
        auditId: audit.id,
        toolName: change.toolName,
        plan: change.plan,
        oldPrice: change.oldPrice,
        newPrice: change.newPrice,
      })),
    )

    groupsByEmail.set(audit.user_email, group)
  }

  for (const group of groupsByEmail.values()) {
    const seenChanges = new Set<string>()

    group.changes = group.changes.filter((change) => {
      const changeKey = `${change.toolName}:${change.plan}`

      if (seenChanges.has(changeKey)) {
        return false
      }

      seenChanges.add(changeKey)
      return true
    })
  }

  return { groups: [...groupsByEmail.values()], skipped }
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

    const affectedAudits = detectStaleAudits(data ?? [])
    const { groups, skipped } = groupAuditsByEmail(affectedAudits)
    const resend = new Resend(process.env.RESEND_API_KEY)
    let emailsSent = 0

    for (const group of groups) {
      try {
        const response = await resend.emails.send({
          from: 'BurnLens <onboarding@resend.dev>',
          to: group.email,
          subject: 'Your BurnLens audit has been affected by pricing changes',
          html: buildEmailHtml(group),
        })

        if (response.error) {
          console.warn('Failed to send pricing change notification:', response.error)
          continue
        }

        emailsSent += 1
      } catch (error) {
        console.warn('Failed to send pricing change notification:', error)
      }
    }

    return NextResponse.json({ emailsSent, skipped })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch audits' }, { status: 500 })
  }
}
