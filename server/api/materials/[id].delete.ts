import { and, eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/db'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!
  await useDb().delete(schema.materials)
    .where(and(eq(schema.materials.id, id), eq(schema.materials.userId, userId)))
  return { ok: true }
})
