import Dexie, { Table } from 'dexie'

export interface PomodoroSession {
  id?: number
  userId?: string
  startTime: Date
  endTime?: Date
  duration: number // in seconds
  type: 'pomodoro' | 'short-break' | 'long-break'
  tags: string[]
  completed: boolean
  notes?: string
  synced: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserSettings {
  id?: number
  userId?: string
  pomodoroLength: number // in minutes
  shortBreakLength: number
  longBreakLength: number
  sessionsUntilLongBreak: number
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
  soundEnabled: boolean
  soundType: 'beep' | 'chime' | 'bell' | 'notification' | 'success'
  notificationsEnabled: boolean
  profilePublic: boolean
  username?: string
  displayName?: string
  bio?: string
  createdAt: Date
  updatedAt: Date
}

export interface Tag {
  id?: number
  userId?: string
  name: string
  color: string
  createdAt: Date
  synced: boolean
}

export class SyncodoroDB extends Dexie {
  sessions!: Table<PomodoroSession>
  settings!: Table<UserSettings>
  tags!: Table<Tag>

  constructor() {
    super('SyncodoroDB')
    
    this.version(1).stores({
      sessions: '++id, userId, startTime, endTime, type, completed, synced, createdAt',
      settings: '++id, userId, updatedAt',
      tags: '++id, userId, name, synced, createdAt'
    })
  }
}

export const db = new SyncodoroDB()

// Default settings
export const defaultSettings: Omit<UserSettings, 'id' | 'createdAt' | 'updatedAt'> = {
  pomodoroLength: 25,
  shortBreakLength: 5,
  longBreakLength: 15,
  sessionsUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundEnabled: true,
  soundType: 'beep',
  notificationsEnabled: true,
  profilePublic: false,
  username: undefined,
  displayName: undefined,
  bio: undefined,
}
