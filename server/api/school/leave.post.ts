import { eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/db'

// Kelas yang dibuat guru ini tetap tinggal di madrasah (dipakai guru lain juga).
export default defineEventHandler(async (event) => {
  const m = await requireMember(event)
  if (!m.schoolId) return { ok: true }
  // ponytail: admin belum bisa nyerahin peran; tambah "jadikan admin" kalau ada madrasah yang butuh ganti admin
  if (m.role === 'admin') throw createError({ statusCode: 400, statusMessage: 'Admin belum bisa keluar dari madrasah.' })
  await useDb().update(schema.users).set({ schoolId: null, role: 'guru' }).where(eq(schema.users.id, m.userId))
  return { ok: true }
})
