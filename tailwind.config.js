/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0c0f17',
        surface: '#161c28',
        'surface-hover': '#1e2638',
        primary: {
          DEFAULT: 'rgb(var(--color-primary-rgb, 99 102 241) / <alpha-value>)',
        }
      }
    },
  },
  plugins: [],
}
