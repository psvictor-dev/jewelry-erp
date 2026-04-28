/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold:  { DEFAULT:'#B8860B', light:'#DAA520', dark:'#8B6914' },
        cream: { DEFAULT:'#FDF8F0', dark:'#F5EDD8' },
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
    },
  },
  plugins: [],
};