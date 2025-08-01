import { db, PomodoroSession, UserSettings, Tag, defaultSettings } from './database'

// Database helper functions
export const dbHelpers = {
  // Sessions
  async addSession(session: Omit<PomodoroSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const now = new Date()
    return await db.sessions.add({
      ...session,
      createdAt: now,
      updatedAt: now,
      synced: false
    })
  },

  async updateSession(id: number, updates: Partial<PomodoroSession>): Promise<void> {
    await db.sessions.update(id, {
      ...updates,
      updatedAt: new Date(),
      synced: false
    })
  },

  async getSessionsByDateRange(startDate: Date, endDate: Date, userId?: string): Promise<PomodoroSession[]> {
    let query = db.sessions.where('startTime').between(startDate, endDate)
    if (userId) {
      query = query.and(session => session.userId === userId)
    }
    return await query.toArray()
  },

  async getRecentSessions(limit: number = 10, userId?: string): Promise<PomodoroSession[]> {
    let query = db.sessions.orderBy('startTime').reverse()
    if (userId) {
      query = query.filter(session => session.userId === userId)
    }
    return await query.limit(limit).toArray()
  },

  async getTotalSessions(userId?: string): Promise<number> {
    let query = db.sessions
    if (userId) {
      query = query.where('userId').equals(userId)
    }
    return await query.count()
  },

  async getCompletedSessions(userId?: string): Promise<PomodoroSession[]> {
    let query = db.sessions.where('completed').equals(true)
    if (userId) {
      query = query.and(session => session.userId === userId)
    }
    return await query.toArray()
  },

  // Settings
  async getSettings(userId?: string): Promise<UserSettings | undefined> {
    if (userId) {
      return await db.settings.where('userId').equals(userId).first()
    }
    return await db.settings.orderBy('updatedAt').last()
  },

  async updateSettings(settings: Partial<UserSettings>, userId?: string): Promise<void> {
    const existing = await dbHelpers.getSettings(userId)
    const now = new Date()
    
    if (existing) {
      await db.settings.update(existing.id!, {
        ...settings,
        updatedAt: now
      })
    } else {
      await db.settings.add({
        ...defaultSettings,
        ...settings,
        userId,
        createdAt: now,
        updatedAt: now
      })
    }
  },

  // Tags
  async addTag(tag: Omit<Tag, 'id' | 'createdAt'>): Promise<number> {
    return await db.tags.add({
      ...tag,
      createdAt: new Date(),
      synced: false
    })
  },

  async getTags(userId?: string): Promise<Tag[]> {
    if (userId) {
      return await db.tags.where('userId').equals(userId).toArray()
    }
    return await db.tags.toArray()
  },

  async updateTag(id: number, updates: Partial<Tag>): Promise<void> {
    await db.tags.update(id, {
      ...updates,
      synced: false
    })
  },

  async deleteTag(id: number): Promise<void> {
    await db.tags.delete(id)
  },

  // Sync helpers
  async getUnsyncedSessions(userId?: string): Promise<PomodoroSession[]> {
    let query = db.sessions.where('synced').equals(false)
    if (userId) {
      query = query.and(session => session.userId === userId)
    }
    return await query.toArray()
  },

  async markSessionsSynced(sessionIds: number[]): Promise<void> {
    await db.sessions.where('id').anyOf(sessionIds).modify({ synced: true })
  },

  async getUnsyncedTags(userId?: string): Promise<Tag[]> {
    let query = db.tags.where('synced').equals(false)
    if (userId) {
      query = query.and(tag => tag.userId === userId)
    }
    return await query.toArray()
  },

  async markTagsSynced(tagIds: number[]): Promise<void> {
    await db.tags.where('id').anyOf(tagIds).modify({ synced: true })
  },

  // Analytics helpers
  async getSessionStats(userId?: string, days: number = 30): Promise<{
    totalSessions: number
    completedSessions: number
    totalFocusTime: number
    averageSessionLength: number
    streakDays: number
  }> {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000))
    
    const sessions = await dbHelpers.getSessionsByDateRange(startDate, endDate, userId)
    const completedSessions = sessions.filter(s => s.completed && s.type === 'pomodoro')
    
    const totalFocusTime = completedSessions.reduce((sum, session) => sum + session.duration, 0)
    const averageSessionLength = completedSessions.length > 0 ? totalFocusTime / completedSessions.length : 0
    
    // Calculate streak (consecutive days with completed sessions)
    let streakDays = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < days; i++) {
      const checkDate = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000))
      const nextDay = new Date(checkDate.getTime() + (24 * 60 * 60 * 1000))
      
      const daySessions = sessions.filter(s => 
        s.completed && 
        s.type === 'pomodoro' &&
        s.startTime >= checkDate && 
        s.startTime < nextDay
      )
      
      if (daySessions.length > 0) {
        streakDays++
      } else if (i > 0) {
        break // Streak is broken
      }
    }
    
    return {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      totalFocusTime,
      averageSessionLength,
      streakDays
    }
  }
}
