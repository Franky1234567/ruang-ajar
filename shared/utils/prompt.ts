export interface MaterialRequest {
  topic: string
  klass?: string
  goal?: string
  reference?: string
  focus?: string
}

export interface CheckRequest {
  question: string
  key: string
  answer: string
  focus?: string
}

export interface QuizRequest {
  topic: string
  count: number
  reference?: string
  focus?: string
}

// Baris peran guru; kalau ada fokus mapel, AI dikunci ke mapel itu.
function role(focus?: string, tail = ''): string {
  const f = focus?.trim()
  return f
    ? `Kamu guru mata pelajaran ${f}. Semua materi/soal HARUS untuk mapel ${f}${tail ? ' ' + tail : ''}.`
    : `Kamu guru${tail ? ' ' + tail : ''}. Sesuaikan dengan mata pelajaran yang tersirat dari topik/materi.`
}

// Susun draf materi LENGKAP. Kalau ada referensi, materi digrounding ke situ (bukan halu AI).
export function buildMaterialPrompt(req: MaterialRequest): string {
  const parts = [
    role(req.focus, 'yang menyusun materi ajar LENGKAP, jelas, dan mudah dipahami murid.'),
    `Topik: ${req.topic}.`
  ]
  if (req.klass?.trim()) parts.push(`Kelas/level: ${req.klass.trim()}. Sesuaikan kedalaman & kesulitan dengan level ini.`)
  if (req.goal?.trim()) parts.push(`Catatan/permintaan guru (WAJIB diikuti, mis. kalau minta banyakin contoh ya perbanyak): ${req.goal.trim()}`)
  if (req.reference?.trim()) {
    parts.push(
      'Referensi dari guru (JADIKAN acuan gaya, contoh, dan tingkat kesulitan — jangan mengarang di luar ini):\n'
      + req.reference.trim()
    )
  } else {
    parts.push('Tidak ada referensi. Pakai contoh sehari-hari yang sederhana dan lazim.')
  }
  parts.push(
    'Isi tiap bagian dengan DETAIL sesuai template, jangan cuma 1 kalimat:\n'
    + '- explanation: 2-4 paragraf, jelaskan konsep + kapan dipakai + kata petunjuk.\n'
    + '- pattern: rumus/pola lengkap (positif, negatif, tanya) + contoh tiap pola.\n'
    + '- examples: MINIMAL 5 contoh konkret sesuai mapel (kalau bahasa asing, sertakan artinya).\n'
    + '- exercises: MINIMAL 8 soal latihan bernomor, bertahap dari mudah ke sulit.\n'
    + '- answerKey: kunci jawaban tiap nomor latihan di atas.\n'
    + 'Bahasa penjelasan Indonesia; contoh disesuaikan mapel. Gampang dicerna, bukan bahasa berat.'
  )
  return parts.join('\n\n')
}

export type VocabType = 'kata' | 'idiom' | 'slang'

export interface VocabRequest {
  theme: string
  count: number
  type?: VocabType
  klass?: string
  focus?: string
}

const VOCAB_SPEC: Record<VocabType, string> = {
  kata: 'kosakata (vocabulary)',
  idiom: 'idiom / ungkapan (frasa yang maknanya kiasan, bukan arti harfiah)',
  slang: 'bahasa gaul / slang (informal, sehari-hari)'
}

// Generate kosakata / idiom / slang by tema.
export function buildVocabPrompt(req: VocabRequest): string {
  const type = req.type ?? 'kata'
  const parts = [
    `${role(req.focus)} Buatkan ${req.count} ${VOCAB_SPEC[type]} untuk tema: ${req.theme}.`,
    'Tiap entri: "word" = kata/frasa target, "meaning" = arti singkat Bahasa Indonesia, '
    + '"example" = 1 contoh kalimat sederhana pakai kata itu + artinya.'
  ]
  if (type === 'idiom') parts.push('Pilih idiom yang maknanya TIDAK harfiah. "meaning" jelaskan makna kiasannya.')
  if (type === 'slang') parts.push('Pilih slang yang lazim & sopan (hindari yang kasar/vulgar). "meaning" sertakan nuansa informalnya.')
  if (req.klass?.trim()) parts.push(`Level: ${req.klass.trim()}. Pilih yang sesuai & sering dipakai di level ini.`)
  parts.push('Pilih yang umum & berguna (bukan langka). Kalau mapelnya bahasa asing, "word" dalam bahasa itu.')
  return parts.join('\n\n')
}

// Baca dokumen (materi/kisi-kisi) → daftar topik + poin isi tiap topik.
export function buildOutlinePrompt(): string {
  return [
    'Ini dokumen materi atau kisi-kisi pelajaran (bisa hasil scan). Baca isinya.',
    'Daftar SEMUA topik / pokok bahasan yang ada, ikuti penomoran & urutan di dokumen. Jangan lewatkan satu pun.',
    'Untuk tiap topik isi "topic" = nama topiknya, dan "notes" = poin penting / ringkasan isi dokumen untuk topik itu '
    + '(kalau dokumen cuma memuat judul topik tanpa isi, notes boleh singkat atau kosong).'
  ].join('\n\n')
}

// Periksa jawaban murid vs kunci guru. Beri feedback membangun + poin 0-10.
export function buildCheckPrompt(req: CheckRequest): string {
  return [
    role(req.focus, 'yang memeriksa jawaban murid dengan sabar.'),
    `Soal: ${req.question}`,
    `Kunci / poin penting dari guru: ${req.key}`,
    `Jawaban murid: ${req.answer}`,
    'Nilai kebenaran, penalaran/tata bahasa, dan kesesuaian dengan kunci. Beri feedback singkat dalam Bahasa Indonesia '
    + 'yang membangun (sebut yang sudah benar dulu, baru yang perlu diperbaiki). '
    + 'Poin 0-10: 10 kalau tepat, 4-7 kalau hampir, 0-3 kalau masih jauh. Guru yang memutuskan akhir.'
  ].join('\n\n')
}

export interface ExamRequest {
  materials: string[]
  types: string[]
  count: number
  klass?: string
  examples?: string[]
  focus?: string
}

// Generate soal ujian dari materi yang diajarkan; gaya ditiru dari contoh bank.
export function buildExamPrompt(req: ExamRequest): string {
  const parts = [
    `${role(req.focus)} Buat ${req.count} soal ujian dari materi di bawah.`,
    `MATERI yang diujikan (isi soal harus tentang ini):\n- ${req.materials.join('\n- ')}`,
    `Sebar tipe soal ini secara berimbang: ${req.types.join(', ')}. Field "type" tiap soal WAJIB persis salah satu label itu (jangan diterjemahkan). Tiap soal wajib punya kunci jawaban.`
  ]
  if (req.klass?.trim()) parts.push(`Level: ${req.klass.trim()}.`)
  if (req.examples?.length) {
    parts.push(
      'CONTOH POLA SOAL (tiru gaya, format, dan tingkat kesulitannya — topik contoh boleh beda, '
      + 'ambil bentuknya lalu ganti isinya ke MATERI di atas):\n'
      + req.examples.map((e, i) => `${i + 1}. ${e}`).join('\n')
    )
    parts.push('Jangan bikin soal bergaya AI/generik. Contek pola dari contoh di atas.')
  } else {
    parts.push('Tidak ada contoh. Pakai pola soal umum yang sederhana dan jelas sesuai mapel.')
  }
  return parts.join('\n\n')
}

// Generate soal pilihan ganda buat kuis.
export function buildQuizPrompt(req: QuizRequest): string {
  const parts = [
    `${role(req.focus)} Buat ${req.count} soal pilihan ganda (4 opsi) tentang: ${req.topic}.`,
    'Tiap soal: 1 jawaban benar, 3 pengecoh masuk akal, dan alasan singkat kenapa jawabannya benar.',
    'Level murid — sederhana, jelas, mudah dipahami.'
  ]
  if (req.reference?.trim()) {
    parts.push(`Tiru gaya/format dari contoh ini (isi boleh beda):\n${req.reference.trim()}`)
  }
  return parts.join('\n\n')
}
