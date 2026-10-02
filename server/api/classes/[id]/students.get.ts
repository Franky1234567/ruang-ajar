import { asc, eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/db'

export default defineEventHandler(async (event) => {
  const { c } = await requireClass(event, getRouterParam(event, 'id')!)
  return useDb().select().from(schema.students)
    .where(eq(schema.students.classId, c.id)).orderBy(asc(schema.students.name))
})
