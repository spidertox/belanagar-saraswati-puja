/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: '#FBF6EA',
          50: '#FFFDF8',
          100: '#FBF6EA',
          200: '#F3E8CE',
        },
        gold: {
          50: '#FBF0D9',
          100: '#F3DFA9',
          300: '#DCAE49',
          400: '#D19E3A',
          500: '#C08A1E',
          600: '#A06F16',
          700: '#7C5610',
        },
        saffron: {
          400: '#F2A65A',
          500: '#E8722C',
          600: '#CC5A1B',
        },
        maroon: {
          500: '#93233F',
          600: '#7A1B34',
          700: '#5C1427',
          900: '#3A0C19',
        },
        // Light-to-dark slate-navy scale: 400/500/600 are for muted-to-body
        // text on the light (ivory) background, 700 is the primary/strongest
        // text color, and 800/900 are dark enough for solid backgrounds
        // (footer, admin chrome).
        navy: {
          400: '#8993AA',
          500: '#64708C',
          600: '#4A5570',
          700: '#182238',
          800: '#121A2C',
          900: '#0F172A',
        },
        basanti: {
          300: '#F6D883',
          400: '#F3C860',
        },
        // WhatsApp brand greens, used only for the "open group" button.
        whatsapp: {
          600: '#128C7E',
          700: '#0B6E5F',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        displayHi: ['"Tiro Devanagari Hindi"', 'serif'],
        sans: ['"Work Sans"', 'sans-serif'],
        sansHi: ['"Noto Sans Devanagari"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 16px -4px rgba(58, 12, 25, 0.12)',
        lift: '0 12px 32px -8px rgba(58, 12, 25, 0.22)',
      },
      keyframes: {
        riseIn: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        riseIn: 'riseIn 0.7s cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [],
};
