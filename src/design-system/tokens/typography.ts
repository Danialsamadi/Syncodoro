// Typography tokens for black theme
export const typography = {
  // Font families
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
    display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
  },

  // Font sizes (using rem for scalability)
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
    '7xl': '4.5rem',   // 72px
  },

  // Font weights
  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  // Line heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Typography scales for different components
  scales: {
    // Headings
    h1: {
      fontSize: '3rem',        // 48px
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: '-0.025em',
      color: 'var(--color-text-primary)',
    },
    h2: {
      fontSize: '2.25rem',     // 36px
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: '-0.025em',
      color: 'var(--color-text-primary)',
    },
    h3: {
      fontSize: '1.875rem',    // 30px
      fontWeight: 600,
      lineHeight: 1.375,
      color: 'var(--color-text-primary)',
    },
    h4: {
      fontSize: '1.5rem',      // 24px
      fontWeight: 600,
      lineHeight: 1.375,
      color: 'var(--color-text-primary)',
    },
    h5: {
      fontSize: '1.25rem',     // 20px
      fontWeight: 500,
      lineHeight: 1.5,
      color: 'var(--color-text-primary)',
    },
    h6: {
      fontSize: '1.125rem',    // 18px
      fontWeight: 500,
      lineHeight: 1.5,
      color: 'var(--color-text-primary)',
    },

    // Body text
    body: {
      fontSize: '1rem',        // 16px
      fontWeight: 400,
      lineHeight: 1.5,
      color: 'var(--color-text-primary)',
    },
    bodySmall: {
      fontSize: '0.875rem',    // 14px
      fontWeight: 400,
      lineHeight: 1.5,
      color: 'var(--color-text-secondary)',
    },
    caption: {
      fontSize: '0.75rem',     // 12px
      fontWeight: 400,
      lineHeight: 1.5,
      color: 'var(--color-text-tertiary)',
    },

    // Timer specific
    timerDisplay: {
      fontSize: '4.5rem',      // 72px
      fontWeight: 300,
      lineHeight: 1,
      letterSpacing: '-0.025em',
      fontFamily: 'JetBrains Mono, monospace',
      color: 'var(--color-text-primary)',
    },
    timerDisplayMobile: {
      fontSize: '3rem',        // 48px
      fontWeight: 300,
      lineHeight: 1,
      letterSpacing: '-0.025em',
      fontFamily: 'JetBrains Mono, monospace',
      color: 'var(--color-text-primary)',
    },

    // Button text
    buttonLarge: {
      fontSize: '1.125rem',    // 18px
      fontWeight: 500,
      lineHeight: 1,
      letterSpacing: '0.025em',
    },
    button: {
      fontSize: '1rem',        // 16px
      fontWeight: 500,
      lineHeight: 1,
    },
    buttonSmall: {
      fontSize: '0.875rem',    // 14px
      fontWeight: 500,
      lineHeight: 1,
    },

    // Navigation
    nav: {
      fontSize: '1rem',        // 16px
      fontWeight: 500,
      lineHeight: 1.5,
      color: 'var(--color-text-secondary)',
    },
    navActive: {
      fontSize: '1rem',        // 16px
      fontWeight: 600,
      lineHeight: 1.5,
      color: 'var(--color-text-primary)',
    },

    // Stats and numbers
    statNumber: {
      fontSize: '2.25rem',     // 36px
      fontWeight: 700,
      lineHeight: 1,
      fontFamily: 'JetBrains Mono, monospace',
      color: 'var(--color-text-primary)',
    },
    statLabel: {
      fontSize: '0.875rem',    // 14px
      fontWeight: 500,
      lineHeight: 1.5,
      color: 'var(--color-text-secondary)',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    },
  },
} as const

// CSS classes for typography
export const typographyClasses = {
  // Headings
  'text-h1': 'text-5xl font-bold leading-tight tracking-tight text-primary',
  'text-h2': 'text-4xl font-semibold leading-tight tracking-tight text-primary',
  'text-h3': 'text-3xl font-semibold leading-snug text-primary',
  'text-h4': 'text-2xl font-semibold leading-snug text-primary',
  'text-h5': 'text-xl font-medium leading-normal text-primary',
  'text-h6': 'text-lg font-medium leading-normal text-primary',

  // Body
  'text-body': 'text-base font-normal leading-normal text-primary',
  'text-body-small': 'text-sm font-normal leading-normal text-secondary',
  'text-caption': 'text-xs font-normal leading-normal text-tertiary',

  // Timer
  'text-timer': 'text-7xl font-light leading-none tracking-tight font-mono text-primary',
  'text-timer-mobile': 'text-5xl font-light leading-none tracking-tight font-mono text-primary',

  // Buttons
  'text-button-lg': 'text-lg font-medium leading-none tracking-wide',
  'text-button': 'text-base font-medium leading-none',
  'text-button-sm': 'text-sm font-medium leading-none',

  // Navigation
  'text-nav': 'text-base font-medium leading-normal text-secondary',
  'text-nav-active': 'text-base font-semibold leading-normal text-primary',

  // Stats
  'text-stat-number': 'text-4xl font-bold leading-none font-mono text-primary',
  'text-stat-label': 'text-sm font-medium leading-normal text-secondary uppercase tracking-wide',
} as const
