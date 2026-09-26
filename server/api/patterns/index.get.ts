import { desc, eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/db'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  return useDb()
    .select().from(schema.patterns)
    .where(eq(schema.patterns.userId, userId))
    .orderBy(desc(schema.patterns.createdAt))
})
