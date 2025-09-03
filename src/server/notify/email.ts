import type { EmailRequestOptions } from "resend";
let ResendLib: any; try { ResendLib = require("resend").Resend; } catch {}
const key = process.env.RESEND_API_KEY || "";
const resend = key && ResendLib ? new ResendLib(key) : null;

export async function sendMail(payload: EmailRequestOptions, attempts=3){
  if(!resend) throw new Error("Resend not configured");
  let last: any;
  for(let i=0;i<attempts;i++){
    try{ return await resend.emails.send(payload); }catch(e){ last=e; await new Promise(r=>setTimeout(r, 300*(i+1))); }
  }
  throw last;
}
