import { AuthAdapter, Session } from './types';

export class AnonAuthAdapter implements AuthAdapter {
  async getSession(req: Request): Promise<Session> {
    const cookieHeader = req.headers.get('cookie');
    if (!cookieHeader) {
      return { userId: null, role: null };
    }

    const cookies = this.parseCookies(cookieHeader);
    const clientId = cookies.get('np_client');
    
    return {
      userId: clientId || null,
      role: null, // Anonymous users have no role
    };
  }

  async requireAdmin(req: Request): Promise<Session> {
    const cookieHeader = req.headers.get('cookie');
    if (!cookieHeader) {
      throw new Error('Admin access required');
    }

    const cookies = this.parseCookies(cookieHeader);
    const adminPin = cookies.get('admin_pin');
    
    // Check against environment variable
    const expectedPin = process.env.ADMIN_PIN;
    if (!expectedPin || adminPin !== expectedPin) {
      throw new Error('Admin access required');
    }

    return {
      userId: cookies.get('np_client') || null,
      role: 'admin',
    };
  }

  private parseCookies(cookieHeader: string): Map<string, string> {
    const cookies = new Map<string, string>();
    
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies.set(name, decodeURIComponent(value));
      }
    });
    
    return cookies;
  }
}
