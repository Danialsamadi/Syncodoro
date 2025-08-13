import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Timer, BarChart3, User, Settings, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, signOut, profile } = useAuth()
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
    <nav className="bg-surface-primary shadow-black-md border-b border-border-primary">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-timer-pomodoro rounded-xl flex items-center justify-center shadow-glow-red group-hover:shadow-glow-red transition-all duration-300">
              <Timer className="w-6 h-6 text-text-primary" />
            </div>
            <span className="text-2xl font-bold text-text-primary tracking-tight">Syncodoro</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Always show Timer link */}
            <Link
              to="/"
              className={`nav-item flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/')
                  ? 'nav-item-active bg-surface-tertiary border border-timer-pomodoro shadow-glow-red'
                  : 'hover:bg-surface-secondary border border-transparent'
              }`}
            >
              <Timer className="w-4 h-4" />
              <span>Timer</span>
            </Link>
            {user ? (
              <>
                {/* Show username if available */}
                {profile?.username && (
                  <span className="text-text-primary font-semibold px-3 py-1 bg-surface-secondary rounded-lg border border-border-primary">@{profile.username}</span>
                )}
                {navItems.slice(1).map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`nav-item flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(path)
                        ? 'nav-item-active bg-surface-tertiary border border-timer-pomodoro shadow-glow-red'
                        : 'hover:bg-surface-secondary border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </Link>
                ))}
                
                <button
                  onClick={signOut}
                  className="nav-item flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-secondary border border-transparent hover:border-border-primary transition-all duration-200"
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
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-all duration-200"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border-primary bg-surface-secondary">
            <div className="flex flex-col space-y-2">
              {/* Always show Timer link */}
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className={`nav-item flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/')
                    ? 'nav-item-active bg-surface-tertiary border border-timer-pomodoro shadow-glow-red'
                    : 'hover:bg-surface-tertiary border border-transparent'
                }`}
              >
                <Timer className="w-4 h-4" />
                <span>Timer</span>
              </Link>
              
              {user ? (
                <>
                  {/* Show username if available */}
                  {profile?.username && (
                    <span className="text-text-primary font-semibold px-4 py-2 bg-surface-tertiary rounded-lg border border-border-primary mx-2">@{profile.username}</span>
                  )}
                  {navItems.slice(1).map(({ path, label, icon: Icon }) => (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`nav-item flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive(path)
                          ? 'nav-item-active bg-surface-tertiary border border-timer-pomodoro shadow-glow-red'
                          : 'hover:bg-surface-tertiary border border-transparent'
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
                    className="nav-item flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium hover:bg-surface-tertiary border border-transparent hover:border-border-primary transition-all duration-200"
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
