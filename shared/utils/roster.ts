export type Gender = 'L' | 'P'

export interface RosterRow {
  nis: string
  name: string
  gender: Gender | null
}

const GENDER: Record<string, Gender> = { 'l': 'L', 'lk': 'L', 'laki-laki': 'L', 'p': 'P', 'pr': 'P', 'perempuan': 'P' }

// Satu siswa per baris. Paling sering ditempel dari Excel (dipisah tab), tapi koma atau spasi juga jalan:
// "12345<TAB>Ahmad Fauzi<TAB>L", "12345, Siti Aminah, P", "12345 Ahmad Fauzi L", "Ahmad Fauzi".
export function parseRoster(text: string): RosterRow[] {
  const rows: RosterRow[] = []
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) continue
    let parts = /[\t,;]/.test(line)
      ? line.split(/[\t,;]/).map(s => s.trim()).filter(Boolean)
      : line.split(/\s+/)

    // baris judul kolom dari Excel ("No | NIS | Nama | L/P")
    if (parts.some(p => /^nama( siswa)?$/i.test(p))) continue

    let nis = ''
    let gender: Gender | null = null
    // kolom "No" urut di depan NIS: dua angka berturut-turut → yang pertama dibuang
    if (parts.length > 2 && /^\d+$/.test(parts[0]!) && /^\d+$/.test(parts[1]!)) parts.shift()
    if (parts.length > 1 && /^\d+$/.test(parts[0]!)) nis = parts.shift()!
    const last = GENDER[parts.at(-1)!.toLowerCase()]
    if (parts.length > 1 && last) {
      gender = last
      parts = parts.slice(0, -1)
    }
    const name = parts.join(' ').replace(/\s+/g, ' ').trim()
    if (name) rows.push({ nis, name, gender })
  }
  return rows
}
