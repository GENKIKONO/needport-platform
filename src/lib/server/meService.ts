import { Deal, Payment, Invoice, ChatRoom } from '@/lib/types/me';

// TODO: 将来は外部API（Supabase/Stripe等）へ差し替え
// 現在は in-memory モックデータ

const mockDeals: Deal[] = [
  {
    id: 'D-101',
    title: 'テスト案件A',
    status: 'progress',
    updatedAt: '2024-01-15T10:30:00Z',
    amount: 50000,
    counterpart: '株式会社サンプル'
  },
  {
    id: 'D-102', 
    title: 'テスト案件B',
    status: 'done',
    updatedAt: '2024-01-10T14:20:00Z',
    amount: 75000,
    counterpart: '個人事業主 田中'
  },
  {
    id: 'D-103',
    title: 'テスト案件C', 
    status: 'canceled',
    updatedAt: '2024-01-05T09:15:00Z',
    amount: 30000,
    counterpart: '合同会社テスト'
  }
];

const mockPayments: Payment[] = [
  {
    id: 'P-001',
    method: 'bank',
    status: 'paid',
    amount: 50000,
    issuedAt: '2024-01-15T10:30:00Z',
    description: '着手金'
  },
  {
    id: 'P-002',
    method: 'card',
    status: 'pending',
    amount: 25000,
    issuedAt: '2024-01-20T16:45:00Z',
    description: '中間金'
  }
];

const mockInvoices: Invoice[] = [
  {
    id: 'INV-001',
    pdfUrl: '/sample-invoice.pdf',
    title: 'NeedPort レシート（控）',
    amount: 50000,
    issuedAt: '2024-01-15T10:30:00Z',
    status: 'paid'
  },
  {
    id: 'INV-002',
    pdfUrl: '/sample-invoice.pdf',
    title: 'NeedPort レシート（控）',
    amount: 25000,
    issuedAt: '2024-01-20T16:45:00Z',
    status: 'pending'
  }
];

const mockChatRooms: ChatRoom[] = [
  {
    id: 'C-001',
    needId: 'N-101',
    title: 'テスト案件A のチャット',
    lastMessage: 'ありがとうございます。進捗をお待ちしています。',
    updatedAt: '2024-01-15T10:30:00Z',
    participantCount: 3
  },
  {
    id: 'C-002',
    needId: 'N-102',
    title: 'テスト案件B のチャット',
    lastMessage: '完了しました。お疲れ様でした。',
    updatedAt: '2024-01-10T14:20:00Z',
    participantCount: 2
  }
];

export async function fetchDeals(userId: string): Promise<Deal[]> {
  // TODO: 将来は Supabase から取得
  // const { data, error } = await supabase
  //   .from('deals')
  //   .select('*')
  //   .eq('user_id', userId)
  //   .order('updated_at', { ascending: false });
  
  // if (error) throw new Error(`Failed to fetch deals: ${error.message}`);
  // return data || [];
  
  // 現在はモックデータ
  await new Promise(resolve => setTimeout(resolve, 100)); // 擬似遅延
  return mockDeals;
}

export async function fetchPayments(userId: string): Promise<Payment[]> {
  // TODO: 将来は Stripe API から取得
  // const payments = await stripe.paymentIntents.list({
  //   customer: userId,
  //   limit: 100
  // });
  
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockPayments;
}

export async function fetchInvoices(userId: string): Promise<Invoice[]> {
  // TODO: 将来は PDF生成サービス + S3 から取得
  // const invoices = await generateInvoices(userId);
  
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockInvoices;
}

export async function fetchChatRooms(userId: string): Promise<ChatRoom[]> {
  // TODO: 将来は Supabase から取得
  // const { data, error } = await supabase
  //   .from('chat_rooms')
  //   .select('*')
  //   .contains('participants', [userId])
  //   .order('updated_at', { ascending: false });
  
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockChatRooms;
}
