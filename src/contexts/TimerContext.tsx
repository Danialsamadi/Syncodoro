import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'
import { dbHelpers } from '../services/dbHelpers'
import { timerSyncService } from '../services/timerSyncService'
import { useSync } from './SyncContext'
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
    soundType: 'beep' | 'chime' | 'bell' | 'notification' | 'success'
    notificationsEnabled: boolean
  }
  updateSettings: (newSettings: Partial<TimerContextType['settings']>) => void
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
  const { isOnline } = useSync()
  const syncEnabled = useRef(false)
  
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
    soundType: 'beep',
    notificationsEnabled: true
  })

  // Load user settings on mount and when user changes
  useEffect(() => {
    if (user) {
      loadUserSettings()
      
      // Subscribe to timer state changes from other browsers
      timerSyncService.subscribeToTimerChanges(user.id, (newState) => {
        // Only apply changes if we're not the source of the update
        if (!timerSyncService.isOwnUpdate(newState)) {
          console.log('Received timer state from another browser:', newState)
          
          // Update local state with the remote state
          setTimeLeft(newState.timeLeft)
          setIsRunning(newState.isRunning)
          setIsPaused(newState.isPaused)
          setCurrentType(newState.currentType)
          setSessionCount(newState.sessionCount)
          setCurrentTags(newState.currentTags || [])
          if (newState.sessionNotes !== undefined) setSessionNotesState(newState.sessionNotes || '')
          setSessionStartTime(newState.sessionStartTime)
          setCurrentSessionId(newState.currentSessionId || null)
          
          // Show toast notification
          if (newState.isRunning && !newState.isPaused) {
            toast.success(`Timer synced from another device: ${newState.currentType}`)
          }
        }
      })
      
      // Enable sync after initial setup
      setTimeout(() => {
        syncEnabled.current = true
      }, 1000)
      
      return () => {
        // Unsubscribe when component unmounts or user changes
        timerSyncService.unsubscribe()
        syncEnabled.current = false
      }
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
          soundType: userSettings.soundType || 'beep',
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

  // Effect to sync timer state changes
  useEffect(() => {
    if (user && isOnline && syncEnabled.current) {
      // Debounce updates to avoid excessive syncing
      const debounceTimeout = setTimeout(() => {
        syncTimerState({
          timeLeft,
          isRunning,
          isPaused,
          currentType,
          sessionCount,
          currentTags,
          sessionNotes,
          sessionStartTime,
          currentSessionId
        })
      }, 500)
      
      return () => clearTimeout(debounceTimeout)
    }
  }, [timeLeft, isRunning, isPaused, currentType, sessionCount, user, isOnline])

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

  // Helper function to sync timer state to other browsers
  const syncTimerState = (state: any) => {
    if (user && isOnline && syncEnabled.current) {
      timerSyncService.updateTimerState(state)
    }
  }

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
    
    // Sync timer state to other browsers
    syncTimerState({
      timeLeft: getTimerDuration(currentType === 'pomodoro' ? 
        (sessionCount % settings.sessionsUntilLongBreak === 0 ? 'long-break' : 'short-break') : 
        'pomodoro') * 60,
      isRunning: false,
      isPaused: false,
      currentType: currentType === 'pomodoro' ? 
        (sessionCount % settings.sessionsUntilLongBreak === 0 ? 'long-break' : 'short-break') : 
        'pomodoro',
      sessionCount: currentType === 'pomodoro' ? sessionCount + 1 : sessionCount,
      currentTags: [],
      sessionNotes: '',
      sessionStartTime: null,
      currentSessionId: null
    })
  }, [currentType, sessionCount, settings, currentSessionId, sessionNotes, user, isOnline])

  const playNotificationSound = () => {
    if (!settings.soundEnabled) return
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    switch (settings.soundType) {
      case 'beep':
        playBeepSound(audioContext)
        break
      case 'chime':
        playChimeSound(audioContext)
        break
      case 'bell':
        playBellSound(audioContext)
        break
      case 'notification':
        playNotificationTone(audioContext)
        break
      case 'success':
        playSuccessSound(audioContext)
        break
      default:
        playBeepSound(audioContext)
    }
  }

  const playBeepSound = (audioContext: AudioContext) => {
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

  const playChimeSound = (audioContext: AudioContext) => {
    const frequencies = [523.25, 659.25, 783.99] // C5, E5, G5
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = freq
      oscillator.type = 'sine'
      
      const startTime = audioContext.currentTime + (index * 0.2)
      gainNode.gain.setValueAtTime(0.2, startTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8)
      
      oscillator.start(startTime)
      oscillator.stop(startTime + 0.8)
    })
  }

  const playBellSound = (audioContext: AudioContext) => {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 1000
    oscillator.type = 'triangle'
    
    gainNode.gain.setValueAtTime(0.4, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 1.5)
  }

  const playNotificationTone = (audioContext: AudioContext) => {
    const frequencies = [440, 554.37] // A4, C#5
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = freq
      oscillator.type = 'square'
      
      const startTime = audioContext.currentTime + (index * 0.15)
      gainNode.gain.setValueAtTime(0.15, startTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3)
      
      oscillator.start(startTime)
      oscillator.stop(startTime + 0.3)
    })
  }

  const playSuccessSound = (audioContext: AudioContext) => {
    const frequencies = [261.63, 329.63, 392.00, 523.25] // C4, E4, G4, C5
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = freq
      oscillator.type = 'sine'
      
      const startTime = audioContext.currentTime + (index * 0.1)
      gainNode.gain.setValueAtTime(0.2, startTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4)
      
      oscillator.start(startTime)
      oscillator.stop(startTime + 0.4)
    })
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
          notes: sessionNotes,
          synced: false // Always include required field
        })
        setCurrentSessionId(sessionId)
      } catch (error) {
        console.error('Failed to create session:', error)
      }
    }
    
    setIsRunning(true)
    setIsPaused(false)
    
    // Sync timer state to other browsers
    syncTimerState({
      timeLeft,
      isRunning: true,
      isPaused: false,
      currentType,
      sessionCount,
      currentTags,
      sessionNotes,
      sessionStartTime,
      currentSessionId
    })
  }

  const pauseTimer = () => {
    setIsPaused(true)
    
    // Sync timer state to other browsers
    syncTimerState({
      timeLeft,
      isRunning,
      isPaused: true,
      currentType,
      sessionCount,
      currentTags,
      sessionNotes,
      sessionStartTime,
      currentSessionId
    })
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
    
    // Sync timer state to other browsers
    syncTimerState({
      timeLeft: getTimerDuration(currentType) * 60,
      isRunning: false,
      isPaused: false,
      currentType,
      sessionCount,
      currentTags: [],
      sessionNotes: '',
      sessionStartTime: null,
      currentSessionId: null
    })
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
    
    // Sync will happen in handleTimerComplete
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

  const updateSettings = async (newSettings: Partial<TimerContextType['settings']>) => {
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
          soundType: updatedSettings.soundType as 'beep' | 'chime' | 'bell' | 'notification' | 'success',
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
