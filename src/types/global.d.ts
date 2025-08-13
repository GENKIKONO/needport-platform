// Global type declarations for missing modules

declare module 'remark' {
  export function remark(): any;
}

declare module 'remark-html' {
  const html: any;
  export default html;
}

declare module '@line/bot-sdk' {
  export const line: any;
}

declare module '@sentry/nextjs' {
  export const Sentry: any;
}

declare module 'next-intl' {
  export function useTranslations(): any;
}

declare module 'next-intl/server' {
  export function getRequestConfig(config: any): any;
}

declare module 'vitest' {
  export const describe: any;
  export const it: any;
  export const expect: any;
  export const vi: any;
  export const beforeEach: any;
}

declare module 'vitest/config' {
  export function defineConfig(config: any): any;
}

declare module '@axe-core/playwright' {
  export class AxeBuilder {
    constructor();
    analyze(): Promise<any>;
  }
}

// Global window extensions
declare global {
  interface Window {
    trackView?: () => void;
    reportError?: (error: Error, path?: string) => void;
  }
}

export {};
