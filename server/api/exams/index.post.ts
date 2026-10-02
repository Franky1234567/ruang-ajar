import { schema, useDb } from '~~/server/db'
import type { ExamQuestion } from '~~/shared/utils/exam'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const b = await readBody<{ title?: string, classId?: string | null, questions?: ExamQuestion[] }>(event)
  const title = b.title?.trim()
  const questions = (Array.isArray(b.questions) ? b.questions : [])
    .map(q => ({ type: String(q.type ?? ''), text: String(q.text ?? '').trim(), answer: String(q.answer ?? '') }))
    .filter(q => q.text)
  if (!title) throw createError({ statusCode: 400, statusMessage: 'Judul ujian wajib diisi.' })
  if (!questions.length) throw createError({ statusCode: 400, statusMessage: 'Belum ada soal.' })

  // kelas harus yang memang boleh diakses guru ini
  const classId = b.classId ? (await requireClass(event, b.classId)).c.id : null
  const [row] = await useDb().insert(schema.exams).values({ userId, classId, title, questions }).returning()
  return { id: row!.id }
})
