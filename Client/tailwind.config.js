/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef2f8',
          100: '#d4e0ec',
          200: '#a9c0d9',
          300: '#7ea0c6',
          400: '#5480b3',
          500: '#2a60a0',
          600: '#1a4880',
          700: '#0a2540', // Primary navy color
          800: '#081c32',
          900: '#051425',
        },
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Primary orange/accent color
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
      },
      spacing: {
        '8.5': '34px',
      },
      animation: {
        'slide-down': 'slideDown 0.2s ease-out',
        'spin-slow': 'spin 1s linear infinite',
      },
      keyframes: {
        slideDown: {
          from: {
            opacity: '0',
            transform: 'translateY(-8px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(10,37,64,0.08)',
        'medium': '0 4px 12px rgba(10,37,64,0.12)',
        'hard': '0 8px 24px rgba(10,37,64,0.15)',
        'xl-soft': '0 20px 40px rgba(10,37,64,0.12)',
      },
      fontSize: {
        'xxs': '0.625rem', // 10px
      },
      borderRadius: {
        'xl': '0.75rem', // 12px
        '2xl': '1rem',   // 16px
      },
      transitionTimingFunction: {
        'soft': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
      },
      zIndex: {
        '9999': '9999',
        '99999': '99999',
        '999999': '999999',
      },
    },
  },
  plugins: [],
}