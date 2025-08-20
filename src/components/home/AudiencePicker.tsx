export default function AudiencePicker() {
  return (
    <section className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">あなたはどちらですか？</h2>
        <p className="text-gray-600">対象に応じたおすすめコンテンツをご案内します</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { id: 'consumer', label: '生活者の方', description: 'ニーズを探して賛同する' },
          { id: 'vendor', label: '事業者の方', description: 'サービスを提供する' },
          { id: 'gov', label: '自治体の方', description: '地域の課題を解決する' },
          { id: 'ally', label: '支援者の方', description: 'プロジェクトを支援する' }
        ].map((audience) => (
          <button
            key={audience.id}
            className="p-6 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-300 transition-all hover:shadow-md"
          >
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-1">{audience.label}</h3>
              <p className="text-sm text-gray-600">{audience.description}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
