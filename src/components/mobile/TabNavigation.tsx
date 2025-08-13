import { cn } from '../../utils/helpers'

interface TabNavigationProps {
  activeTab: 'focus' | 'break'
  onTabChange: (tab: 'focus' | 'break') => void
  currentType: 'pomodoro' | 'short-break' | 'long-break'
}

export default function TabNavigation({ activeTab, onTabChange, currentType }: TabNavigationProps) {
  const getTabButtonClass = (tab: 'focus' | 'break') => {
    const isActive = (tab === 'focus' && currentType === 'pomodoro') ||
                    (tab === 'break' && (currentType === 'short-break' || currentType === 'long-break'))
    
    return cn(
      'px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200',
      isActive 
        ? 'bg-gray-900 text-white shadow-md' 
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    )
  }

  return (
    <div className="px-6 mb-8">
      <div className="flex items-center space-x-1 bg-gray-100 rounded-full p-1">
        <button
          onClick={() => onTabChange('focus')}
          className={getTabButtonClass('focus')}
        >
          FOCUS
        </button>
        <button
          onClick={() => onTabChange('break')}
          className={getTabButtonClass('break')}
        >
          BREAK
        </button>
      </div>
    </div>
  )
}