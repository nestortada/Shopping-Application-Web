/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],  theme: {
    extend: {
      fontFamily: {
        'paprika': ['Paprika', 'sans-serif'],
      },      keyframes: {
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'heart-beat': {
          '0%': {
            transform: 'scale(1)'
          },
          '50%': {
            transform: 'scale(1.2)'
          },
          '100%': {
            transform: 'scale(1)'
          }
        },
        'fadeIn': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.9)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)'
          }
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.3s ease-out',
        'heart-beat': 'heart-beat 0.5s ease-in-out',
        'fadeIn': 'fadeIn 0.3s ease-out'
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}