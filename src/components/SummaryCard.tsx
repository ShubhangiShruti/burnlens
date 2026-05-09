interface SummaryCardProps {
  summary: string | undefined
  isLoading: boolean
}

export default function SummaryCard({ summary, isLoading }: SummaryCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-11/12 rounded bg-gray-200" />
          <div className="h-4 w-10/12 rounded bg-gray-200" />
          <div className="h-4 w-8/12 rounded bg-gray-200" />
        </div>
      </div>
    )
  }

  if (!summary) {
    return null
  }

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-emerald-950 shadow-sm">
      <div className="flex gap-3">
        <span className="mt-0.5 text-lg" aria-hidden="true">
          ✨
        </span>
        <p className="text-sm leading-6 md:text-base">{summary}</p>
      </div>
    </div>
  )
}
