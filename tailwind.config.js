/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Black theme colors
        'bg-primary': '#0a0a0a',
        'bg-secondary': '#171717',
        'bg-tertiary': '#262626',
        'bg-elevated': '#404040',
        
        'surface-primary': '#171717',
        'surface-secondary': '#262626',
        'surface-tertiary': '#404040',
        
        'text-primary': '#f8f8f8',
        'text-secondary': '#d4d4d4',
        'text-tertiary': '#a3a3a3',
        'text-disabled': '#737373',
        
        'border-primary': '#404040',
        'border-secondary': '#262626',
        'border-tertiary': '#525252',
        'border-focus': '#ef4444',
        
        // Timer colors
        'timer-pomodoro': '#ef4444',
        'timer-short': '#22c55e',
        'timer-long': '#3b82f6',
        
        // Keep primary for compatibility
        primary: {
          50: '#f8f8f8',
          100: '#e5e5e5',
          200: '#d4d4d4',
          300: '#a3a3a3',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#0a0a0a',
        },
        secondary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        }
      },
      
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
        'display': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      
      fontSize: {
        'timer': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.025em' }],
        'timer-mobile': ['3rem', { lineHeight: '1', letterSpacing: '-0.025em' }],
        'stat-number': ['2.25rem', { lineHeight: '1' }],
      },
      
      boxShadow: {
        'black-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
        'black': '0 1px 3px 0 rgba(0, 0, 0, 0.6), 0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        'black-md': '0 4px 6px -1px rgba(0, 0, 0, 0.6), 0 2px 4px -1px rgba(0, 0, 0, 0.4)',
        'black-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -2px rgba(0, 0, 0, 0.4)',
        'black-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.5)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.5)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.5)',
      },
      
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounce 2s infinite',
        'timer-pulse': 'timerPulse 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      
      keyframes: {
        timerPulse: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.02)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(239, 68, 68, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(239, 68, 68, 0.8)' },
          '100%': { boxShadow: '0 0 5px rgba(239, 68, 68, 0.5)' },
        },
      },
      
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'snappy': 'cubic-bezier(0.4, 0, 0.6, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
}
