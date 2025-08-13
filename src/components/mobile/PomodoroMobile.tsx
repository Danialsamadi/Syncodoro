import { useState } from 'react'
import { Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTimer } from '../../contexts/TimerContext'
import TabNavigation from './TabNavigation'
import CircularTimer from './CircularTimer'
import TaskEditor from './TaskEditor'
import StatusMessage from './StatusMessage'
import TimerControls from './TimerControls'
import BottomNavigation from './BottomNavigation'

export default function PomodoroMobile() {
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

  const [activeTab, setActiveTab] = useState<'focus' | 'break'>('focus')
  const [activeBottomTab, setActiveBottomTab] = useState<'home' | 'calendar' | 'statistics' | 'settings'>('home')
  const [currentTask, setCurrentTask] = useState('Making UI design for an app')

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

  const getPhase = (): 'interval' | 'break' | 'new-session' => {
    if (timeLeft === totalTime && !isRunning) {
      return 'new-session'
    }
    if (currentType === 'short-break' || currentType === 'long-break') {
      return 'break'
    }
    return 'interval'
  }

  const getFinishedTime = () => {
    const now = new Date()
    const finishTime = new Date(now.getTime() + timeLeft * 1000)
    return finishTime
  }

  const handleTimerAction = (action: 'start' | 'pause' | 'continue' | 'break' | 'skip' | 'end-session') => {
    switch (action) {
      case 'start':
      case 'continue':
        startTimer()
        break
      case 'pause':
        pauseTimer()
        break
      case 'break':
        // Start break timer
        startTimer()
        break
      case 'skip':
        skipTimer()
        break
      case 'end-session':
        resetTimer()
        break
    }
  }

  const handleTabChange = (tab: 'focus' | 'break') => {
    setActiveTab(tab)
    // You could add logic here to switch timer types based on tab
  }

  const handleBottomNavChange = (tab: 'home' | 'calendar' | 'statistics' | 'settings') => {
    setActiveBottomTab(tab)
  }

  const handleTaskChange = (task: string) => {
    setCurrentTask(task)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pt-12">
        <h1 className="text-2xl font-bold text-gray-900">Pomodoro</h1>
        <Link 
          to="/settings"
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <Settings className="w-6 h-6 text-gray-500" />
        </Link>
      </div>

      {/* Tab Navigation */}
      <TabNavigation 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        currentType={currentType}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Task Editor */}
        <TaskEditor 
          currentTask={currentTask}
          onTaskChange={handleTaskChange}
        />

        {/* Timer Circle */}
        <CircularTimer
          timeRemaining={timeLeft}
          totalTime={totalTime}
          isRunning={isRunning}
          timerType={currentType}
          sessionCount={sessionCount}
          finishedAt={isRunning ? getFinishedTime() : undefined}
        />

        {/* Status Message */}
        <StatusMessage
          phase={getPhase()}
          timerType={currentType}
          isRunning={isRunning}
          isPaused={isPaused}
        />

        {/* Control Buttons */}
        <TimerControls
          phase={getPhase()}
          isRunning={isRunning}
          isPaused={isPaused}
          onAction={handleTimerAction}
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeBottomTab}
        onTabChange={handleBottomNavChange}
      />
    </div>
  )
}