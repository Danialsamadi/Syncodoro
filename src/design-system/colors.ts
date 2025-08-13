// Modern Design Color System
// Inspired by Material Design 3, Apple Human Interface Guidelines, and modern productivity apps

export const colors = {
  // Vibrant primary purple palette - modern and energetic
  primary: {
    950: '#13082B',  // Deepest purple
    900: '#2D1A64',  // Deep purple
    800: '#4C2FB3',  // Rich purple
    700: '#6344C4',  // Medium purple
    600: '#7A5AF8',  // Bright purple (primary accent)
    500: '#9373FF',  // Light purple
    400: '#B197FF',  // Soft purple
    300: '#CABDFF',  // Pale purple
    200: '#E2DBFF',  // Very light purple
    100: '#F3F0FF',  // Almost white purple
    50: '#FAF8FF',   // White with purple tint
  },

  // Secondary teal palette - complementary to purple
  secondary: {
    900: '#044A53',  // Deep teal
    800: '#05717E',  // Dark teal
    700: '#0797A8',  // Medium teal
    600: '#08BDD2',  // Bright teal (secondary accent)
    500: '#21D0E6',  // Light teal
    400: '#5ADBE9',  // Soft teal
    300: '#93E7F0',  // Pale teal
    200: '#C1F2F7',  // Very light teal
    100: '#E5FAFC',  // Almost white teal
  },

  // Neutral grays with subtle purple undertone
  neutral: {
    950: '#0F0F17',  // Almost black
    900: '#1A1A27',  // Very dark gray
    800: '#2A2A3B',  // Dark gray
    700: '#3D3D52',  // Medium dark gray
    600: '#565670',  // Medium gray
    500: '#71718F',  // Mid gray
    400: '#9090AB',  // Light gray
    300: '#B4B4C7',  // Lighter gray
    200: '#D7D7E4',  // Very light gray
    100: '#ECECF2',  // Almost white
    50: '#F8F8FB',   // Pure white with slight purple tint
  },

  // Enhanced semantic colors
  semantic: {
    success: {
      900: '#054F2C',  // Deep green
      800: '#06703E',  // Dark green
      700: '#059459',  // Medium green
      600: '#10B981',  // Bright green (main)
      500: '#34D399',  // Light green
      400: '#6EE7B7',  // Soft green
      300: '#A7F3D0',  // Pale green
      200: '#D1FAE5',  // Very light green
      100: '#ECFDF5',  // Almost white green
    },
    warning: {
      900: '#783A00',  // Deep amber
      800: '#9A4D00',  // Dark amber
      700: '#C26100',  // Medium amber
      600: '#F59E0B',  // Bright amber (main)
      500: '#FBBF24',  // Light amber
      400: '#FCD34D',  // Soft amber
      300: '#FDE68A',  // Pale amber
      200: '#FEF3C7',  // Very light amber
      100: '#FFFBEB',  // Almost white amber
    },
    error: {
      900: '#7F1D1D',  // Deep red
      800: '#B91C1C',  // Dark red
      700: '#DC2626',  // Medium red
      600: '#EF4444',  // Bright red (main)
      500: '#F87171',  // Light red
      400: '#FCA5A5',  // Soft red
      300: '#FECACA',  // Pale red
      200: '#FEE2E2',  // Very light red
      100: '#FEF2F2',  // Almost white red
    },
    info: {
      900: '#1E3A8A',  // Deep blue
      800: '#1E40AF',  // Dark blue
      700: '#1D4ED8',  // Medium blue
      600: '#2563EB',  // Bright blue (main)
      500: '#3B82F6',  // Light blue
      400: '#60A5FA',  // Soft blue
      300: '#93C5FD',  // Pale blue
      200: '#BFDBFE',  // Very light blue
      100: '#DBEAFE',  // Almost white blue
    },
  },

  // Timer-specific colors - more vibrant and distinct
  timer: {
    focus: {
      primary: '#7A5AF8',      // Purple for focus sessions
      secondary: '#6344C4',    // Darker purple for accents
      background: 'rgba(122, 90, 248, 0.1)',
      border: 'rgba(122, 90, 248, 0.3)',
      glow: 'rgba(122, 90, 248, 0.4)',
    },
    shortBreak: {
      primary: '#08BDD2',      // Teal for short breaks
      secondary: '#05717E',    // Darker teal for accents
      background: 'rgba(8, 189, 210, 0.1)',
      border: 'rgba(8, 189, 210, 0.3)',
      glow: 'rgba(8, 189, 210, 0.4)',
    },
    longBreak: {
      primary: '#10B981',      // Green for long breaks
      secondary: '#059459',    // Darker green for accents
      background: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.3)',
      glow: 'rgba(16, 185, 129, 0.4)',
    },
  },
} as const

// Surface colors following Material Design 3 elevation
export const surfaces = {
  // Dark theme background layers
  dark: {
    background: {
      primary: colors.neutral[950],     // Almost black
      secondary: colors.neutral[900],   // Very dark gray
      tertiary: colors.neutral[800],    // Dark gray
    },
    
    // Surface elevations (Material Design inspired)
    surface: {
      level0: colors.neutral[950],      // Background level
      level1: colors.neutral[900],      // Elevated surface (+1dp)
      level2: colors.neutral[800],      // Card level (+3dp)  
      level3: colors.neutral[700],      // Modal level (+6dp)
      level4: colors.neutral[600],      // Menu level (+8dp)
      level5: colors.neutral[500],      // Tooltip level (+12dp)
    },

    // Interactive surfaces
    interactive: {
      primary: colors.primary[600],     // Primary buttons
      primaryHover: colors.primary[700],
      secondary: colors.secondary[600], // Secondary buttons
      secondaryHover: colors.secondary[700],
      tertiary: colors.neutral[700],    // Tertiary buttons
      tertiaryHover: colors.neutral[600],
    },
  },

  // Light theme background layers
  light: {
    background: {
      primary: colors.neutral[50],      // Almost white
      secondary: colors.neutral[100],   // Very light gray
      tertiary: colors.neutral[200],    // Light gray
    },
    
    // Surface elevations (Material Design inspired)
    surface: {
      level0: colors.neutral[50],       // Background level
      level1: '#FFFFFF',                // Elevated surface (white)
      level2: colors.neutral[100],      // Card level
      level3: colors.neutral[200],      // Modal level
      level4: colors.neutral[300],      // Menu level
      level5: colors.neutral[400],      // Tooltip level
    },

    // Interactive surfaces
    interactive: {
      primary: colors.primary[600],     // Primary buttons
      primaryHover: colors.primary[700],
      secondary: colors.secondary[600], // Secondary buttons
      secondaryHover: colors.secondary[700],
      tertiary: colors.neutral[300],    // Tertiary buttons
      tertiaryHover: colors.neutral[400],
    },
  }
} as const

// Text colors with proper contrast ratios
export const text = {
  // Dark theme text
  dark: {
    primary: colors.neutral[50],        // High contrast white
    secondary: colors.neutral[300],     // Medium contrast
    tertiary: colors.neutral[400],      // Lower contrast
    disabled: colors.neutral[600],      // Disabled state
    inverse: colors.neutral[950],       // Text on light backgrounds
    
    // Semantic text colors
    success: colors.semantic.success[400],
    warning: colors.semantic.warning[400],
    error: colors.semantic.error[400],
    info: colors.semantic.info[400],
  },

  // Light theme text
  light: {
    primary: colors.neutral[950],       // High contrast almost black
    secondary: colors.neutral[700],     // Medium contrast
    tertiary: colors.neutral[600],      // Lower contrast
    disabled: colors.neutral[400],      // Disabled state
    inverse: colors.neutral[50],        // Text on dark backgrounds
    
    // Semantic text colors
    success: colors.semantic.success[700],
    warning: colors.semantic.warning[700],
    error: colors.semantic.error[700],
    info: colors.semantic.info[700],
  }
} as const

// Border colors
export const borders = {
  // Dark theme borders
  dark: {
    primary: colors.neutral[700],       // Primary borders
    secondary: colors.neutral[800],     // Subtle borders
    tertiary: colors.neutral[600],      // Hover borders
    focus: colors.primary[600],         // Focus rings
    divider: colors.neutral[800],       // Divider lines
  },

  // Light theme borders
  light: {
    primary: colors.neutral[300],       // Primary borders
    secondary: colors.neutral[200],     // Subtle borders
    tertiary: colors.neutral[400],      // Hover borders
    focus: colors.primary[600],         // Focus rings
    divider: colors.neutral[200],       // Divider lines
  }
} as const

// Shadow definitions (Material Design elevation)
export const shadows = {
  // Dark theme shadows (subtle)
  dark: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.4)',
    
    // Glow effects for interactive elements
    glow: {
      primary: `0 0 20px rgba(122, 90, 248, 0.4)`,
      secondary: `0 0 20px rgba(8, 189, 210, 0.3)`,
      focus: `0 0 0 3px rgba(122, 90, 248, 0.3)`,
    },
  },

  // Light theme shadows (more pronounced)
  light: {
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
  }
} as const

// CSS custom properties for easy usage - dark theme default
export const cssVariables = {
  // Primary palette
  '--color-primary-950': colors.primary[950],
  '--color-primary-900': colors.primary[900],
  '--color-primary-800': colors.primary[800],
  '--color-primary-700': colors.primary[700],
  '--color-primary-600': colors.primary[600],
  '--color-primary-500': colors.primary[500],
  '--color-primary-400': colors.primary[400],
  '--color-primary-300': colors.primary[300],
  '--color-primary-200': colors.primary[200],
  '--color-primary-100': colors.primary[100],
  '--color-primary-50': colors.primary[50],
  
  // Secondary palette
  '--color-secondary-900': colors.secondary[900],
  '--color-secondary-800': colors.secondary[800],
  '--color-secondary-700': colors.secondary[700],
  '--color-secondary-600': colors.secondary[600],
  '--color-secondary-500': colors.secondary[500],
  '--color-secondary-400': colors.secondary[400],
  '--color-secondary-300': colors.secondary[300],
  '--color-secondary-200': colors.secondary[200],
  '--color-secondary-100': colors.secondary[100],
  
  // Dark theme surfaces
  '--surface-background': surfaces.dark.background.primary,
  '--surface-level-1': surfaces.dark.surface.level1,
  '--surface-level-2': surfaces.dark.surface.level2,
  '--surface-level-3': surfaces.dark.surface.level3,
  
  // Dark theme text
  '--text-primary': text.dark.primary,
  '--text-secondary': text.dark.secondary,
  '--text-tertiary': text.dark.tertiary,
  
  // Dark theme borders
  '--border-primary': borders.dark.primary,
  '--border-secondary': borders.dark.secondary,
  '--border-focus': borders.dark.focus,
  
  // Timer colors
  '--timer-focus': colors.timer.focus.primary,
  '--timer-short-break': colors.timer.shortBreak.primary,
  '--timer-long-break': colors.timer.longBreak.primary,
} as const
