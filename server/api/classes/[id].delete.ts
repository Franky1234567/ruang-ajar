import { eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/db'

// Kelas dipakai bareng satu madrasah, jadi yang boleh hapus cuma pembuatnya atau admin.
export default defineEventHandler(async (event) => {
  const { m, c } = await requireClass(event, getRouterParam(event, 'id')!)
  if (c.ownerId !== m.userId && m.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Cuma pembuat kelas atau admin yang bisa menghapus.' })
  }
  await useDb().delete(schema.classes).where(eq(schema.classes.id, c.id))
  return { ok: true }
})
