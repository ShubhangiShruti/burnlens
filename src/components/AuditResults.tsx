'use client'

import { useState } from 'react'
import type { AuditResult } from '@/lib/types'
import LeadCaptureModal from './LeadCaptureModal'
import SummaryCard from './SummaryCard'
import ToolRow from './ToolRow'

interface AuditResultsProps {
  result: AuditResult
  auditId: string
}

function formatCurrency(value: number): string {
  return `$${Math.round(value).toLocaleString()}`
}

export default function AuditResults({ result, auditId }: AuditResultsProps) {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    if (typeof window === 'undefined') {
      return
    }

    await window.navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="space-y-8">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        {result.alreadyOptimal ? (
          <h2 className="text-4xl font-bold tracking-tight text-gray-950">
            Your AI stack is well-optimized 🎉
          </h2>
        ) : result.monthlySavings > 0 ? (
          <h2 className="text-5xl font-bold tracking-tight text-emerald-600">
            You could save {formatCurrency(result.monthlySavings)}/month —{' '}
            {formatCurrency(result.annualSavings)}/year
          </h2>
        ) : (
          <h2 className="text-4xl font-bold tracking-tight text-gray-950">
            Your AI spend has no obvious leaks
          </h2>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setIsLeadModalOpen(true)}
            className="rounded-md bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Save Report
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="rounded-md border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
      </div>

      <SummaryCard summary={result.summary} isLoading={false} />

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h3 className="text-lg font-bold text-gray-950">Per-tool breakdown</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {result.recommendations.map((recommendation, index) => (
            <ToolRow
              key={`${recommendation.toolId}-${recommendation.currentPlan}-${index}`}
              recommendation={recommendation}
            />
          ))}
        </div>
      </div>

      {result.credexRecommended ? (
        <div className="rounded-lg bg-emerald-600 p-6 text-white shadow-sm md:p-8">
          <h3 className="text-2xl font-bold">Unlock even more savings with Credex credits</h3>
          <p className="mt-2 max-w-2xl text-emerald-50">
            Your audit shows meaningful monthly savings. Credex can help you capture discounted AI
            and cloud credits without waiting for vendor programs.
          </p>
          <a
            href="https://credex.rocks"
            className="mt-5 inline-flex rounded-md bg-white px-5 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
          >
            Visit Credex
          </a>
        </div>
      ) : null}

      <LeadCaptureModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        auditId={auditId}
        monthlySavings={result.monthlySavings}
      />
    </section>
  )
}
