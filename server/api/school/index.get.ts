import { eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/db'

export default defineEventHandler(async (event) => {
  const m = await requireMember(event)
  if (!m.schoolId) return { school: null, role: m.role }
  const [s] = await useDb().select().from(schema.schools).where(eq(schema.schools.id, m.schoolId)).limit(1)
  // kode gabung cuma buat admin, biar nggak disebar sembarang guru
  return {
    school: s && { name: s.name, code: m.role === 'admin' ? s.code : null, planUntil: s.planUntil },
    role: m.role
  }
})
