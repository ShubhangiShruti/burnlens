import Link from 'next/link'
import { TOOLS, type ToolPlan } from '@/lib/pricing'

function planPrice(plan: ToolPlan): string {
  if (typeof plan.pricePerSeat === 'number' && plan.pricePerSeat > 0) {
    return `$${Math.round(plan.pricePerSeat).toLocaleString()}/seat/mo`
  }

  if (typeof plan.flatPrice === 'number' && plan.flatPrice > 0) {
    return `$${Math.round(plan.flatPrice).toLocaleString()}/mo`
  }

  return 'Free'
}

export default function PricingChangesPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
          BurnLens
        </Link>

        <header className="mt-8 max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-950 md:text-5xl">
            AI Tool Pricing Tracker
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Live pricing across major AI tools - updated whenever vendors change their rates.
          </p>
        </header>

        <section className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <article
              key={tool.id}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
            >
              <h2 className="text-xl font-bold text-gray-950">{tool.name}</h2>
              <table className="mt-4 w-full text-left text-sm">
                <thead className="border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
                  <tr>
                    <th className="py-2 pr-3">Plan</th>
                    <th className="py-2">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tool.plans.map((plan) => (
                    <tr key={plan.id}>
                      <td className="py-3 pr-3 font-medium text-gray-800">{plan.label}</td>
                      <td className="py-3 font-semibold text-emerald-700">{planPrice(plan)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          ))}
        </section>

        <footer className="mt-10 flex flex-col gap-4 border-t border-gray-100 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Pricing data maintained by BurnLens. Last verified May 2026.
          </p>
          <Link
            href="/"
            className="inline-flex rounded-md bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Audit your AI spend for free
          </Link>
        </footer>
      </div>
    </main>
  )
}
