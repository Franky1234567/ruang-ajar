import { and, eq, isNull } from 'drizzle-orm'
import { schema, useDb } from '~~/server/db'

export default defineEventHandler(async (event) => {
  const m = await requireMember(event)
  if (m.schoolId) throw createError({ statusCode: 409, statusMessage: 'Kamu sudah tergabung di madrasah.' })
  const code = (await readBody<{ code?: string }>(event)).code?.trim().toUpperCase()
  if (!code) throw createError({ statusCode: 400, statusMessage: 'Kode madrasah wajib diisi.' })

  const db = useDb()
  const [s] = await db.select().from(schema.schools).where(eq(schema.schools.code, code)).limit(1)
  if (!s) throw createError({ statusCode: 404, statusMessage: 'Kode nggak ketemu. Cek lagi ke admin madrasah.' })

  await db.update(schema.users).set({ schoolId: s.id, role: 'guru' }).where(eq(schema.users.id, m.userId))
  // kelas pribadi yang udah diisi ikut pindah ke madrasah
  await db.update(schema.classes).set({ schoolId: s.id })
    .where(and(eq(schema.classes.ownerId, m.userId), isNull(schema.classes.schoolId)))
  return { name: s.name }
})
