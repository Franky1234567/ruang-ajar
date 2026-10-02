import type { VocabRequest } from '~~/shared/utils/prompt'

const SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      word: { type: 'STRING' },
      meaning: { type: 'STRING' },
      example: { type: 'STRING' }
    },
    required: ['word', 'meaning', 'example']
  }
}

export default defineEventHandler(async (event) => {
  await requireUserId(event)
  const body = await readBody<VocabRequest>(event)
  if (!body.theme?.trim()) throw createError({ statusCode: 400, statusMessage: 'Tema belum diisi.' })

  const key = await resolveKey(event)
  const model = useRuntimeConfig(event).geminiModel
  const prompt = buildVocabPrompt({ theme: body.theme, count: body.count || 10, type: body.type, klass: body.klass, focus: body.focus })
  return geminiJson<{ word: string, meaning: string, example: string }[]>(event, key, model, prompt, SCHEMA)
})
