'use client'

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export async function exportAuditPDF(elementId: string): Promise<void> {
  const element = document.getElementById(elementId)
  if (!element) {
    alert('Could not find the report to export. Please try again.')
    return
  }

  // Capture the element as a canvas (screenshot)
  const canvas = await html2canvas(element, {
    scale: 2,           // 2x resolution — crisp on retina screens
    useCORS: true,      // allow external images
    backgroundColor: '#ffffff',
    logging: false,
  })

  const imgData = canvas.toDataURL('image/png')

  // A4 page dimensions in mm
  const pdfWidth = 210
  const pdfHeight = 297

  // Scale image to fit A4 width, allow multiple pages if tall
  const imgWidthMm = pdfWidth
  const imgHeightMm = (canvas.height * pdfWidth) / canvas.width

  const pdf = new jsPDF('p', 'mm', 'a4')

  let yPosition = 0
  let remainingHeight = imgHeightMm

  // If the content is taller than one page, slice across pages
  while (remainingHeight > 0) {
    if (yPosition > 0) pdf.addPage()

    pdf.addImage(
      imgData,
      'PNG',
      0,
      -yPosition,
      imgWidthMm,
      imgHeightMm
    )

    yPosition += pdfHeight
    remainingHeight -= pdfHeight
  }

  pdf.save(`burnlens-audit-${new Date().toISOString().split('T')[0]}.pdf`)
}