import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Timer, BarChart3, User, Settings, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'
import { ThemeToggleCompact } from './ThemeToggle'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  const navItems = [
    { path: '/', label: 'Timer', icon: Timer },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <nav className="bg-surface-primary dark:bg-gray-900 shadow-black-md border-b border-border-primary dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-timer-pomodoro rounded-xl flex items-center justify-center shadow-glow-red group-hover:shadow-glow-red transition-all duration-300">
              <Timer className="w-6 h-6 text-text-primary dark:text-gray-100" />
            </div>
            <span className="text-2xl font-bold text-text-primary dark:text-gray-100 tracking-tight">Syncodoro</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Always show Timer link */}
            <Link
              to="/"
              className={`nav-item flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/')
                  ? 'nav-item-active bg-surface-tertiary dark:bg-gray-800 border border-timer-pomodoro shadow-glow-red'
                  : 'hover:bg-surface-secondary dark:hover:bg-gray-800 border border-transparent'
              }`}
            >
              <Timer className="w-4 h-4" />
              <span>Timer</span>
            </Link>
            {user ? (
              <>
                {navItems.slice(1).map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`nav-item flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(path)
                        ? 'nav-item-active bg-surface-tertiary dark:bg-gray-800 border border-timer-pomodoro shadow-glow-red'
                        : 'hover:bg-surface-secondary dark:hover:bg-gray-800 border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </Link>
                ))}
                
                <button
                  onClick={signOut}
                  className="nav-item flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-secondary dark:hover:bg-gray-800 border border-transparent hover:border-border-primary dark:hover:border-gray-700 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="btn-primary"
              >
                Sign In
              </Link>
            )}
            <ThemeToggleCompact />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <ThemeToggleCompact />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-gray-200 hover:bg-surface-secondary dark:hover:bg-gray-800 transition-all duration-200"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border-primary dark:border-gray-700 bg-surface-secondary dark:bg-gray-800">
            <div className="flex flex-col space-y-2">
              {/* Always show Timer link */}
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className={`nav-item flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/')
                    ? 'nav-item-active bg-surface-tertiary dark:bg-gray-700 border border-timer-pomodoro shadow-glow-red'
                    : 'hover:bg-surface-tertiary dark:hover:bg-gray-700 border border-transparent'
                }`}
              >
                <Timer className="w-4 h-4" />
                <span>Timer</span>
              </Link>
              
              {user ? (
                <>
                  {navItems.slice(1).map(({ path, label, icon: Icon }) => (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`nav-item flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive(path)
                          ? 'nav-item-active bg-surface-tertiary dark:bg-gray-700 border border-timer-pomodoro shadow-glow-red'
                          : 'hover:bg-surface-tertiary dark:hover:bg-gray-700 border border-transparent'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </Link>
                  ))}
                  
                  <button
                    onClick={() => {
                      signOut()
                      setIsMenuOpen(false)
                    }}
                    className="nav-item flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium hover:bg-surface-tertiary dark:hover:bg-gray-700 border border-transparent hover:border-border-primary dark:hover:border-gray-700 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="btn-primary mx-2"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
