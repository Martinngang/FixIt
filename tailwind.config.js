/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enables dark mode via class (e.g., adding 'dark' to <html>)
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#F8FAFC', // Light theme background (slate-50)
          dark: '#0F172A', // Dark theme background (slate-950)
        },
        card: {
          DEFAULT: '#FFFFFF', // Light theme card background
          dark: '#1E293B', // Dark theme card background
        },
        foreground: {
          DEFAULT: '#1E293B', // Light theme text (slate-800)
          dark: '#F1F5F9', // Dark theme text (slate-100)
        },
        'muted-foreground': {
          DEFAULT: '#64748B', // Light theme muted text (slate-500)
          dark: '#94A3B8', // Dark theme muted text (slate-400)
        },
        primary: {
          DEFAULT: '#2563EB', // Blue-600 for primary elements
          dark: '#3B82F6', // Blue-500 for dark mode (slightly lighter)
        },
        border: {
          DEFAULT: '#E2E8F0', // Light theme border (slate-200)
          dark: '#334155', // Dark theme border (slate-700)
        },
        muted: {
          DEFAULT: '#F1F5F9', // Light theme muted background (slate-100)
          dark: '#1E293B', // Dark theme muted background (slate-800)
        },
        blue: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        purple: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        green: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        orange: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        yellow: {
          50: '#FEFCE8',
          100: '#FEF9C3',
          200: '#FEF08A',
          400: '#FACC15',
          500: '#EAB308',
          600: '#CA8A04',
          700: '#A16207',
          800: '#854D0E',
          900: '#713F12',
        },
      },
      backgroundImage: {
        'grid-slate-200': "url('/grid-light.svg')",
        'grid-slate-700': "url('/grid-dark.svg')",
      },
      boxShadow: {
        'xl': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        bounce: 'bounce 1s infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}