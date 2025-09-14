import { NextResponse } from "next/server";
import { createAdminClientOrNull } from "@/lib/supabase/admin";
import { jsonOk, jsonError } from "@/lib/api";
import { sendMail } from "@/lib/mailer";
import { digestMail } from "@/emails/digest";


// Force dynamic rendering to avoid build-time env access
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const date = body.date || new Date().toISOString().split('T')[0];
    
    const admin = createAdminClientOrNull();
    
    if (!admin) {
      return NextResponse.json(
        { error: 'SERVICE_UNAVAILABLE', detail: 'Admin env not configured' },
        { status: 503 }
      );
    }
    
    // Get stats for the date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Count new items
    const [
      { count: newNeeds },
      { count: newOffers },
      { count: newEntries }
    ] = await Promise.all([
      admin.from("needs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfDay.toISOString())
        .lte("created_at", endOfDay.toISOString()),
      admin.from("offers")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfDay.toISOString())
        .lte("created_at", endOfDay.toISOString()),
      admin.from("entries")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfDay.toISOString())
        .lte("created_at", endOfDay.toISOString())
    ]);
    
    // Get top needs by new entries
    const { data: topNeeds } = await admin
      .from("needs")
      .select(`
        id,
        title,
        entries!inner(count)
      `)
      .gte("entries.created_at", startOfDay.toISOString())
      .lte("entries.created_at", endOfDay.toISOString())
      .order("entries(count)", { ascending: false })
      .limit(5);
    
    // Get needs nearing deadline
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const { data: nearingDeadlines } = await admin
      .from("needs")
      .select("id, title, deadline")
      .not("deadline", "is", null)
      .lte("deadline", sevenDaysFromNow.toISOString().split('T')[0])
      .eq("recruitment_closed", false)
      .not("adopted_offer_id", "is", null)
      .order("deadline", { ascending: true })
      .limit(10);
    
    // Build digest stats
    const stats = {
      date,
      newNeeds: newNeeds || 0,
      newOffers: newOffers || 0,
      newEntries: newEntries || 0,
      topNeeds: (topNeeds || []).map(need => ({
        id: need.id,
        title: need.title,
        newEntries: need.entries?.reduce((sum: number, entry: any) => sum + entry.count, 0) || 0
      })),
      nearingDeadlines: (nearingDeadlines || []).map(need => {
        const daysLeft = Math.ceil((new Date(need.deadline!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return {
          id: need.id,
          title: need.title,
          deadline: need.deadline!,
          daysLeft
        };
      })
    };
    
    // Generate and send email
    const emailContent = digestMail(stats);
    
    // Build recipients
    const globalRecipients = process.env.NP_NOTIFY_TO?.split(',').map(e => e.trim()).filter(Boolean) || [];
    const bccRecipients = process.env.NP_NOTIFY_BCC?.split(',').map(e => e.trim()).filter(Boolean) || [];
    
    if (globalRecipients.length === 0) {
      return jsonError("No recipients configured for digest", 400);
    }
    
    await sendMail({
      to: globalRecipients,
      bcc: bccRecipients,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });
    
    return jsonOk({
      message: "Digest sent successfully",
      stats,
      recipients: globalRecipients.length
    });
    
  } catch (error: any) {
    return jsonError(error?.message ?? "Failed to send digest", 500);
  }
}
