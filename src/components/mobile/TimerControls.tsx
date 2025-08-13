interface TimerControlsProps {
  phase: 'interval' | 'break' | 'new-session'
  isRunning: boolean
  isPaused: boolean
  onAction: (action: 'start' | 'pause' | 'continue' | 'break' | 'skip' | 'end-session') => void
}

export default function TimerControls({ phase, isRunning, isPaused, onAction }: TimerControlsProps) {
  const getMainButton = () => {
    if (phase === 'new-session') {
      return {
        text: 'START',
        action: 'start' as const,
        variant: 'primary'
      }
    }
    
    if (phase === 'break') {
      return {
        text: 'BREAK',
        action: 'break' as const,
        variant: 'primary'
      }
    }
    
    if (phase === 'interval') {
      if (isRunning && !isPaused) {
        return {
          text: 'PAUSE',
          action: 'pause' as const,
          variant: 'secondary'
        }
      }
      return {
        text: 'CONTINUE',
        action: 'continue' as const,
        variant: 'primary'
      }
    }
    
    return {
      text: 'START',
      action: 'start' as const,
      variant: 'primary'
    }
  }

  const getSecondaryButton = () => {
    if (phase === 'break') {
      return {
        text: 'SKIP THE BREAK',
        action: 'skip' as const
      }
    }
    
    if (phase === 'interval' && isRunning) {
      return {
        text: 'END SESSION',
        action: 'end-session' as const
      }
    }
    
    return null
  }

  const mainButton = getMainButton()
  const secondaryButton = getSecondaryButton()

  return (
    <div className="flex flex-col items-center space-y-4 mb-16 px-6">
      <button
        onClick={() => onAction(mainButton.action)}
        className={`px-12 py-4 rounded-full font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${
          mainButton.variant === 'primary'
            ? 'bg-gray-900 text-white hover:bg-gray-800'
            : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
        }`}
      >
        {mainButton.text}
      </button>
      
      {secondaryButton && (
        <button
          onClick={() => onAction(secondaryButton.action)}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors underline"
        >
          {secondaryButton.text}
        </button>
      )}
    </div>
  )
}