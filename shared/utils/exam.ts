export interface ExamQuestion {
  type: string
  text: string
  answer: string
}

export interface GradeItem {
  no: number
  studentAnswer: string
  credit: number
  comment: string
}

// Opsi PG disatukan ke teks soal ("A. ..."), biar cetak, edit, dan koreksi foto cukup baca `text`.
// Huruf bawaan AI ("A." / "(a)") dibuang dulu biar nggak dobel.
export function withOptions(q: ExamQuestion & { options?: string[] }): ExamQuestion {
  const opts = (q.options ?? []).map(o => String(o).replace(/^\(?[a-e][.)]\s*/i, '').trim()).filter(Boolean)
  const text = opts.length ? `${q.text.trim()}\n${opts.map((o, i) => `${'ABCDE'[i]}. ${o}`).join('\n')}` : q.text
  return { type: q.type, text, answer: q.answer }
}

export interface ScoreRow {
  nis: string
  name: string
  score: number | null
}

// CSV pakai ';' karena Excel dengan regional Indonesia pakai titik koma sebagai pemisah kolom.
export function scoresCsv(rows: ScoreRow[]): string {
  const cell = (v: string) => /[;"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
  return ['NIS;Nama;Nilai', ...rows.map(r => [r.nis, r.name, r.score ?? ''].map(v => cell(String(v))).join(';'))].join('\r\n')
}

// Nilai 0-100 dihitung di sini, bukan dari AI: model sering salah jumlah.
// Nomor yang nggak dikembalikan AI dihitung 0; credit di luar 0..1 dijepit.
export function scoreFromItems(items: GradeItem[], total: number): number {
  if (!total) return 0
  const byNo = new Map(items.map(i => [i.no, i.credit]))
  let sum = 0
  for (let no = 1; no <= total; no++) sum += Math.min(1, Math.max(0, Number(byNo.get(no)) || 0))
  return Math.round(sum / total * 100)
}
