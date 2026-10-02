import { asc, eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/db'

// Semua siswa yang bisa diakses guru ini, buat saran nama di Kuis & avatar di Leaderboard.
export default defineEventHandler(async (event) => {
  const m = await requireMember(event)
  const { students, classes } = schema
  return useDb().select({ name: students.name, gender: students.gender, className: classes.name })
    .from(students).innerJoin(classes, eq(students.classId, classes.id))
    .where(classScope(m)).orderBy(asc(students.name))
})
