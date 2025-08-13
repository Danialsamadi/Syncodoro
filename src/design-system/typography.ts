// Typography system following Apple Human Interface Guidelines
// with Material Design 3 influence for web

export const typography = {
  // Font families - Apple system fonts with fallbacks
  fontFamily: {
    // Apple's SF Pro equivalent for web
    system: [
      '-apple-system',
      'BlinkMacSystemFont', 
      'SF Pro Display',
      'SF Pro Text',
      'Segoe UI',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      'sans-serif'
    ],
    
    // Monospace for timer and code
    mono: [
      'SF Mono',
      'Monaco', 
      'Menlo',
      'Roboto Mono',
      'Consolas',
      'Liberation Mono',
      'Courier New',
      'monospace'
    ],
    
    // Display font for headings
    display: [
      '-apple-system',
      'BlinkMacSystemFont',
      'SF Pro Display',
      'system-ui',
      'sans-serif'
    ],
  },

  // Font sizes following Apple's type scale
  fontSize: {
    // Apple HIG Large Title equivalent
    '6xl': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],    // 56px
    '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],      // 48px
    '4xl': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.015em' }],   // 40px
    
    // Apple HIG Title equivalent  
    '3xl': ['2rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],     // 32px
    '2xl': ['1.75rem', { lineHeight: '1.3', letterSpacing: '-0.005em' }],  // 28px
    'xl': ['1.5rem', { lineHeight: '1.35' }],                              // 24px
    
    // Apple HIG Headline equivalent
    'lg': ['1.25rem', { lineHeight: '1.4' }],                              // 20px
    'base': ['1rem', { lineHeight: '1.5' }],                               // 16px
    
    // Apple HIG Body equivalent
    'sm': ['0.875rem', { lineHeight: '1.5' }],                             // 14px
    'xs': ['0.75rem', { lineHeight: '1.5' }],                              // 12px
    
    // Apple HIG Caption equivalent
    '2xs': ['0.625rem', { lineHeight: '1.4' }],                            // 10px
  },

  // Font weights - Apple HIG inspired
  fontWeight: {
    thin: 100,        // Ultralight
    extralight: 200,  // Thin
    light: 300,       // Light
    normal: 400,      // Regular
    medium: 500,      // Medium
    semibold: 600,    // Semibold
    bold: 700,        // Bold
    extrabold: 800,   // Heavy
    black: 900,       // Black
  },

  // Line heights
  lineHeight: {
    none: 1,
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter spacing - Apple HIG inspired
  letterSpacing: {
    tighter: '-0.02em',
    tight: '-0.01em',
    normal: '0em',
    wide: '0.01em',
    wider: '0.02em',
    widest: '0.05em',
  },

  // Typography scales for different contexts
  scales: {
    // Display typography (Large titles, hero text)
    display: {
      large: {
        fontSize: '3.5rem',      // 56px
        fontWeight: 700,
        lineHeight: 1.1,
        letterSpacing: '-0.02em',
        fontFamily: 'var(--font-display)',
      },
      medium: {
        fontSize: '3rem',        // 48px
        fontWeight: 600,
        lineHeight: 1.1,
        letterSpacing: '-0.02em',
        fontFamily: 'var(--font-display)',
      },
      small: {
        fontSize: '2.5rem',      // 40px
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: '-0.015em',
        fontFamily: 'var(--font-display)',
      },
    },

    // Headings (Apple HIG Title styles)
    heading: {
      h1: {
        fontSize: '2rem',        // 32px
        fontWeight: 700,
        lineHeight: 1.25,
        letterSpacing: '-0.01em',
      },
      h2: {
        fontSize: '1.75rem',     // 28px
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: '-0.005em',
      },
      h3: {
        fontSize: '1.5rem',      // 24px
        fontWeight: 600,
        lineHeight: 1.35,
      },
      h4: {
        fontSize: '1.25rem',     // 20px
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1rem',        // 16px
        fontWeight: 600,
        lineHeight: 1.5,
      },
      h6: {
        fontSize: '0.875rem',    // 14px
        fontWeight: 600,
        lineHeight: 1.5,
      },
    },

    // Body text (Apple HIG Body styles)
    body: {
      large: {
        fontSize: '1.125rem',    // 18px
        fontWeight: 400,
        lineHeight: 1.5,
      },
      medium: {
        fontSize: '1rem',        // 16px
        fontWeight: 400,
        lineHeight: 1.5,
      },
      small: {
        fontSize: '0.875rem',    // 14px
        fontWeight: 400,
        lineHeight: 1.5,
      },
    },

    // Timer display (Custom monospace)
    timer: {
      large: {
        fontSize: '6rem',        // 96px
        fontWeight: 200,         // Ultralight
        lineHeight: 1,
        letterSpacing: '-0.02em',
        fontFamily: 'var(--font-mono)',
      },
      medium: {
        fontSize: '4.5rem',      // 72px
        fontWeight: 200,
        lineHeight: 1,
        letterSpacing: '-0.015em',
        fontFamily: 'var(--font-mono)',
      },
      small: {
        fontSize: '3rem',        // 48px
        fontWeight: 300,
        lineHeight: 1,
        letterSpacing: '-0.01em',
        fontFamily: 'var(--font-mono)',
      },
    },

    // Interface elements
    interface: {
      // Button text
      button: {
        large: {
          fontSize: '1.125rem',   // 18px
          fontWeight: 600,
          lineHeight: 1,
          letterSpacing: '0.01em',
        },
        medium: {
          fontSize: '1rem',       // 16px
          fontWeight: 600,
          lineHeight: 1,
        },
        small: {
          fontSize: '0.875rem',   // 14px
          fontWeight: 600,
          lineHeight: 1,
        },
      },

      // Navigation
      navigation: {
        fontSize: '1rem',         // 16px
        fontWeight: 500,
        lineHeight: 1.5,
      },

      // Labels and captions
      label: {
        fontSize: '0.875rem',     // 14px
        fontWeight: 500,
        lineHeight: 1.4,
        textTransform: 'none' as const,
      },
      
      caption: {
        fontSize: '0.75rem',      // 12px
        fontWeight: 400,
        lineHeight: 1.4,
        opacity: 0.7,
      },

      // Stats and metrics
      metric: {
        number: {
          fontSize: '2.5rem',     // 40px
          fontWeight: 300,        // Light weight for large numbers
          lineHeight: 1,
          fontFamily: 'var(--font-mono)',
        },
        label: {
          fontSize: '0.875rem',   // 14px
          fontWeight: 500,
          lineHeight: 1.4,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.05em',
          opacity: 0.8,
        },
      },
    },
  },
} as const

// CSS utility classes
export const typographyClasses = {
  // Display
  'text-display-lg': 'text-6xl font-bold leading-tight tracking-tighter',
  'text-display-md': 'text-5xl font-semibold leading-tight tracking-tighter', 
  'text-display-sm': 'text-4xl font-semibold leading-tight tracking-tight',

  // Headings
  'text-h1': 'text-3xl font-bold leading-tight tracking-tight',
  'text-h2': 'text-2xl font-semibold leading-snug tracking-tight',
  'text-h3': 'text-xl font-semibold leading-snug',
  'text-h4': 'text-lg font-semibold leading-normal',
  'text-h5': 'text-base font-semibold leading-normal',
  'text-h6': 'text-sm font-semibold leading-normal',

  // Body
  'text-body-lg': 'text-lg font-normal leading-normal',
  'text-body': 'text-base font-normal leading-normal',
  'text-body-sm': 'text-sm font-normal leading-normal',

  // Timer
  'text-timer-lg': 'text-8xl font-extralight leading-none tracking-tighter font-mono',
  'text-timer': 'text-7xl font-extralight leading-none tracking-tight font-mono',
  'text-timer-sm': 'text-5xl font-light leading-none tracking-tight font-mono',

  // Interface
  'text-button-lg': 'text-lg font-semibold leading-none tracking-wide',
  'text-button': 'text-base font-semibold leading-none',
  'text-button-sm': 'text-sm font-semibold leading-none',
  
  'text-nav': 'text-base font-medium leading-normal',
  'text-label': 'text-sm font-medium leading-tight',
  'text-caption': 'text-xs font-normal leading-tight opacity-70',

  // Metrics
  'text-metric-number': 'text-4xl font-light leading-none font-mono',
  'text-metric-label': 'text-sm font-medium leading-tight uppercase tracking-wider opacity-80',
} as const

