import type { H3Event } from 'h3'
import { and, eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/db'

// Ujian itu pribadi: cuma pembuatnya yang boleh buka, nilai, atau hapus.
export async function requireExam(event: H3Event) {
  const userId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!
  if (!isUuid(id)) throw createError({ statusCode: 404, statusMessage: 'Ujian tidak ditemukan.' })
  const [exam] = await useDb().select().from(schema.exams)
    .where(and(eq(schema.exams.id, id), eq(schema.exams.userId, userId))).limit(1)
  if (!exam) throw createError({ statusCode: 404, statusMessage: 'Ujian tidak ditemukan.' })
  return exam
}
