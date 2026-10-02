import { eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/db'

export default defineEventHandler(async (event) => {
  await requireUserId(event)
  const id = getRouterParam(event, 'id')!
  if (!isUuid(id)) throw createError({ statusCode: 404, statusMessage: 'Siswa tidak ditemukan.' })
  const [s] = await useDb().select({ classId: schema.students.classId })
    .from(schema.students).where(eq(schema.students.id, id)).limit(1)
  if (!s) throw createError({ statusCode: 404, statusMessage: 'Siswa tidak ditemukan.' })
  await requireClass(event, s.classId)
  await useDb().delete(schema.students).where(eq(schema.students.id, id))
  return { ok: true }
})
