import { schema, useDb } from '~~/server/db'

interface VocabInput { word?: string, meaning?: string, example?: string, theme?: string, klass?: string }

// Simpan banyak vocab sekaligus (hasil generate).
export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const body = await readBody<VocabInput | VocabInput[]>(event)
  const list = Array.isArray(body) ? body : [body]

  const values = list
    .filter(v => v?.word?.trim())
    .map(v => ({
      userId,
      word: v.word!.trim(),
      meaning: v.meaning ?? '',
      example: v.example ?? '',
      theme: v.theme ?? '',
      klass: v.klass ?? ''
    }))

  if (!values.length) throw createError({ statusCode: 400, statusMessage: 'Tidak ada vocab valid.' })
  return useDb().insert(schema.vocab).values(values).returning()
})
