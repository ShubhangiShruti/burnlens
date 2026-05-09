import type { Metadata } from 'next'
import Link from 'next/link'
import AuditResults from '@/components/AuditResults'
import { supabase } from '@/lib/supabase'
import type { AuditResult } from '@/lib/types'

interface AuditPageProps {
  params: { id: string }
}

interface AuditRow {
  results_data: AuditResult
  monthly_savings: number
}

async function getAudit(id: string): Promise<AuditRow | null> {
  const { data, error } = await supabase
    .from('audits')
    .select('results_data, monthly_savings')
    .eq('id', id)
    .maybeSingle<AuditRow>()

  if (error || !data) {
    return null
  }

  return data
}

export async function generateMetadata({ params }: AuditPageProps): Promise<Metadata> {
  const audit = await getAudit(params.id)
  const monthlySavings = audit?.monthly_savings ?? 0
  const description = 'See this AI spend audit and find out where your team is overspending'

  return {
    title: `BurnLens Audit — Save $${Math.round(monthlySavings).toLocaleString()}/month on AI tools`,
    description,
    openGraph: {
      title: `I could save $${Math.round(monthlySavings).toLocaleString()}/month on AI tools — see your audit`,
      description,
    },
    twitter: {
      card: 'summary_large_image',
    },
  }
}

export default async function AuditPage({ params }: AuditPageProps) {
  const audit = await getAudit(params.id)

  if (!audit) {
    return (
      <main className="min-h-screen bg-white px-4 py-20">
        <div className="mx-auto max-w-xl rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-gray-950">Audit not found</h1>
          <p className="mt-3 text-gray-600">
            This report may have been removed or the link may be incorrect.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-md bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Back to home
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
          BurnLens
        </Link>
        <div className="mt-8">
          <AuditResults result={audit.results_data} auditId={params.id} />
        </div>
      </div>
    </main>
  )
}
