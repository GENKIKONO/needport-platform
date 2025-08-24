import { NextRequest, NextResponse } from 'next/server';
import { fetchInvoices } from '@/lib/server/meService';
import { getDevSession } from '@/middleware/session-guard';

export async function GET(request: NextRequest) {
  try {
    const session = getDevSession();
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invoices = await fetchInvoices(session.id);
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Failed to fetch invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' }, 
      { status: 500 }
    );
  }
}
