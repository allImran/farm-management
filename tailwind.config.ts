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
        // "Inferno"-style ramp used by thermal-imaging visuals (cold → hot).
        thermal: {
          50: '#fcffa4',
          100: '#f9e46a',
          200: '#f9cb35',
          300: '#f98e09',
          400: '#e45a31',
          500: '#bc3754',
          600: '#87216b',
          700: '#57106e',
          800: '#320a5e',
          900: '#1b0c41',
          950: '#07051a',
        },
      },
      backgroundImage: {
        // Hero backdrop for detail pages, built from the primary (brand yellow) ramp. Light mode
        // pairs with dark text (like primary buttons); dark mode sinks into surface-dark-elevated.
        hero:
          'radial-gradient(circle at 90% 0%, rgba(255, 255, 255, 0.45) 0%, transparent 45%), linear-gradient(135deg, #f5b700 0%, #ffca1f 50%, #ffd94d 100%)',
        'hero-dark':
          'radial-gradient(circle at 90% 0%, rgba(255, 202, 31, 0.18) 0%, transparent 45%), linear-gradient(135deg, #734c0d 0%, #432802 45%, #171c2c 100%)',
        'thermal-body':
          'radial-gradient(circle at center, #f9cb35 0%, #f98e09 18%, #e45a31 36%, #bc3754 52%, rgba(135, 33, 107, 0.5) 66%, transparent 74%)',
        'thermal-body-hot':
          'radial-gradient(circle at center, #ffffff 0%, #fcffa4 24%, #f9cb35 38%, #f98e09 52%, #e45a31 64%, rgba(188, 55, 84, 0.6) 74%, transparent 80%)',
        'thermal-floor':
          'radial-gradient(ellipse at 50% 110%, #57106e 0%, #320a5e 35%, #1b0c41 65%, #07051a 100%)',
        'thermal-scale': 'linear-gradient(to right, #1b0c41, #57106e, #bc3754, #f98e09, #f9cb35, #fcffa4)',
        'scan-beam':
          'linear-gradient(to bottom, transparent 0%, rgba(252, 255, 164, 0.08) 60%, rgba(252, 255, 164, 0.45) 98%, transparent 100%)',
        'grid-faint':
          'linear-gradient(to right, rgba(255, 255, 255, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.06) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '2rem 2rem',
      },
      fontFamily: {
        // Hind Siliguri supplies Bengali glyphs that Plus Jakarta Sans lacks.
        sans: ['"Plus Jakarta Sans"', '"Hind Siliguri"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
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
        scan: 'scan 4.5s ease-in-out infinite',
        breathe: 'breathe 3.5s ease-in-out infinite',
        drift: 'drift 18s ease-in-out infinite',
        wander: 'wander 10s ease-in-out infinite',
        dash: 'dash 24s linear infinite',
        reveal: 'slideUp 0.7s ease-out both',
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
        scan: {
          '0%': { top: '-25%' },
          '100%': { top: '100%' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.85' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(4%, -6%) scale(1.05)' },
          '66%': { transform: 'translate(-5%, 4%) scale(0.97)' },
        },
        wander: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '30%': { transform: 'translate(10px, -6px)' },
          '65%': { transform: 'translate(-8px, 8px)' },
        },
        dash: {
          to: { strokeDashoffset: '-400' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
