import { ErrorMessages } from "@/lib/ui/messages";

export async function guardedFetch(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);
  if (!res.ok) {
    const msg = (ErrorMessages as any)[res.status] ?? ErrorMessages.default;
    const type = res.status === 401 ? "info" : (res.status === 429 ? "warning" : "error");
    window.dispatchEvent(new CustomEvent("toast", { 
      detail: { 
        type, 
        message: msg 
      }
    }));
    if (res.status === 401) setTimeout(() => { location.href = "/me"; }, 800);
    throw new Error(`${res.status}`);
  }
  return res;
}
