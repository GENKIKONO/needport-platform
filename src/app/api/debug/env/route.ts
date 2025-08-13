import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Production guard - prevent debug endpoints in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Debug endpoints disabled in production' }, { status: 404 });
  }

  try {
    // Only show safe environment variables
    const safeEnv = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '[SET]' : '[NOT SET]',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '[SET]' : '[NOT SET]',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '[SET]' : '[NOT SET]',
      ADMIN_PIN: process.env.ADMIN_PIN ? '[SET]' : '[NOT SET]',
      MAIL_FROM: process.env.MAIL_FROM,
      MAIL_TO_OWNER: process.env.MAIL_TO_OWNER ? '[SET]' : '[NOT SET]',
      SMTP_HOST: process.env.SMTP_HOST ? '[SET]' : '[NOT SET]',
      SMTP_PORT: process.env.SMTP_PORT,
      FF_MAINTENANCE: process.env.FF_MAINTENANCE,
      NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(safeEnv);

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get environment info' },
      { status: 500 }
    );
  }
}
