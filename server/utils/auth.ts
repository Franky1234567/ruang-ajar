import type { H3Event } from 'h3'

// Ambil userId dari sesi; lempar 401 kalau belum login.
export async function requireUserId(event: H3Event): Promise<string> {
  const { user } = await requireUserSession(event)
  return (user as { id: string }).id
}
