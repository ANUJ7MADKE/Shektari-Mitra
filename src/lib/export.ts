import { jsPDF } from 'jspdf'
import { average, grade, periodReadings, type Plot, type AppState } from './model'

export function download(filename: string, content: BlobPart, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a'); a.href = url; a.download = filename
  document.body.appendChild(a); a.click(); a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
export function csvCell(value: string | number) {
  let text = String(value)
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}
export function exportReport(plots: Plot[], period: string, state: AppState) {
  const doc = new jsPDF()
  let y = 20
  const line = (text: string, size = 10) => {
    doc.setFontSize(size)
    const lines: string[] = doc.splitTextToSize(text, 175)
    for (const row of lines) {
      if (y > 275) { doc.addPage(); y = 20 }
      doc.text(row, 18, y); y += size * 0.5 + 2
    }
  }
  doc.setTextColor(45, 106, 79)
  line('Shetkari Mitra', 22)
  doc.setTextColor(28, 43, 28)
  line('Sample Irrigation & Mill Summary', 15)
  line(`Village A, Sangli District | Reporting period: ${period}`)
  line(`Generated: ${new Date().toLocaleString('en-IN')}`)
  y += 5
  line('DEMO REPORT - simulated readings; not an official mill certificate.', 10)
  line('Recovery grades illustrate the prototype rule; they are not lab results.')
  y += 7
  plots.forEach(p => {
    const readings = periodReadings(p, period)
    line(`${p.id} | ${p.farmer}`, 13)
    line(p.field.replace(/—/g, '-'))
    if (readings.length) {
      const mean = average(readings.map(r => r.moisture))
      line(`Average soil moisture: ${mean.toFixed(1)}% | Sample recovery grade: ${grade(mean, p.threshold)} | Readings: ${readings.length}`)
    } else line('No readings recorded for this period.')
    line(`Current moisture: ${p.moisture}% | Auto-shutoff limit: ${p.threshold}%`)
    const advice = state.advice.filter(a => a.plotId === p.id && a.at.startsWith(period))
    advice.forEach(a => line(`Officer note (${new Date(a.at).toLocaleDateString('en-IN')}): ${a.text}`))
    y += 7
  })
  doc.save(`shetkari-mitra-${plots.length === 1 ? plots[0].id : 'village-a'}-${period}.pdf`)
}
