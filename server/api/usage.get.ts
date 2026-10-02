export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  return { used: await aiUsed(userId), limit: await aiLimit(event, userId) }
})
