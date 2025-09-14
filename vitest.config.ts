import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: [
      'src/**/__tests__/**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      'tests/e2e/**', // Exclude Playwright E2E tests
      'playwright.config.ts',
      'tests/**/*.spec.ts' // Exclude .spec.ts files (Playwright format)
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
