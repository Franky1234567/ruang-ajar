import { describe, expect, it } from 'vitest'
import { buildExamPrompt, buildGradePrompt, buildMaterialPrompt, buildQuizPrompt } from '../shared/utils/prompt'
import { parsePatterns } from '../shared/utils/patterns'
import { isMadrasahSubject } from '../shared/utils/subjects'
import { parseRoster } from '../shared/utils/roster'
import { scoreFromItems, scoresCsv, withOptions } from '../shared/utils/exam'

describe('opsi pilihan ganda', () => {
  it('opsi disatukan ke teks soal, huruf bawaan AI nggak dobel', () => {
    const q = withOptions({ type: 'Pilihan Ganda', text: 'Which is countable?', options: ['A. water', 'b) apple', 'rice', 'sugar'], answer: 'B. apple' })
    expect(q.text).toBe('Which is countable?\nA. water\nB. apple\nC. rice\nD. sugar')
    expect(q).not.toHaveProperty('options')
  })

  it('soal non-PG tanpa opsi nggak berubah', () => {
    expect(withOptions({ type: 'Isian', text: 'She ___ home.', options: [], answer: 'goes' }).text).toBe('She ___ home.')
  })

  it('prompt ujian minta 4 opsi di field options', () => {
    expect(buildExamPrompt({ materials: ['Noun'], types: ['Pilihan Ganda'], count: 5 })).toContain('4 opsi di field "options"')
  })
})

describe('ekspor nilai', () => {
  it('CSV titik koma, nilai kosong tetap ada kolomnya, nama aneh di-quote', () => {
    expect(scoresCsv([
      { nis: '12345', name: 'Ahmad', score: 88 },
      { nis: '', name: 'Siti; "Ica"', score: null }
    ])).toBe('NIS;Nama;Nilai\r\n12345;Ahmad;88\r\n;"Siti; ""Ica""";')
  })
})

describe('koreksi lembar jawaban', () => {
  const item = (no: number, credit: number) => ({ no, credit, studentAnswer: '', comment: '' })

  it('nilai dihitung dari credit, nomor yang hilang = 0, credit liar dijepit', () => {
    expect(scoreFromItems([item(1, 1), item(2, 0.5), item(3, 0)], 4)).toBe(38)
    expect(scoreFromItems([item(1, 5), item(2, -1)], 2)).toBe(50)
    expect(scoreFromItems([item(1, 1), item(9, 1)], 1)).toBe(100)
    expect(scoreFromItems([], 0)).toBe(0)
  })

  it('prompt memuat semua soal + kunci dan larangan menebak', () => {
    const p = buildGradePrompt([{ type: 'Isian', text: 'She ___ home.', answer: 'goes' }, { type: 'Essay', text: 'Jelaskan wudhu', answer: 'membasuh' }])
    expect(p).toContain('2. [Essay] Jelaskan wudhu')
    expect(p).toContain('Kunci: goes')
    expect(p).toContain('1 sampai 2')
    expect(p).toContain('JANGAN menebak')
  })
})

describe('parseRoster', () => {
  it('tempelan Excel dengan judul kolom & nomor urut', () => {
    const text = 'No\tNIS\tNama\tL/P\n1\t12345\tAhmad Fauzi\tL\n2\t12346\tSiti Aminah\tP\n'
    expect(parseRoster(text)).toEqual([
      { nis: '12345', name: 'Ahmad Fauzi', gender: 'L' },
      { nis: '12346', name: 'Siti Aminah', gender: 'P' }
    ])
  })

  it('format koma, spasi, dan nama doang', () => {
    expect(parseRoster('12345, Siti Aminah, perempuan\n12346 Ahmad Fauzi L\nNaya Putri\n\n')).toEqual([
      { nis: '12345', name: 'Siti Aminah', gender: 'P' },
      { nis: '12346', name: 'Ahmad Fauzi', gender: 'L' },
      { nis: '', name: 'Naya Putri', gender: null }
    ])
  })

  it('huruf L/P di tengah nama nggak dianggap jenis kelamin', () => {
    expect(parseRoster('Muhammad P Ramadhan')).toEqual([{ nis: '', name: 'Muhammad P Ramadhan', gender: null }])
  })
})

describe('mode madrasah', () => {
  it('kenali ejaan mapel Kemenag yang beda-beda', () => {
    for (const f of ['Fiqih MTs kelas 7', 'fikih', 'Aqidah Akhlak', 'Al-Quran Hadits', 'SKI', 'Bahasa Arab MI']) {
      expect(isMadrasahSubject(f)).toBe(true)
    }
    for (const f of ['Bahasa Inggris', 'Matematika', 'Fisika', 'Ekonomi', '']) {
      expect(isMadrasahSubject(f)).toBe(false)
    }
  })

  it('mapel madrasah dapat aturan harakat & larangan ngarang dalil, mapel umum nggak', () => {
    const fikih = buildQuizPrompt({ topic: 'Wudhu', count: 5, focus: 'Fikih' })
    expect(fikih).toContain('HARAKAT')
    expect(fikih).toContain('DILARANG mengarang dalil')
    expect(buildQuizPrompt({ topic: 'Tenses', count: 5, focus: 'Bahasa Inggris' })).not.toContain('HARAKAT')
  })
})

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

describe('buildQuizPrompt', () => {
  it('minta N soal pilihan ganda 4 opsi untuk topik', () => {
    const p = buildQuizPrompt({ topic: 'Present Continuous', count: 5 })
    expect(p).toContain('5 soal pilihan ganda')
    expect(p).toContain('Present Continuous')
  })
})
