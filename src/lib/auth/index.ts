import { AuthAdapter } from './types';
import { AnonAuthAdapter } from './anonAdapter';

let authAdapter: AuthAdapter | null = null;

export function getAuthAdapter(): AuthAdapter {
  if (!authAdapter) {
    const provider = process.env.AUTH_PROVIDER || 'anon';
    
    switch (provider) {
      case 'anon':
        authAdapter = new AnonAuthAdapter();
        break;
      // Future providers can be added here:
      // case 'clerk':
      //   authAdapter = new ClerkAuthAdapter();
      //   break;
      default:
        console.warn(`Unknown auth provider: ${provider}, falling back to anon`);
        authAdapter = new AnonAuthAdapter();
    }
  }
  
  return authAdapter;
}

// Convenience functions
export async function getSession(req: Request) {
  return getAuthAdapter().getSession(req);
}

export async function requireAdmin(req: Request) {
  return getAuthAdapter().requireAdmin(req);
}
