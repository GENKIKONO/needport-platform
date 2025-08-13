export function checkDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

export function guardDestructiveAction(): { allowed: boolean; message?: string } {
  if (checkDemoMode()) {
    return {
      allowed: false,
      message: "デモモード中は破壊的な操作は許可されません",
    };
  }
  return { allowed: true };
}
