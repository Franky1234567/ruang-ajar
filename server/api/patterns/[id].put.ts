import { and, eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/db'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!
  const b = await readBody(event)

  const [row] = await useDb().update(schema.patterns)
    .set({ type: b.type, topic: b.topic, text: b.text })
    .where(and(eq(schema.patterns.id, id), eq(schema.patterns.userId, userId)))
    .returning()

  if (!row) throw createError({ statusCode: 404, statusMessage: 'Contoh tidak ditemukan.' })
  return row
})
