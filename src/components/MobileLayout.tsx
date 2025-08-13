import { ReactNode } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Home, Calendar, Circle, BarChart3, Settings } from 'lucide-react'

interface MobileLayoutProps {
  children: ReactNode
  title: string
  showSettings?: boolean
}

export default function MobileLayout({ children, title, showSettings = true }: MobileLayoutProps) {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const getNavItemClass = (path: string) => {
    return `flex flex-col items-center space-y-1 py-2 px-4 rounded-lg transition-all duration-200 ${
      isActive(path) 
        ? 'text-primary-600' 
        : 'text-text-tertiary hover:text-text-secondary'
    }`
  }

  return (
    <div className="min-h-screen bg-primary-950 flex flex-col" style={{ backgroundColor: "#0A1F3F" }}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 pt-12">
        <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
        {showSettings && (
          <Link 
            to="/settings"
            className="p-2 rounded-xl hover:bg-surface-level-2 transition-colors"
          >
            <Settings className="w-6 h-6 text-text-secondary" />
          </Link>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-around py-4 px-6 bg-surface-level-1 border-t border-border-secondary">
        <Link to="/" className={getNavItemClass('/')}>
          <Home className="w-6 h-6" />
          <span className="text-xs font-medium">Home</span>
        </Link>

        <Link to="/dashboard" className={getNavItemClass('/dashboard')}>
          <Calendar className="w-6 h-6" />
          <span className="text-xs font-medium">My Task</span>
        </Link>

        <Link to="/" className={getNavItemClass('/')}>
          {isActive('/') ? (
            <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          ) : (
            <Circle className="w-6 h-6" />
          )}
          <span className="text-xs font-semibold">Record</span>
        </Link>

        <Link to="/profile" className={getNavItemClass('/profile')}>
          <BarChart3 className="w-6 h-6" />
          <span className="text-xs font-medium">Reports</span>
        </Link>

        <Link to="/settings" className={getNavItemClass('/settings')}>
          <Settings className="w-6 h-6" />
          <span className="text-xs font-medium">Setting</span>
        </Link>
      </div>
    </div>
  )
}
