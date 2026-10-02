import { and, eq, isNull } from 'drizzle-orm'
import { schema, useDb } from '~~/server/db'

// Bikin madrasah baru; pembuatnya jadi admin.
export default defineEventHandler(async (event) => {
  const m = await requireMember(event)
  if (m.schoolId) throw createError({ statusCode: 409, statusMessage: 'Kamu sudah tergabung di madrasah.' })
  const name = (await readBody<{ name?: string }>(event)).name?.trim()
  if (!name) throw createError({ statusCode: 400, statusMessage: 'Nama madrasah wajib diisi.' })

  const db = useDb()
  const [s] = await db.insert(schema.schools).values({ name, code: makeSchoolCode() }).returning()
  await db.update(schema.users).set({ schoolId: s!.id, role: 'admin' }).where(eq(schema.users.id, m.userId))
  await db.update(schema.classes).set({ schoolId: s!.id })
    .where(and(eq(schema.classes.ownerId, m.userId), isNull(schema.classes.schoolId)))
  return { name: s!.name, code: s!.code }
})
