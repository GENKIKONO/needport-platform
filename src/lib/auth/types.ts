export type Session = {
  userId?: string | null;
  role?: 'admin' | 'user' | null;
};

export interface AuthAdapter {
  getSession(req: Request): Promise<Session>;
  requireAdmin(req: Request): Promise<Session>; // throws if not admin
}
