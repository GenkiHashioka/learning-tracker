import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle', // マイグレーションの履歴を保存するディレクトリ
  dialect: 'sqlite', // 使用するデータベースの種類
  dbCredentials: {
    url: 'sqlite.db', // 作成するSQLiteデータベースのファイル名
  },
});
