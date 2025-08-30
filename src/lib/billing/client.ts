export async function startFlatUnlock(needId?: string) {
  const res = await fetch("/api/billing/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ mode: "payment", needId }),
  });
  if (!res.ok) throw new Error("checkout_failed");
  const { url } = await res.json();
  if (url) window.location.href = url;
}

export async function startPhoneSupportSubscription() {
  const res = await fetch("/api/billing/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ mode: "subscription" }),
  });
  if (!res.ok) throw new Error("checkout_failed");
  const { url } = await res.json();
  if (url) window.location.href = url;
}
