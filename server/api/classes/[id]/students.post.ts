import { schema, useDb } from '~~/server/db'
import type { RosterRow } from '~~/shared/utils/roster'

// Tambah banyak siswa sekaligus (hasil parseRoster di sisi klien).
export default defineEventHandler(async (event) => {
  const { c } = await requireClass(event, getRouterParam(event, 'id')!)
  const body = await readBody<RosterRow[]>(event)
  const rows = (Array.isArray(body) ? body : [])
    .map(r => ({
      classId: c.id,
      nis: String(r.nis ?? '').trim().slice(0, 30),
      name: String(r.name ?? '').trim().slice(0, 100),
      gender: r.gender === 'L' || r.gender === 'P' ? r.gender : null
    }))
    .filter(r => r.name)
  if (!rows.length) throw createError({ statusCode: 400, statusMessage: 'Nggak ada nama siswa yang terbaca.' })
  if (rows.length > 200) throw createError({ statusCode: 400, statusMessage: 'Maksimal 200 siswa sekali tempel.' })
  return useDb().insert(schema.students).values(rows).returning()
})
