import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      borderRadius: { 
        md: "8px",
        xl: '14px',
      },
      boxShadow: {
        card: "0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.03)",
        port: '0 10px 30px -10px rgba(14,116,144,.15), 0 2px 8px rgba(0,0,0,.04)',
      },
      colors: {
        brand: { 
          DEFAULT: "#0EA5E9",
          50: "#f0f9ff",
          100: "#e0f2fe", 
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        blue: {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
          400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
          800: '#1e40af', 900: '#1e3a8a',
        },
        emerald: {
          50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7',
          400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857',
          800: '#065f46', 900: '#064e3b',
        },
        amber: {
          50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
          400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
          800: '#92400e', 900: '#78350f',
        },
        harbor:  { 600: '#1E3A8A', 500: '#2646AD', 400: '#3A67E3' },   // 港の深い青
        sea:     { 600: '#0E7490', 500: '#14B8A6', 100: '#E6FFFB' },   // 海〜ターコイズ
        foam:    { 50:  '#F6FBFF' },                                   // 波の泡・薄白
        sand:    { 50:  '#FFF6E6' },                                   // 砂浜の薄ベージュ
        buoy:    { 500: '#F97316' },                                   // ブイのオレンジ
        light:   { 500: '#F43F5E' },                                   // 灯台の赤
      },
      fontFamily: {
        sans: ['system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans JP', 'sans-serif']
      },
      container: {
        center: true,
        padding: '1rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
