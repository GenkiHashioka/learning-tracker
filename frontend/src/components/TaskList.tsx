'use client';

import { hc } from 'hono/client';
import { AppType } from '../../../backend/src/index.js';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { lightningCssTransform } from 'next/dist/build/swc/generated-native.js';

const client = hc<AppType>('http://localhost:3001');

// page.tsxから受け取るタスク一覧の型
type Task = {
  id: number;
  title: string;
  status: string | null;
  tagName: string | null;
};

// ステータスの表示名と色の定義
const statusConfig = {
  todo: {
    label: '未着手',
    color: 'bg-gray-100 text-gray-700 border-gray-300',
  },
  in_progress: {
    label: '進行中',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  done: {
    label: '完了',
    color: 'bg-green-100 text-green-700 border-green-300',
  },
};

// リストの１行分だけを担当する子コンポーネント
function TaskItem({ task }: { task: Task }) {
  const router = useRouter();

  // このタスク専用の状態（入力欄のデータなど）
  // 記録フォームを開いているかどうかの状態を管理する
  const [isLogging, setIsLogging] = useState(false);
  // 学習時間の入力値を管理する状態
  const [minutes, setMinutes] = useState<number | ''>('');
  // メモの入力値を管理する状態
  const [notes, setNotes] = useState('');

  const currentStatus = (task.status as keyof typeof statusConfig) || 'todo';
  const config = statusConfig[currentStatus];

  // ステータス変更の処理
  const handleStatusChange = async (newStatus: string) => {
    await client.api.tasks[':id'].$patch({
      param: { id: task.id.toString() },
      json: { status: newStatus as 'todo' | 'in_progress' | 'done' },
    });

    // 画面をリロードして最新のタスク一覧を取得する
    router.refresh();
  };

  // タイムログの保存
  const handleSaveTimeLog = async () => {
    if (typeof minutes !== 'number' || minutes <= 0) {
      return;
    }

    await client.api['time-logs'].$post({
      json: {
        taskId: task.id,
        durationMinutes: minutes,
        notes: notes || undefined, // メモが空文字の場合はundefinedにする
      },
    });

    // 保存が完了したらフォームを閉じてリセットし、画面をリロードする
    setIsLogging(false);
    setMinutes('');
    setNotes('');
    alert('学習時間を保存しました！お疲れ様でした！');
    router.refresh();
  };

  return (
    <li className='p-4 flex flex-col gap-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <span className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-mono'>
            {task.tagName || 'タグなし'}
          </span>
          <span
            className={`text-gray-800 font-medium ${currentStatus === 'done' ? 'line-through text-gray-400' : ''}`}
          >
            {task.title}
          </span>
        </div>

        <div className='flex items-center gap-3'>
          {/* 実績記録ボタン */}
          <button
            onClick={() => setIsLogging(!isLogging)}
            className='text-sm font-medium text-blue-600 hover:text-blue-800'
          >
            {isLogging ? 'キャンセル' : '+ 実績を記録'}
          </button>
          {/* ステータス変更のプルダウン */}
          <select
            value={currentStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`text-sm font-medium px-3 py-1.5 rounded-lg border focus:outline-none cursor-pointer transition-colors ${config.color}`}
          >
            <option value='todo'>未着手</option>
            <option value='in_progress'>進行中</option>
            <option value='done'>完了</option>
          </select>
        </div>
      </div>

      {/* 実績記録フォーム */}
      {isLogging && (
        <div className='mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-col gap-3'>
          <div className='flex items-center gap-3'>
            <label className='text-sm font-bold text-gray-600'>学習時間:</label>
            <input
              type='number'
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              placeholder='分'
              className='w-24 px-3 py-1.5 border rounded-md text-sm text-gray-900 placeholder-gray-400'
            />
            <span className='text-sm text-gray-600'>分</span>
          </div>
          <div className='flex flex-col gap-1'>
            <label className='text-sm font-bold text-gray-600'>
              学びのメモ(任意):
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder='今日はどんなことを学びましたか？'
              className='w-full px-3 py-2 border rounded-md text-sm h-20 resize-none text-gray-900 placeholder-gray-400'
            />
          </div>
          <button
            onClick={handleSaveTimeLog}
            disabled={!minutes}
            className='self-end bg-gray-800 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-gray-900 disabled:bg-gray-300 transition-colors'
          >
            記録を保存する
          </button>
        </div>
      )}
    </li>
  );
}

export default function TaskList({ initialTasks }: { initialTasks: Task[] }) {
  if (initialTasks.length === 0) {
    return (
      <p className='p-6 text-center text-gray-500'>
        タスクがありません。追加してみましょう！
      </p>
    );
  }

  return (
    <ul>
      {initialTasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  );
}
