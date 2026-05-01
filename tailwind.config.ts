import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './component/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        bg: '#FBF8F8',
        'bg-2': '#F6EEEE',
        'bg-3': '#EDDEDE',
        'bg-4': '#DBBDBD',
        'bg-5': '#D2ACAC',

        // Texts
        'text-main': '#18171C',
        'text-secondary': '#78738C',

        // Main Color (Rouge/Rose)
        main: {
          50: '#FFF1F2',
          100: '#FFE3E5',
          200: '#FFCCD1',
          300: '#FFA1AC',
          400: '#FF5168',
          500: '#F93A59',
          600: '#E71742',
          700: '#C30D37',
          800: '#A30E35',
          900: '#8B1034',
          950: '#4E0317',
        },

        // Secondary Color (Rouge)
        secondary: {
          50: '#FEF2F2',
          100: '#FFE1E1',
          200: '#FFC9C9',
          300: '#FEA3A3',
          400: '#FA6F6F',
          500: '#F24040',
          600: '#DF2323',
          700: '#BC1919',
          800: '#9B1919',
          900: '#811B1B',
          950: '#460909',
        },

        // Accent Colors
        violet: {
          400: '#6F3EFC',
          500: '#724FFF',
          600: '#9482FF',
        },
        green: {
          500: '#5BB72A',
          600: '#7BD249',
        },
        blue: {
          400: '#0A68FF',
          500: '#288CFF',
          600: '#50AFFF',
        },
        orange: {
          500: '#E88930',
          600: '#EC9F4B',
        },
        pink: {
          500: '#EC4BD7',
          600: '#F77BE8',
        },
      },
      backgroundImage: {
        'gradient-light': 'linear-gradient(135deg, #FBF8F8 0%, #F6EEEE 100%)',
        'gradient-main': 'linear-gradient(135deg, #F93A59 0%, #E71742 100%)',
        'gradient-main-hover': 'linear-gradient(135deg, #E71742 0%, #C30D37 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config;

