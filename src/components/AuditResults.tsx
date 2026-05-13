'use client'

import { useState } from 'react'
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { calculateBurnScore } from '@/lib/auditEngine'
import { exportAuditPDF } from '@/lib/exportPDF'
import type { AuditResult, Recommendation } from '@/lib/types'
import LeadCaptureModal from './LeadCaptureModal'
import SummaryCard from './SummaryCard'
import ToolRow from './ToolRow'

interface AuditResultsProps {
  result?: AuditResult
  auditId?: string
  isLoading?: boolean
}

function formatCurrency(value: number): string {
  return `$${Math.round(value).toLocaleString()}`
}

function formatToolLabel(name: string): string {
  return name.length > 12 ? `${name.slice(0, 11)}...` : name
}

function burnScoreMeta(score: number): { label: string; className: string } {
  if (score >= 80) {
    return { label: 'Optimized', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' }
  }

  if (score >= 60) {
    return { label: 'Reasonable', className: 'border-amber-200 bg-amber-50 text-amber-700' }
  }

  if (score >= 40) {
    return { label: 'Needs Review', className: 'border-orange-200 bg-orange-50 text-orange-700' }
  }

  return { label: 'Overspending', className: 'border-red-200 bg-red-50 text-red-700' }
}

function AuditResultsSkeleton() {
  return (
    <section className="space-y-8">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-11/12 rounded bg-gray-200 sm:w-8/12" />
          <div className="h-8 w-8/12 rounded bg-gray-200 sm:w-5/12" />
        </div>
      </div>

      <SummaryCard summary={undefined} isLoading />

      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <div className="animate-pulse">
          <div className="h-[300px] rounded bg-gray-200" />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <div className="h-5 w-44 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="divide-y divide-gray-200">
          {[0, 1, 2].map((row) => (
            <div key={row} className="grid gap-4 px-5 py-5 md:grid-cols-3">
              <div className="h-4 rounded bg-gray-200 animate-pulse" />
              <div className="h-4 rounded bg-gray-200 animate-pulse" />
              <div className="h-4 rounded bg-gray-200 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function AuditResults({ result, auditId, isLoading = false }: AuditResultsProps) {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  if (isLoading || !result) {
    return <AuditResultsSkeleton />
  }

  const burnScore = result.burnScore ?? calculateBurnScore(result.recommendations)
  const scoreMeta = burnScoreMeta(burnScore)
  const chartData = result.recommendations.map((recommendation) => ({
    toolName: formatToolLabel(recommendation.toolName),
    currentSpend: recommendation.currentSpend,
    optimizedSpend: Math.max(0, recommendation.currentSpend - recommendation.monthlySaving),
  }))
  const topSaving = result.recommendations.reduce<Recommendation | undefined>(
    (best, recommendation) =>
      !best || recommendation.monthlySaving > best.monthlySaving ? recommendation : best,
    undefined,
  )
  const totalMonthlySavings = Number(result.monthlySavings)
  const annualizedSavings = totalMonthlySavings * 12

  async function handleShare() {
    if (typeof window === 'undefined') {
      return
    }

    const shareUrl = `${window.location.origin}/audit/${auditId}`
    await window.navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  async function handleDownloadPDF() {
    if (!result) {
      return
    }

    setIsGeneratingPDF(true)

    try {
      await exportAuditPDF('audit-report-content')
    } catch {
      window.alert('PDF export failed — please try again.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <section id="audit-report-content" className="space-y-8">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            {result.alreadyOptimal ? (
              <h2 className="text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">
                Your AI stack is well-optimized 🎉
              </h2>
            ) : result.monthlySavings > 0 ? (
              <h2 className="text-3xl font-bold tracking-tight text-emerald-600 md:text-5xl">
                You could save {formatCurrency(result.monthlySavings)}/month —{' '}
                {formatCurrency(result.annualSavings)}/year
              </h2>
            ) : (
              <h2 className="text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">
                Your AI spend has no obvious leaks
              </h2>
            )}
          </div>

          <div
            className={`flex h-36 w-36 flex-col items-center justify-center rounded-full border text-center shadow-sm ${scoreMeta.className}`}
          >
            <span className="text-4xl font-bold leading-none">{burnScore}</span>
            <span className="mt-2 text-xs font-semibold uppercase tracking-wide">BurnLens Score</span>
            <span className="mt-1 text-sm font-semibold">{scoreMeta.label}</span>
          </div>
        </div>

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

      <SummaryCard summary={result.aiSummary ?? result.summary} isLoading={false} />

      <button
        type="button"
        onClick={handleDownloadPDF}
        disabled={isGeneratingPDF}
        className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 sm:w-auto"
      >
        {isGeneratingPDF ? 'Generating...' : '⬇ Download PDF Report'}
      </button>

      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <h3 className="text-lg font-bold text-gray-950">Spend Breakdown</h3>
        {topSaving ? (
          <p className="mt-4 hidden rounded-md bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 max-[479px]:block">
            Top saving: {topSaving.toolName} — {formatCurrency(topSaving.monthlySaving)}/mo
          </p>
        ) : null}
        <div className="mt-4 h-[300px] max-[479px]:hidden">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="toolName" tickLine={false} axisLine={false} />
              <YAxis
                tickFormatter={(value: number) => formatCurrency(value)}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
              <Legend />
              <Bar dataKey="currentSpend" name="Current Spend" fill="#EF4444" radius={[4, 4, 0, 0]} />
              <Bar
                dataKey="optimizedSpend"
                name="Optimized Spend"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

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

      {totalMonthlySavings >= 500 ? (
        <div className="rounded-lg border border-emerald-200 border-l-4 border-l-green-600 bg-gradient-to-r from-amber-50 to-green-50 p-6 shadow-sm md:p-8">
          <h3 className="text-2xl font-bold text-gray-950">You qualify for Credex credits</h3>
          <p className="mt-3 max-w-3xl text-base leading-7 text-gray-700">
            Your stack has {formatCurrency(totalMonthlySavings)}/month in savings potential. Credex
            sells discounted AI credits from companies that over-purchased — you could capture this
            savings starting today.
          </p>
          <p className="mt-3 text-lg font-bold text-emerald-700">
            That&apos;s {formatCurrency(annualizedSavings)}/year back in your budget.
          </p>
          <a
            href="https://credex.rocks"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex rounded-md bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            Get Credex Credits →
          </a>
        </div>
      ) : totalMonthlySavings > 0 ? (
        <p className="text-sm text-gray-600">
          Want to save on future AI purchases?{' '}
          <a
            href="https://credex.rocks"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Credex sells discounted AI credits.
          </a>
        </p>
      ) : (
        <p className="text-sm text-gray-600">
          You&apos;re already spending efficiently. We&apos;ll notify you when new optimizations
          apply to your stack.
        </p>
      )}

      <LeadCaptureModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        auditId={auditId ?? ''}
        monthlySavings={result.monthlySavings}
      />
    </section>
  )
}
