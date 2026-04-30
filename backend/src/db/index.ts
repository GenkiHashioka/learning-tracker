import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema.js';

// sqlite.dbファイルを開く（無ければこの名前で作成する）
const sqlite = new Database('sqlite.db');

// Drizzle ORMにデータベースとスキーマを登録してエクスポート
export const db = drizzle(sqlite, { schema });
