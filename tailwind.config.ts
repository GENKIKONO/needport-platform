import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:'#eef2ff',100:'#e0e7ff',200:'#c7d2fe',300:'#a5b4fc',
          400:'#818cf8',500:'#6366f1',600:'#3b82f6',700:'#4338ca',
          800:'#3730a3',900:'#312e81',
        },
      },
      borderRadius: {
        xl: '14px',
      },
      container: {
        center: true,
        padding: '1rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
