import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";


// Force dynamic rendering to avoid build-time env access
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Generate a secure random token
    const token = randomBytes(32).toString('hex');
    
    const response = NextResponse.json({ token });
    
    // Set CSRF token in httpOnly cookie
    response.cookies.set('csrf_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 15, // 15 minutes
    });
    
    return response;
    
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json(
      { error: "Failed to generate CSRF token" },
      { status: 500 }
    );
  }
}
