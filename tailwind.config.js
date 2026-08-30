import typography from '@tailwindcss/typography';

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
        moto: {
          dark: '#0a0a0a',
          card: '#121212',
          panel: '#181818',
          border: '#2a2a2a',
          orange: '#ff5500',
          'orange-hover': '#e04b00',
          'orange-light': '#ff7733',
          gray: '#8e8e93',
          light: '#f5f5f7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Oswald', 'sans-serif'],
      },
      boxShadow: {
        'glow-orange': '0 0 25px rgba(255, 85, 0, 0.35)',
        'glow-sm': '0 0 12px rgba(255, 85, 0, 0.2)',
      }
    },
  },
  plugins: [
    typography,
  ],
}
