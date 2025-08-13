import { NextRequest, NextResponse } from "next/server";
import { verify } from "@/lib/security/hmac";

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-needport-signature");
    const hookSecret = process.env.HOOK_SECRET;
    
    if (!signature || !hookSecret) {
      return NextResponse.json(
        { error: "Missing signature or secret" },
        { status: 400 }
      );
    }
    
    const body = await request.text();
    
    // Verify the signature
    const isValid = verify({
      payload: body,
      signature,
      secret: hookSecret,
      toleranceSec: 300, // 5 minutes
    });
    
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }
    
    // Process the webhook payload
    const payload = JSON.parse(body);
    
    // Example processing logic
    console.log("Webhook received:", {
      event: payload.event,
      timestamp: new Date().toISOString(),
      data: payload.data,
    });
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
      event: payload.event,
    });
    
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
