import { and, asc, eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/db'

// Ujian + siswa kelasnya + nilai yang sudah masuk.
export default defineEventHandler(async (event) => {
  const exam = await requireExam(event)
  const db = useDb()
  const m = await requireMember(event)
  const { classes, students, examScores } = schema

  const [cls] = exam.classId
    ? await db.select({ name: classes.name }).from(classes)
        .where(and(eq(classes.id, exam.classId), classScope(m))).limit(1)
    : []
  // kalau guru udah keluar madrasah, kelasnya nggak kebaca lagi → daftar siswa kosong
  const roster = cls
    ? await db.select({
        id: students.id, name: students.name, nis: students.nis,
        score: examScores.score, note: examScores.note
      }).from(students)
        .leftJoin(examScores, and(eq(examScores.studentId, students.id), eq(examScores.examId, exam.id)))
        .where(eq(students.classId, exam.classId!)).orderBy(asc(students.name))
    : []

  return { id: exam.id, title: exam.title, questions: exam.questions, className: cls?.name ?? null, students: roster }
})
