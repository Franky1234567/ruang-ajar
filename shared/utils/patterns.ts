const NUM_RE = /^\s*\d+[.)]\s+/
const OPTION_RE = /^[A-D][.)]\s+/i

// Pecah teks tempelan jadi item soal. Baris opsi (A. B. C. D.) tetap nempel ke soalnya.
export function parsePatterns(input: string): string[] {
  const lines = input.replace(/\r/g, '').split('\n')
  const result: string[] = []
  let current = ''
  const numbered = lines.some(x => NUM_RE.test(x))
  const hasBlankLine = lines.some(x => !x.trim())

  const flush = () => {
    if (current.trim()) result.push(current.trim())
    current = ''
  }

  for (const line of lines) {
    const t = line.trim()
    if (!t) { flush(); continue }
    if (NUM_RE.test(t)) { flush(); current = t.replace(NUM_RE, ''); continue }
    if (!numbered && !hasBlankLine && !OPTION_RE.test(t)) { flush(); current = t; continue }
    current += (current ? '\n' : '') + t
  }
  flush()
  return result
}
