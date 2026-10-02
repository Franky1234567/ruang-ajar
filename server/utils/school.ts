import type { H3Event } from 'h3'
import { and, eq, isNull } from 'drizzle-orm'
import { schema, useDb } from '~~/server/db'

export interface Member {
  userId: string
  schoolId: string | null
  role: string
}

// schoolId dibaca dari DB tiap request (bukan dari sesi) biar langsung berlaku setelah gabung/keluar.
export async function requireMember(event: H3Event): Promise<Member> {
  const userId = await requireUserId(event)
  const [u] = await useDb().select({ schoolId: schema.users.schoolId, role: schema.users.role })
    .from(schema.users).where(eq(schema.users.id, userId)).limit(1)
  if (!u) throw createError({ statusCode: 401, statusMessage: 'Akun tidak ditemukan.' })
  return { userId, schoolId: u.schoolId, role: u.role }
}

// Kelas yang boleh diakses: semua kelas di madrasah sendiri, atau kelas pribadi kalau belum gabung.
export const classScope = (m: Member) => m.schoolId
  ? eq(schema.classes.schoolId, m.schoolId)
  : and(isNull(schema.classes.schoolId), eq(schema.classes.ownerId, m.userId))

// ID dari URL; yang bukan UUID bikin Postgres error 500, jadi ditolak duluan sebagai 404.
export const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)

export async function requireClass(event: H3Event, classId: string) {
  const m = await requireMember(event)
  if (!isUuid(classId)) throw createError({ statusCode: 404, statusMessage: 'Kelas tidak ditemukan.' })
  const [c] = await useDb().select().from(schema.classes)
    .where(and(eq(schema.classes.id, classId), classScope(m))).limit(1)
  if (!c) throw createError({ statusCode: 404, statusMessage: 'Kelas tidak ditemukan.' })
  return { m, c }
}

// Tanpa 0/O/1/I biar nggak salah ketik waktu dibacain di grup WA.
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export function makeSchoolCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return Array.from(bytes, b => CODE_CHARS[b % CODE_CHARS.length]).join('')
}
