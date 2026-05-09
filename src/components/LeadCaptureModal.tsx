'use client'

import { FormEvent, useState } from 'react'

interface LeadCaptureModalProps {
  isOpen: boolean
  onClose: () => void
  auditId: string
  monthlySavings: number
}

export default function LeadCaptureModal({
  isOpen,
  onClose,
  auditId,
  monthlySavings,
}: LeadCaptureModalProps) {
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [role, setRole] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) {
    return null
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, companyName, role, auditId, monthlySavings, honeypot }),
      })

      if (!response.ok) {
        throw new Error('Lead request failed')
      }

      setIsSuccess(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 px-4 py-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-modal-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="lead-modal-title" className="text-xl font-bold text-gray-950">
              Save your BurnLens Report
            </h2>
            <p className="mt-1 text-sm text-gray-600">Get your full audit emailed to you.</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-2xl leading-none text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {isSuccess ? (
          <div className="mt-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900">
            Thanks. Your report is saved and your email is on the way.
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(event) => setHoneypot(event.target.value)}
              className="hidden"
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="off"
            />

            <label className="block">
              <span className="text-sm font-medium text-gray-800">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="you@company.com"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-800">Company name</span>
              <input
                type="text"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="Acme AI"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-800">Role</span>
              <input
                type="text"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="Founder, CTO, Engineering Manager"
              />
            </label>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {isSubmitting ? 'Saving...' : 'Email my report'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
