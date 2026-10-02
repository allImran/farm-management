import type { Config } from 'tailwindcss'

export default {
  content: [
    './app.vue',
    './error.vue',
    './app/**/*.{js,vue,ts}',
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fffceb',
          100: '#fff6c7',
          200: '#ffe985',
          300: '#ffd94d',
          400: '#ffca1f',
          500: '#f5b700',
          600: '#d69900',
          700: '#ab7500',
          800: '#8a5d08',
          900: '#734c0d',
          950: '#432802',
        },
        accent: {
          blue: '#3b6ef6',
          green: '#22c55e',
          purple: '#8b6cf2',
          yellow: '#f5b700',
          red: '#ef4444',
        },
        surface: {
          light: '#f6f7fb',
          DEFAULT: '#ffffff',
          dark: '#0f1320',
          'dark-elevated': '#171c2c',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(16, 24, 40, 0.06), 0 1px 2px -1px rgba(16, 24, 40, 0.04)',
        card: '0 4px 16px -4px rgba(16, 24, 40, 0.08), 0 2px 6px -2px rgba(16, 24, 40, 0.04)',
        popover: '0 12px 32px -8px rgba(16, 24, 40, 0.16), 0 4px 12px -4px rgba(16, 24, 40, 0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.25s ease-out',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
