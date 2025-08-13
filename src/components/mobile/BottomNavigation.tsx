import { Home, Calendar, Circle, ChartColumnIncreasing, Settings } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

interface BottomNavigationProps {
  activeTab: 'home' | 'calendar' | 'statistics' | 'settings'
  onTabChange: (tab: 'home' | 'calendar' | 'statistics' | 'settings') => void
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const getNavItemClass = (path: string) => {
    return `flex flex-col items-center space-y-1 py-2 px-4 rounded-lg transition-all duration-200 ${
      isActive(path) 
        ? 'text-gray-900' 
        : 'text-gray-400 hover:text-gray-600'
    }`
  }

  const getRecordButtonClass = () => {
    const isRecordActive = isActive('/')
    return `flex flex-col items-center space-y-1 py-2 px-4 rounded-lg transition-all duration-200 ${
      isRecordActive ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
    }`
  }

  return (
    <div className="flex items-center justify-around py-4 px-6 bg-white border-t border-gray-200">
      <Link to="/" className={getNavItemClass('/')}>
        <Home className="w-6 h-6" />
        <span className="text-xs font-medium">Home</span>
      </Link>

      <Link to="/dashboard" className={getNavItemClass('/dashboard')}>
        <Calendar className="w-6 h-6" />
        <span className="text-xs font-medium">Calendar</span>
      </Link>

      <Link to="/" className={getRecordButtonClass()}>
        {isActive('/') ? (
          <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        ) : (
          <Circle className="w-6 h-6" />
        )}
        <span className="text-xs font-semibold">Pomodoro</span>
      </Link>

      <Link to="/profile" className={getNavItemClass('/profile')}>
        <ChartColumnIncreasing className="w-6 h-6" />
        <span className="text-xs font-medium">Statistic</span>
      </Link>

      <Link to="/settings" className={getNavItemClass('/settings')}>
        <Settings className="w-6 h-6" />
        <span className="text-xs font-medium">Settings</span>
      </Link>
    </div>
  )
}