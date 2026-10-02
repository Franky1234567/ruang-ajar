import type { H3Event } from 'h3'

// Pemilik ruangajar (bukan admin madrasah). Email dari sesi Google, dicocokkan ke env SUPERADMIN_EMAILS.
export async function requireSuperadmin(event: H3Event) {
  const { user } = await requireUserSession(event)
  const email = String((user as { email?: string }).email ?? '').toLowerCase()
  const allowed = String(useRuntimeConfig(event).superadminEmails).toLowerCase().split(',').map(s => s.trim()).filter(Boolean)
  if (!email || !allowed.includes(email)) throw createError({ statusCode: 403, statusMessage: 'Khusus pengelola ruangajar.' })
}
