import { getAuth } from "@clerk/nextjs/server";

export function getUserIdFromRequest(req: Request | any): string | null {
  try {
    const { userId } = getAuth(req as any) || {};
    return userId ?? null;
  } catch {
    return null;
  }
}
