import type { H3Event } from 'h3'
import { and, eq, sql } from 'drizzle-orm'
import { schema, useDb } from '~~/server/db'

export const currentMonth = () => new Date().toISOString().slice(0, 7)

// Guru di madrasah yang paketnya masih aktif dapat kuota berbayar; sisanya kuota gratis.
export async function aiLimit(event: H3Event, userId: string) {
  const config = useRuntimeConfig(event)
  const [row] = await useDb().select({ planUntil: schema.schools.planUntil })
    .from(schema.users).innerJoin(schema.schools, eq(schema.users.schoolId, schema.schools.id))
    .where(eq(schema.users.id, userId)).limit(1)
  const paid = !!row?.planUntil && row.planUntil > new Date()
  return paid
    ? Number(config.aiMonthlyLimitPaid) || 1000
    : Number(config.aiMonthlyLimit) || 100
}

export async function aiUsed(userId: string) {
  const [row] = await useDb().select().from(schema.aiUsage)
    .where(and(eq(schema.aiUsage.userId, userId), eq(schema.aiUsage.month, currentMonth())))
  return row?.count ?? 0
}

// Naikin pemakaian AI bulan ini secara atomik; lempar 429 kalau udah mentok limit.
// ponytail: kuota kepotong walau panggilan AI-nya gagal, refund kalau ada keluhan.
export async function consumeAiQuota(userId: string, limit: number) {
  const [row] = await useDb().insert(schema.aiUsage)
    .values({ userId, month: currentMonth(), count: 1 })
    .onConflictDoUpdate({
      target: [schema.aiUsage.userId, schema.aiUsage.month],
      set: { count: sql`${schema.aiUsage.count} + 1` },
      setWhere: sql`${schema.aiUsage.count} < ${limit}`
    })
    .returning()
  if (!row) {
    throw createError({
      statusCode: 429,
      statusMessage: `Kuota AI bulan ini habis (${limit}x). Kuota reset tiap awal bulan.`
    })
  }
}
