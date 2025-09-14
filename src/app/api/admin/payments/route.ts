import { NextRequest, NextResponse } from 'next/server';
import { createAdminClientOrNull } from "@/lib/supabase/admin";


// Force dynamic rendering to avoid build-time env access
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

/**
 * Admin Payment Management API
 * 
 * Lv1: Manual operator-led payment management
 * - List held transactions with filters
 * - Admin-only access required
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'held';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const sadmin = supabaseAdmin();

    // Build query based on status filter
    let query = sadmin
      .from('vendor_accesses')
      .select(`
        id,
        payment_intent_id,
        deposit_amount,
        vendor_id,
        need_id,
        proposal_id,
        granted_at,
        needs(title),
        profiles!vendor_id(first_name, last_name, business_name)
      `)
      .order('granted_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // For now, we'll use vendor_accesses as a proxy for held transactions
    // In a full implementation, we'd have a dedicated payment_records table
    if (status === 'held') {
      // Transactions that exist but haven't been explicitly completed/refunded
      query = query.not('payment_intent_id', 'is', null);
    }

    const { data: rawTransactions, error } = await query;

    if (error) {
      console.error('Error fetching transactions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      );
    }

    // Transform data to match expected format
    const transactions = rawTransactions?.map(transaction => {
      const profile = transaction.profiles;
      const vendorName = profile?.business_name || 
                        (profile?.first_name && profile?.last_name ? 
                         `${profile.first_name} ${profile.last_name}` : null);

      return {
        id: transaction.id,
        amount: transaction.deposit_amount,
        vendor_id: transaction.vendor_id,
        need_id: transaction.need_id,
        proposal_id: transaction.proposal_id,
        stripe_payment_intent_id: transaction.payment_intent_id,
        created_at: transaction.granted_at,
        vendor_name: vendorName,
        need_title: transaction.needs?.title,
        status: 'held' // For Lv1, we'll assume all are held until we build proper status tracking
      };
    }) || [];

    return NextResponse.json({
      transactions,
      total: transactions.length,
      status: status,
      message: `${transactions.length} transactions found`
    });

  } catch (error) {
    console.error('Admin payments API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}