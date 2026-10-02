const SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    explanation: { type: 'STRING' },
    pattern: { type: 'STRING' },
    examples: { type: 'STRING' },
    exercises: { type: 'STRING' },
    answerKey: { type: 'STRING' }
  },
  required: ['title', 'explanation', 'pattern', 'examples', 'exercises', 'answerKey']
}

const MAX_FILE = 15 * 1024 * 1024

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)
  const fields: Record<string, string> = {}
  let file: { mimeType: string, base64: string } | null = null

  for (const p of parts ?? []) {
    if (p.filename && p.data?.length) {
      if (p.data.length > MAX_FILE) {
        throw createError({ statusCode: 413, statusMessage: 'File maksimal 15MB.' })
      }
      file = { mimeType: p.type || 'application/octet-stream', base64: p.data.toString('base64') }
    } else if (p.name) {
      fields[p.name] = p.data.toString('utf-8')
    }
  }

  if (!fields.topic?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Topik belum diisi.' })
  }

  const key = await resolveKey(event)
  const model = useRuntimeConfig(event).geminiModel
  const reference = file
    ? `${fields.reference ?? ''}\n(Referensi utama ada di file terlampir — baca isinya sebagai acuan materi.)`.trim()
    : fields.reference
  const prompt = buildMaterialPrompt({ topic: fields.topic, klass: fields.klass, goal: fields.goal, reference, focus: fields.focus })

  if (file) return geminiVisionJson(key, model, prompt, SCHEMA, file)
  return geminiJson(event, key, model, prompt, SCHEMA)
})
