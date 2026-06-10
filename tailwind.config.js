/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        construction: {
          yellow: '#F5A623',
          'yellow-light': '#FFD166',
          'yellow-dark': '#D4890A',
          blue: '#1A3D6E',
          'blue-mid': '#2B5DA8',
          'blue-light': '#4A90D9',
          gray: '#6B7280',
          'gray-light': '#D1D5DB',
          'gray-dark': '#374151',
          concrete: '#8B8680',
          dark: '#0F1923',
          'dark-card': '#1A2535',
          'dark-border': '#2A3A4E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'count-up': 'countUp 0.8s ease-out',
        'slide-in': 'slideIn 0.5s ease-out',
        'fade-in': 'fadeIn 0.4s ease-in',
        'pulse-glow': 'pulseGlow 2s infinite',
      },
      keyframes: {
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(245, 166, 35, 0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(245, 166, 35, 0.8)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
