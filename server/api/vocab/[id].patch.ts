import { and, eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/db'

// Toggle "sudah hafal" (atau edit field vocab).
export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!
  const b = await readBody<{ learned?: boolean, word?: string, meaning?: string, example?: string }>(event)

  const patch: Record<string, unknown> = {}
  if (typeof b.learned === 'boolean') patch.learned = b.learned
  if (b.word !== undefined) patch.word = b.word
  if (b.meaning !== undefined) patch.meaning = b.meaning
  if (b.example !== undefined) patch.example = b.example

  const [row] = await useDb().update(schema.vocab).set(patch)
    .where(and(eq(schema.vocab.id, id), eq(schema.vocab.userId, userId))).returning()
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Vocab tidak ditemukan.' })
  return row
})
