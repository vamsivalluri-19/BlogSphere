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
          50: '#f5f7fa',
          100: '#eaeef4',
          200: '#d0dae5',
          300: '#a7bccc',
          400: '#7797b0',
          500: '#567995',
          600: '#436079',
          700: '#384f64',
          800: '#314354',
          900: '#2c3b4b',
          950: '#1b2530',
        },
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
