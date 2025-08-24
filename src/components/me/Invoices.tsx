'use client';

import Section from './Section';

interface Invoice {
  id: string;
  title: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending';
}

const mockInvoices: Invoice[] = [
  {
    id: '1',
    title: 'ロゴデザイン完了金',
    amount: 150000,
    date: '2024-01-10',
    status: 'paid'
  },
  {
    id: '2',
    title: 'Webサイト制作着手金',
    amount: 50000,
    date: '2024-01-15',
    status: 'pending'
  }
];

export default function Invoices({ userId }: { userId: string }) {
  const handleDownload = (invoiceId: string) => {
    // ダミーPDFダウンロード
    const link = document.createElement('a');
    link.href = '/sample-invoice.pdf';
    link.download = `invoice-${invoiceId}.pdf`;
    link.click();
  };

  return (
    <Section title="領収書・請求書" description="取引の領収書と請求書">
      <div className="space-y-4">
        {mockInvoices.map((invoice) => (
          <div key={invoice.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{invoice.title}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <span>¥{invoice.amount.toLocaleString()}</span>
                  <span>{new Date(invoice.date).toLocaleDateString('ja-JP')}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    invoice.status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {invoice.status === 'paid' ? '支払い完了' : '支払い待ち'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(invoice.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  PDFダウンロード
                </button>
                {invoice.status === 'paid' && (
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                    領収書表示
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {mockInvoices.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>領収書・請求書はありません</p>
          </div>
        )}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">NeedPortレシート（控）について</h4>
        <p className="text-sm text-blue-800">
          取引成立後、NeedPortが発行する正式な領収書です。確定申告や経費精算にご利用いただけます。
        </p>
      </div>
    </Section>
  );
}
