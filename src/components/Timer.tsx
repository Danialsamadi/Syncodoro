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
        return 'text-timer-pomodoro'
      case 'short-break':
        return 'text-timer-long'
      case 'long-break':
        return 'text-timer-short'
      default:
        return 'text-timer-pomodoro'
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

  const getGlowClass = () => {
    switch (currentType) {
      case 'pomodoro':
        return isRunning && !isPaused ? 'shadow-glow-red animate-timer-pulse' : 'shadow-black-lg'
      case 'short-break':
        return isRunning && !isPaused ? 'shadow-glow-blue animate-timer-pulse' : 'shadow-black-lg'
      case 'long-break':
        return isRunning && !isPaused ? 'shadow-glow-green animate-timer-pulse' : 'shadow-black-lg'
      default:
        return isRunning && !isPaused ? 'shadow-glow-red animate-timer-pulse' : 'shadow-black-lg'
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
    <div className="flex flex-col items-center space-y-8 p-8 bg-surface-primary rounded-2xl border border-border-primary shadow-black-lg">
      {/* Timer Circle */}
      <div className={`relative ${getGlowClass()} rounded-full transition-all duration-300`}>
        <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className="text-border-primary"
          />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke={getProgressColor()}
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-in-out"
          />
        </svg>
        
        {/* Timer content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`timer-display ${getTimerColor()} font-mono font-light tracking-tight`}>
            {formatTime(timeLeft)}
          </div>
          <div className="text-lg text-text-secondary mt-2 font-medium">
            {getTypeLabel()}
          </div>
          {sessionCount > 0 && (
            <div className="text-sm text-text-tertiary mt-1 font-medium">
              Session {sessionCount}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-6">
        <button
          onClick={resetTimer}
          className="p-4 rounded-xl bg-surface-secondary hover:bg-surface-tertiary text-text-secondary hover:text-text-primary border border-border-primary hover:border-border-tertiary transition-all duration-200 shadow-black hover:shadow-black-md hover:-translate-y-0.5"
          title="Reset"
        >
          <RotateCcw className="w-6 h-6" />
        </button>

        <button
          onClick={isRunning && !isPaused ? pauseTimer : startTimer}
          className={`p-6 rounded-xl text-text-primary font-medium transition-all duration-200 transform hover:scale-105 hover:-translate-y-1 shadow-black-lg hover:shadow-black-xl ${
            currentType === 'pomodoro'
              ? 'bg-timer-pomodoro hover:bg-red-600 shadow-glow-red'
              : currentType === 'short-break'
              ? 'bg-timer-long hover:bg-blue-600 shadow-glow-blue'
              : 'bg-timer-short hover:bg-green-600 shadow-glow-green'
          } ${isRunning && !isPaused ? 'animate-timer-pulse' : ''}`}
        >
          {isRunning && !isPaused ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8 ml-1" />
          )}
        </button>

        <button
          onClick={skipTimer}
          className="p-4 rounded-xl bg-surface-secondary hover:bg-surface-tertiary text-text-secondary hover:text-text-primary border border-border-primary hover:border-border-tertiary transition-all duration-200 shadow-black hover:shadow-black-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
          title="Skip"
          disabled={!isRunning}
        >
          <SkipForward className="w-6 h-6" />
        </button>
      </div>

      {/* Status */}
      <div className="text-center bg-surface-secondary rounded-xl p-4 border border-border-primary">
        <div className="text-xl font-semibold text-text-primary">
          {isRunning && !isPaused
            ? 'Timer Running'
            : isPaused
            ? 'Timer Paused'
            : 'Ready to Start'}
        </div>
        {currentType === 'pomodoro' && (
          <div className="text-sm text-text-secondary mt-2 font-medium">
            {settings.sessionsUntilLongBreak - (sessionCount % settings.sessionsUntilLongBreak)} sessions until long break
          </div>
        )}
      </div>
    </div>
  )
}
