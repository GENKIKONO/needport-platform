import { NextRequest, NextResponse } from 'next/server';
import { fetchPayments } from '@/lib/server/meService';
import { getDevSession } from '@/middleware/session-guard';

export async function GET(request: NextRequest) {
  try {
    const session = getDevSession();
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payments = await fetchPayments(session.id);
    return NextResponse.json(payments);
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' }, 
      { status: 500 }
    );
  }
}
