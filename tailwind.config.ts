import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './component/**/*.{js,ts,jsx,tsx,mdx}', // Vérifiez si c'est "component" ou "components" !
    './src/**/*.{js,ts,jsx,tsx,mdx}', // Ajoutez ceci si vous avez un dossier src
  ],
  theme: {
    extend: {
      colors: {
        bg: '#211212',
        'bg-2': '#321B1B',
        'bg-3': '#4C2929',
        'bg-4': '#633636',
        'bg-5': '#743E3E',

        // Texts
        'text-main': '#E4E3E8',
        'text-secondary': '#B2AFBC',

        // Main Color (Rouge/Rose)
        main: {
          50: '#4E0317',
          100: '#8B1034',
          200: '#A30E35',
          300: '#C30D37',
          400: '#E71742',
          500: '#F93A59',
          600: '#FF5168',
          700: '#FFA1AC',
          800: '#FFCCD1',
          900: '#FFE3E5',
          950: '#FFF1F2',
          hover: 'rgba(255, 161, 172, 0.2)', // #FFA1AC avec 20% alpha
        },

        // Secondary Color (Rouge)
        secondary: {
          50: '#460909',
          100: '#811B1B',
          200: '#9B1919',
          300: '#BC1919',
          400: '#DF2323',
          500: '#F24040',
          600: '#FA6F6F',
          700: '#FEA3A3',
          800: '#FFC9C9',
          900: '#FFE1E1',
          950: '#FEF2F2',
        },

        // Accent Colors & Basic Colors
        red: {
          50: '#FDF3F3',
          100: '#FBE5E5',
          200: '#F9CFCF',
          300: '#F4ADAD',
          400: '#EB7E7E',
          500: '#E53131',
          600: '#C13333',
          700: '#AA2B2B',
          800: '#8D2727',
          900: '#752727',
          950: '#3F1010',
        },
        violet: {
          50: '#F3F2FF',
          100: '#E9E7FF',
          200: '#D6D3FF',
          300: '#B8AFFF',
          400: '#9482FF',
          500: '#724FFF',
          600: '#6F3EFC',
          700: '#5319E8',
          800: '#4515C2',
          900: '#3A139F',
          950: '#21096C',
        },
        green: {
          50: '#F2FBEA',
          100: '#E0F7D0',
          200: '#C4EFA7',
          300: '#9EE274',
          400: '#7BD249',
          500: '#5BB72A',
          600: '#44921E',
          700: '#35701B',
          800: '#2E591B',
          900: '#284C1B',
          950: '#12290A',
        },
        blue: {
          50: '#EDF7FF',
          100: '#D7ECFF',
          200: '#B9DFFF',
          300: '#88CCFF',
          400: '#50AFFF',
          500: '#288CFF',
          600: '#0A68FF',
          700: '#0A55EB',
          800: '#0F44BE',
          900: '#133E95',
          950: '#11275A',
        },
        orange: {
          50: '#FEF8EE',
          100: '#FCF0D8',
          200: '#F7DCB1',
          300: '#F2C37F',
          400: '#EC9F4B',
          500: '#E88930',
          600: '#D86C1E',
          700: '#B4521A',
          800: '#8F411D',
          900: '#74381A',
          950: '#3E1B0C',
        },
        pink: {
          50: '#FFF4FE',
          100: '#FFE8FE',
          200: '#FDD1FB',
          300: '#F77BE8',
          400: '#F77BE8',
          500: '#EC4BD7',
          600: '#D029B7',
          700: '#AC1F93',
          800: '#8D1B78',
          900: '#731C61',
          950: '#4D053E',
        },
      },
      backgroundImage: {
        'gradient-light': 'linear-gradient(135deg, #211212 0%, #321B1B 100%)',
        'gradient-main': 'linear-gradient(135deg, #F93A59 0%, #E71742 100%)',
        'gradient-main-hover': 'linear-gradient(135deg, #E71742 0%, #C30D37 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config;