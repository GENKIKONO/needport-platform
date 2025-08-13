import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    
    const { data: templates, error } = await supabase
      .from('mail_templates')
      .select('*')
      .order('name');

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: "Failed to fetch templates" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      templates: templates || []
    });

  } catch (error) {
    console.error('Mail templates fetch error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, subject, html } = await request.json();
    
    if (!name || !subject || !html) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    
    const { data, error } = await supabase
      .from('mail_templates')
      .insert({
        name,
        subject,
        html,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: "Failed to create template" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      template: data
    });

  } catch (error) {
    console.error('Mail template creation error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
