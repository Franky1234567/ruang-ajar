import { boolean, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  googleId: text('google_id').unique().notNull(),
  email: text('email').notNull(),
  name: text('name'),
  picture: text('picture'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

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

export const settings = pgTable('settings', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  model: text('model').default('gemini-flash-lite-latest'),
  defaultClass: text('default_class').default('SMP kelas 8'),
  focus: text('focus').default(''),
  geminiKey: text('gemini_key')
})
