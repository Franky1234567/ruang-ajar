import { and, eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/db'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!
  const b = await readBody(event)

  const [row] = await useDb().update(schema.materials).set({
    date: b.date,
    klass: b.klass,
    topic: b.topic,
    goal: b.goal,
    title: b.title,
    explanation: b.explanation,
    pattern: b.pattern,
    examples: b.examples,
    exercises: b.exercises,
    answerKey: b.answerKey
  }).where(and(eq(schema.materials.id, id), eq(schema.materials.userId, userId))).returning()

  if (!row) throw createError({ statusCode: 404, statusMessage: 'Materi tidak ditemukan.' })
  return row
})
