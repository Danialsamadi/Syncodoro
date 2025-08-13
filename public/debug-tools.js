// Syncodoro Debug Tools
// Run these functions in the browser console to diagnose and fix sync issues

window.SyncodoroDiagnostics = {
  // Helper function to get current user ID
  async getCurrentUserId() {
    let userId = null
    
    // Try multiple ways to get the current user
    try {
      // Method 1: Check if there's a React app with auth context
      const reactFiberKey = Object.keys(document.getElementById('root')).find(key => key.startsWith('__reactFiber'))
      if (reactFiberKey) {
        const fiber = document.getElementById('root')[reactFiberKey]
        // Navigate through React fiber to find auth context
        let current = fiber
        while (current && !userId) {
          if (current.memoizedProps?.value?.user?.id) {
            userId = current.memoizedProps.value.user.id
            break
          }
          if (current.return) current = current.return
          else if (current.child) current = current.child
          else if (current.sibling) current = current.sibling
          else break
        }
      }
      
      // Method 2: Try to import and use supabase directly
      if (!userId) {
        const { supabase } = await import('/src/services/supabase.ts')
        const { data: { user } } = await supabase.auth.getUser()
        userId = user?.id
      }
    } catch (error) {
      console.log('Could not detect user through React context, trying localStorage...')
    }
    
    // Method 3: Check localStorage for session
    if (!userId) {
      try {
        const localStorageKeys = Object.keys(localStorage)
        const supabaseKey = localStorageKeys.find(key => key.includes('supabase.auth.token'))
        if (supabaseKey) {
          const session = JSON.parse(localStorage.getItem(supabaseKey) || '{}')
          userId = session?.user?.id
        }
      } catch (error) {
        console.log('Could not get user from localStorage')
      }
    }
    
    return userId
  },

  // Clean up corrupted data in IndexedDB
  async cleanupDatabase() {
    try {
      console.log('🧹 Starting database cleanup...')
      
      // Import the dbHelpers module
      const { dbHelpers } = await import('/src/services/dbHelpers.ts')
      
      // Get current user ID
      const userId = await this.getCurrentUserId()
      
      if (!userId) {
        console.warn('⚠️ No authenticated user found. Please sign in first.')
        console.log('💡 Try signing in to the app first, then run this command again.')
        return
      }
      
      console.log('👤 Found user ID:', userId)
      
      await dbHelpers.cleanupCorruptedData(userId)
      console.log('✅ Database cleanup completed')
      
    } catch (error) {
      console.error('❌ Error during cleanup:', error)
    }
  },

  // Check database integrity
  async checkDatabaseIntegrity() {
    try {
      console.log('🔍 Checking database integrity...')
      
      const { dbHelpers } = await import('/src/services/dbHelpers.ts')
      const { db } = await import('/src/services/database.ts')
      
      // Get current user ID
      const userId = await this.getCurrentUserId()
      
      if (!userId) {
        console.warn('⚠️ No authenticated user found. Please sign in first.')
        return
      }
      
      console.log('👤 Found user ID:', userId)
      
      // Check sessions
      const allSessions = await db.sessions.where('userId').equals(userId).toArray()
      console.log(`📊 Found ${allSessions.length} total sessions`)
      
      const invalidSessions = allSessions.filter(session => {
        return !session.startTime || !session.type || session.duration === undefined || session.completed === undefined || session.synced === undefined
      })
      
      if (invalidSessions.length > 0) {
        console.warn(`⚠️ Found ${invalidSessions.length} invalid sessions:`, invalidSessions)
      } else {
        console.log('✅ All sessions appear valid')
      }
      
      // Check settings
      const allSettings = await db.settings.where('userId').equals(userId).toArray()
      console.log(`📊 Found ${allSettings.length} settings records`)
      
      const invalidSettings = allSettings.filter(settings => {
        return typeof settings.pomodoroLength !== 'number' || 
               typeof settings.shortBreakLength !== 'number' || 
               typeof settings.longBreakLength !== 'number' || 
               typeof settings.sessionsUntilLongBreak !== 'number'
      })
      
      if (invalidSettings.length > 0) {
        console.warn(`⚠️ Found ${invalidSettings.length} invalid settings:`, invalidSettings)
      } else {
        console.log('✅ All settings appear valid')
      }
      
      // Check tags
      const allTags = await db.tags.where('userId').equals(userId).toArray()
      console.log(`📊 Found ${allTags.length} tags`)
      
      console.log('🔍 Database integrity check completed')
      
    } catch (error) {
      console.error('❌ Error during integrity check:', error)
    }
  },

  // Force sync all data
  async forceSync() {
    try {
      console.log('🔄 Starting forced sync...')
      
      const { SyncService } = await import('/src/services/syncService.ts')
      
      // Get current user ID
      const userId = await this.getCurrentUserId()
      
      if (!userId) {
        console.warn('⚠️ No authenticated user found. Please sign in first.')
        return
      }
      
      console.log('👤 Found user ID:', userId)
      
      const syncService = new SyncService()
      await syncService.syncData(userId)
      
      console.log('✅ Forced sync completed')
      
    } catch (error) {
      console.error('❌ Error during forced sync:', error)
    }
  },

  // Clear all local data (use with caution!)
  async clearLocalData() {
    const confirmed = confirm('⚠️ This will delete ALL local data. Are you sure? This action cannot be undone!')
    
    if (!confirmed) {
      console.log('❌ Operation cancelled')
      return
    }
    
    try {
      console.log('🗑️ Clearing all local data...')
      
      const { db } = await import('/src/services/database.ts')
      
      await db.sessions.clear()
      await db.settings.clear()
      await db.tags.clear()
      
      console.log('✅ All local data cleared')
      console.log('🔄 Please refresh the page and sign in again')
      
    } catch (error) {
      console.error('❌ Error clearing local data:', error)
    }
  },

  // Show help
  help() {
    console.log(`
🛠️ Syncodoro Debug Tools

Available functions:
- SyncodoroDiagnostics.cleanupDatabase()     - Remove corrupted data from local database
- SyncodoroDiagnostics.checkDatabaseIntegrity() - Check for data integrity issues
- SyncodoroDiagnostics.forceSync()           - Force synchronization with Supabase
- SyncodoroDiagnostics.clearLocalData()      - Clear all local data (use with caution!)
- SyncodoroDiagnostics.help()                - Show this help message

Usage:
1. Open browser console (F12 or Cmd+Opt+I)
2. Run any of the above functions
3. Check console output for results

Example:
SyncodoroDiagnostics.cleanupDatabase()
    `)
  }
}

// Auto-show help when loaded
console.log('🛠️ Syncodoro Debug Tools loaded! Run SyncodoroDiagnostics.help() for available commands.')
