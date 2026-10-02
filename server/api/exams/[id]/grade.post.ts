import type { GradeItem } from '~~/shared/utils/exam'

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    items: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          no: { type: 'INTEGER' },
          studentAnswer: { type: 'STRING' },
          credit: { type: 'NUMBER' },
          comment: { type: 'STRING' }
        },
        required: ['no', 'studentAnswer', 'credit', 'comment']
      }
    },
    note: { type: 'STRING' }
  },
  required: ['items', 'note']
}

const MAX_FILE = 15 * 1024 * 1024

// Foto lembar jawaban → usulan nilai. Belum disimpan: guru cek dulu, lalu simpan lewat scores.put.
export default defineEventHandler(async (event) => {
  const exam = await requireExam(event)
  const parts = await readMultipartFormData(event)
  const filePart = parts?.find(p => p.filename && p.data?.length)
  if (!filePart) throw createError({ statusCode: 400, statusMessage: 'Foto lembar jawaban belum ada.' })
  if (filePart.data.length > MAX_FILE) throw createError({ statusCode: 413, statusMessage: 'Foto maksimal 15MB.' })
  const focus = parts?.find(p => p.name === 'focus')?.data.toString('utf-8')

  const key = await resolveKey(event)
  const model = useRuntimeConfig(event).geminiModel
  const res = await geminiVisionJson<{ items: GradeItem[], note: string }>(
    key, model, buildGradePrompt(exam.questions, focus), SCHEMA,
    { mimeType: filePart.type || 'image/jpeg', base64: filePart.data.toString('base64') }
  )
  return { ...res, score: scoreFromItems(res.items ?? [], exam.questions.length) }
})
