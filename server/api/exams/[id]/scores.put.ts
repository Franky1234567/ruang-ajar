import { and, eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/db'

// Simpan nilai satu siswa (manual atau hasil koreksi AI yang sudah disetujui guru).
export default defineEventHandler(async (event) => {
  const exam = await requireExam(event)
  const b = await readBody<{ studentId?: string, score?: number | null, note?: string }>(event)
  if (!exam.classId || !b.studentId || !isUuid(b.studentId)) {
    throw createError({ statusCode: 400, statusMessage: 'Siswa tidak valid.' })
  }
  const [s] = await useDb().select({ id: schema.students.id }).from(schema.students)
    .where(and(eq(schema.students.id, b.studentId), eq(schema.students.classId, exam.classId))).limit(1)
  if (!s) throw createError({ statusCode: 404, statusMessage: 'Siswa bukan dari kelas ujian ini.' })

  const db = useDb()
  // kolom nilai dikosongkan → hapus nilainya
  if (b.score === null || b.score === undefined || Number.isNaN(Number(b.score))) {
    await db.delete(schema.examScores)
      .where(and(eq(schema.examScores.examId, exam.id), eq(schema.examScores.studentId, s.id)))
    return { score: null }
  }
  const score = Math.min(100, Math.max(0, Math.round(Number(b.score))))
  const note = String(b.note ?? '').slice(0, 500)
  await db.insert(schema.examScores).values({ examId: exam.id, studentId: s.id, score, note })
    .onConflictDoUpdate({
      target: [schema.examScores.examId, schema.examScores.studentId],
      set: { score, note, updatedAt: new Date() }
    })
  return { score, note }
})
