import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, Monitor } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  showLabel = false 
}) => {
  const { themeMode, setThemeMode, isDark } = useTheme();

  const handleThemeChange = () => {
    // Cycle through theme modes: light -> dark -> system -> light
    const nextMode = themeMode === 'light' 
      ? 'dark' 
      : themeMode === 'dark' 
        ? 'system' 
        : 'light';
    
    setThemeMode(nextMode);
  };

  return (
    <button
      onClick={handleThemeChange}
      className={`flex items-center justify-center gap-2 rounded-lg p-2 transition-all duration-250 ${
        isDark 
          ? 'bg-gray-800 hover:bg-gray-700 text-white' 
          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
      } ${className}`}
      aria-label={`Switch to ${
        themeMode === 'light' 
          ? 'dark' 
          : themeMode === 'dark' 
            ? 'system' 
            : 'light'
      } theme`}
    >
      {themeMode === 'light' && (
        <>
          <Sun size={18} className="text-warning-600" />
          {showLabel && <span className="text-sm font-medium">Light</span>}
        </>
      )}
      
      {themeMode === 'dark' && (
        <>
          <Moon size={18} className="text-primary-400" />
          {showLabel && <span className="text-sm font-medium">Dark</span>}
        </>
      )}
      
      {themeMode === 'system' && (
        <>
          <Monitor size={18} className="text-secondary-500" />
          {showLabel && <span className="text-sm font-medium">System</span>}
        </>
      )}
    </button>
  );
};

// Compact version of the theme toggle that just shows the icon
export const ThemeToggleCompact: React.FC<{ className?: string }> = ({ 
  className = '' 
}) => {
  const { themeMode, setThemeMode, isDark } = useTheme();

  const handleThemeChange = () => {
    // Toggle between light and dark only
    setThemeMode(isDark ? 'light' : 'dark');
  };

  return (
    <button
      onClick={handleThemeChange}
      className={`p-2 rounded-full transition-all duration-250 ${
        isDark 
          ? 'bg-gray-800 hover:bg-gray-700 text-white' 
          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
      } ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {isDark ? (
        <Sun size={18} className="text-warning-500" />
      ) : (
        <Moon size={18} className="text-primary-600" />
      )}
    </button>
  );
};

export default ThemeToggle;
