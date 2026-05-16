import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf7',
          100: '#d1faeb',
          500: '#14b884',
          600: '#0d976d',
          700: '#0a7959',
        },
        ink: {
          900: '#101828',
          700: '#344054',
          500: '#667085',
        },
      },
      boxShadow: {
        soft: '0 12px 30px -18px rgba(16, 24, 40, 0.35)',
      },
    },
  },
  plugins: [],
} satisfies Config;
