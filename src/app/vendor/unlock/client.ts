export async function startFlatUnlock() {
  const res = await fetch('/api/billing/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mode: 'payment' }),
  });
  const { url } = await res.json();
  window.location.href = url;
}

export async function startPhoneSupport() {
  const res = await fetch('/api/billing/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ mode: 'subscription' }),
  });
  const { url } = await res.json();
  window.location.href = url;
}
