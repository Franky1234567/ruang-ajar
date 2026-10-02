import { asc, eq, sql } from 'drizzle-orm'
import { schema, useDb } from '~~/server/db'

// Rekap admin: siapa aja gurunya dan seberapa aktif.
export default defineEventHandler(async (event) => {
  const m = await requireMember(event)
  if (!m.schoolId || m.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Khusus admin madrasah.' })
  const { users } = schema
  // Ditulis lengkap "tabel"."kolom": drizzle nggak nambahin nama tabel di select satu tabel,
  // jadi "id" di subquery kebaca sebagai id tabel dalam, bukan users.id.
  return useDb().select({
    name: users.name,
    email: users.email,
    role: users.role,
    materials: sql<number>`(select count(*)::int from "materials" where "materials"."user_id" = "users"."id")`,
    aiThisMonth: sql<number>`coalesce((select "ai_usage"."count" from "ai_usage" where "ai_usage"."user_id" = "users"."id" and "ai_usage"."month" = ${currentMonth()}), 0)`
  }).from(users).where(eq(users.schoolId, m.schoolId)).orderBy(asc(users.name))
})
