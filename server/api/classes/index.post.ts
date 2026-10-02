import { schema, useDb } from '~~/server/db'

export default defineEventHandler(async (event) => {
  const m = await requireMember(event)
  const name = (await readBody<{ name?: string }>(event)).name?.trim()
  if (!name) throw createError({ statusCode: 400, statusMessage: 'Nama kelas wajib diisi.' })
  const [row] = await useDb().insert(schema.classes)
    .values({ name, ownerId: m.userId, schoolId: m.schoolId }).returning()
  return { id: row!.id, name: row!.name, ownerId: row!.ownerId, studentCount: 0 }
})
