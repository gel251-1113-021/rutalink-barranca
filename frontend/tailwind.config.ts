import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        rutalink: {
          dark: '#121417',
          surface: '#1A1D21',
          surfaceLight: '#24282F',
          border: '#2E333D',
          accent: '#2563EB',
          accentHover: '#1D4ED8',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          muted: '#94A3B8'
        }
      },
    },
  },
  plugins: [],
};
export default config;
