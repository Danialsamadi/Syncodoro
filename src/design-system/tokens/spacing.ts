// Spacing tokens for consistent layout
export const spacing = {
  // Base spacing scale (4px increments)
  px: '1px',
  0: '0px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px
} as const

// Semantic spacing for specific use cases
export const semanticSpacing = {
  // Component spacing
  component: {
    xs: spacing[1],      // 4px - minimal spacing
    sm: spacing[2],      // 8px - small spacing
    md: spacing[4],      // 16px - default spacing
    lg: spacing[6],      // 24px - large spacing
    xl: spacing[8],      // 32px - extra large spacing
    '2xl': spacing[12],  // 48px - 2x large spacing
  },

  // Layout spacing
  layout: {
    xs: spacing[4],      // 16px - minimal layout spacing
    sm: spacing[6],      // 24px - small layout spacing
    md: spacing[8],      // 32px - default layout spacing
    lg: spacing[12],     // 48px - large layout spacing
    xl: spacing[16],     // 64px - extra large layout spacing
    '2xl': spacing[24],  // 96px - 2x large layout spacing
  },

  // Container spacing
  container: {
    xs: spacing[4],      // 16px - mobile padding
    sm: spacing[6],      // 24px - tablet padding
    md: spacing[8],      // 32px - desktop padding
    lg: spacing[12],     // 48px - large desktop padding
    xl: spacing[16],     // 64px - extra large desktop padding
  },

  // Stack spacing (vertical rhythm)
  stack: {
    xs: spacing[2],      // 8px - tight stacking
    sm: spacing[3],      // 12px - small stacking
    md: spacing[4],      // 16px - default stacking
    lg: spacing[6],      // 24px - loose stacking
    xl: spacing[8],      // 32px - extra loose stacking
  },

  // Inline spacing (horizontal rhythm)
  inline: {
    xs: spacing[1],      // 4px - tight inline
    sm: spacing[2],      // 8px - small inline
    md: spacing[3],      // 12px - default inline
    lg: spacing[4],      // 16px - loose inline
    xl: spacing[6],      // 24px - extra loose inline
  },
} as const

// Border radius tokens
export const borderRadius = {
  none: '0px',
  sm: '0.125rem',      // 2px
  base: '0.25rem',     // 4px
  md: '0.375rem',      // 6px
  lg: '0.5rem',        // 8px
  xl: '0.75rem',       // 12px
  '2xl': '1rem',       // 16px
  '3xl': '1.5rem',     // 24px
  full: '9999px',      // Fully rounded
} as const

// Shadow tokens for depth
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.6), 0 1px 2px 0 rgba(0, 0, 0, 0.4)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.6), 0 2px 4px -1px rgba(0, 0, 0, 0.4)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -2px rgba(0, 0, 0, 0.4)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.4)',
} as const

// Component-specific spacing
export const componentSpacing = {
  // Button spacing
  button: {
    padding: {
      sm: `${spacing[2]} ${spacing[3]}`,     // 8px 12px
      md: `${spacing[3]} ${spacing[4]}`,     // 12px 16px
      lg: `${spacing[4]} ${spacing[6]}`,     // 16px 24px
      xl: `${spacing[5]} ${spacing[8]}`,     // 20px 32px
    },
    gap: {
      sm: spacing[2],    // 8px
      md: spacing[3],    // 12px
      lg: spacing[4],    // 16px
    },
  },

  // Input spacing
  input: {
    padding: {
      sm: `${spacing[2]} ${spacing[3]}`,     // 8px 12px
      md: `${spacing[3]} ${spacing[4]}`,     // 12px 16px
      lg: `${spacing[4]} ${spacing[5]}`,     // 16px 20px
    },
  },

  // Card spacing
  card: {
    padding: {
      sm: spacing[4],    // 16px
      md: spacing[6],    // 24px
      lg: spacing[8],    // 32px
    },
    gap: spacing[4],     // 16px between card elements
  },

  // Modal spacing
  modal: {
    padding: spacing[6],           // 24px
    margin: spacing[4],            // 16px
    backdrop: spacing[0],          // No padding for backdrop
  },

  // Navigation spacing
  nav: {
    padding: {
      horizontal: spacing[6],      // 24px
      vertical: spacing[4],        // 16px
    },
    gap: spacing[6],              // 24px between nav items
  },

  // Timer component spacing
  timer: {
    padding: spacing[8],          // 32px
    gap: spacing[6],              // 24px between elements
    controls: {
      gap: spacing[4],            // 16px between controls
      padding: spacing[3],        // 12px control padding
    },
  },

  // Dashboard spacing
  dashboard: {
    grid: {
      gap: spacing[6],            // 24px grid gap
      padding: spacing[8],        // 32px container padding
    },
    card: {
      padding: spacing[6],        // 24px card padding
      gap: spacing[4],            // 16px card content gap
    },
  },
} as const
