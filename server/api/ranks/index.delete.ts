import { eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/db'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  await useDb().delete(schema.ranks).where(eq(schema.ranks.userId, userId))
  return { ok: true }
})
