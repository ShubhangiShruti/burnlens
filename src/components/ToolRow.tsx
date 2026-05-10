import type { Recommendation, Severity } from '@/lib/types'

interface ToolRowProps {
  recommendation: Recommendation
}

const severityStyles: Record<Severity, string> = {
  keep: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  consider: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  switch: 'bg-red-50 text-red-700 ring-1 ring-red-200',
}

const severityLabels: Record<Severity, string> = {
  keep: 'Optimal',
  consider: 'Review',
  switch: 'Switch',
}

function formatCurrency(value: number): string {
  return `$${Math.round(value).toLocaleString()}/mo`
}

export default function ToolRow({ recommendation }: ToolRowProps) {
  const savingClass =
    recommendation.monthlySaving > 0 ? 'text-emerald-700 font-semibold' : 'text-gray-500'

  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-5 py-5 sm:gap-4 md:grid-cols-[1.1fr_0.9fr_1fr_1.4fr_0.8fr_0.8fr] md:items-start">
      <div className="min-w-0">
        <p className="font-semibold text-gray-950">{recommendation.toolName}</p>
        <p className="mt-1 hidden text-sm text-gray-500 sm:block">{recommendation.reasoning}</p>
      </div>

      <div className="hidden sm:block">
        <p className="text-sm font-medium text-gray-700">Current plan</p>
        <p className="mt-1 text-sm text-gray-600">{recommendation.currentPlan}</p>
      </div>

      <div className="hidden sm:block">
        <p className="text-sm font-medium text-gray-700">Current spend</p>
        <p className="mt-1 text-sm text-gray-600">{formatCurrency(recommendation.currentSpend)}</p>
      </div>

      <div className="hidden sm:block">
        <p className="text-sm font-medium text-gray-700">Recommended action</p>
        <p className="mt-1 text-sm text-gray-600">{recommendation.recommendedAction}</p>
      </div>

      <div>
        <p className="hidden text-sm font-medium text-gray-700 sm:block">Savings</p>
        <p className={`text-sm sm:mt-1 ${savingClass}`}>
          {formatCurrency(recommendation.monthlySaving)}
        </p>
      </div>

      <div>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${severityStyles[recommendation.severity]}`}
        >
          {severityLabels[recommendation.severity]}
        </span>
      </div>
    </div>
  )
}
