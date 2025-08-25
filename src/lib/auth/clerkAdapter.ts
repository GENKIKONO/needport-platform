// Clerk authentication adapter (for future use)
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export interface UserSession {
  email: string;
  userId: string;
  firstName?: string;
  lastName?: string;
}

export async function readSession(): Promise<UserSession | null> {
  try {
    const { userId } = auth();
    if (!userId) return null;
    
    const user = await currentUser();
    if (!user?.emailAddresses?.[0]?.emailAddress) return null;
    
    return {
      email: user.emailAddresses[0].emailAddress,
      userId: user.id,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
    };
  } catch (error) {
    console.error("Clerk auth error:", error);
    return null;
  }
}

export async function isAuthed(): Promise<boolean> {
  const session = await readSession();
  return !!session;
}

export async function requireAuth(): Promise<UserSession> {
  const session = await readSession();
  if (!session) {
    redirect("/auth/login");
  }
  return session;
}

// For backward compatibility with simple session interface
export function getHost(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "localhost:3000";
}
