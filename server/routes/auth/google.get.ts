import { eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/db'

export default defineOAuthGoogleEventHandler({
  config: { scope: ['email', 'profile'] },
  async onSuccess(event, { user }) {
    const g = user as { sub: string, email: string, name?: string, picture?: string }
    const db = useDb()

    let [dbUser] = await db.select().from(schema.users).where(eq(schema.users.googleId, g.sub)).limit(1)
    if (!dbUser) {
      [dbUser] = await db.insert(schema.users)
        .values({ googleId: g.sub, email: g.email, name: g.name, picture: g.picture })
        .returning()
    }

    await setUserSession(event, {
      user: { id: dbUser.id, email: dbUser.email, name: dbUser.name, picture: dbUser.picture }
    })
    return sendRedirect(event, '/')
  },
  onError(event, error) {
    console.error('Google OAuth error:', error)
    return sendRedirect(event, '/login?error=oauth')
  }
})
