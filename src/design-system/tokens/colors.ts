// Black Theme Design Tokens for Syncodoro
export const colors = {
  // Primary black theme palette
  black: {
    50: '#f8f8f8',   // Almost white (for text on dark backgrounds)
    100: '#e5e5e5',  // Very light gray
    200: '#d4d4d4',  // Light gray
    300: '#a3a3a3',  // Medium gray
    400: '#737373',  // Gray
    500: '#525252',  // Dark gray
    600: '#404040',  // Darker gray
    700: '#262626',  // Very dark gray
    800: '#171717',  // Almost black
    900: '#0a0a0a',  // Pure black
  },

  // Accent colors for the black theme
  accent: {
    // Pomodoro red (adjusted for dark theme)
    red: {
      400: '#f87171',  // Lighter red for dark backgrounds
      500: '#ef4444',  // Current brand red
      600: '#dc2626',  // Darker red
    },
    
    // Success green (adjusted for dark theme)
    green: {
      400: '#4ade80',  // Lighter green
      500: '#22c55e',  // Success green
      600: '#16a34a',  // Darker green
    },
    
    // Warning yellow (adjusted for dark theme)
    yellow: {
      400: '#facc15',  // Lighter yellow
      500: '#eab308',  // Warning yellow
      600: '#ca8a04',  // Darker yellow
    },
    
    // Info blue (adjusted for dark theme)
    blue: {
      400: '#60a5fa',  // Lighter blue
      500: '#3b82f6',  // Info blue
      600: '#2563eb',  // Darker blue
    }
  },

  // Semantic colors for dark theme
  background: {
    primary: '#0a0a0a',      // Pure black background
    secondary: '#171717',     // Almost black cards/panels
    tertiary: '#262626',      // Dark gray sections
    elevated: '#404040',      // Elevated components
  },

  surface: {
    primary: '#171717',       // Card backgrounds
    secondary: '#262626',     // Secondary surfaces
    tertiary: '#404040',      // Elevated surfaces
    overlay: 'rgba(0, 0, 0, 0.8)', // Modal overlays
  },

  text: {
    primary: '#f8f8f8',       // Primary text (almost white)
    secondary: '#d4d4d4',     // Secondary text (light gray)
    tertiary: '#a3a3a3',      // Tertiary text (medium gray)
    disabled: '#737373',      // Disabled text
    inverse: '#0a0a0a',       // Text on light backgrounds
  },

  border: {
    primary: '#404040',       // Primary borders
    secondary: '#262626',     // Secondary borders
    tertiary: '#525252',      // Hover borders
    focus: '#ef4444',         // Focus borders (brand red)
  },

  // Interactive states
  interactive: {
    hover: 'rgba(255, 255, 255, 0.05)',     // Hover overlay
    pressed: 'rgba(255, 255, 255, 0.1)',    // Pressed state
    focus: 'rgba(239, 68, 68, 0.2)',        // Focus ring
    disabled: 'rgba(255, 255, 255, 0.02)',  // Disabled state
  },

  // Timer specific colors
  timer: {
    pomodoro: {
      primary: '#ef4444',      // Pomodoro red
      background: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.3)',
    },
    shortBreak: {
      primary: '#22c55e',      // Short break green
      background: 'rgba(34, 197, 94, 0.1)',
      border: 'rgba(34, 197, 94, 0.3)',
    },
    longBreak: {
      primary: '#3b82f6',      // Long break blue
      background: 'rgba(59, 130, 246, 0.1)',
      border: 'rgba(59, 130, 246, 0.3)',
    },
  },

  // Status colors
  status: {
    success: {
      primary: '#22c55e',
      background: 'rgba(34, 197, 94, 0.1)',
      border: 'rgba(34, 197, 94, 0.3)',
    },
    warning: {
      primary: '#eab308',
      background: 'rgba(234, 179, 8, 0.1)',
      border: 'rgba(234, 179, 8, 0.3)',
    },
    error: {
      primary: '#ef4444',
      background: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.3)',
    },
    info: {
      primary: '#3b82f6',
      background: 'rgba(59, 130, 246, 0.1)',
      border: 'rgba(59, 130, 246, 0.3)',
    },
  },
} as const

// CSS Custom Properties for the black theme
export const cssVariables = {
  '--color-background-primary': colors.background.primary,
  '--color-background-secondary': colors.background.secondary,
  '--color-background-tertiary': colors.background.tertiary,
  '--color-background-elevated': colors.background.elevated,
  
  '--color-surface-primary': colors.surface.primary,
  '--color-surface-secondary': colors.surface.secondary,
  '--color-surface-tertiary': colors.surface.tertiary,
  '--color-surface-overlay': colors.surface.overlay,
  
  '--color-text-primary': colors.text.primary,
  '--color-text-secondary': colors.text.secondary,
  '--color-text-tertiary': colors.text.tertiary,
  '--color-text-disabled': colors.text.disabled,
  
  '--color-border-primary': colors.border.primary,
  '--color-border-secondary': colors.border.secondary,
  '--color-border-tertiary': colors.border.tertiary,
  '--color-border-focus': colors.border.focus,
  
  '--color-timer-pomodoro': colors.timer.pomodoro.primary,
  '--color-timer-short-break': colors.timer.shortBreak.primary,
  '--color-timer-long-break': colors.timer.longBreak.primary,
} as const

// Tailwind CSS color extensions
export const tailwindColors = {
  'bg-primary': colors.background.primary,
  'bg-secondary': colors.background.secondary,
  'bg-tertiary': colors.background.tertiary,
  'bg-elevated': colors.background.elevated,
  
  'surface-primary': colors.surface.primary,
  'surface-secondary': colors.surface.secondary,
  'surface-tertiary': colors.surface.tertiary,
  
  'text-primary': colors.text.primary,
  'text-secondary': colors.text.secondary,
  'text-tertiary': colors.text.tertiary,
  'text-disabled': colors.text.disabled,
  
  'border-primary': colors.border.primary,
  'border-secondary': colors.border.secondary,
  'border-tertiary': colors.border.tertiary,
  'border-focus': colors.border.focus,
  
  'timer-pomodoro': colors.timer.pomodoro.primary,
  'timer-short': colors.timer.shortBreak.primary,
  'timer-long': colors.timer.longBreak.primary,
} as const
