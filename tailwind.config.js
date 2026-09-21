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
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        profit: {
          500: '#10b981',
          600: '#059669',
          bg: '#064e3b15'
        },
        loss: {
          500: '#ef4444',
          600: '#dc2626',
          bg: '#7f1d1d15'
        },
        warrant: {
          500: '#8b5cf6',
          600: '#7c3aed',
          bg: '#5b21b615'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
