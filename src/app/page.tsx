'use client'

import { useRef, useState } from 'react'
import AuditForm from '@/components/AuditForm'
import AuditResults from '@/components/AuditResults'
import type { AuditResult } from '@/lib/types'

export default function HomePage() {
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null)
  const [auditId, setAuditId] = useState<string | null>(null)
  const resultsRef = useRef<HTMLDivElement | null>(null)

  function handleAuditComplete(result: AuditResult, id: string) {
    setAuditResult(result)
    setAuditId(id)

    window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b border-gray-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 sm:flex-row sm:items-end sm:justify-between">
          <span className="text-2xl font-bold text-emerald-600">BurnLens</span>
          <span className="text-sm text-gray-500">Free AI Spend Audit for startup teams</span>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-950 md:text-6xl">
            Find out exactly where your AI budget is leaking.
          </h1>
          <p className="mt-5 text-lg leading-8 text-gray-600 md:text-xl">
            Free audit for startups and engineering teams. No login required.
          </p>
        </div>

        <div className="mt-10">
          <AuditForm onAuditComplete={handleAuditComplete} />
        </div>

        {auditResult && auditId ? (
          <div ref={resultsRef} className="mt-12 scroll-mt-8">
            <AuditResults result={auditResult} auditId={auditId} />
          </div>
        ) : null}
      </section>

      <footer className="border-t border-gray-100 px-4 py-8 text-center text-sm text-gray-500">
        Built by BurnLens · Powered by Credex · Not affiliated with any AI vendor
      </footer>
    </main>
  )
}
