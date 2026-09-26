import type { H3Event } from 'h3'

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[]
}

interface GroqResponse {
  choices?: { message?: { content?: string } }[]
}

async function withRetry<T>(fn: () => Promise<T>, tries = 3): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await fn()
    } catch (err) {
      const status = (err as { status?: number }).status
      if (i >= tries - 1 || (status !== 503 && status !== 429)) throw err
      await new Promise(r => setTimeout(r, 800 * (i + 1)))
    }
  }
}

export function resolveKey(event: H3Event, bodyKey?: string): string {
  const key = bodyKey?.trim() || useRuntimeConfig(event).geminiApiKey
  if (!key) {
    throw createError({ statusCode: 400, statusMessage: 'API key belum diisi (Pengaturan atau env GEMINI_API_KEY).' })
  }
  return key
}

async function callGemini<T>(key: string, model: string, prompt: string, schema: unknown): Promise<T> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`
  const res = await withRetry(() => $fetch<GeminiResponse>(url, {
    method: 'POST',
    body: {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', responseSchema: schema }
    }
  }))
  const text = res.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw createError({ statusCode: 502, statusMessage: 'Model tidak mengembalikan hasil.' })
  return JSON.parse(text) as T
}

// Fallback saat Gemini limit/overload. Groq json_object cuma dukung objek → array dibungkus {items}.
async function callGroq<T>(key: string, model: string, prompt: string, schema: { type?: string, items?: unknown }): Promise<T> {
  const isArray = schema.type === 'ARRAY'
  const shape = isArray
    ? `objek JSON {"items": [...]} di mana tiap item sesuai: ${JSON.stringify(schema.items)}`
    : `JSON sesuai: ${JSON.stringify(schema)}`
  const res = await withRetry(() => $fetch<GroqResponse>('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}` },
    body: {
      model,
      messages: [{ role: 'user', content: `${prompt}\n\nBalas HANYA ${shape}. Tanpa teks lain.` }],
      response_format: { type: 'json_object' },
      temperature: 0.7
    }
  }))
  const text = res.choices?.[0]?.message?.content
  if (!text) throw createError({ statusCode: 502, statusMessage: 'Fallback Groq tidak mengembalikan hasil.' })
  const parsed = JSON.parse(text)
  return (isArray ? parsed.items ?? parsed.result ?? [] : parsed) as T
}

// Gemini vision: baca file (foto/PDF) sebagai referensi. Groq nggak dukung → Gemini-only.
export async function geminiVisionJson<T>(
  key: string,
  model: string,
  prompt: string,
  schema: unknown,
  file: { mimeType: string, base64: string }
): Promise<T> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`
  const res = await withRetry(() => $fetch<GeminiResponse>(url, {
    method: 'POST',
    body: {
      contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: file.mimeType, data: file.base64 } }] }],
      generationConfig: { responseMimeType: 'application/json', responseSchema: schema }
    }
  }))
  const text = res.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw createError({ statusCode: 502, statusMessage: 'Model tidak bisa membaca file.' })
  return JSON.parse(text) as T
}

export async function geminiJson<T>(
  event: H3Event,
  key: string,
  model: string,
  prompt: string,
  schema: { type?: string, items?: unknown }
): Promise<T> {
  try {
    return await callGemini<T>(key, model, prompt, schema)
  } catch (err) {
    const status = (err as { status?: number }).status
    const groqKey = useRuntimeConfig(event).groqApiKey
    if (groqKey && (status === 429 || status === 503 || status === 500)) {
      const groqModel = useRuntimeConfig(event).groqModel || 'llama-3.3-70b-versatile'
      return await callGroq<T>(groqKey, groqModel, prompt, schema)
    }
    if (err instanceof SyntaxError) {
      throw createError({ statusCode: 502, statusMessage: 'Respons model bukan JSON valid.' })
    }
    throw err
  }
}
