import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { db } from './db/index.js';
import { categories, tags, tasks } from './db/schema.js';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

const app = new Hono();

// フロントエンドからのアクセスを許可する
app.use('/api/*', cors());

const routes = app
  .get('/api/categories', async (c) => {
    // データベースから学習カテゴリを取得する
    const dbCategories = await db.select().from(categories);

    // データベースからタグを取得する
    const dbTags = await db.select().from(tags);

    // フロントエンドに返すためのデータ構造を作成する
    const result = dbCategories.map((category) => {
      // カテゴリに関するタグをフィルタリングする
      const categoryTags = dbTags
        .filter((tag) => tag.categoryId === category.id)
        .map((tag) => ({ id: tag.id, name: tag.name }));

      return {
        id: category.id,
        name: category.name,
        tags: categoryTags,
      };
    });

    return c.json(result);
  })

  .post(
    '/api/tasks',
    // フロントエンドからは、タスクのタイトル(string)とタグID(number)が送られてくる想定
    zValidator(
      'json',
      z.object({
        title: z.string(),
        tagId: z.number(),
      }),
    ),
    async (c) => {
      // バリデーションされたリクエストボディを取得する
      const body = c.req.valid('json');

      // データベースのtasksテーブルに新しいタスクを保存する
      const newTask = await db
        .insert(tasks)
        .values({
          title: body.title,
          tagId: body.tagId,
        })
        .returning(); // 挿入されたタスクの情報を取得する

      // フロントエンドに保存したデータを返す
      return c.json(newTask[0]);
    },
  )

  .get('/api/tasks', async (c) => {
    // tasksテーブルとtagsテーブルを結合して、タグ名も含めてタスクを取得する
    const allTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        status: tasks.status,
        tagName: tags.name, // tagsテーブルのnameカラムを取得する
      })
      .from(tasks)
      .leftJoin(tags, eq(tasks.tagId, tags.id)); // タスクとタグを結合するためのLEFT JOIN

    return c.json(allTasks);
  })

  .patch(
    '/api/tasks/:id',
    zValidator(
      'json',
      z.object({
        // zodのenumを使って、文字列を指定する。
        status: z.enum(['todo', 'in_progress', 'done']),
      }),
    ),
    async (c) => {
      // URLパラメータからタスクIDを取得
      const id = Number(c.req.param('id'));
      // 安全なステータスの文字列を取得
      const { status } = c.req.valid('json');
      // データベースの該当タスクを更新する
      await db.update(tasks).set({ status: status }).where(eq(tasks.id, id));

      return c.json({ success: true });
    },
  );

const port = 3001;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

export type AppType = typeof routes;
// export default app;
