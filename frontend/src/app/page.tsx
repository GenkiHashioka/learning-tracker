import { hc } from 'hono/client';
import type { AppType } from '../../../backend/src/index';
import TaskForm from '../components/TaskFrom';
import TaskList from '../components/TaskList';

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
              <h2 className='text-xl font-bold text-gray-700'>
                今日の学習予定
              </h2>
            </div>
            <span className='text-sm text-gray-400'>
              {new Date().toLocaleDateString('ja-JP', {
                month: 'long',
                day: 'numeric',
                weekday: 'short',
              })}
            </span>
          </div>
          <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
            <TaskList initialTasks={tasks} />
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
