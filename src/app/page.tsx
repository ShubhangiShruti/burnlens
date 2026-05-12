'use client'

import { useRef, useState } from 'react'
import AuditForm from '@/components/AuditForm'
import AuditResults from '@/components/AuditResults'
import type { AuditResult } from '@/lib/types'
import Image from "next/image"
import Link from "next/link"

export default function HomePage() {
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null)
  const [auditId, setAuditId] = useState<string | null>(null)
  const [isAuditLoading, setIsAuditLoading] = useState(false)
  const resultsRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)

  function handleAuditComplete(result: AuditResult, id: string) {
    setAuditResult(result)
    setAuditId(id)
    setIsAuditLoading(false)

    window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  function handleAuditLoadingChange(isLoading: boolean) {
    setIsAuditLoading(isLoading)

    if (isLoading) {
      window.setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b border-gray-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 sm:flex-row sm:items-end sm:justify-between">
        <Link href="/" className="focus-ring flex items-center gap-3 rounded-sm" onClick={() => setOpen(false)}>
          <Image src="/logo.png" alt="BurnLens" width={32} height={32} />
          <span className="text-2xl font-bold text-emerald-600">BurnLens</span>
          </Link>
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

        <section className="mt-10 space-y-6">
          <div className="grid gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:grid-cols-3 md:p-6">
            <div>
              <p className="text-3xl font-bold text-gray-950">$2.4M+</p>
              <p className="mt-1 text-sm text-gray-500">In AI spend analyzed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-950">340+</p>
              <p className="mt-1 text-sm text-gray-500">Startups audited</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-950">$18K</p>
              <p className="mt-1 text-sm text-gray-500">Average annual savings found</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <figure className="rounded-lg border border-gray-200 border-l-4 border-l-emerald-500 bg-white p-5 shadow-sm">
              <blockquote className="text-base leading-7 text-gray-700">
                “We were paying for three AI tools that basically did the same thing. BurnLens
                showed us in 30 seconds.”
              </blockquote>
              <figcaption className="mt-4">
                <p className="font-semibold text-gray-950">Rohan M.</p>
                <p className="text-sm text-gray-500">CTO, Early-stage SaaS</p>
              </figcaption>
            </figure>

            <figure className="rounded-lg border border-gray-200 border-l-4 border-l-emerald-500 bg-white p-5 shadow-sm">
              <blockquote className="text-base leading-7 text-gray-700">
                “Saved us $340/month just by switching Copilot tiers. Took less time than my
                morning coffee.”
              </blockquote>
              <figcaption className="mt-4">
                <p className="font-semibold text-gray-950">Priya S.</p>
                <p className="text-sm text-gray-500">Engineering Lead</p>
              </figcaption>
            </figure>
          </div>

          <p className="text-sm italic text-gray-500">
            (Statistics are illustrative. Testimonials are mocked for demonstration purposes.)
          </p>
        </section>

        <div className="mt-10">
          <AuditForm
            onAuditComplete={handleAuditComplete}
            onAuditLoadingChange={handleAuditLoadingChange}
          />
        </div>

        {isAuditLoading || (auditResult && auditId) ? (
          <div ref={resultsRef} className="mt-12 scroll-mt-8">
            <AuditResults
              result={auditResult ?? undefined}
              auditId={auditId ?? undefined}
              isLoading={isAuditLoading}
            />
          </div>
        ) : null}
      </section>

      <footer className="border-t border-gray-100 px-4 py-8 text-center text-sm text-gray-500">
        Built by BurnLens · Powered by Credex · Built by Shubhangi Shruti · Not affiliated with any AI vendor
      </footer>
    </main>
  )
}
