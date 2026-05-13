import jsPDF from 'jspdf'
import type { AuditResult } from './types'

export async function exportAuditPDF(elementId: string): Promise<void> {
  // Get the result data from the DOM isn't needed — 
  // we receive it via the result prop. This signature
  // kept for backward compatibility.
  throw new Error('Use exportAuditPDFFromData instead')
}

export function exportAuditPDFFromData(result: AuditResult): void {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageW = 210
  const margin = 16
  const contentW = pageW - margin * 2
  let y = 0

  // ── Helpers ──────────────────────────────────────────────
  function hex(color: string) {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    doc.setDrawColor(r, g, b)
    doc.setFillColor(r, g, b)
    doc.setTextColor(r, g, b)
  }

  function textColor(color: string) {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    doc.setTextColor(r, g, b)
  }

  function fillRect(x: number, yPos: number, w: number, h: number, color: string) {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    doc.setFillColor(r, g, b)
    doc.rect(x, yPos, w, h, 'F')
  }

  function checkPage(needed: number) {
    if (y + needed > 275) {
      doc.addPage()
      y = 20
    }
  }

  // ── Header band ──────────────────────────────────────────
  fillRect(0, 0, pageW, 28, '#064e3b')
  textColor('#ffffff')
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('BurnLens AI Spend Audit', margin, 12)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    margin, 20
  )
  doc.text('burnlens.vercel.app  ·  Discounted AI credits at credex.rocks', pageW - margin, 20, { align: 'right' })
  y = 36

  // ── Savings hero ─────────────────────────────────────────
  const monthly = Math.round(Number(result.monthlySavings))
  const annual = monthly * 12
  const score: number = (result as AuditResult & { burnScore?: number }).burnScore ?? 0

  fillRect(margin, y, contentW, 22, monthly > 0 ? '#ecfdf5' : '#f9fafb')
  const borderColor = monthly > 0 ? '#10b981' : '#d1d5db'
  const br = parseInt(borderColor.slice(1, 3), 16)
  const bg2 = parseInt(borderColor.slice(3, 5), 16)
  const bb = parseInt(borderColor.slice(5, 7), 16)
  doc.setDrawColor(br, bg2, bb)
  doc.setLineWidth(0.8)
  doc.rect(margin, y, contentW, 22)

  if (monthly > 0) {
    textColor('#065f46')
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text(`$${monthly.toLocaleString()}/mo  ·  $${annual.toLocaleString()}/yr`, margin + 4, y + 10)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Potential savings identified', margin + 4, y + 17)
  } else {
    textColor('#374151')
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text('Your AI spend has no obvious leaks', margin + 4, y + 13)
  }

  if (score > 0) {
    const scoreColor = score >= 80 ? '#059669' : score >= 60 ? '#d97706' : '#dc2626'
    textColor(scoreColor)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text(`${score}`, pageW - margin - 4, y + 10, { align: 'right' })
    textColor('#6b7280')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text('BurnLens Score', pageW - margin - 4, y + 17, { align: 'right' })
  }
  y += 30

  // ── AI Summary ───────────────────────────────────────────
  const summary = result.aiSummary ?? result.summary
  if (summary) {
    checkPage(24)
    textColor('#111827')
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Summary', margin, y)
    y += 5

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    textColor('#374151')
    const lines = doc.splitTextToSize(summary, contentW)
    doc.text(lines, margin, y)
    y += lines.length * 4.5 + 8
  }

  // ── Section header helper ────────────────────────────────
  function sectionHeader(title: string) {
    checkPage(14)
    fillRect(margin, y, contentW, 8, '#f3f4f6')
    textColor('#111827')
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(title, margin + 3, y + 5.5)
    y += 12
  }

  // ── Per-tool breakdown ───────────────────────────────────
  sectionHeader('Per-tool Breakdown')

  // Column headers
  textColor('#6b7280')
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.text('TOOL', margin, y)
  doc.text('PLAN', margin + 42, y)
  doc.text('CURRENT SPEND', margin + 72, y)
  doc.text('RECOMMENDATION', margin + 104, y)
  doc.text('SAVINGS', pageW - margin, y, { align: 'right' })
  y += 3
  doc.setDrawColor(209, 213, 219)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageW - margin, y)
  y += 5

  result.recommendations.forEach((rec, i) => {
    checkPage(14)

    // Alternating row background
    if (i % 2 === 0) {
      fillRect(margin, y - 3, contentW, 12, '#f9fafb')
    }

    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'bold')
    textColor('#111827')
    doc.text(rec.toolName, margin + 1, y + 4)

    doc.setFont('helvetica', 'normal')
    textColor('#374151')
    doc.setFontSize(8)
    doc.text(rec.currentPlan ?? '—', margin + 42, y + 4)
    doc.text(`$${Math.round(rec.currentSpend)}/mo`, margin + 72, y + 4)

    // Recommendation text — wrap if long
    const recLines = doc.splitTextToSize(rec.recommendedAction ?? 'No changes needed', 52)
    doc.text(recLines, margin + 104, y + 4)

    // Savings badge
    const saving = Math.round(rec.monthlySaving ?? 0)
    if (saving > 0) {
      textColor('#059669')
      doc.setFont('helvetica', 'bold')
      doc.text(`-$${saving}/mo`, pageW - margin, y + 4, { align: 'right' })
    } else {
      textColor('#9ca3af')
      doc.setFont('helvetica', 'normal')
      doc.text('Optimal', pageW - margin, y + 4, { align: 'right' })
    }

    y += Math.max(recLines.length * 4.5, 12)
  })

  y += 6

  // ── Credex CTA if savings > $500 ─────────────────────────
  if (monthly >= 500) {
    checkPage(22)
    fillRect(margin, y, contentW, 20, '#ecfdf5')
    doc.setDrawColor(16, 185, 129)
    doc.setLineWidth(1)
    doc.rect(margin, y, contentW, 20)
    doc.setLineWidth(3)
    doc.line(margin, y, margin, y + 20)

    textColor('#065f46')
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('You qualify for Credex credits', margin + 5, y + 7)
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'normal')
    textColor('#047857')
    doc.text(
      `Save $${annual.toLocaleString()}/year by buying discounted AI credits at credex.rocks`,
      margin + 5, y + 14
    )
    y += 26
  }

  // ── Footer ───────────────────────────────────────────────
  const totalPages = (doc as jsPDF & { internal: { getNumberOfPages: () => number } })
    .internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    fillRect(0, 287, pageW, 10, '#f3f4f6')
    textColor('#9ca3af')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text('BurnLens · burnlens.vercel.app · Powered by Credex', margin, 293)
    doc.text(`Page ${p} of ${totalPages}`, pageW - margin, 293, { align: 'right' })
  }

  doc.save(`burnlens-audit-${new Date().toISOString().split('T')[0]}.pdf`)
}