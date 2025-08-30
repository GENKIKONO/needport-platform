export default function Page(){
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">決済がキャンセルされました</h1>
        <p className="text-gray-600">決済は完了しませんでした。必要であれば再度お試しください。</p>
      </div>
    </main>
  );
}
