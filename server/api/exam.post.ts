import type { ExamRequest } from '~~/shared/utils/prompt'

interface Body extends ExamRequest {
  apiKey?: string
  model?: string
}

const SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      type: { type: 'STRING' },
      text: { type: 'STRING' },
      answer: { type: 'STRING' }
    },
    required: ['type', 'text', 'answer']
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Body>(event)
  if (!body.materials?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Pilih minimal satu materi.' })
  }
  if (!body.types?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Pilih minimal satu tipe soal.' })
  }
  const key = resolveKey(event, body.apiKey)
  const model = body.model?.trim() || 'gemini-flash-lite-latest'
  const prompt = buildExamPrompt({
    materials: body.materials,
    types: body.types,
    count: body.count || 8,
    klass: body.klass,
    examples: body.examples ?? []
  })
  return geminiJson<{ type: string, text: string, answer: string }[]>(event, key, model, prompt, SCHEMA)
})
