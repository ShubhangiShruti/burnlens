'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useFormPersistence } from '@/hooks/useFormPersistence'
import { TOOLS, type ToolPlan } from '@/lib/pricing'
import type { AuditInput, AuditResult, ToolInput, UseCase } from '@/lib/types'

interface AuditFormProps {
  onAuditComplete: (result: AuditResult, auditId: string) => void
}

interface PersistedFormState {
  selectedTools: ToolInput[]
  teamSize: number
  useCase: UseCase
}

interface AuditResponse {
  auditId: string
  result: AuditResult
}

interface SummaryResponse {
  summary: string
}

const initialFormState: PersistedFormState = {
  selectedTools: [],
  teamSize: 1,
  useCase: 'mixed',
}

function planMonthlySpend(plan: ToolPlan, seats: number): number {
  if (typeof plan.pricePerSeat === 'number') {
    return Math.round(plan.pricePerSeat * seats * 100) / 100
  }

  return Math.round((plan.flatPrice ?? 0) * 100) / 100
}

export default function AuditForm({ onAuditComplete }: AuditFormProps) {
  const [formState, setFormState] = useFormPersistence<PersistedFormState>('burnlens-form', initialFormState)
  const [toolToAdd, setToolToAdd] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const selectedToolIds = useMemo(
    () => new Set(formState.selectedTools.map((tool) => tool.toolId)),
    [formState.selectedTools],
  )

  function updateTool(index: number, updatedTool: ToolInput) {
    setFormState((current) => ({
      ...current,
      selectedTools: current.selectedTools.map((tool, toolIndex) =>
        toolIndex === index ? updatedTool : tool,
      ),
    }))
  }

  function addTool(toolId: string) {
    const tool = TOOLS.find((item) => item.id === toolId)

    if (!tool || selectedToolIds.has(toolId)) {
      return
    }

    const firstPlan = tool.plans[0]
    const newTool: ToolInput = {
      toolId,
      plan: firstPlan.id,
      seats: formState.teamSize,
      monthlySpend: planMonthlySpend(firstPlan, formState.teamSize),
    }

    setFormState((current) => ({
      ...current,
      selectedTools: [...current.selectedTools, newTool],
    }))
    setToolToAdd('')
  }

  function removeTool(index: number) {
    setFormState((current) => ({
      ...current,
      selectedTools: current.selectedTools.filter((_, toolIndex) => toolIndex !== index),
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (formState.selectedTools.length === 0) {
      setError('Add at least one tool before running your audit.')
      return
    }

    if (formState.teamSize <= 0) {
      setError('Team size must be greater than zero.')
      return
    }

    setIsSubmitting(true)

    try {
      const input: AuditInput = {
        tools: formState.selectedTools,
        teamSize: formState.teamSize,
        useCase: formState.useCase,
      }

      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        throw new Error('Audit request failed')
      }

      const auditData = (await response.json()) as AuditResponse
      let result = auditData.result

      try {
        const summaryResponse = await fetch('/api/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            result,
            useCase: formState.useCase,
            teamSize: formState.teamSize,
          }),
        })

        if (summaryResponse.ok) {
          const summaryData = (await summaryResponse.json()) as SummaryResponse
          result = { ...result, summary: summaryData.summary }
        }
      } catch {
        result = auditData.result
      }

      onAuditComplete(result, auditData.auditId)
    } catch {
      setError('Unable to run your audit right now. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm md:p-8">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-gray-800">Team size</span>
          <input
            type="number"
            min={1}
            value={formState.teamSize}
            onChange={(event) =>
              setFormState((current) => ({ ...current, teamSize: Number(event.target.value) }))
            }
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-gray-800">Primary use case</span>
          <select
            value={formState.useCase}
            onChange={(event) =>
              setFormState((current) => ({ ...current, useCase: event.target.value as UseCase }))
            }
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="coding">Coding</option>
            <option value="writing">Writing</option>
            <option value="data">Data</option>
            <option value="research">Research</option>
            <option value="mixed">Mixed</option>
          </select>
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-semibold text-gray-800">Add AI tool</span>
        <select
          value={toolToAdd}
          onChange={(event) => {
            setToolToAdd(event.target.value)
            addTool(event.target.value)
          }}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="">Choose a tool</option>
          {TOOLS.map((tool) => (
            <option key={tool.id} value={tool.id} disabled={selectedToolIds.has(tool.id)}>
              {selectedToolIds.has(tool.id) ? `${tool.name} — added` : tool.name}
            </option>
          ))}
        </select>
      </label>

      <div className="space-y-4">
        {formState.selectedTools.map((selectedTool, index) => {
          const pricingTool = TOOLS.find((tool) => tool.id === selectedTool.toolId)
          const currentPlan = pricingTool?.plans.find((plan) => plan.id === selectedTool.plan)
          const isFlatPlan = currentPlan ? typeof currentPlan.flatPrice === 'number' : false

          return (
            <div key={selectedTool.toolId} className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-bold text-gray-950">{pricingTool?.name ?? selectedTool.toolId}</h3>
                <button
                  type="button"
                  onClick={() => removeTool(index)}
                  className="rounded-md px-3 py-1 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-medium text-gray-800">Plan</span>
                  <select
                    value={selectedTool.plan}
                    onChange={(event) => {
                      const nextPlan = pricingTool?.plans.find((plan) => plan.id === event.target.value)
                      updateTool(index, {
                        ...selectedTool,
                        plan: event.target.value,
                        monthlySpend: nextPlan
                          ? planMonthlySpend(nextPlan, selectedTool.seats)
                          : selectedTool.monthlySpend,
                      })
                    }}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    {pricingTool?.plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.label}
                      </option>
                    ))}
                  </select>
                </label>

                {!isFlatPlan ? (
                  <label className="block">
                    <span className="text-sm font-medium text-gray-800">Seats</span>
                    <input
                      type="number"
                      min={1}
                      value={selectedTool.seats}
                      onChange={(event) => {
                        const seats = Number(event.target.value)
                        updateTool(index, {
                          ...selectedTool,
                          seats,
                          monthlySpend: currentPlan
                            ? planMonthlySpend(currentPlan, seats)
                            : selectedTool.monthlySpend,
                        })
                      }}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </label>
                ) : null}

                <label className="block">
                  <span className="text-sm font-medium text-gray-800">Monthly spend</span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={selectedTool.monthlySpend}
                    onChange={(event) =>
                      updateTool(index, {
                        ...selectedTool,
                        monthlySpend: Number(event.target.value),
                      })
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-950 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
              </div>
            </div>
          )
        })}
      </div>

      {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
      >
        {isSubmitting ? 'Running audit...' : 'Run My Audit'}
      </button>
    </form>
  )
}
