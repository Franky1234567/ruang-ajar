import { eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/db'

// Set tanggal akhir paket setelah madrasah bayar. until: 'YYYY-MM-DD' (sampai akhir hari itu), null = cabut paket.
export default defineEventHandler(async (event) => {
  await requireSuperadmin(event)
  const id = getRouterParam(event, 'id')!
  if (!isUuid(id)) throw createError({ statusCode: 404, statusMessage: 'Madrasah tidak ditemukan.' })
  const { until } = await readBody<{ until?: string | null }>(event)
  let planUntil: Date | null = null
  if (until) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(until)) throw createError({ statusCode: 400, statusMessage: 'Format tanggal YYYY-MM-DD.' })
    planUntil = new Date(`${until}T23:59:59+07:00`)
  }
  const [row] = await useDb().update(schema.schools).set({ planUntil })
    .where(eq(schema.schools.id, id)).returning({ planUntil: schema.schools.planUntil })
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Madrasah tidak ditemukan.' })
  return row
})
