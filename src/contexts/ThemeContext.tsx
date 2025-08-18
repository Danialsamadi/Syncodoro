import React, { createContext, useContext, useState, useEffect } from 'react';
import { lightTheme } from '../design-system/lightTheme';
import { darkTheme } from '../design-system/darkTheme';
import { colors } from '../design-system/colors';

type ThemeMode = 'light' | 'dark' | 'system';
type Theme = typeof lightTheme | typeof darkTheme;

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get initial theme preference from localStorage or default to 'system'
  const getInitialThemeMode = (): ThemeMode => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode as ThemeMode) || 'system';
  };

  // Determine initial dark mode state
  const getInitialIsDark = (): boolean => {
    const mode = getInitialThemeMode();
    if (mode === 'dark') return true;
    if (mode === 'light') return false;
    // System preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  const initialIsDark = getInitialIsDark();
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode);
  const [isDark, setIsDark] = useState<boolean>(initialIsDark);
  const [theme, setTheme] = useState<Theme>(initialIsDark ? darkTheme : lightTheme);

  // Apply theme based on mode
  useEffect(() => {
    const applyTheme = (dark: boolean) => {
      setIsDark(dark);
      setTheme(dark ? darkTheme : lightTheme);
      
      // Toggle dark class on html element for Tailwind dark mode
      if (dark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // Save theme mode to localStorage
    localStorage.setItem('themeMode', themeMode);

    if (themeMode === 'system') {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark);

      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Apply explicit theme choice
      applyTheme(themeMode === 'dark');
    }
  }, [themeMode]);

  // Apply CSS variables for the current theme
  useEffect(() => {
    // Get all CSS variables from the theme
    const cssVars = Object.entries({
      // Primary palette - use imported colors directly since they're not in the theme object
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
      
      // Text colors
      '--text-primary': theme.colors.text.primary,
      '--text-secondary': theme.colors.text.secondary,
      '--text-tertiary': theme.colors.text.tertiary,
      '--text-disabled': theme.colors.text.disabled,
      '--text-inverse': theme.colors.text.inverse,
      
      // Surface colors
      '--bg-primary': theme.colors.background.primary,
      '--surface-level-1': theme.colors.surface.level1,
      '--surface-level-2': theme.colors.surface.level2,
      '--surface-level-3': theme.colors.surface.level3,
      '--surface-level-4': theme.colors.surface.level4,
      '--surface-level-5': theme.colors.surface.level5,
      
      // Border colors
      '--border-primary': theme.colors.border.primary,
      '--border-secondary': theme.colors.border.secondary,
      '--border-tertiary': theme.colors.border.tertiary,
      '--border-focus': theme.colors.border.focus,
      
      // Shadow variables
      '--shadow-sm': theme.shadows.sm,
      '--shadow-md': theme.shadows.md,
      '--shadow-lg': theme.shadows.lg,
      '--shadow-xl': theme.shadows.xl,
      '--shadow-2xl': theme.shadows['2xl'],
      '--shadow-focus': theme.shadows.glow.focus,
      '--shadow-glow-primary': theme.shadows.glow.primary,
      '--shadow-glow-secondary': theme.shadows.glow.secondary,
      
      // Timer colors
      '--timer-focus': theme.colors.timer.focus.primary,
      '--timer-short-break': theme.colors.timer.shortBreak.primary,
      '--timer-long-break': theme.colors.timer.longBreak.primary,
    });

    // Apply CSS variables to :root
    cssVars.forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Export useTheme as a regular function to avoid HMR issues
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
