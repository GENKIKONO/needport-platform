export type Deal = { 
  id: string; 
  title: string; 
  status: 'progress' | 'done' | 'canceled'; 
  updatedAt: string; 
  amount?: number;
  counterpart?: string;
};

export type Payment = { 
  id: string; 
  method: 'card' | 'bank'; 
  status: 'pending' | 'paid' | 'failed'; 
  amount: number; 
  issuedAt: string;
  description?: string;
};

export type Invoice = { 
  id: string; 
  pdfUrl: string; 
  title: string; 
  amount: number; 
  issuedAt: string;
  status: 'paid' | 'pending';
};

export type ChatRoom = { 
  id: string; 
  needId?: string; 
  title: string; 
  lastMessage?: string; 
  updatedAt: string;
  participantCount?: number;
};
