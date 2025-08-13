import React, { createContext, useContext, useState, useEffect } from 'react';
import { lightTheme } from '../design-system/lightTheme';
import { darkTheme } from '../design-system/darkTheme';

type ThemeMode = 'light' | 'dark' | 'system';
type Theme = typeof lightTheme;

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

  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>(lightTheme);

  // Apply theme based on mode
  useEffect(() => {
    const applyTheme = (dark: boolean) => {
      setIsDark(dark);
      setTheme(dark ? darkTheme : lightTheme);
      document.documentElement.classList.toggle('dark', dark);
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
      // Primary palette
      '--color-primary-950': theme.colors.primary?.[950] || darkTheme.colors.primary[950],
      '--color-primary-900': theme.colors.primary?.[900] || darkTheme.colors.primary[900],
      '--color-primary-800': theme.colors.primary?.[800] || darkTheme.colors.primary[800],
      '--color-primary-700': theme.colors.primary?.[700] || darkTheme.colors.primary[700],
      '--color-primary-600': theme.colors.primary?.[600] || darkTheme.colors.primary[600],
      '--color-primary-500': theme.colors.primary?.[500] || darkTheme.colors.primary[500],
      '--color-primary-400': theme.colors.primary?.[400] || darkTheme.colors.primary[400],
      '--color-primary-300': theme.colors.primary?.[300] || darkTheme.colors.primary[300],
      '--color-primary-200': theme.colors.primary?.[200] || darkTheme.colors.primary[200],
      '--color-primary-100': theme.colors.primary?.[100] || darkTheme.colors.primary[100],
      '--color-primary-50': theme.colors.primary?.[50] || darkTheme.colors.primary[50],
      
      // Text colors
      '--text-primary': theme.colors.text.primary,
      '--text-secondary': theme.colors.text.secondary,
      '--text-tertiary': theme.colors.text.tertiary,
      '--text-disabled': theme.colors.text.disabled,
      '--text-inverse': theme.colors.text.inverse,
      
      // Surface colors
      '--surface-background': theme.colors.background.primary,
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

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
