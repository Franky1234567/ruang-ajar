const SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      topic: { type: 'STRING' },
      notes: { type: 'STRING' }
    },
    required: ['topic', 'notes']
  }
}

const MAX_FILE = 15 * 1024 * 1024

// Baca PDF/foto → daftar topik + poin isi. Buat fitur "generate massal".
export default defineEventHandler(async (event) => {
  await requireUserId(event)
  const parts = await readMultipartFormData(event)
  const fields: Record<string, string> = {}
  let file: { mimeType: string, base64: string } | null = null

  for (const p of parts ?? []) {
    if (p.filename && p.data?.length) {
      if (p.data.length > MAX_FILE) throw createError({ statusCode: 413, statusMessage: 'File maksimal 15MB.' })
      file = { mimeType: p.type || 'application/octet-stream', base64: p.data.toString('base64') }
    } else if (p.name) {
      fields[p.name] = p.data.toString('utf-8')
    }
  }
  if (!file) throw createError({ statusCode: 400, statusMessage: 'Upload PDF/foto dulu.' })

  const key = resolveKey(event, fields.apiKey)
  const model = fields.model?.trim() || 'gemini-flash-lite-latest'
  return geminiVisionJson<{ topic: string, notes: string }[]>(key, model, buildOutlinePrompt(), SCHEMA, file)
})
