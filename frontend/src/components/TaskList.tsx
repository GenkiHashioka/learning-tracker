'use client';

import { hc } from 'hono/client';
import { AppType } from '../../../backend/src/index.js';
import { useRouter } from 'next/navigation';

const client = hc<AppType>('http://localhost:3001');

// page.tsxから受け取るタスク一覧の型
type Task = {
  id: number;
  title: string;
  status: string | null;
  tagName: string | null;
};

export default function TaskList({ initialTasks }: { initialTasks: Task[] }) {
  const router = useRouter();

  // プルダウンが変更された時に呼ばれる関数
  const handleStatusChange = async (taskId: number, newStatus: string) => {
    await client.api.tasks[':id'].$patch({
      param: { id: taskId.toString() },
      json: { status: newStatus as 'todo' | 'in_progress' | 'done' },
    });

    // 画面をリロードして最新のタスク一覧を取得する
    router.refresh();
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

  if (initialTasks.length === 0) {
    return (
      <p className='p-6 text-center text-gray-500'>
        タスクがありません。追加してみましょう！
      </p>
    );
  }

  return (
    <ul className='divide-y divide-gray-100'>
      {initialTasks.map((task) => {
        // 現在のステータス設定を取得
        const currentStatus =
          (task.status as keyof typeof statusConfig) || 'todo';
        const config = statusConfig[currentStatus];

        return (
          <li
            key={task.id}
            className='p-4 flex items-center justify-between hover:bg-gray-50'
          >
            <div className='flex items-center gap-3'>
              <span className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-mono'>
                {task.tagName || 'タグなし'}
              </span>

              {/* 完了したタスクは取り消し線を引いて文字をうすくする */}
              <span
                className={`text-gray-800 font-medium ${currentStatus === 'done' ? 'line-through text-gray-400' : ''}`}
              >
                {task.title}
              </span>
            </div>

            {/* ステータス変更のプルダウン */}
            <select
              value={currentStatus}
              onChange={(e) => {
                handleStatusChange(task.id, e.target.value);
              }}
              className={`text-sm font-medium px-3 py-1.5 rounded-lg border focus:outline-none cursor-pointer transition-colors ${config.color}`}
            >
              <option value='todo'>未着手</option>
              <option value='in_progress'>進行中</option>
              <option value='done'>完了</option>
            </select>
          </li>
        );
      })}
    </ul>
  );
}
