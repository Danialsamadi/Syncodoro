import { formatTime, getTimerProgress } from '../../utils/helpers'

interface CircularTimerProps {
  timeRemaining: number
  totalTime: number
  isRunning: boolean
  timerType: 'pomodoro' | 'short-break' | 'long-break'
  sessionCount: number
  finishedAt?: Date
}

export default function CircularTimer({ 
  timeRemaining, 
  totalTime, 
  isRunning, 
  timerType,
  sessionCount,
  finishedAt 
}: CircularTimerProps) {
  const progress = getTimerProgress(timeRemaining, totalTime)
  const circumference = 2 * Math.PI * 140 // radius of 140
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const getTimerColor = () => {
    switch (timerType) {
      case 'pomodoro':
        return '#374151' // gray-700
      case 'short-break':
        return '#10B981' // emerald-500
      case 'long-break':
        return '#3B82F6' // blue-500
      default:
        return '#374151'
    }
  }

  const formatFinishTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    }).toUpperCase()
  }

  const getSessionLabel = () => {
    if (timerType === 'pomodoro') {
      return `SESSION ${sessionCount}/4`
    }
    return 'ON BREAK'
  }

  return (
    <div className="relative mb-12">
      <svg className="w-80 h-80 transform -rotate-90" viewBox="0 0 300 300">
        {/* Background circle */}
        <circle
          cx="150"
          cy="150"
          r="140"
          stroke="#E5E7EB"
          strokeWidth="2"
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx="150"
          cy="150"
          r="140"
          stroke={getTimerColor()}
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-in-out"
        />
        {/* Progress indicator dot */}
        <circle
          cx="150"
          cy="10"
          r="6"
          fill={getTimerColor()}
          className="transition-all duration-1000 ease-in-out"
          style={{
            transformOrigin: '150px 150px',
            transform: `rotate(${(progress / 100) * 360}deg)`,
          }}
        />
      </svg>
      
      {/* Timer content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-500 mb-2 tracking-wider">
            {getSessionLabel()}
          </div>
          <div className="text-6xl font-light font-mono text-gray-900 tracking-tight mb-4">
            {formatTime(timeRemaining)}
          </div>
          {finishedAt && (
            <div className="text-sm font-medium text-gray-500 tracking-wider">
              FINISHED AT {formatFinishTime(finishedAt)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}