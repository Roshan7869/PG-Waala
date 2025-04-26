/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./backend.ts"
  ],
  theme: {
    extend: {
      colors: {
        'pg-primary': '#2563eb',
        'pg-secondary': '#1d4ed8',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
  darkMode: 'class',
} 