import { eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/db'

export default defineEventHandler(async (event) => {
  const exam = await requireExam(event)
  await useDb().delete(schema.exams).where(eq(schema.exams.id, exam.id))
  return { ok: true }
})
