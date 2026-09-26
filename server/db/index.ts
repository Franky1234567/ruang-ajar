import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function useDb() {
  if (_db) return _db
  const url = process.env.DATABASE_URL
  if (!url) throw createError({ statusCode: 500, statusMessage: 'DATABASE_URL belum diset.' })
  _db = drizzle(neon(url), { schema })
  return _db
}

export { schema }
