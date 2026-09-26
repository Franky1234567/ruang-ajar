import { and, eq, sql } from 'drizzle-orm'
import { schema, useDb } from '~~/server/db'

// Tambah poin ke murid (find-or-create by nama+kelas, case-insensitive).
export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const b = await readBody<{ name?: string, className?: string, points?: number }>(event)
  const name = b.name?.trim()
  const group = b.className?.trim() || 'Umum'
  const points = Number(b.points) || 0
  if (!name) throw createError({ statusCode: 400, statusMessage: 'Nama murid wajib.' })

  const db = useDb()
  const [existing] = await db.select().from(schema.ranks).where(and(
    eq(schema.ranks.userId, userId),
    sql`lower(${schema.ranks.name}) = ${name.toLowerCase()}`,
    sql`lower(${schema.ranks.className}) = ${group.toLowerCase()}`
  )).limit(1)

  if (existing) {
    const [row] = await db.update(schema.ranks)
      .set({ points: existing.points + points, activities: existing.activities + 1 })
      .where(eq(schema.ranks.id, existing.id)).returning()
    return row
  }
  const [row] = await db.insert(schema.ranks)
    .values({ userId, name, className: group, points, activities: 1 }).returning()
  return row
})
