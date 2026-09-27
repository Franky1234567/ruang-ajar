import { desc, eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/db'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  return useDb()
    .select().from(schema.vocab)
    .where(eq(schema.vocab.userId, userId))
    .orderBy(desc(schema.vocab.createdAt))
})
