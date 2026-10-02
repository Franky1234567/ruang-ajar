import type { ExamQuestion } from '~~/shared/utils/exam'

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c] as string))
}

// HTML buat .print-area (window.print). Kunci di halaman terpisah biar bisa nggak ikut dibagikan.
export function examPrintHtml(title: string, klass: string, questions: ExamQuestion[], withKeys: boolean) {
  if (!questions.length) return ''
  const head = `<h1>${escapeHtml(title)}</h1><p>Nama: ________________   Kelas: ${escapeHtml(klass) || '__________'}</p>`
  const body = questions.map((q, i) => `<article><b>${i + 1}.</b> ${escapeHtml(q.text)}</article>`).join('')
  const keys = withKeys
    ? `<div class="answer-print"><h2>Kunci Jawaban</h2>${questions.map((q, i) => `<p>${i + 1}. ${escapeHtml(q.answer)}</p>`).join('')}</div>`
    : ''
  return head + body + keys
}
