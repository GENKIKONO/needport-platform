export const runtime = "edge";
export async function GET() {
  if(process.env.CRON_DAILY_DIGEST !== "enabled") return new Response("disabled", { status:204 });
  // ここで未読の集計 → sendMail を複数件
  return new Response("ok");
}
