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
    try {
      let query = db.sessions.where('synced').equals(false)
      if (userId) {
        query = query.and(session => session.userId === userId)
      }
      const sessions = await query.toArray()
      
      // Filter out any sessions with invalid data
      return sessions.filter(session => {
        // Validate required fields
        if (!session.startTime || !session.type || session.duration === undefined || session.completed === undefined) {
          console.warn('🔧 Filtering out invalid session:', session)
          return false
        }
        return true
      })
    } catch (error) {
      console.error('❌ Error getting unsynced sessions:', error)
      
      // Try to get all sessions and filter manually as fallback
      try {
        console.log('🔄 Attempting fallback: getting all sessions and filtering manually')
        const allSessions = userId 
          ? await db.sessions.where('userId').equals(userId).toArray()
          : await db.sessions.toArray()
        
        return allSessions.filter(session => {
          // Check if synced field exists and is false, and validate other required fields
          return session.synced === false && 
                 session.startTime && 
                 session.type && 
                 session.duration !== undefined && 
                 session.completed !== undefined
        })
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError)
        return []
      }
    }
  },

  async markSessionsSynced(sessionIds: (number | undefined)[]): Promise<void> {
    await db.sessions.where('id').anyOf(sessionIds.filter((id): id is number => typeof id === 'number')).modify({ synced: true })
  },

  // Cleanup corrupted sessions (missing required fields)
  async cleanupCorruptedSessions(userId?: string): Promise<void> {
    try {
      const allSessions = userId
        ? await db.sessions.where('userId').equals(userId).toArray()
        : await db.sessions.toArray();
      const corruptedSessionIds = allSessions
        .filter(session => !session.startTime || !session.type || session.duration === undefined || session.completed === undefined)
        .map(session => session.id)
        .filter((id): id is number => typeof id === 'number');
      if (corruptedSessionIds.length > 0) {
        await db.sessions.where('id').anyOf(corruptedSessionIds).delete();
        console.log(`🧹 Removed ${corruptedSessionIds.length} corrupted sessions`);
      }
    } catch (error) {
      console.error('❌ Failed to cleanup corrupted sessions:', error);
    }
  },

  // Cleanup corrupted tags (missing required fields)
  async cleanupCorruptedTags(userId?: string): Promise<void> {
    try {
      const allTags = userId
        ? await db.tags.where('userId').equals(userId).toArray()
        : await db.tags.toArray();
      const corruptedTagIds = allTags
        .filter(tag => !tag.name || !tag.color)
        .map(tag => tag.id)
        .filter((id): id is number => typeof id === 'number');
      if (corruptedTagIds.length > 0) {
        await db.tags.where('id').anyOf(corruptedTagIds).delete();
        console.log(`🧹 Removed ${corruptedTagIds.length} corrupted tags`);
      }
    } catch (error) {
      console.error('❌ Failed to cleanup corrupted tags:', error);
    }
  },

  async getUnsyncedTags(userId?: string): Promise<Tag[]> {
    try {
      let query = db.tags.where('synced').equals(false)
      if (userId) {
        query = query.and(tag => tag.userId === userId)
      }
      const tags = await query.toArray()
      // Filter out any tags with invalid data
      return tags.filter(tag => {
        // Validate required fields
        if (!tag.name || !tag.color) {
          console.warn('🔧 Filtering out invalid tag:', tag)
          return false
        }
        return true
      })
    } catch (error) {
      console.error('❌ Error getting unsynced tags:', error)
      // If DataError, try to clean up corrupted tags
      if (error instanceof Error && error.name === 'DataError') {
        console.log('🧹 DataError detected, attempting to clean up corrupted tags...')
        await dbHelpers.cleanupCorruptedTags(userId)
      }
      // Try to get all tags and filter manually as fallback
      try {
        console.log('🔄 Attempting fallback: getting all tags and filtering manually')
        const allTags = userId 
          ? await db.tags.where('userId').equals(userId).toArray()
          : await db.tags.toArray()
        return allTags.filter(tag => {
          // Check if synced field exists and is false, and validate other required fields
          return tag.synced === false && 
                 tag.name && 
                 tag.color
        })
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError)
        return []
      }
    }
  },

  async markTagsSynced(tagIds: (number | undefined)[]): Promise<void> {
    await db.tags.where('id').anyOf(tagIds.filter((id): id is number => typeof id === 'number')).modify({ synced: true })
  },

  // Clean up duplicate sessions
  async cleanupDuplicateSessions(userId?: string): Promise<void> {
    console.log('🧼 Starting duplicate session cleanup...')
    
    try {
      // Get all sessions for the user
      const allSessions = userId 
        ? await db.sessions.where('userId').equals(userId).toArray()
        : await db.sessions.toArray()
      
      // Group sessions by unique key (startTime + duration + type)
      const sessionGroups = allSessions.reduce((groups, session) => {
        const key = `${session.startTime.toISOString()}_${session.duration}_${session.type}`
        if (!groups[key]) {
          groups[key] = []
        }
        groups[key].push(session)
        return groups
      }, {} as Record<string, typeof allSessions>)
      
      let duplicatesRemoved = 0
      
      // For each group, keep only the first session and remove duplicates
      for (const [key, sessions] of Object.entries(sessionGroups)) {
        if (sessions.length > 1) {
          console.log(`Found ${sessions.length} duplicate sessions for key: ${key}`)
          
          // Sort by creation date and keep the first one
          sessions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
          const toKeep = sessions[0]
          const toRemove = sessions.slice(1)
          
          // Remove duplicates
          for (const duplicate of toRemove) {
            if (duplicate.id) {
              await db.sessions.delete(duplicate.id)
              duplicatesRemoved++
              console.log(`🗑️ Removed duplicate session: ${duplicate.id}`)
            }
          }
        }
      }
      
      console.log(`✅ Removed ${duplicatesRemoved} duplicate sessions`)
    } catch (error) {
      console.error('❌ Error during duplicate session cleanup:', error)
    }
  },

  // Database cleanup helpers
  async cleanupCorruptedData(userId?: string): Promise<void> {
    console.log('🧹 Starting database cleanup...')
    
    try {
      // Clean up sessions with invalid data
      const allSessions = userId 
        ? await db.sessions.where('userId').equals(userId).toArray()
        : await db.sessions.toArray()
      
      const corruptedSessionIds: number[] = []
      
      allSessions.forEach(session => {
        // Check for required fields
        if (!session.startTime || !session.type || session.duration === undefined || session.completed === undefined || session.synced === undefined) {
          if (session.id) {
            corruptedSessionIds.push(session.id)
          }
        }
        
        // Check for invalid dates
        if (session.startTime && !(session.startTime instanceof Date) && isNaN(new Date(session.startTime).getTime())) {
          if (session.id) {
            corruptedSessionIds.push(session.id)
          }
        }
        
        // Check for invalid types
        if (session.type && !['pomodoro', 'short-break', 'long-break'].includes(session.type)) {
          if (session.id) {
            corruptedSessionIds.push(session.id)
          }
        }
      })
      
      if (corruptedSessionIds.length > 0) {
        console.log(`🗑️ Removing ${corruptedSessionIds.length} corrupted sessions`)
        await db.sessions.where('id').anyOf(corruptedSessionIds).delete()
      }
      
      // Clean up settings with invalid data
      const allSettings = userId 
        ? await db.settings.where('userId').equals(userId).toArray()
        : await db.settings.toArray()
      
      const corruptedSettingsIds: number[] = []
      
      allSettings.forEach(settings => {
        // Check for required numeric fields
        if (typeof settings.pomodoroLength !== 'number' || 
            typeof settings.shortBreakLength !== 'number' || 
            typeof settings.longBreakLength !== 'number' || 
            typeof settings.sessionsUntilLongBreak !== 'number') {
          if (settings.id) {
            corruptedSettingsIds.push(settings.id)
          }
        }
      })
      
      if (corruptedSettingsIds.length > 0) {
        console.log(`🗑️ Removing ${corruptedSettingsIds.length} corrupted settings`)
        await db.settings.where('id').anyOf(corruptedSettingsIds).delete()
      }
      
      console.log('✅ Database cleanup completed')
    } catch (error) {
      console.error('❌ Error during database cleanup:', error)
    }
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
