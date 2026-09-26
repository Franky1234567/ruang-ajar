import { schema, useDb } from '~~/server/db'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const b = await readBody(event)
  if (!b?.topic?.trim()) throw createError({ statusCode: 400, statusMessage: 'Topik wajib.' })

  const [row] = await useDb().insert(schema.materials).values({
    userId,
    date: b.date || new Date().toISOString().slice(0, 10),
    klass: b.klass ?? '',
    topic: b.topic,
    goal: b.goal ?? '',
    title: b.title ?? '',
    explanation: b.explanation ?? '',
    pattern: b.pattern ?? '',
    examples: b.examples ?? '',
    exercises: b.exercises ?? '',
    answerKey: b.answerKey ?? ''
  }).returning()
  return row
})
