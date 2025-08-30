import Link from "next/link";
import { readSession } from "@/lib/simpleSession";
import { PhoneSupportButton } from "@/components/billing/PhoneSupportButton";
import useSWR from "swr";
const fetcher=(u:string)=>fetch(u).then(r=>r.json());

export const dynamic = "force-dynamic";

interface MePageProps {
  searchParams: { t?: string };
}

// Static data for table placeholders
const mockDeals = [
  { id: 1, title: "Webサイト制作", status: "進行中", updatedAt: "2024-01-15" },
  { id: 2, title: "ロゴデザイン", status: "完了", updatedAt: "2024-01-10" },
  { id: 3, title: "アプリ開発", status: "提案中", updatedAt: "2024-01-08" },
];

const mockPayments = [
  { id: "PAY-001", amount: "50,000円", method: "クレジットカード", status: "完了" },
  { id: "PAY-002", amount: "30,000円", method: "銀行振込", status: "処理中" },
];

const mockChats = [
  { thread: "Webサイト制作について", lastMessage: "デザイン案を確認しました", unread: 2 },
  { thread: "ロゴデザイン相談", lastMessage: "修正版を送付します", unread: 0 },
];

export default async function MePage({ searchParams }: MePageProps) {
  const session = await readSession(); // SSR simple session read
  const currentTab = searchParams.t || 'deals';
  
  // Client-side data fetching for entitlements
  const { data } = useSWR('/api/me/entitlements', fetcher);
  const phoneOn = !!data?.entitlements?.phoneSupport;

  if (!session) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">マイページ</h1>
        <p className="mb-4">ログインが必要です。</p>
        <div className="flex gap-3">
          <Link className="px-4 py-2 rounded bg-blue-600 text-white" href="/auth/login">ログイン</Link>
          <Link className="px-4 py-2 rounded border" href="/auth/register">新規登録</Link>
        </div>
      </main>
    );
  }

  const tabs = [
    { key: 'deals', label: '取引', href: '/me?t=deals' },
    { key: 'payments', label: '支払い', href: '/me?t=payments' },
    { key: 'chats', label: 'チャット', href: '/me?t=chats' },
    { key: 'profile', label: 'プロフィール', href: '/me?t=profile' },
  ];

  const renderTabContent = () => {
    switch (currentTab) {
      case 'deals':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">取引履歴</h3>
            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">件名</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">状態</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">更新日</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockDeals.map((deal) => (
                    <tr key={deal.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{deal.title}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          deal.status === '完了' ? 'bg-green-100 text-green-800' :
                          deal.status === '進行中' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {deal.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{deal.updatedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'payments':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">支払い管理</h3>
            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">請求ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">金額</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">方法</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">状態</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{payment.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{payment.amount}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{payment.method}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          payment.status === '完了' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'chats':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">チャット履歴</h3>
            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">スレッド</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">最終メッセージ</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">未読</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockChats.map((chat, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{chat.thread}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{chat.lastMessage}</td>
                      <td className="px-4 py-3 text-sm">
                        {chat.unread > 0 ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                            {chat.unread}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">プロフィール</h3>
            <div className="bg-white rounded-lg border p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">氏名</label>
                  <p className="mt-1 text-sm text-gray-900">{session.name || '未設定'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
                  <p className="mt-1 text-sm text-gray-900">{session.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">アカウントタイプ</label>
                  <p className="mt-1 text-sm text-gray-900">一般ユーザー</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">登録日</label>
                  <p className="mt-1 text-sm text-gray-900">2024年1月</p>
                </div>
                <div className="pt-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    編集（準備中）
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">ようこそ</h1>
        <p className="text-gray-600">{session.email}</p>
      </header>

      {/* タブナビゲーション */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <Link
              key={tab.key}
              href={tab.href}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                currentTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* タブコンテンツ */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>

      {/* クイックリンク */}
      <section className="space-y-2">
        <h2 className="font-semibold">クイックリンク</h2>
        <div className="flex gap-3 flex-wrap">
          <Link className="px-3 py-2 rounded border" href="/needs">ニーズ一覧を見る</Link>
          <Link className="px-3 py-2 rounded border" href="/needs/new">ニーズを投稿する</Link>
        </div>
      </section>

      {/* オプション */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-2">オプション</h2>
        {phoneOn ? (
          <form method="post" action="/api/billing/portal">
            <button className="inline-flex items-center px-4 py-2 rounded bg-slate-700 text-white hover:bg-slate-800">
              お支払いの確認 / 解約（Billing Portal）
            </button>
          </form>
        ) : (
          <PhoneSupportButton />
        )}
      </section>

      {/* ログアウト */}
      <form action="/api/auth/logout" method="post">
        <button className="px-4 py-2 rounded bg-gray-100 border">ログアウト</button>
      </form>
    </main>
  );
}
