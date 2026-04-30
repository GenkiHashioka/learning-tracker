import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// ⓵ 大分類（カテゴリ）テーブル
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
});

// ⓶ 小分類（タグ）テーブル
export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categoryId: integer('category_id').references(() => categories.id), // どのカテゴリに属するかを管理する。
  name: text('name').notNull(),
});

// ⓷ タスク（予定）テーブル
export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  tagId: integer('tag_id').references(() => tags.id),
  status: text('status', { enum: ['todo', 'in_progress', 'done'] }).default(
    'todo',
  ),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
});

// ⓸ 実績（タイムログ）テーブル
export const timeLogs = sqliteTable('time_logs', {
  id: integer('id').primaryKey({autoIncrement: true}),
  taskId: integer('task_id').references(() => tasks.id),
  durationMinutes: integer('duration_minutes').notNull(), // タスクに費やした時間（分単位）
  notes: text('notes'), // タスクに関するメモやコメント
  loggedAt: text('logged_at').notNull().default('CURRENT_TIMESTAMP'),
})
