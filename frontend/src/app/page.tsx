import { hc } from 'hono/client';
import type { AppType } from '../../../backend/src/index';
import TaskForm from '../components/TaskFrom';

const client = hc<AppType>('http://localhost:3001');

export default async function Home() {
  // カテゴリとタスクの両方のデータを並列で取得する
  const [categoriesRes, tasksRes] = await Promise.all([
    client.api.categories.$get(),
    client.api.tasks.$get(),
  ]);

  const categories = await categoriesRes.json();
  const tasks = await tasksRes.json();

  return (
    <main className='min-h-screen bg-gray-50 p-8'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold text-gray-800 mb-8'>
          学習ダッシュボード
        </h1>

        <TaskForm categories={categories} />

        <section className='mb-12'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <div className='w-1 h-7 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full' />
              <h2 className='text-xl font-bold text-gray-700'>今日の学習予定</h2>
            </div>
            <span className='text-sm text-gray-400'>
              {new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}
            </span>
          </div>
          <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
            {tasks.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 text-gray-400'>
                <svg className='w-10 h-10 mb-3 opacity-40' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
                </svg>
                <p className='text-sm'>タスクがありません。追加してみましょう！</p>
              </div>
            ) : (
              <ul>
                {tasks.map((task, index) => {
                  const statusStyles: Record<string, string> = {
                    todo: 'bg-blue-50 text-blue-600',
                    in_progress: 'bg-amber-50 text-amber-600',
                    done: 'bg-emerald-50 text-emerald-600',
                  };
                  const borderStyles: Record<string, string> = {
                    todo: 'border-blue-300',
                    in_progress: 'border-amber-300',
                    done: 'border-emerald-300',
                  };
                  const statusLabel: Record<string, string> = {
                    todo: '未着手',
                    in_progress: '進行中',
                    done: '完了',
                  };
                  return (
                    <li
                      key={task.id}
                      className={`flex items-center justify-between px-5 py-4 border-l-4 ${borderStyles[task.status ?? ''] ?? 'border-gray-200'} ${index !== 0 ? 'border-t border-t-gray-100' : ''} hover:bg-gray-50 transition-colors`}
                    >
                      <div className='flex items-center gap-3'>
                        <span className='px-2.5 py-1 bg-indigo-50 text-indigo-500 text-xs rounded-full font-medium'>
                          {task.tagName || 'タグなし'}
                        </span>
                        <span className='text-gray-800 font-medium'>{task.title}</span>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[task.status ?? ''] ?? 'bg-gray-100 text-gray-600'}`}>
                        {statusLabel[task.status ?? ''] ?? task.status}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {categories.map((category) => (
            <div
              key={category.id}
              className='bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow'
            >
              <h2 className='text-xl font-semibold text-gray-700 mb-4'>
                {category.name}
              </h2>

              <div className='flex flex-wrap gap-2'>
                {category.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className='px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full font-medium'
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
