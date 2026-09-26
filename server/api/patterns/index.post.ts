import { schema, useDb } from '~~/server/db'

interface PatternInput { type?: string, topic?: string, text?: string }

// Terima 1 pattern atau array (bank simpan banyak sekaligus).
export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const body = await readBody<PatternInput | PatternInput[]>(event)
  const list = Array.isArray(body) ? body : [body]

  const values = list
    .filter(p => p?.text?.trim())
    .map(p => ({ userId, type: p.type || '', topic: p.topic || '', text: p.text! }))

  if (!values.length) throw createError({ statusCode: 400, statusMessage: 'Tidak ada contoh valid.' })
  return useDb().insert(schema.patterns).values(values).returning()
})
