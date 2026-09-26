import { schema, useDb } from '~~/server/db'

interface RankInput { name?: string, className?: string, points?: number, activities?: number }

// Impor poin lama dari localStorage (jaga points & activities apa adanya).
export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const body = await readBody<RankInput[]>(event)
  const values = (Array.isArray(body) ? body : [])
    .filter(r => r?.name?.trim())
    .map(r => ({
      userId,
      name: r.name!.trim(),
      className: r.className?.trim() || 'Umum',
      points: Number(r.points) || 0,
      activities: Number(r.activities) || 1
    }))
  if (!values.length) return []
  return useDb().insert(schema.ranks).values(values).returning()
})
