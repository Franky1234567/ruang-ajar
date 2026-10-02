import { desc, sql } from 'drizzle-orm'
import { schema, useDb } from '~~/server/db'

export default defineEventHandler(async (event) => {
  await requireSuperadmin(event)
  const { schools } = schema
  return useDb().select({
    id: schools.id,
    name: schools.name,
    code: schools.code,
    planUntil: schools.planUntil,
    createdAt: schools.createdAt,
    // nama tabel ditulis lengkap; lihat catatan di school/recap.get.ts
    teachers: sql<number>`(select count(*)::int from "users" where "users"."school_id" = "schools"."id")`,
    adminEmail: sql<string | null>`(select "users"."email" from "users" where "users"."school_id" = "schools"."id" and "users"."role" = 'admin' limit 1)`
  }).from(schools).orderBy(desc(schools.createdAt))
})
