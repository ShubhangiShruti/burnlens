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

        {/* ── What is BurnLens explainer ── */}

        {/* SECTION 1 — What is BurnLens: text + image side by side */}
        <section className="mt-16 border-t border-gray-100 pt-16">
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-start lg:gap-16">

            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
                What is BurnLens?
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-gray-600">
                BurnLens is a free AI spend auditor. It looks at every AI tool
                your team pays for — the plan, the number of seats, the monthly
                cost — and tells you exactly where you are overspending, what to
                switch, and how much you recover each month.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-gray-600">
                No login. No sales call. No consultant. Just your numbers,
                run through a financial audit engine in under 60 seconds, with
                a shareable result you can send to your co-founder or CFO.
              </p>
            </div>

            <div className="w-full flex-shrink-0 lg:w-[460px]">
              <Image
                src="/audit-preview.png"
                alt="Example BurnLens audit result showing savings breakdown across AI tools"
                width={460}
                height={345}
                className="w-full rounded-2xl shadow-lg"
              />
              <p className="mt-2 text-center text-xs text-gray-400">
                Example audit result — your numbers will vary
              </p>
            </div>

          </div>
        </section>

        {/* SECTION 2 — Two feature cards side by side */}
        <section className="mt-12">
          <div className="grid gap-6 md:grid-cols-2">

            {/* Card 1 — Who is it for */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8">
              <h2 className="text-2xl font-bold text-gray-900">Who is it for?</h2>
              <ul className="mt-6 space-y-5">
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center
                    justify-center rounded-full bg-emerald-100 text-xs
                    font-bold text-emerald-700">→</span>
                  <span className="text-gray-600">
                    <strong className="text-gray-800">Startup founders and CTOs</strong>
                    {' '}who approve the SaaS bill and suspect the team is paying
                    for seats nobody is using.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center
                    justify-center rounded-full bg-emerald-100 text-xs
                    font-bold text-emerald-700">→</span>
                  <span className="text-gray-600">
                    <strong className="text-gray-800">Individual contributors</strong>
                    {' '}paying out of pocket for Cursor, ChatGPT Plus, or Claude
                    Pro — and wondering if the plan still fits how they actually work.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center
                    justify-center rounded-full bg-emerald-100 text-xs
                    font-bold text-emerald-700">→</span>
                  <span className="text-gray-600">
                    <strong className="text-gray-800">Engineering leads buying for a team</strong>
                    {' '}— deciding whether Business seats for 8 people or a higher
                    tier for fewer seats covers the same workload at lower cost.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center
                    justify-center rounded-full bg-emerald-100 text-xs
                    font-bold text-emerald-700">→</span>
                  <span className="text-gray-600">
                    <strong className="text-gray-800">Anyone whose AI bill crept up quietly</strong>
                    {' '}— one seat added here, one upgrade there, and now it is
                    $700 a month with no clear picture of what you are getting.
                  </span>
                </li>
              </ul>
            </div>

            {/* Card 2 — What do you get */}
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-8">
              <h2 className="text-2xl font-bold text-gray-900">What do you get?</h2>
              <ul className="mt-6 space-y-5">
                {[
                  ['Per-tool verdict', 'Optimal, Overpaying, or Wrong plan — with a one-line reason for each tool.'],
                  ['Monthly and annual savings', 'Exact dollar amounts calculated against verified current vendor pricing.'],
                  ['BurnLens Score', 'A single 0–100 efficiency rating so you know at a glance how lean your stack is.'],
                  ['Shareable public URL', 'Send your audit to your co-founder or CFO without exposing your email.'],
                  ['Downloadable PDF report', 'Attach it to a budget review, a board deck, or a procurement request.'],
                ].map(([title, desc]) => (
                  <li key={title} className="flex items-start gap-3">
                    <span className="mt-1 text-emerald-600 font-bold flex-shrink-0">✓</span>
                    <span className="text-gray-600">
                      <strong className="text-gray-800">{title}</strong>
                      {' — '}{desc}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </section>

        {/* SECTION 3 — How to run your audit, full width */}
        <section className="mt-12 rounded-2xl bg-gray-900 px-8 py-12 md:px-16">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            How to run your audit
          </h2>
          <p className="mt-3 text-gray-400">
            Five inputs. Sixty seconds. No account needed.
          </p>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ['Enter team size', 'The number of people who will use these tools. Auditing for yourself? Enter 1.'],
              ['Select use case', 'Coding, Writing, Data, Research, or Mixed — this affects which alternatives we surface.'],
              ['Add each tool', 'Select the plan and enter your actual monthly spend. One tool at a time.'],
              ['Add seats if applicable', 'For Business or Enterprise plans, enter the number on your invoice — not just active users. That gap is where overspending hides.'],
              ['Click Run My Audit', 'Results appear instantly below. No login or email required to see them.'],
            ].map(([title, desc], i) => (
              <li key={title} className="flex flex-col gap-3">
                <span className="flex h-10 w-10 items-center justify-center
                  rounded-full bg-emerald-500 text-lg font-bold text-white">
                  {i + 1}
                </span>
                <strong className="text-base text-white">{title}</strong>
                <p className="text-sm leading-relaxed text-gray-400">{desc}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── End explainer ── */}

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
