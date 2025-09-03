import { NextResponse } from "next/server";
import { sendMail } from "@/server/notify/email";

export async function POST(){
  if(process.env.VERCEL_ENV !== "production") return NextResponse.json({ ok:false, reason:"prod only" }, { status:400 });
  const to = process.env.NOTIFY_TEST_TO || "";
  const from = process.env.NOTIFY_FROM || "NeedPort <noreply@needport.jp>";
  if(!to) return NextResponse.json({ ok:false, reason:"missing NOTIFY_TEST_TO" }, { status:400 });
  try{
    await sendMail({ to, from, subject:"NeedPort notify test", text:"ok" });
    return NextResponse.json({ ok:true });
  }catch(e:any){
    return NextResponse.json({ ok:false, error:String(e?.message||e) }, { status:500 });
  }
}
