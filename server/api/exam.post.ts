import type { ExamQuestion } from '~~/shared/utils/exam'
import type { ExamRequest } from '~~/shared/utils/prompt'

const SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      type: { type: 'STRING' },
      text: { type: 'STRING' },
      options: { type: 'ARRAY', items: { type: 'STRING' } },
      answer: { type: 'STRING' }
    },
    required: ['type', 'text', 'answer']
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ExamRequest>(event)
  if (!body.materials?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Pilih minimal satu materi.' })
  }
  if (!body.types?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Pilih minimal satu tipe soal.' })
  }
  const key = await resolveKey(event)
  const model = useRuntimeConfig(event).geminiModel
  const prompt = buildExamPrompt({
    materials: body.materials,
    types: body.types,
    count: body.count || 8,
    klass: body.klass,
    examples: body.examples ?? [],
    focus: body.focus
  })
  const res = await geminiJson<(ExamQuestion & { options?: string[] })[]>(event, key, model, prompt, SCHEMA)
  return res.map(withOptions)
})
