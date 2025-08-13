interface StatusMessageProps {
  phase: 'interval' | 'break' | 'new-session'
  timerType: 'pomodoro' | 'short-break' | 'long-break'
  isRunning: boolean
  isPaused: boolean
}

export default function StatusMessage({ phase, timerType, isRunning, isPaused }: StatusMessageProps) {
  const getMessage = () => {
    if (phase === 'new-session') {
      return {
        title: 'WHAT ARE WE',
        subtitle: 'WORKING ON TODAY?'
      }
    }
    
    if (phase === 'break') {
      return {
        title: 'WELL DONE!',
        subtitle: 'HOW ABOUT A BREAK?'
      }
    }
    
    if (phase === 'interval') {
      if (isRunning && !isPaused) {
        return {
          title: 'FOCUS TIME',
          subtitle: 'STAY CONCENTRATED'
        }
      }
      return {
        title: 'READY TO START',
        subtitle: 'FOCUS SESSION'
      }
    }
    
    return {
      title: 'TIMER READY',
      subtitle: 'PRESS START'
    }
  }

  const { title, subtitle } = getMessage()

  return (
    <div className="text-center mb-8 px-6">
      <div className="text-sm font-bold text-gray-500 tracking-wider mb-1">
        {title}
      </div>
      <div className="text-sm font-bold text-gray-500 tracking-wider">
        {subtitle}
      </div>
    </div>
  )
}