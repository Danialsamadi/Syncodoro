import { supabase } from './supabase'

export interface DashboardStats {
  totalSessions: number
  completedSessions: number
  totalFocusTime: number
  averageSessionLength: number
  streakDays: number
}

export class DashboardSyncService {
  /**
   * Fetches the most accurate session stats directly from the server
   * This ensures all browsers show the same data regardless of local IndexedDB state
   */
  public async getServerSessionStats(userId: string, days: number = 30): Promise<DashboardStats | null> {
    // Create a timeout promise to prevent hanging
    const timeout = new Promise<null>((resolve) => {
      setTimeout(() => {
        console.warn('Server stats fetch timed out');
        resolve(null);
      }, 5000); // 5 second timeout
    });
    
    try {
      // Race between the actual fetch and the timeout
      return await Promise.race([
        this._fetchServerStats(userId, days),
        timeout
      ]);
    } catch (error) {
      console.error('Error in getServerSessionStats:', error);
      return null;
    }
  }

  private async _fetchServerStats(userId: string, days: number = 30): Promise<DashboardStats | null> {
    try {
      console.log('Fetching dashboard stats from server for user:', userId)
      
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000))
      
      // Fetch all completed pomodoro sessions for this user in the date range
      const { data: sessions, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'pomodoro')
        .eq('completed', true)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
      
      if (error) {
        console.error('Error fetching sessions from server:', error)
        return null
      }
      
      if (!sessions || sessions.length === 0) {
        console.log('No sessions found on server')
        return {
          totalSessions: 0,
          completedSessions: 0,
          totalFocusTime: 0,
          averageSessionLength: 0,
          streakDays: 0
        }
      }
      
      console.log(`Found ${sessions.length} completed sessions on server`)
      
      // Calculate total focus time and average session length
      const totalFocusTime = sessions.reduce((sum, session) => sum + session.duration, 0)
      const averageSessionLength = sessions.length > 0 ? totalFocusTime / sessions.length : 0
      
      // Get total sessions (including incomplete ones) - using a simpler query to avoid timeout
      let totalSessionsCount = 0;
      try {
        const { data: allSessions, error: countError } = await supabase
          .from('sessions')
          .select('id')
          .eq('user_id', userId)
          .eq('type', 'pomodoro')
          .gte('start_time', startDate.toISOString())
          .lte('start_time', endDate.toISOString())
        
        if (countError) {
          console.error('Error counting total sessions:', countError)
        } else if (allSessions) {
          totalSessionsCount = allSessions.length;
        }
      } catch (countErr) {
        console.error('Error in total sessions count:', countErr)
        // Use completed sessions count as fallback
        totalSessionsCount = sessions.length;
      }
      
      // Calculate streak (consecutive days with completed sessions)
      let streakDays = 0
      
      // Group sessions by date
      const sessionsByDate = sessions.reduce((acc, session) => {
        const date = new Date(session.start_time).toDateString()
        if (!acc[date]) {
          acc[date] = []
        }
        acc[date].push(session)
        return acc
      }, {} as Record<string, any[]>)
      
      // Calculate streak
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      for (let i = 0; i < days; i++) {
        const checkDate = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000))
        const dateString = checkDate.toDateString()
        
        if (sessionsByDate[dateString] && sessionsByDate[dateString].length > 0) {
          streakDays++
        } else if (i > 0) {
          break // Streak is broken
        }
      }
      
      return {
        totalSessions: totalSessionsCount || sessions.length,
        completedSessions: sessions.length,
        totalFocusTime,
        averageSessionLength,
        streakDays
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats from server:', error)
      return null
    }
  }
}

// Export a singleton instance
export const dashboardSyncService = new DashboardSyncService()
