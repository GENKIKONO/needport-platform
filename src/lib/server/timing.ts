import { AsyncLocalStorage } from 'async_hooks';

interface TimingEntry {
  label: string;
  duration: number;
}

class ServerTiming {
  private storage = new AsyncLocalStorage<TimingEntry[]>();

  measure<T>(fn: () => Promise<T> | T, label: string): Promise<T> {
    const start = performance.now();
    
    return Promise.resolve(fn()).then((result) => {
      const duration = performance.now() - start;
      this.addTiming(label, duration);
      return result;
    });
  }

  private addTiming(label: string, duration: number) {
    const timings = this.storage.getStore();
    if (timings) {
      timings.push({ label, duration });
    }
  }

  getTimings(): TimingEntry[] {
    return this.storage.getStore() || [];
  }

  clearTimings() {
    const timings = this.storage.getStore();
    if (timings) {
      timings.length = 0;
    }
  }

  runWithTiming<T>(fn: () => Promise<T> | T): Promise<T> {
    return this.storage.run([], async () => {
      const result = fn();
      return result instanceof Promise ? result : Promise.resolve(result);
    });
  }

  generateHeader(): string {
    const timings = this.getTimings();
    return timings
      .map(timing => `${timing.label};dur=${timing.duration.toFixed(2)}`)
      .join(', ');
  }
}

// Global instance
const serverTiming = new ServerTiming();

export { serverTiming };

// Helper function for measuring database queries
export async function measureQuery<T>(
  queryFn: () => Promise<T>,
  label: string
): Promise<T> {
  return serverTiming.measure(queryFn, `db-${label}`);
}

// Helper function for measuring API calls
export async function measureApi<T>(
  apiFn: () => Promise<T>,
  label: string
): Promise<T> {
  return serverTiming.measure(apiFn, `api-${label}`);
}

// Helper function for measuring file operations
export async function measureFile<T>(
  fileFn: () => Promise<T>,
  label: string
): Promise<T> {
  return serverTiming.measure(fileFn, `file-${label}`);
}

// Middleware helper
export function createTimingMiddleware() {
  return async (request: Request, next: () => Promise<Response>) => {
    return serverTiming.runWithTiming(async () => {
      const response = await next();
      
      const timings = serverTiming.generateHeader();
      if (timings) {
        response.headers.set('Server-Timing', timings);
      }
      
      return response;
    });
  };
}
