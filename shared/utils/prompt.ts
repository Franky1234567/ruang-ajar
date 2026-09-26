export interface MaterialRequest {
  topic: string
  klass?: string
  goal?: string
  reference?: string
}

export interface CheckRequest {
  question: string
  key: string
  answer: string
}

export interface QuizRequest {
  topic: string
  count: number
  reference?: string
}

// Susun draf materi LENGKAP. Kalau ada referensi, materi digrounding ke situ (bukan halu AI).
export function buildMaterialPrompt(req: MaterialRequest): string {
  const parts = [
    'Kamu guru yang menyusun materi ajar LENGKAP, jelas, dan mudah dipahami murid. '
    + 'Sesuaikan dengan mata pelajaran yang tersirat dari topik (mis. Bahasa Inggris, Matematika, Bahasa Arab, IPA, dll).',
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
    'Kamu guru yang memeriksa jawaban murid dengan sabar (mapel apa pun, sesuaikan dari soal).',
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
}

// Generate soal ujian dari materi yang diajarkan; gaya ditiru dari contoh bank.
export function buildExamPrompt(req: ExamRequest): string {
  const parts = [
    `Kamu guru. Buat ${req.count} soal ujian sesuai mata pelajaran dari materi di bawah.`,
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
    `Kamu guru. Buat ${req.count} soal pilihan ganda (4 opsi) tentang: ${req.topic} (mapel menyesuaikan topik).`,
    'Tiap soal: 1 jawaban benar, 3 pengecoh masuk akal, dan alasan singkat kenapa jawabannya benar.',
    'Level murid — sederhana, jelas, mudah dipahami.'
  ]
  if (req.reference?.trim()) {
    parts.push(`Tiru gaya/format dari contoh ini (isi boleh beda):\n${req.reference.trim()}`)
  }
  return parts.join('\n\n')
}
