/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0A0A0A',
          light: '#1A1A1A',
          lighter: '#2D2D2D',
        },
        accent: {
          DEFAULT: '#4d3cbb',
          hover: '#4031a0',
          50: '#f1f0ff',
          100: '#e5e2ff',
          200: '#cfcbff',
          300: '#b0a9ff',
          400: '#8b80f2',
          500: '#6c5ce7',
          600: '#4d3cbb',
          700: '#4031a0',
          800: '#352987',
          900: '#2b216e',
        },
        background: '#FAFAFA',
        'text-secondary': '#9CA3AF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        'card': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
}
