// Demo script to show how data sync works
// This demonstrates the offline-first approach with Supabase sync

import { dbHelpers } from '../services/dbHelpers'
import { syncService } from '../services/syncService'

export class SyncDemo {
  static async demonstrateOfflineFirst(userId: string) {
    console.log('🚀 Syncodoro Data Sync Demo')
    console.log('============================')
    
    // 1. Create data offline (stored in IndexedDB)
    console.log('\n📱 Creating data offline...')
    
    // Add a tag
    const tagId = await dbHelpers.addTag({
      userId,
      name: 'Work',
      color: '#3b82f6',
      synced: false
    })
    console.log('✅ Created tag "Work" locally')
    
    // Add a Pomodoro session
    const sessionId = await dbHelpers.addSession({
      userId,
      startTime: new Date(),
      endTime: new Date(Date.now() + 25 * 60 * 1000), // 25 minutes
      duration: 1500, // 25 minutes in seconds
      type: 'pomodoro',
      tags: ['Work'],
      completed: true,
      notes: 'Completed important project task',
      synced: false
    })
    console.log('✅ Created Pomodoro session locally')
    
    // Update settings
    await dbHelpers.updateSettings({
      pomodoroLength: 1800, // 30 minutes
      shortBreakLength: 600, // 10 minutes
      soundEnabled: true,
      notificationsEnabled: true
    }, userId)
    console.log('✅ Updated timer settings locally')
    
    // 2. Show local data
    console.log('\n💾 Local data (IndexedDB):')
    const localTags = await dbHelpers.getTags(userId)
    const localSessions = await dbHelpers.getRecentSessions(5, userId)
    const localSettings = await dbHelpers.getSettings(userId)
    
    console.log(`- Tags: ${localTags.length} (${localTags.map(t => t.name).join(', ')})`)
    console.log(`- Sessions: ${localSessions.length} recent sessions`)
    console.log(`- Settings: Pomodoro ${localSettings?.pomodoroLength}s, Break ${localSettings?.shortBreakLength}s`)
    
    // 3. Simulate going online and syncing
    console.log('\n🌐 Going online and syncing to Supabase...')
    
    try {
      await syncService.syncData(userId)
      console.log('✅ Sync completed successfully!')
      
      // 4. Show sync status
      console.log('\n📊 Sync Status:')
      const unsyncedSessions = await dbHelpers.getUnsyncedSessions(userId)
      const unsyncedTags = await dbHelpers.getUnsyncedTags(userId)
      
      console.log(`- Unsynced sessions: ${unsyncedSessions.length}`)
      console.log(`- Unsynced tags: ${unsyncedTags.length}`)
      
      if (unsyncedSessions.length === 0 && unsyncedTags.length === 0) {
        console.log('🎉 All data is now synced to Supabase!')
      }
      
    } catch (error) {
      console.log('❌ Sync failed (probably no Supabase connection):', error)
      console.log('💡 Data remains safely stored locally and will sync when online')
    }
    
    console.log('\n🔄 Data Flow Summary:')
    console.log('1. ✅ Data created and stored locally (IndexedDB)')
    console.log('2. ✅ App works perfectly offline')
    console.log('3. ✅ When online, data syncs to Supabase automatically')
    console.log('4. ✅ Other devices can access the same data')
    console.log('5. ✅ Offline-first: local data is always available')
  }
  
  static async showDataTypes() {
    console.log('\n📋 Syncodoro Data Types Stored in Supabase:')
    console.log('==========================================')
    
    console.log('\n1. 👤 User Profiles (profiles table):')
    console.log('   - Username and display name')
    console.log('   - Bio and profile visibility')
    console.log('   - Public profile sharing settings')
    
    console.log('\n2. 🍅 Pomodoro Sessions (sessions table):')
    console.log('   - Start/end times and duration')
    console.log('   - Session type (pomodoro/break)')
    console.log('   - Associated tags and notes')
    console.log('   - Completion status')
    
    console.log('\n3. ⚙️ User Settings (user_settings table):')
    console.log('   - Timer durations (pomodoro, breaks)')
    console.log('   - Auto-start preferences')
    console.log('   - Sound and notification settings')
    
    console.log('\n4. 🏷️ Tags (tags table):')
    console.log('   - Custom tag names and colors')
    console.log('   - User-specific tag collections')
    console.log('   - Session categorization')
    
    console.log('\n🔒 Security: All data is protected by Row Level Security (RLS)')
    console.log('📱 Offline-First: Data works without internet, syncs when available')
    console.log('🔄 Real-time: Changes sync across all your devices')
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).SyncDemo = SyncDemo
}
