import { useTimer } from '../contexts/TimerContext'
import { formatTime, getTimerProgress } from '../utils/helpers'
import { Play, Pause, Music, Edit3 } from 'lucide-react'
import { useState } from 'react'

export default function TimerNew() {
  const {
    timeLeft,
    isRunning,
    isPaused,
    currentType,
    sessionCount,
    startTimer,
    pauseTimer,
    resetTimer,
    settings
  } = useTimer()

  const [activeTab, setActiveTab] = useState<'focus' | 'short-break' | 'long-break'>('focus')

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
  const circumference = 2 * Math.PI * 140 // radius of 140
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const getTimerColor = () => {
    switch (currentType) {
      case 'pomodoro':
        return '#2E8A99' // primary-600 teal
      case 'short-break':
        return '#84A7A1' // sage teal
      case 'long-break':
        return '#1F6E8C' // ocean blue
      default:
        return '#2E8A99'
    }
  }

  const getTabButtonClass = (tab: string) => {
    const isActive = (tab === 'focus' && currentType === 'pomodoro') ||
                    (tab === 'short-break' && currentType === 'short-break') ||
                    (tab === 'long-break' && currentType === 'long-break')
    
    return `px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 ${
      isActive 
        ? 'bg-white text-neutral-900 shadow-elevation-2' 
        : 'text-text-secondary hover:text-text-primary hover:bg-surface-level-2'
    }`
  }

  return (
    <div className="min-h-screen bg-primary-950 flex flex-col" style={{ backgroundColor: "#0A1F3F" }}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 pt-12">
        <h1 className="text-2xl font-bold text-text-primary">Record</h1>
        <button className="p-2 rounded-xl hover:bg-surface-level-2 transition-colors">
          <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="px-6 mb-8">
        <div className="flex items-center space-x-1 bg-surface-level-2 rounded-full p-1">
          <button
            onClick={() => setActiveTab('focus')}
            className={getTabButtonClass('focus')}
          >
            Focus
          </button>
          <button
            onClick={() => setActiveTab('short-break')}
            className={getTabButtonClass('short-break')}
          >
            Short break
          </button>
          <button
            onClick={() => setActiveTab('long-break')}
            className={getTabButtonClass('long-break')}
          >
            Long break
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Project Info */}
        <div className="flex items-center space-x-2 mb-6 text-text-tertiary">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">No project assignee</span>
        </div>

        <h2 className="text-lg font-semibold text-text-primary mb-12">
          What are you working on?
        </h2>

        {/* Timer Circle */}
        <div className="relative mb-12">
          <svg className="w-80 h-80 transform -rotate-90" viewBox="0 0 300 300">
            {/* Background circle */}
            <circle
              cx="150"
              cy="150"
              r="140"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="3"
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
              style={{
                filter: `drop-shadow(0 0 8px ${getTimerColor()}40)`
              }}
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
                filter: `drop-shadow(0 0 6px ${getTimerColor()})`
              }}
            />
          </svg>
          
          {/* Timer content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-center mb-4">
              <div className="text-sm font-medium text-text-tertiary mb-2">
                Total {Math.floor(totalTime / 60)} minutes
              </div>
              <div className="text-5xl font-light font-mono text-text-primary tracking-tight">
                {formatTime(timeLeft)}
              </div>
            </div>
            
            <button className="flex items-center space-x-2 px-4 py-2 rounded-full bg-surface-level-2 border border-border-primary hover:bg-surface-level-3 transition-all duration-200">
              <Edit3 className="w-4 h-4 text-text-tertiary" />
              <span className="text-sm font-medium text-text-secondary">Custom</span>
            </button>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center space-x-6 mb-16">
          {/* Sound Button */}
          <button className="p-4 rounded-full bg-surface-level-2 hover:bg-surface-level-3 transition-colors border border-border-primary">
            <Music className="w-6 h-6 text-text-secondary" />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={isRunning && !isPaused ? pauseTimer : startTimer}
            className="flex items-center space-x-3 px-8 py-4 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold transition-all duration-200 shadow-elevation-3 hover:shadow-elevation-4 hover:-translate-y-0.5"
          >
            {isRunning && !isPaused ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-1" />
            )}
            <span>
              {isRunning && !isPaused ? 'Pause session' : 'Start session'}
            </span>
          </button>

          {/* Edit Button */}
          <button className="p-4 rounded-full bg-surface-level-2 hover:bg-surface-level-3 transition-colors border border-border-primary">
            <Edit3 className="w-6 h-6 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-around py-4 px-6 bg-surface-level-1 border-t border-border-secondary">
        <button className="flex flex-col items-center space-y-1 py-2 px-4 rounded-lg text-text-tertiary">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          <span className="text-xs font-medium">Home</span>
        </button>

        <button className="flex flex-col items-center space-y-1 py-2 px-4 rounded-lg text-text-tertiary">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium">My Task</span>
        </button>

        <button className="flex flex-col items-center space-y-1 py-2 px-4 rounded-lg text-primary-600">
          <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <span className="text-xs font-semibold">Record</span>
        </button>

        <button className="flex flex-col items-center space-y-1 py-2 px-4 rounded-lg text-text-tertiary">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
          <span className="text-xs font-medium">Reports</span>
        </button>

        <button className="flex flex-col items-center space-y-1 py-2 px-4 rounded-lg text-text-tertiary">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium">Setting</span>
        </button>
      </div>
    </div>
  )
}
