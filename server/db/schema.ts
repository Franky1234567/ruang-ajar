import { boolean, integer, jsonb, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import type { ExamQuestion } from '../../shared/utils/exam'

export const schools = pgTable('schools', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  code: text('code').unique().notNull(),
  // paket berbayar aktif sampai tanggal ini; null/lewat = gratis
  planUntil: timestamp('plan_until'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  googleId: text('google_id').unique().notNull(),
  email: text('email').notNull(),
  name: text('name'),
  picture: text('picture'),
  schoolId: uuid('school_id').references(() => schools.id, { onDelete: 'set null' }),
  role: text('role').default('guru').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// schoolId null = kelas pribadi guru yang belum gabung madrasah.
export const classes = pgTable('classes', {
  id: uuid('id').defaultRandom().primaryKey(),
  schoolId: uuid('school_id').references(() => schools.id, { onDelete: 'cascade' }),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const students = pgTable('students', {
  id: uuid('id').defaultRandom().primaryKey(),
  classId: uuid('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
  nis: text('nis').default('').notNull(),
  name: text('name').notNull(),
  gender: text('gender')
})

// Ujian pribadi guru; classId opsional (ujian les tanpa daftar siswa tetap bisa disimpan & dicetak).
export const exams = pgTable('exams', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  classId: uuid('class_id').references(() => classes.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  questions: jsonb('questions').$type<ExamQuestion[]>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const examScores = pgTable('exam_scores', {
  examId: uuid('exam_id').notNull().references(() => exams.id, { onDelete: 'cascade' }),
  studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  score: integer('score').notNull(),
  note: text('note').default('').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, t => [primaryKey({ columns: [t.examId, t.studentId] })])

export const materials = pgTable('materials', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  klass: text('klass').default(''),
  topic: text('topic').notNull(),
  goal: text('goal').default(''),
  title: text('title').default(''),
  explanation: text('explanation').default(''),
  pattern: text('pattern').default(''),
  examples: text('examples').default(''),
  exercises: text('exercises').default(''),
  answerKey: text('answer_key').default(''),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const patterns = pgTable('patterns', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  topic: text('topic').default(''),
  text: text('text').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const ranks = pgTable('ranks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  className: text('class_name').default('Umum'),
  points: integer('points').default(0).notNull(),
  activities: integer('activities').default(0).notNull()
})

export const vocab = pgTable('vocab', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').default('kata').notNull(),
  word: text('word').notNull(),
  meaning: text('meaning').default(''),
  example: text('example').default(''),
  theme: text('theme').default(''),
  klass: text('klass').default(''),
  learned: boolean('learned').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

export const aiUsage = pgTable('ai_usage', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  month: text('month').notNull(),
  count: integer('count').default(0).notNull()
}, t => [primaryKey({ columns: [t.userId, t.month] })])

export const settings = pgTable('settings', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  model: text('model').default('gemini-flash-lite-latest'),
  defaultClass: text('default_class').default('SMP kelas 8'),
  focus: text('focus').default(''),
  geminiKey: text('gemini_key')
})
