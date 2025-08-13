// Animation tokens for smooth transitions and micro-interactions
export const animations = {
  // Duration tokens
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '750ms',
    slowest: '1000ms',
  },

  // Easing functions
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    
    // Custom cubic-bezier curves
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',        // Smooth acceleration/deceleration
    snappy: 'cubic-bezier(0.4, 0, 0.6, 1)',        // Snappy feel
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Bounce effect
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Elastic feel
  },

  // Common transition combinations
  transitions: {
    // Basic transitions
    fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',

    // Specific property transitions
    color: 'color 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    background: 'background-color 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    border: 'border-color 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    shadow: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)',

    // Component-specific transitions
    button: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    modal: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    tooltip: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    dropdown: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Keyframe animations
  keyframes: {
    // Fade animations
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    fadeOut: {
      from: { opacity: 1 },
      to: { opacity: 0 },
    },

    // Scale animations
    scaleIn: {
      from: { transform: 'scale(0.9)', opacity: 0 },
      to: { transform: 'scale(1)', opacity: 1 },
    },
    scaleOut: {
      from: { transform: 'scale(1)', opacity: 1 },
      to: { transform: 'scale(0.9)', opacity: 0 },
    },

    // Slide animations
    slideInUp: {
      from: { transform: 'translateY(100%)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
    },
    slideInDown: {
      from: { transform: 'translateY(-100%)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
    },
    slideInLeft: {
      from: { transform: 'translateX(-100%)', opacity: 0 },
      to: { transform: 'translateX(0)', opacity: 1 },
    },
    slideInRight: {
      from: { transform: 'translateX(100%)', opacity: 0 },
      to: { transform: 'translateX(0)', opacity: 1 },
    },

    // Bounce animation
    bounce: {
      '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
      '40%, 43%': { transform: 'translate3d(0, -30px, 0)' },
      '70%': { transform: 'translate3d(0, -15px, 0)' },
      '90%': { transform: 'translate3d(0, -4px, 0)' },
    },

    // Pulse animation
    pulse: {
      '0%': { transform: 'scale(1)' },
      '50%': { transform: 'scale(1.05)' },
      '100%': { transform: 'scale(1)' },
    },

    // Spin animation
    spin: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },

    // Timer-specific animations
    timerPulse: {
      '0%': { transform: 'scale(1)', opacity: 1 },
      '50%': { transform: 'scale(1.02)', opacity: 0.8 },
      '100%': { transform: 'scale(1)', opacity: 1 },
    },

    // Progress animation
    progressFill: {
      from: { transform: 'scaleX(0)' },
      to: { transform: 'scaleX(1)' },
    },

    // Glow effect
    glow: {
      '0%': { boxShadow: '0 0 5px rgba(239, 68, 68, 0.5)' },
      '50%': { boxShadow: '0 0 20px rgba(239, 68, 68, 0.8)' },
      '100%': { boxShadow: '0 0 5px rgba(239, 68, 68, 0.5)' },
    },
  },

  // Animation presets for common use cases
  presets: {
    // Modal animations
    modalEnter: {
      animation: 'scaleIn 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
    modalExit: {
      animation: 'scaleOut 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    },

    // Tooltip animations
    tooltipEnter: {
      animation: 'fadeIn 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
    tooltipExit: {
      animation: 'fadeOut 100ms cubic-bezier(0.4, 0, 0.2, 1)',
    },

    // Button hover effects
    buttonHover: {
      transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
      transform: 'translateY(-1px)',
    },
    buttonPress: {
      transition: 'all 100ms cubic-bezier(0.4, 0, 0.2, 1)',
      transform: 'translateY(0px) scale(0.98)',
    },

    // Timer animations
    timerStart: {
      animation: 'timerPulse 2s ease-in-out infinite',
    },
    timerComplete: {
      animation: 'bounce 1s ease-in-out',
    },

    // Loading animations
    spin: {
      animation: 'spin 1s linear infinite',
    },
    pulse: {
      animation: 'pulse 2s ease-in-out infinite',
    },

    // Page transitions
    pageEnter: {
      animation: 'slideInUp 400ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
    pageExit: {
      animation: 'fadeOut 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    },

    // Card hover effects
    cardHover: {
      transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -2px rgba(0, 0, 0, 0.4)',
    },

    // Focus effects
    focusRing: {
      transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
      outline: '2px solid rgba(239, 68, 68, 0.5)',
      outlineOffset: '2px',
    },
  },
} as const

// CSS animation utilities
export const animationClasses = {
  // Duration classes
  'animate-fast': 'transition-all duration-150 ease-smooth',
  'animate-normal': 'transition-all duration-300 ease-smooth',
  'animate-slow': 'transition-all duration-500 ease-smooth',

  // Common animations
  'animate-fade-in': 'animate-fadeIn duration-300 ease-smooth',
  'animate-fade-out': 'animate-fadeOut duration-200 ease-smooth',
  'animate-scale-in': 'animate-scaleIn duration-300 ease-smooth',
  'animate-scale-out': 'animate-scaleOut duration-200 ease-smooth',
  'animate-slide-up': 'animate-slideInUp duration-400 ease-smooth',
  'animate-slide-down': 'animate-slideInDown duration-400 ease-smooth',

  // Interactive states
  'hover-lift': 'hover:transform hover:-translate-y-1 transition-transform duration-150 ease-smooth',
  'hover-scale': 'hover:scale-105 transition-transform duration-150 ease-smooth',
  'active-press': 'active:scale-98 transition-transform duration-100 ease-smooth',

  // Loading states
  'animate-spin': 'animate-spin duration-1000 ease-linear infinite',
  'animate-pulse': 'animate-pulse duration-2000 ease-in-out infinite',

  // Timer specific
  'animate-timer-pulse': 'animate-timerPulse duration-2000 ease-in-out infinite',
  'animate-timer-complete': 'animate-bounce duration-1000 ease-in-out',
} as const
