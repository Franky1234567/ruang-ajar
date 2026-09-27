import { and, eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/db'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!
  await useDb().delete(schema.vocab)
    .where(and(eq(schema.vocab.id, id), eq(schema.vocab.userId, userId)))
  return { ok: true }
})
