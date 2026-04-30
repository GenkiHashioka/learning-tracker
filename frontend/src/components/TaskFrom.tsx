'use client';

import { hc } from 'hono/client';
import { AppType } from '../../../backend/src/index';
import { type SubmitEvent, useState } from 'react';

const client = hc<AppType>('http://localhost:3001');

export default function TaskForm() {
  const [title, setTitle] = useState('');

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    await client.api.tasks.$post({
      json: {
        title: title.trim(),
        tagId: 1,
      },
    });

    alert('タスクが追加されました！');
    setTitle('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200'
    >
      <h2 className='text-lg font-bold text-gray-700 mb-4'>
        新しい学習タスクを追加
      </h2>
      <div className='flex gap-4'>
        <input
          type='text'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例： JavaScriptの基礎を学ぶ"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          登録する
        </button>
      </div>
    </form>
  );
}
