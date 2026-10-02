import { desc, eq, sql } from 'drizzle-orm'
import { schema, useDb } from '~~/server/db'

export default defineEventHandler(async (event) => {
  const userId = await requireUserId(event)
  const { exams, classes } = schema
  return useDb().select({
    id: exams.id,
    title: exams.title,
    className: classes.name,
    questionCount: sql<number>`jsonb_array_length(${exams.questions})`,
    // join → drizzle nulis prefix tabel, tapi tetap ditulis lengkap biar aman (lihat school/recap.get.ts)
    scored: sql<number>`(select count(*)::int from "exam_scores" where "exam_scores"."exam_id" = "exams"."id")`,
    createdAt: exams.createdAt
  }).from(exams).leftJoin(classes, eq(exams.classId, classes.id))
    .where(eq(exams.userId, userId)).orderBy(desc(exams.createdAt))
})
