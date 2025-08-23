import { NextRequest, NextResponse } from 'next/server';
import { VendorSchema } from '@/lib/validation/vendor';

// Simple in-memory storage for demo (replace with database in production)
const vendorStore = new Map<string, any>();
const reviewQueue = new Map<string, any>();
let vendorCounter = 1;

// Rate limiting: 5 minutes per user
const rateLimitStore = new Map<string, number>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = VendorSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        ok: false,
        message: '入力内容に問題があります',
        fieldErrors: validationResult.error.flatten().fieldErrors
      }, { status: 422 });
    }
    
    const data = validationResult.data;
    
    // Rate limiting
    const userIp = request.ip || 'unknown';
    const now = Date.now();
    const lastSubmission = rateLimitStore.get(userIp);
    
    if (lastSubmission && (now - lastSubmission) < 5 * 60 * 1000) {
      return NextResponse.json({
        ok: false,
        message: '送信が頻繁すぎます。5分後に再試行してください。'
      }, { status: 429 });
    }
    
    // Create vendor record
    const vendorId = `vendor-${vendorCounter++}`;
    const vendor = {
      id: vendorId,
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Store vendor (in production, save to database)
    vendorStore.set(vendorId, vendor);
    
    // Add to review queue
    const reviewId = `review-${vendorId}`;
    const review = {
      id: reviewId,
      vendorId: vendorId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      vendor: {
        companyName: vendor.companyName,
        orgType: vendor.orgType,
        email: vendor.email
      }
    };
    reviewQueue.set(reviewId, review);
    
    // Update rate limit
    rateLimitStore.set(userIp, now);
    
    // Clean up old rate limit entries (older than 10 minutes)
    for (const [ip, timestamp] of rateLimitStore.entries()) {
      if (now - timestamp > 10 * 60 * 1000) {
        rateLimitStore.delete(ip);
      }
    }
    
    return NextResponse.json({
      ok: true,
      id: vendorId,
      reviewId: reviewId,
      status: 'pending',
      message: '事業者登録を受け付けました。審査後にご連絡いたします。'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Vendor registration error:', error);
    return NextResponse.json({
      ok: false,
      message: 'サーバーエラーが発生しました。しばらく時間をおいて再試行してください。'
    }, { status: 500 });
  }
}

// GET endpoint for admin to view vendors (optional)
export async function GET() {
  try {
    const vendors = Array.from(vendorStore.values());
    return NextResponse.json({
      ok: true,
      vendors: vendors.map(v => ({
        id: v.id,
        companyName: v.companyName,
        orgType: v.orgType,
        status: v.status,
        createdAt: v.createdAt
      }))
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      message: 'サーバーエラーが発生しました。'
    }, { status: 500 });
  }
}
