import { supabase } from '@/lib/supabase'

async function getAuditCount(): Promise<number> {
  const { count } = await supabase.from('audits').select('*', { count: 'exact', head: true })

  return count ?? 0
}

async function getAuditsWithEmailCount(): Promise<number> {
  const { count } = await supabase
    .from('audits')
    .select('*', { count: 'exact', head: true })
    .not('user_email', 'is', null)

  return count ?? 0
}

export default async function AdminPage() {
  const [totalAudits, auditsWithEmail] = await Promise.all([
    getAuditCount(),
    getAuditsWithEmailCount(),
  ])
  const coverage = totalAudits > 0 ? Math.round((auditsWithEmail / totalAudits) * 100) : 0

  return (
    <main className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold tracking-tight text-gray-950">BurnLens Admin</h1>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">Total Audits</p>
            <p className="mt-2 text-3xl font-bold text-gray-950">{totalAudits}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">Audits with Email</p>
            <p className="mt-2 text-3xl font-bold text-gray-950">{auditsWithEmail}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">Coverage %</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">{coverage}%</p>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-950">Detect Pricing Changes</h2>
            <form method="POST" action="/api/detect-changes" className="mt-5">
              <button
                type="submit"
                className="rounded-md bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Run Detection
              </button>
            </form>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-950">Send Notifications</h2>
            <form method="POST" action="/api/notify-changes" className="mt-5">
              <button
                type="submit"
                className="rounded-md bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Send Emails
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}
