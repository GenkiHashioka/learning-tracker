'use client';

import { hc } from 'hono/client';
import { AppType } from '../../../backend/src/index';
import { type SubmitEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

const client = hc<AppType>('http://localhost:3001');

// page.tsxから受け取るpropsの型定義
type TaskFormProps = {
  categories: {
    id: number;
    name: string;
    tags: { id: number; name: string }[];
  }[];
};

export default function TaskForm({ categories }: TaskFormProps) {
  // 画面更新用
  const router = useRouter();
  const [title, setTitle] = useState('');

  // プルダウンで選択されているタグのIDを保存する状態
  const [selectedTagId, setSelectedTagId] = useState<number>(0);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    if (!title.trim() || selectedTagId === 0) {
      alert('タスク名とタグを選択してください。');
      return;
    }

    await client.api.tasks.$post({
      json: {
        title: title.trim(),
        tagId: selectedTagId, // 洗濯されたタグのIDを送信
      },
    });

    // 入力欄のクリア
    setTitle('');
    // プルダウンのリセット
    setSelectedTagId(0);

    // タスク一覧を更新するためにページをリフレッシュ
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='mb-12 p-6 bg-white rounded-xl shadow-sm border border-gray-200'
    >
      <h2 className='text-lg font-bold text-gray-700 mb-4'>
        新しい学習タスクを追加
      </h2>
      <div className='flex flex-col md:flex-row gap-4'>
        <input
          type='text'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='例： JavaScriptの基礎を学ぶ'
          className='flex-[2] border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500'
        />

        <select
          value={selectedTagId}
          onChange={(e) => setSelectedTagId(Number(e.target.value))}
          className='flex-[1] border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          <option value={0}>タグを選択...</option>
          {categories.map((category) => (
            <optgroup key={category.id} label={category.name}>
              {category.tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        <button
          type='submit'
          className='bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors'
        >
          登録する
        </button>
      </div>
    </form>
  );
}
