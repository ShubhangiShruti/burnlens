import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabase } from '@/lib/supabase'

interface LeadRequestBody {
  email: string
  companyName?: string
  role?: string
  auditId: string
  monthlySavings: number
  honeypot?: string
}

function appUrl(request: Request): string {
  const origin = request.headers.get('origin')

  if (origin) {
    return origin
  }

  const host = request.headers.get('host')
  return host ? `https://${host}` : 'https://burnlens.app'
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LeadRequestBody

    if (body.honeypot && body.honeypot.trim().length > 0) {
      return NextResponse.json({ success: true })
    }

    const monthlySavings = Number(body.monthlySavings) || 0

    const { error } = await supabase.from('leads').insert({
      email: body.email,
      company_name: body.companyName || null,
      role: body.role || null,
      audit_id: body.auditId,
      monthly_savings: monthlySavings,
      is_high_savings: monthlySavings > 500,
    })

    if (error) {
      throw error
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const auditUrl = `${appUrl(request)}/audit/${body.auditId}`
    const highSavingsText =
      monthlySavings > 500
        ? '<p>Credex can help you capture even more savings with discounted AI and cloud credits.</p>'
        : ''

    await resend.emails.send({
      from: 'BurnLens <onboarding@resend.dev>',
      to: body.email,
      subject: 'Your BurnLens AI Spend Audit',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 640px;">
          <h1 style="color: #059669;">Your BurnLens audit is saved.</h1>
          <p>You could save <strong>$${Math.round(monthlySavings).toLocaleString()}/month</strong> on AI tools.</p>
          <p>Visit <a href="${auditUrl}">${auditUrl}</a> to view and share your report.</p>
          ${highSavingsText}
          <p>Thanks for using BurnLens.</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to save lead' }, { status: 500 })
  }
}
