/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Open Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'title': ['Lato', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'body': ['Open Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      colors: {
        // Monochromatic palette
        gray: {
          50: "#f9f9f9",
          100: "#f0f0f0",
          200: "#e4e4e4",
          300: "#d1d1d1",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },
        
        // UI specific colors - minimal with dark mode support
        'bg-primary': {
          DEFAULT: '#ffffff',
          dark: '#171717'
        },
        'bg-secondary': {
          DEFAULT: '#f9f9f9',
          dark: '#262626'
        },
        
        'surface-primary': {
          DEFAULT: '#ffffff',
          dark: '#171717'
        },
        'surface-secondary': {
          DEFAULT: '#f9f9f9',
          dark: '#262626'
        },
        
        'text-primary': {
          DEFAULT: '#171717',
          dark: '#f0f0f0'
        },
        'text-secondary': {
          DEFAULT: '#525252',
          dark: '#a3a3a3'
        },
        
        'border-primary': {
          DEFAULT: '#e4e4e4',
          dark: '#404040'
        },
        'border-focus': {
          DEFAULT: '#404040',
          dark: '#d1d1d1'
        },
      },
      
      fontSize: {
        'xs': ["12px", {lineHeight: "1.5"}],
        'sm': ["14px", {lineHeight: "1.5"}],
        'base': ["16px", {lineHeight: "1.6"}],
        'lg': ["18px", {lineHeight: "1.5"}],
        'xl': ["20px", {lineHeight: "1.4"}],
        '2xl': ["24px", {lineHeight: "1.3"}],
        '3xl': ["30px", {lineHeight: "1.2"}],
        'timer': ['4.5rem', { lineHeight: '1' }],
        'timer-mobile': ['3rem', { lineHeight: '1' }],
      },
      
      borderRadius: {
        'none': "0px",
        'sm': "4px",
        'DEFAULT': "8px",
        'md': "12px",
        'lg': "16px",
        'full': "9999px"
      },
      
      spacing: {
        0: "0px",
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        8: "32px",
        10: "40px",
        12: "48px",
        16: "64px",
        20: "80px",
        24: "96px",
        32: "128px",
        40: "160px",
        48: "192px",
        64: "256px",
        px: "1px",
      },
      
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.08)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
        'focus': '0 0 0 2px rgba(64, 64, 64, 0.2)',
      },
      
      animation: {
        'pulse': 'pulse 2s ease-in-out infinite',
        'timer-pulse': 'timerPulse 2s ease-in-out infinite',
      },
      
      keyframes: {
        timerPulse: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.02)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
