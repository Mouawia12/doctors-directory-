/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef6ff',
          100: '#d9ecff',
          200: '#b3d9ff',
          300: '#7abdff',
          400: '#3f9cff',
          500: '#0d7df5',
          600: '#0463d2',
          700: '#034aa5',
          800: '#053a7f',
          900: '#092f63',
        },
        accent: {
          50: '#fff6ed',
          100: '#ffe7ce',
          200: '#ffd0a1',
          300: '#ffb06a',
          400: '#ff9139',
          500: '#ff7a12',
          600: '#f46204',
          700: '#c44b05',
          800: '#9c3c0c',
          900: '#7d320d',
        },
        success: '#22c55e',
        warning: '#f97316',
        danger: '#ef4444',
        surface: '#f8fafc',
      },
      fontFamily: {
        sans: ['"Cairo"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 20px 45px rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '1.75rem',
      },
    },
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1280px',
      },
    },
  },
  plugins: [require('tailwindcss-rtl')],
}
