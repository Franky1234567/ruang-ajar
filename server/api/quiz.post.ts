import type { QuizRequest } from '~~/shared/utils/prompt'

interface Body extends QuizRequest {
  apiKey?: string
  model?: string
}

const SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      q: { type: 'STRING' },
      options: { type: 'ARRAY', items: { type: 'STRING' } },
      answer: { type: 'INTEGER' },
      why: { type: 'STRING' }
    },
    required: ['q', 'options', 'answer', 'why']
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Body>(event)
  if (!body.topic?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Topik belum diisi.' })
  }
  const key = resolveKey(event, body.apiKey)
  const model = body.model?.trim() || 'gemini-flash-lite-latest'
  const prompt = buildQuizPrompt({ topic: body.topic, count: body.count || 3, reference: body.reference })
  return geminiJson<{ q: string, options: string[], answer: number, why: string }[]>(event, key, model, prompt, SCHEMA)
})
