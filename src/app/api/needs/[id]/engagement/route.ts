// src/app/api/needs/[id]/engagement/route.ts
// Engagement API for collective demand (interest/pledge/anonymous)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import crypto from 'crypto';
import { getRequestId, logWithRequestId } from '@/lib/request-id';

// Engagement kind validation
const EngagementSchema = z.object({
  kind: z.enum(['interest', 'pledge']),
});

// Generate anonymous key for unauthenticated users
function generateAnonKey(ip: string, userAgent: string): string {
  const salt = process.env.ANON_SALT || 'needport-anonymous-engagement-salt-change-in-production-12345';
  const payload = ip + userAgent + salt;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

// Get client IP address from various headers
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = request.headers.get('x-client-ip');
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  if (realIP) return realIP;
  if (clientIP) return clientIP;
  
  // Fallback for development
  return '127.0.0.1';
}

interface RouteParams {
  params: { id: string };
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  const requestId = getRequestId(request);
  
  try {
    const needId = params.id;
    
    // Validate request body
    const body = await request.json();
    const validatedBody = EngagementSchema.parse(body);
    const { kind } = validatedBody;

    const supabase = createClient();
    const { userId } = auth();

    // Check if need exists
    const { data: need, error: needError } = await supabase
      .from('needs')
      .select('id, title, published')
      .eq('id', needId)
      .single();

    if (needError || !need) {
      return NextResponse.json(
        { error: 'Need not found' },
        { status: 404 }
      );
    }

    // Only allow engagement with published needs
    if (!need.published) {
      return NextResponse.json(
        { error: 'Can only engage with published needs' },
        { status: 400 }
      );
    }

    if (userId) {
      // Authenticated user: upsert to need_engagements
      const { data: existingEngagement, error: checkError } = await supabase
        .from('need_engagements')
        .select('id')
        .eq('need_id', needId)
        .eq('user_id', userId)
        .eq('kind', kind)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 = no rows found, which is fine
        throw checkError;
      }

      if (existingEngagement) {
        // Toggle: remove existing engagement
        const { error: deleteError } = await supabase
          .from('need_engagements')
          .delete()
          .eq('id', existingEngagement.id);

        if (deleteError) throw deleteError;

        return NextResponse.json({
          success: true,
          action: 'removed',
          kind,
          user_id: userId,
        });
      } else {
        // Create new engagement
        const { data: newEngagement, error: insertError } = await supabase
          .from('need_engagements')
          .insert({
            need_id: needId,
            user_id: userId,
            kind,
          })
          .select('id, created_at')
          .single();

        if (insertError) throw insertError;

        return NextResponse.json({
          success: true,
          action: 'added',
          kind,
          user_id: userId,
          engagement: newEngagement,
        });
      }
    } else {
      // Anonymous user: only 'interest' allowed, store in need_anonymous_interest
      if (kind !== 'interest') {
        return NextResponse.json(
          { error: 'Anonymous users can only express interest' },
          { status: 400 }
        );
      }

      const ip = getClientIP(request);
      const userAgent = request.headers.get('user-agent') || '';
      const anonKey = generateAnonKey(ip, userAgent);
      const today = new Date().toISOString().split('T')[0];

      // Check rate limiting
      const rateLimit = parseInt(process.env.ANON_RATE_LIMIT || '10', 10);
      const { count: todayCount, error: countError } = await supabase
        .from('need_anonymous_interest')
        .select('*', { count: 'exact', head: true })
        .eq('anon_key', anonKey)
        .eq('day', today);

      if (countError) throw countError;

      if ((todayCount || 0) >= rateLimit) {
        return NextResponse.json(
          { error: 'Rate limit exceeded for anonymous engagement' },
          { status: 429 }
        );
      }

      // Try to insert anonymous interest
      const { data: anonInterest, error: anonError } = await supabase
        .from('need_anonymous_interest')
        .insert({
          need_id: needId,
          anon_key: anonKey,
          day: today,
        })
        .select('id, created_at')
        .single();

      if (anonError) {
        // Handle unique constraint violation as idempotent operation
        if (anonError.code === '23505') {
          return NextResponse.json({
            success: true,
            action: 'already_exists',
            kind: 'interest',
            anonymous: true,
          });
        }
        throw anonError;
      }

      return NextResponse.json({
        success: true,
        action: 'added',
        kind: 'interest',
        anonymous: true,
        engagement: anonInterest,
      });
    }

  } catch (error: any) {
    logWithRequestId(requestId, 'error', 'Error in engagement POST:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.errors },
        { status: 400, headers: { 'X-Request-ID': requestId } }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'X-Request-ID': requestId } }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const needId = params.id;
    const supabase = createClient();

    // Check if need exists
    const { data: need, error: needError } = await supabase
      .from('needs')
      .select('id, title, published')
      .eq('id', needId)
      .single();

    if (needError || !need) {
      return NextResponse.json(
        { error: 'Need not found' },
        { status: 404 }
      );
    }

    // Get authenticated engagement counts
    const { data: engagementCounts, error: engError } = await supabase
      .from('need_engagements')
      .select('kind')
      .eq('need_id', needId);

    if (engError) throw engError;

    // Count by kind
    const interestUsers = engagementCounts.filter(e => e.kind === 'interest').length;
    const pledgeUsers = engagementCounts.filter(e => e.kind === 'pledge').length;

    // Get anonymous interest counts
    const today = new Date().toISOString().split('T')[0];

    // Today's anonymous interest
    const { count: anonInterestToday, error: anonTodayError } = await supabase
      .from('need_anonymous_interest')
      .select('*', { count: 'exact', head: true })
      .eq('need_id', needId)
      .eq('day', today);

    if (anonTodayError) throw anonTodayError;

    // Total anonymous interest
    const { count: anonInterestTotal, error: anonTotalError } = await supabase
      .from('need_anonymous_interest')
      .select('*', { count: 'exact', head: true })
      .eq('need_id', needId);

    if (anonTotalError) throw anonTotalError;

    return NextResponse.json({
      need_id: needId,
      need_title: need.title,
      interest_users: interestUsers,
      pledge_users: pledgeUsers,
      anon_interest_today: anonInterestToday || 0,
      anon_interest_total: anonInterestTotal || 0,
      last_updated: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Error in engagement GET:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}