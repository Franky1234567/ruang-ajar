import type { VocabRequest } from '~~/shared/utils/prompt'

interface Body extends VocabRequest {
  apiKey?: string
  model?: string
}

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
  const body = await readBody<Body>(event)
  if (!body.theme?.trim()) throw createError({ statusCode: 400, statusMessage: 'Tema belum diisi.' })

  const key = resolveKey(event, body.apiKey)
  const model = body.model?.trim() || 'gemini-flash-lite-latest'
  const prompt = buildVocabPrompt({ theme: body.theme, count: body.count || 10, type: body.type, klass: body.klass, focus: body.focus })
  return geminiJson<{ word: string, meaning: string, example: string }[]>(event, key, model, prompt, SCHEMA)
})
