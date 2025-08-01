import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { dbHelpers } from '../services/dbHelpers'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

type TimerType = 'pomodoro' | 'short-break' | 'long-break'

interface TimerContextType {
  // Timer state
  timeLeft: number
  isRunning: boolean
  isPaused: boolean
  currentType: TimerType
  sessionCount: number
  currentTags: string[]
  
  // Timer controls
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  skipTimer: () => void
  
  // Session management
  addTag: (tag: string) => void
  removeTag: (tag: string) => void
  setSessionNotes: (notes: string) => void
  
  // Settings
  settings: {
    pomodoroLength: number
    shortBreakLength: number
    longBreakLength: number
    sessionsUntilLongBreak: number
    autoStartBreaks: boolean
    autoStartPomodoros: boolean
    soundEnabled: boolean
    notificationsEnabled: boolean
  }
  updateSettings: (newSettings: Partial<typeof settings>) => void
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

export function useTimer() {
  const context = useContext(TimerContext)
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider')
  }
  return context
}

interface TimerProviderProps {
  children: React.ReactNode
}

export function TimerProvider({ children }: TimerProviderProps) {
  const { user } = useAuth()
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentType, setCurrentType] = useState<TimerType>('pomodoro')
  const [sessionCount, setSessionCount] = useState(0)
  const [currentTags, setCurrentTags] = useState<string[]>([])
  const [sessionNotes, setSessionNotesState] = useState('')
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null)
  
  // Settings with defaults
  const [settings, setSettings] = useState({
    pomodoroLength: 25,
    shortBreakLength: 5,
    longBreakLength: 15,
    sessionsUntilLongBreak: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    soundEnabled: true,
    notificationsEnabled: true
  })

  // Load user settings on mount and when user changes
  useEffect(() => {
    if (user) {
      loadUserSettings()
    }
  }, [user])

  const loadUserSettings = async () => {
    try {
      const userSettings = await dbHelpers.getSettings(user?.id)
      if (userSettings) {
        const newSettings = {
          pomodoroLength: userSettings.pomodoroLength,
          shortBreakLength: userSettings.shortBreakLength,
          longBreakLength: userSettings.longBreakLength,
          sessionsUntilLongBreak: userSettings.sessionsUntilLongBreak,
          autoStartBreaks: userSettings.autoStartBreaks,
          autoStartPomodoros: userSettings.autoStartPomodoros,
          soundEnabled: userSettings.soundEnabled,
          notificationsEnabled: userSettings.notificationsEnabled
        }
        setSettings(newSettings)
        
        // Update timer if not running
        if (!isRunning) {
          setTimeLeft(getTimerDuration(currentType, newSettings) * 60)
        }
      }
    } catch (error) {
      console.error('Failed to load user settings:', error)
    }
  }

  const getTimerDuration = (type: TimerType, currentSettings = settings) => {
    switch (type) {
      case 'pomodoro':
        return currentSettings.pomodoroLength
      case 'short-break':
        return currentSettings.shortBreakLength
      case 'long-break':
        return currentSettings.longBreakLength
      default:
        return currentSettings.pomodoroLength
    }
  }

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            handleTimerComplete()
            return 0
          }
          return time - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isRunning, isPaused, timeLeft])

  const handleTimerComplete = useCallback(async () => {
    setIsRunning(false)
    setIsPaused(false)

    // Play notification sound
    if (settings.soundEnabled) {
      playNotificationSound()
    }

    // Show browser notification
    if (settings.notificationsEnabled && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(`${currentType === 'pomodoro' ? 'Pomodoro' : 'Break'} completed!`, {
          body: currentType === 'pomodoro' 
            ? 'Time for a break!' 
            : 'Ready for another pomodoro?',
          icon: '/pwa-192x192.png'
        })
      }
    }

    // Save completed session
    if (currentSessionId) {
      await dbHelpers.updateSession(currentSessionId, {
        endTime: new Date(),
        completed: true,
        notes: sessionNotes
      })
    }

    // Auto-transition logic
    if (currentType === 'pomodoro') {
      const newSessionCount = sessionCount + 1
      setSessionCount(newSessionCount)
      
      const isLongBreakTime = newSessionCount % settings.sessionsUntilLongBreak === 0
      const nextType = isLongBreakTime ? 'long-break' : 'short-break'
      
      setCurrentType(nextType)
      setTimeLeft(getTimerDuration(nextType) * 60)
      
      if (settings.autoStartBreaks) {
        setTimeout(() => startTimer(), 1000)
      }
      
      toast.success(`Pomodoro completed! ${isLongBreakTime ? 'Long' : 'Short'} break time.`)
    } else {
      setCurrentType('pomodoro')
      setTimeLeft(getTimerDuration('pomodoro') * 60)
      
      if (settings.autoStartPomodoros) {
        setTimeout(() => startTimer(), 1000)
      }
      
      toast.success('Break completed! Ready for another pomodoro?')
    }

    // Clear session data
    setCurrentTags([])
    setSessionNotesState('')
    setSessionStartTime(null)
    setCurrentSessionId(null)
  }, [currentType, sessionCount, settings, currentSessionId, sessionNotes])

  const playNotificationSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  const startTimer = async () => {
    if (!isRunning) {
      // Starting a new session
      const startTime = new Date()
      setSessionStartTime(startTime)
      
      try {
        const sessionId = await dbHelpers.addSession({
          userId: user?.id,
          startTime,
          duration: getTimerDuration(currentType) * 60,
          type: currentType,
          tags: currentTags,
          completed: false,
          notes: sessionNotes
        })
        setCurrentSessionId(sessionId)
      } catch (error) {
        console.error('Failed to create session:', error)
      }
    }
    
    setIsRunning(true)
    setIsPaused(false)
  }

  const pauseTimer = () => {
    setIsPaused(true)
  }

  const resetTimer = async () => {
    setIsRunning(false)
    setIsPaused(false)
    setTimeLeft(getTimerDuration(currentType) * 60)
    
    // Cancel current session if exists
    if (currentSessionId) {
      await dbHelpers.updateSession(currentSessionId, {
        endTime: new Date(),
        completed: false
      })
      setCurrentSessionId(null)
    }
    
    setCurrentTags([])
    setSessionNotesState('')
    setSessionStartTime(null)
  }

  const skipTimer = async () => {
    // Complete current session as skipped
    if (currentSessionId) {
      await dbHelpers.updateSession(currentSessionId, {
        endTime: new Date(),
        completed: false,
        notes: sessionNotes + ' (skipped)'
      })
    }
    
    handleTimerComplete()
  }

  const addTag = (tag: string) => {
    if (!currentTags.includes(tag)) {
      setCurrentTags([...currentTags, tag])
    }
  }

  const removeTag = (tag: string) => {
    setCurrentTags(currentTags.filter(t => t !== tag))
  }

  const setSessionNotes = (notes: string) => {
    setSessionNotesState(notes)
  }

  const updateSettings = async (newSettings: Partial<typeof settings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    
    // Save to database
    if (user) {
      try {
        await dbHelpers.updateSettings({
          pomodoroLength: updatedSettings.pomodoroLength,
          shortBreakLength: updatedSettings.shortBreakLength,
          longBreakLength: updatedSettings.longBreakLength,
          sessionsUntilLongBreak: updatedSettings.sessionsUntilLongBreak,
          autoStartBreaks: updatedSettings.autoStartBreaks,
          autoStartPomodoros: updatedSettings.autoStartPomodoros,
          soundEnabled: updatedSettings.soundEnabled,
          notificationsEnabled: updatedSettings.notificationsEnabled
        }, user.id)
      } catch (error) {
        console.error('Failed to save settings:', error)
      }
    }
    
    // Update timer duration if not running
    if (!isRunning) {
      setTimeLeft(getTimerDuration(currentType, updatedSettings) * 60)
    }
  }

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const value: TimerContextType = {
    timeLeft,
    isRunning,
    isPaused,
    currentType,
    sessionCount,
    currentTags,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    addTag,
    removeTag,
    setSessionNotes,
    settings,
    updateSettings
  }

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  )
}
