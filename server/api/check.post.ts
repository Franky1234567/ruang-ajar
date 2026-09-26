import type { CheckRequest } from '~~/shared/utils/prompt'

interface Body extends CheckRequest {
  apiKey?: string
  model?: string
}

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    verdict: { type: 'STRING' },
    feedback: { type: 'STRING' },
    points: { type: 'INTEGER' }
  },
  required: ['verdict', 'feedback', 'points']
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Body>(event)
  if (!body.question?.trim() || !body.answer?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Soal dan jawaban murid wajib diisi.' })
  }
  const key = resolveKey(event, body.apiKey)
  const model = body.model?.trim() || 'gemini-flash-lite-latest'
  const prompt = buildCheckPrompt(body)
  return geminiJson<{ verdict: string, feedback: string, points: number }>(event, key, model, prompt, SCHEMA)
})
