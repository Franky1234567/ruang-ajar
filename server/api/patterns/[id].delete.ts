import { and, eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/db'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!
  await useDb().delete(schema.patterns)
    .where(and(eq(schema.patterns.id, id), eq(schema.patterns.userId, userId)))
  return { ok: true }
})
