import { asc, sql } from 'drizzle-orm'
import { schema, useDb } from '~~/server/db'

export default defineEventHandler(async (event) => {
  const m = await requireMember(event)
  const { classes } = schema
  return useDb().select({
    id: classes.id,
    name: classes.name,
    ownerId: classes.ownerId,
    // nama tabel ditulis lengkap; lihat catatan di school/recap.get.ts
    studentCount: sql<number>`(select count(*)::int from "students" where "students"."class_id" = "classes"."id")`
  }).from(classes).where(classScope(m)).orderBy(asc(classes.name))
})
