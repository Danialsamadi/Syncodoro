// Modern Light Theme Configuration
// Part of the redesigned Syncodoro theme system

import { colors, surfaces, text, borders, shadows } from './colors';

export const lightTheme = {
  colors: {
    // Background colors - light theme
    background: {
      primary: colors.neutral[50],      // Almost white background
      secondary: colors.neutral[100],   // Very light gray
      tertiary: colors.neutral[200],    // Light gray sections
      elevated: '#FFFFFF',              // Pure white elevated components
    },

    // Surface colors for cards and components
    surface: {
      level0: colors.neutral[50],       // Background level
      level1: '#FFFFFF',                // Elevated surface (white)
      level2: colors.neutral[100],      // Card level
      level3: colors.neutral[200],      // Modal level
      level4: colors.neutral[300],      // Menu level
      level5: colors.neutral[400],      // Tooltip level
      overlay: 'rgba(15, 15, 23, 0.4)', // Modal overlays
    },

    // Text colors for light theme
    text: {
      primary: colors.neutral[950],     // Almost black primary text
      secondary: colors.neutral[700],   // Medium gray secondary text
      tertiary: colors.neutral[600],    // Light gray tertiary text
      disabled: colors.neutral[400],    // Disabled text
      inverse: colors.neutral[50],      // White text on dark backgrounds
      
      // Semantic text colors
      success: colors.semantic.success[700],
      warning: colors.semantic.warning[700],
      error: colors.semantic.error[700],
      info: colors.semantic.info[700],
    },

    // Border colors
    border: {
      primary: colors.neutral[300],     // Light borders
      secondary: colors.neutral[200],   // Very light borders
      tertiary: colors.neutral[400],    // Medium borders
      focus: colors.primary[600],       // Purple focus borders
      divider: colors.neutral[200],     // Divider lines
    },

    // Timer specific colors - vibrant and distinct
    timer: {
      focus: {
        primary: colors.primary[600],      // Purple for focus sessions
        secondary: colors.primary[700],    // Darker purple for accents
        background: 'rgba(122, 90, 248, 0.1)',
        border: 'rgba(122, 90, 248, 0.3)',
        glow: 'rgba(122, 90, 248, 0.25)',
      },
      shortBreak: {
        primary: colors.secondary[600],    // Teal for short breaks
        secondary: colors.secondary[700],  // Darker teal for accents
        background: 'rgba(8, 189, 210, 0.1)',
        border: 'rgba(8, 189, 210, 0.3)',
        glow: 'rgba(8, 189, 210, 0.2)',
      },
      longBreak: {
        primary: colors.semantic.success[600],    // Green for long breaks
        secondary: colors.semantic.success[700],  // Darker green for accents
        background: 'rgba(16, 185, 129, 0.1)',
        border: 'rgba(16, 185, 129, 0.3)',
        glow: 'rgba(16, 185, 129, 0.2)',
      },
    },

    // Interactive states
    interactive: {
      primary: colors.primary[600],           // Primary purple
      primaryHover: colors.primary[700],      // Darker purple on hover
      primaryActive: colors.primary[800],     // Even darker on active
      secondary: colors.secondary[600],       // Secondary teal
      secondaryHover: colors.secondary[700],  // Darker teal on hover
      secondaryActive: colors.secondary[800], // Even darker on active
      tertiary: colors.neutral[300],          // Tertiary gray
      tertiaryHover: colors.neutral[400],     // Darker gray on hover
      tertiaryActive: colors.neutral[500],    // Even darker on active
      hover: 'rgba(15, 15, 23, 0.04)',        // Light hover overlay
      pressed: 'rgba(15, 15, 23, 0.08)',      // Pressed state
      focus: 'rgba(122, 90, 248, 0.2)',       // Focus ring
      disabled: 'rgba(15, 15, 23, 0.02)',     // Disabled state
    },
  },

  // Shadows for light theme - more pronounced
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    
    // Glow effects for interactive elements
    glow: {
      primary: `0 0 20px rgba(122, 90, 248, 0.25)`,
      secondary: `0 0 20px rgba(8, 189, 210, 0.2)`,
      focus: `0 0 0 3px rgba(122, 90, 248, 0.2)`,
    },
  },

  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Segoe UI', 'Roboto', 'system-ui', 'sans-serif'],
      mono: ['SF Mono', 'Monaco', 'Menlo', 'Roboto Mono', 'Consolas', 'monospace'],
    },
    fontSize: {
      timer: ['6rem', { lineHeight: '1', letterSpacing: '-0.025em' }],
      timerMobile: ['4rem', { lineHeight: '1', letterSpacing: '-0.025em' }],
      display1: ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      display2: ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      heading1: ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
      heading2: ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      heading3: ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.005em' }],
      heading4: ['1.25rem', { lineHeight: '1.4' }],
      bodyLg: ['1.125rem', { lineHeight: '1.5' }],
      body: ['1rem', { lineHeight: '1.5' }],
      bodySm: ['0.875rem', { lineHeight: '1.5' }],
      caption: ['0.75rem', { lineHeight: '1.5' }],
    },
  },

  // Animation
  animation: {
    durations: {
      fastest: '50ms',
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
      slowest: '450ms',
    },
    easings: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },

  // Spacing
  spacing: {
    '4xs': '0.125rem', // 2px
    '3xs': '0.25rem',  // 4px
    '2xs': '0.5rem',   // 8px
    'xs': '0.75rem',   // 12px
    'sm': '1rem',      // 16px
    'md': '1.5rem',    // 24px
    'lg': '2rem',      // 32px
    'xl': '2.5rem',    // 40px
    '2xl': '3rem',     // 48px
    '3xl': '4rem',     // 64px
    '4xl': '6rem',     // 96px
  },

  // Border radius
  borderRadius: {
    'xs': '0.25rem',   // 4px
    'sm': '0.5rem',    // 8px
    'md': '0.75rem',   // 12px
    'lg': '1rem',      // 16px
    'xl': '1.5rem',    // 24px
    '2xl': '2rem',     // 32px
    'full': '9999px',  // Pill shape
  },

  // Z-index
  zIndex: {
    'behind': -1,
    'base': 0,
    'elevated': 1,
    'dropdown': 10,
    'sticky': 100,
    'overlay': 200,
    'modal': 300,
    'popover': 400,
    'toast': 500,
    'tooltip': 600,
  }
} as const;