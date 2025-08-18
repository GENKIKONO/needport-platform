export async function guardedFetch(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);
  if (res.status === 401) {
    // トーストは既存のToastを使用
    window.dispatchEvent(new CustomEvent("toast", { 
      detail: { 
        type: "info", 
        message: "本人確認（メール）が必要です。マイページから引き継ぎしてください。" 
      }
    }));
    setTimeout(() => { window.location.href = "/me"; }, 800);
    throw new Error("Unauthorized");
  }
  if (res.status === 423) {
    window.dispatchEvent(new CustomEvent("toast", { 
      detail: { 
        type: "warning", 
        message: "現在この操作は無効化されています（管理設定）。" 
      }
    }));
    throw new Error("Locked");
  }
  return res;
}
