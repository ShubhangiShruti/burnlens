import Link from 'next/link'
import { runAudit } from '@/lib/auditEngine'
import { supabase } from '@/lib/supabase'
import type { AuditInput, AuditResult, Recommendation } from '@/lib/types'

interface ReauditPageProps {
  params: Promise<{ id: string }>
}

interface AuditRow {
  id: string
  tools_data: AuditInput['tools']
  results_data: unknown
  pricing_snapshot: Record<string, Record<string, number>> | null
  user_email: string | null
}

type StoredAuditResult = AuditResult & Partial<Pick<AuditInput, 'teamSize' | 'useCase'>>

function formatCurrency(value: number): string {
  return `$${Math.round(value).toLocaleString()}`
}

function changedToolIds(oldRecommendations: Recommendation[], newRecommendations: Recommendation[]): Set<string> {
  const changedIds = new Set<string>()
  const newByToolId = new Map(newRecommendations.map((recommendation) => [recommendation.toolId, recommendation]))

  for (const oldRecommendation of oldRecommendations) {
    const newRecommendation = newByToolId.get(oldRecommendation.toolId)

    if (
      !newRecommendation ||
      oldRecommendation.recommendedAction !== newRecommendation.recommendedAction ||
      oldRecommendation.monthlySaving !== newRecommendation.monthlySaving
    ) {
      changedIds.add(oldRecommendation.toolId)
    }
  }

  for (const newRecommendation of newRecommendations) {
    if (!oldRecommendations.some((oldRecommendation) => oldRecommendation.toolId === newRecommendation.toolId)) {
      changedIds.add(newRecommendation.toolId)
    }
  }

  return changedIds
}

function RecommendationTable({
  recommendations,
  changedIds,
  actionHeader,
}: {
  recommendations: Recommendation[]
  changedIds: Set<string>
  actionHeader: string
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
          <tr>
            <th className="px-4 py-3">Tool</th>
            <th className="px-4 py-3">{actionHeader}</th>
            <th className="px-4 py-3">Monthly saving</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {recommendations.map((recommendation) => (
            <tr
              key={`${recommendation.toolId}-${recommendation.currentPlan}`}
              className={changedIds.has(recommendation.toolId) ? 'bg-yellow-50' : 'bg-white'}
            >
              <td className="px-4 py-4 font-semibold text-gray-950">{recommendation.toolName}</td>
              <td className="px-4 py-4 text-gray-700">{recommendation.recommendedAction}</td>
              <td className="px-4 py-4 font-semibold text-emerald-700">
                {formatCurrency(recommendation.monthlySaving)}/mo
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

async function getAudit(id: string): Promise<AuditRow | null> {
  const { data, error } = await supabase
    .from('audits')
    .select('id, tools_data, results_data, pricing_snapshot, user_email')
    .eq('id', id)
    .single<AuditRow>()

  if (error || !data) {
    return null
  }

  return data
}

export default async function ReauditPage({ params }: ReauditPageProps) {
  const { id } = await params
  const data = await getAudit(id)

  if (!data) {
    return (
      <main className="min-h-screen bg-white px-4 py-20">
        <div className="mx-auto max-w-xl rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-gray-950">Audit not found</h1>
          <p className="mt-3 text-gray-600">
            This re-audit link may have expired or the original report may be unavailable.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-md bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Start a fresh audit
          </Link>
        </div>
      </main>
    )
  }

  const oldResult = data.results_data as StoredAuditResult
  const input: AuditInput = {
    tools: data.tools_data,
    teamSize: oldResult.teamSize ?? 1,
    useCase: oldResult.useCase ?? 'mixed',
  }
  const newResult = runAudit(input)
  const changedIds = changedToolIds(oldResult.recommendations, newResult.recommendations)

  return (
    <main className="min-h-screen bg-white px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
          BurnLens
        </Link>

        <section className="mt-8 rounded-lg border border-emerald-200 border-l-4 border-l-emerald-500 bg-emerald-50 p-6 shadow-sm">
          <p className="text-lg font-semibold text-emerald-950">
            Pricing has changed since your last audit. Here is how your recommendations have been
            updated.
          </p>
        </section>

        <h1 className="mt-8 text-3xl font-bold tracking-tight text-gray-950 md:text-5xl">
          Your potential monthly savings changed from {formatCurrency(oldResult.monthlySavings)} to{' '}
          <span className="text-emerald-600">{formatCurrency(newResult.monthlySavings)}</span>
        </h1>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-xl font-bold text-gray-600">Previous Audit</h2>
            <RecommendationTable
              recommendations={oldResult.recommendations}
              changedIds={changedIds}
              actionHeader="Old recommendation"
            />
          </div>

          <div>
            <h2 className="mb-4 text-xl font-bold text-emerald-600">Updated Audit</h2>
            <RecommendationTable
              recommendations={newResult.recommendations}
              changedIds={changedIds}
              actionHeader="Updated recommendation"
            />
          </div>
        </section>

        <Link
          href="/"
          className="mt-10 inline-flex rounded-md bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          Start a fresh audit
        </Link>
      </div>
    </main>
  )
}
