
// Force dynamic rendering to avoid build-time env access
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = "edge"; // 軽いので edge でOK

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = `${url.protocol}//${url.host}`;

  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") || "";
  if (secret && auth !== `Bearer ${secret}`) {
    return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), { status: 401 });
  }

  const paths = [
    "/api/admin/cron/close-expired",
    "/api/admin/cron/lifecycle-reminders",
    "/api/admin/jobs/threshold/run",
    "/api/admin/jobs/moderations/notify"
  ];

  const results = await Promise.all(
    paths.map(async (p) => {
      try {
        const res = await fetch(origin + p, { method: "POST", headers: { "Content-Type": "application/json" } });
        return { path: p, ok: res.ok, status: res.status };
      } catch (e) {
        return { path: p, ok: false, status: 0, error: (e as Error).message };
      }
    })
  );

  const ok = results.every(r => r.ok);
  return new Response(JSON.stringify({ ok, summary: results }, null, 2), {
    status: ok ? 200 : 500,
    headers: { "content-type": "application/json" }
  });
}
