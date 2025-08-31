'use client'
export default function ErrorPage(){
  return (
    <main className="min-h-[60vh] grid place-items-center p-8 text-center">
      <div>
        <h1 className="text-2xl font-bold mb-2">エラーが発生しました</h1>
        <p className="text-gray-600 mb-6">時間をおいて再度お試しください。</p>
        <a className="px-4 py-2 rounded bg-blue-600 text-white" href="/">ホームへ</a>
      </div>
    </main>
  );
}
