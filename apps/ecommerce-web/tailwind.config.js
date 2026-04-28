/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: { colors: { gold: { DEFAULT:'#B8860B', light:'#DAA520' } } } },
  plugins: [],
};