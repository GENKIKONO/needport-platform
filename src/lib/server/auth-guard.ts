import { NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';

export interface AuthGuardResult {
  success: boolean;
  userId?: string;
  error?: string;
  statusCode?: number;
}

export interface VerificationRequirements {
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

/**
 * Enhanced auth guard that checks Clerk authentication and verification status
 */
export async function requireAuth(
  req: NextRequest,
  requirements: VerificationRequirements = {}
): Promise<AuthGuardResult> {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required',
        statusCode: 401
      };
    }

    // If no verification requirements, just return success
    if (!requirements.emailVerified && !requirements.phoneVerified) {
      return {
        success: true,
        userId
      };
    }

    // Get user verification status from Clerk
    const { clerkClient } = await import('@clerk/nextjs/server');
    
    try {
      const user = await clerkClient.users.getUser(userId);
      
      // Check email verification
      if (requirements.emailVerified) {
        const hasVerifiedEmail = user.emailAddresses.some(email => email.verification?.status === 'verified');
        if (!hasVerifiedEmail) {
          return {
            success: false,
            error: 'Email verification required',
            statusCode: 403
          };
        }
      }

      // Check phone verification
      if (requirements.phoneVerified) {
        const hasVerifiedPhone = user.phoneNumbers.some(phone => phone.verification?.status === 'verified');
        if (!hasVerifiedPhone) {
          return {
            success: false,
            error: 'Phone verification required',
            statusCode: 403
          };
        }
      }

      return {
        success: true,
        userId
      };

    } catch (clerkError) {
      console.error('Error fetching user from Clerk:', clerkError);
      return {
        success: false,
        error: 'Authentication service error',
        statusCode: 500
      };
    }

  } catch (error) {
    console.error('Auth guard error:', error);
    return {
      success: false,
      error: 'Internal authentication error',
      statusCode: 500
    };
  }
}

/**
 * Check if user is verified for critical actions (purchase, propose)
 */
export async function requireFullVerification(req: NextRequest): Promise<AuthGuardResult> {
  return requireAuth(req, {
    emailVerified: true,
    phoneVerified: true
  });
}

/**
 * Middleware helper to return proper response for auth failures
 */
export function createAuthErrorResponse(result: AuthGuardResult): Response {
  return new Response(
    JSON.stringify({
      error: result.error,
      code: result.statusCode === 403 ? 'VERIFICATION_REQUIRED' : 'AUTHENTICATION_REQUIRED'
    }),
    {
      status: result.statusCode || 401,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}
