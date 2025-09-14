import { NextRequest, NextResponse } from "next/server";
import { createAdminClientOrNull } from "@/lib/supabase/admin";
import { sendMail } from "@/lib/mail/smtp";


// Force dynamic rendering to avoid build-time env access
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name: templateName } = await params;
    const supabase = createAdminClientOrNull();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'SERVICE_UNAVAILABLE', detail: 'Admin env not configured' },
        { status: 503 }
      );
    }
    
    const { data: template, error } = await supabase
      .from('mail_templates')
      .select('*')
      .eq('name', templateName)
      .single();

    if (error || !template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      template
    });

  } catch (error) {
    console.error('Mail template fetch error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name: templateName } = await params;
    const { subject, html } = await request.json();
    
    if (!subject || !html) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createAdminClientOrNull();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'SERVICE_UNAVAILABLE', detail: 'Admin env not configured' },
        { status: 503 }
      );
    }
    
    const { data, error } = await supabase
      .from('mail_templates')
      .update({
        subject,
        html,
        updated_at: new Date().toISOString()
      })
      .eq('name', templateName)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: "Failed to update template" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      template: data
    });

  } catch (error) {
    console.error('Mail template update error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name: templateName } = await params;
    const supabase = createAdminClientOrNull();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'SERVICE_UNAVAILABLE', detail: 'Admin env not configured' },
        { status: 503 }
      );
    }
    
    const { error } = await supabase
      .from('mail_templates')
      .delete()
      .eq('name', templateName);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: "Failed to delete template" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    console.error('Mail template deletion error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
