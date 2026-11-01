/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FAF8F4',
          100: '#F8F5EF', // main background
          200: '#F0E9DE', // secondary background / subtle card
          300: '#EFE7DB', // sidebar background
          400: '#E5DDD1', // subtle border
          500: '#D8CEBF',
          600: '#B8AD9C',
        },
        espresso: {
          900: '#1E1B18',
          800: '#302B26', // primary text
          600: '#5A524A',
          500: '#797168', // secondary text
          400: '#9E9489',
          300: '#C4BCB1',
        },
        sage: {
          50: '#F2F5F1',
          100: '#E3ECE1',
          200: '#C7D9C4',
          500: '#71856B', // primary accent
          600: '#53684E', // accent hover
          700: '#3E503A',
        },
        status: {
          success: '#527A56',
          'success-bg': '#EEF5EF',
          'success-border': '#CBE2CD',
          warning: '#B78343',
          'warning-bg': '#FDF7EE',
          'warning-border': '#F4DEC1',
          error: '#B85C50',
          'error-bg': '#FDF2F0',
          'error-border': '#F7D0CC',
          info: '#6F8798',
          'info-bg': '#F0F5F8',
          'info-border': '#CDDCE5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"DM Sans"', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
        'control': '9px',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(48, 43, 38, 0.04), 0 1px 2px 0 rgba(48, 43, 38, 0.02)',
        'card': '0 4px 12px -2px rgba(48, 43, 38, 0.05), 0 2px 6px -1px rgba(48, 43, 38, 0.03)',
        'dropdown': '0 10px 25px -5px rgba(48, 43, 38, 0.1), 0 8px 10px -6px rgba(48, 43, 38, 0.05)',
      }
    },
  },
  plugins: [],
}
