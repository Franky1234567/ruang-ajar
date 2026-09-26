import { describe, expect, it } from 'vitest'
import { buildCheckPrompt, buildExamPrompt, buildMaterialPrompt, buildQuizPrompt } from '../shared/utils/prompt'
import { parsePatterns } from '../shared/utils/patterns'

describe('parsePatterns', () => {
  it('pecah soal bernomor, opsi A/B tetap nempel', () => {
    const out = parsePatterns('1. She ___ home.\nA. go B. goes\n2. They ___ football.')
    expect(out).toEqual(['She ___ home.\nA. go B. goes', 'They ___ football.'])
  })

  it('tanpa nomor & ada baris kosong → pisah per paragraf', () => {
    expect(parsePatterns('Soal satu\n\nSoal dua')).toEqual(['Soal satu', 'Soal dua'])
  })
})

describe('buildExamPrompt', () => {
  it('sertakan materi + contoh saat ada', () => {
    const p = buildExamPrompt({ materials: ['Past Tense'], types: ['Isian'], count: 8, examples: ['Rewrite: she go'] })
    expect(p).toContain('Past Tense')
    expect(p).toContain('Rewrite: she go')
    expect(p).toContain('8 soal')
  })

  it('tanpa contoh → pakai pola umum', () => {
    const p = buildExamPrompt({ materials: ['Greeting'], types: ['Isian'], count: 5 })
    expect(p).not.toContain('CONTOH POLA')
    expect(p).toContain('pola soal umum')
  })
})

describe('buildMaterialPrompt', () => {
  it('sertakan topik & grounding ke referensi kalau ada', () => {
    const p = buildMaterialPrompt({ topic: 'Past Tense', reference: 'She go home yesterday.' })
    expect(p).toContain('Past Tense')
    expect(p).toContain('She go home yesterday.')
    expect(p).toContain('JADIKAN acuan')
  })

  it('tanpa referensi → instruksi contoh sehari-hari', () => {
    const p = buildMaterialPrompt({ topic: 'Greeting' })
    expect(p).not.toContain('JADIKAN acuan')
    expect(p).toContain('Tidak ada referensi')
  })
})

describe('buildCheckPrompt', () => {
  it('muat soal, kunci, jawaban murid, dan skala poin 0-10', () => {
    const p = buildCheckPrompt({ question: 'Rewrite: she go', key: 'she goes', answer: 'she goes' })
    expect(p).toContain('Rewrite: she go')
    expect(p).toContain('she goes')
    expect(p).toContain('0-10')
  })
})

describe('buildQuizPrompt', () => {
  it('minta N soal pilihan ganda 4 opsi untuk topik', () => {
    const p = buildQuizPrompt({ topic: 'Present Continuous', count: 5 })
    expect(p).toContain('5 soal pilihan ganda')
    expect(p).toContain('Present Continuous')
  })
})
