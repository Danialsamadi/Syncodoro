import { useTimer } from '../contexts/TimerContext'
import { formatTime, getTimerProgress } from '../utils/helpers'
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react'

export default function Timer() {
  const {
    timeLeft,
    isRunning,
    isPaused,
    currentType,
    sessionCount,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    settings
  } = useTimer()

  const totalTime = (() => {
    switch (currentType) {
      case 'pomodoro':
        return settings.pomodoroLength * 60
      case 'short-break':
        return settings.shortBreakLength * 60
      case 'long-break':
        return settings.longBreakLength * 60
      default:
        return settings.pomodoroLength * 60
    }
  })()

  const progress = getTimerProgress(timeLeft, totalTime)
  const circumference = 2 * Math.PI * 90 // radius of 90
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const getTimerColor = () => {
    switch (currentType) {
      case 'pomodoro':
        return 'text-primary-500'
      case 'short-break':
        return 'text-blue-500'
      case 'long-break':
        return 'text-green-500'
      default:
        return 'text-primary-500'
    }
  }

  const getProgressColor = () => {
    switch (currentType) {
      case 'pomodoro':
        return '#ef4444'
      case 'short-break':
        return '#3b82f6'
      case 'long-break':
        return '#22c55e'
      default:
        return '#ef4444'
    }
  }

  const getTypeLabel = () => {
    switch (currentType) {
      case 'pomodoro':
        return 'Focus Time'
      case 'short-break':
        return 'Short Break'
      case 'long-break':
        return 'Long Break'
      default:
        return 'Focus Time'
    }
  }

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Timer Circle */}
      <div className="relative">
        <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke={getProgressColor()}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-in-out"
          />
        </svg>
        
        {/* Timer content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-4xl font-mono font-bold ${getTimerColor()}`}>
            {formatTime(timeLeft)}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {getTypeLabel()}
          </div>
          {sessionCount > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              Session {sessionCount}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-4">
        <button
          onClick={resetTimer}
          className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={isRunning && !isPaused ? pauseTimer : startTimer}
          className={`p-4 rounded-full text-white transition-all transform hover:scale-105 ${
            currentType === 'pomodoro'
              ? 'bg-primary-500 hover:bg-primary-600'
              : currentType === 'short-break'
              ? 'bg-blue-500 hover:bg-blue-600'
              : 'bg-green-500 hover:bg-green-600'
          } ${isRunning ? 'timer-active' : ''}`}
        >
          {isRunning && !isPaused ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </button>

        <button
          onClick={skipTimer}
          className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
          title="Skip"
          disabled={!isRunning}
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Status */}
      <div className="text-center">
        <div className="text-lg font-medium text-gray-900">
          {isRunning && !isPaused
            ? 'Timer Running'
            : isPaused
            ? 'Timer Paused'
            : 'Ready to Start'}
        </div>
        {currentType === 'pomodoro' && (
          <div className="text-sm text-gray-600 mt-1">
            {settings.sessionsUntilLongBreak - (sessionCount % settings.sessionsUntilLongBreak)} sessions until long break
          </div>
        )}
      </div>
    </div>
  )
}
