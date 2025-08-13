import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const report = await request.json();
    
    // Log CSP violation to database
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from('server_logs')
      .insert({
        level: 'warn',
        route: '/api/csp/report',
        message: 'CSP Violation',
        meta: {
          type: 'csp_violation',
          report: report,
          user_agent: request.headers.get('user-agent'),
          ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
              request.headers.get('x-real-ip') || 
              'unknown'
        }
      });

    if (error) {
      console.error('Failed to log CSP violation:', error);
    }

    // Always return 204 No Content for CSP reports
    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error('CSP report error:', error);
    return new NextResponse(null, { status: 204 });
  }
}

export async function GET() {
  // Return recent reports (for debugging)
  const supabase = createAdminClient();
  
  const { data: reports } = await supabase
    .from('server_logs')
    .select('*')
    .eq('meta->type', 'csp_violation')
    .order('created_at', { ascending: false })
    .limit(10);

  return NextResponse.json({
    reports: reports || [],
    total: reports?.length || 0
  });
}
