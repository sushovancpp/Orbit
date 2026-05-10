/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        orbit: {
          50:  '#f0f4ff',
          100: '#dde6fe',
          200: '#c3d0fd',
          400: '#7b95fa',
          500: '#5b78f6',
          600: '#4360f0',
          700: '#3550dc',
          800: '#2d42b2',
          900: '#1e2d7a',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      animation: {
        'fade-in': 'fadeIn .2s ease',
        'slide-up': 'slideUp .25s ease',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
