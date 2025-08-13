import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMail } from "@/lib/mail/smtp";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name: templateName } = await params;
    const supabase = createAdminClient();
    
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

    const supabase = createAdminClient();
    
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
    const supabase = createAdminClient();
    
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
