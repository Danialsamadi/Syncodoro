import { supabase } from './supabase'

// Interface for active timer state
export interface ActiveTimerState {
  timeLeft: number
  isRunning: boolean
  isPaused: boolean
  currentType: 'pomodoro' | 'short-break' | 'long-break'
  sessionCount: number
  currentTags: string[]
  sessionNotes?: string
  sessionStartTime?: Date | null
  currentSessionId?: number | null
}

export class TimerSyncService {
  private subscription: any = null
  private userId: string | null = null
  private onTimerStateChange: ((state: ActiveTimerState) => void) | null = null
  private lastSyncedState: ActiveTimerState | null = null
  private syncDebounceTimeout: NodeJS.Timeout | null = null
  
  constructor() {
    // Initialize
    console.log('Timer sync service initialized')
  }

  // Set up real-time subscription for timer state changes
  public subscribeToTimerChanges(userId: string, callback: (state: ActiveTimerState) => void) {
    this.userId = userId
    this.onTimerStateChange = callback
    
    // Unsubscribe from any existing subscription
    this.unsubscribe()
    
    console.log('Setting up timer sync subscription for user:', userId)
    
    // Subscribe to changes in the active_timer_state table for this user
    this.subscription = supabase
      .channel('active_timer_state_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_timer_state',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Received timer state update:', payload)
          
          // Only process if we have a callback and the data is valid
          if (this.onTimerStateChange && payload.new) {
            const newState: ActiveTimerState = {
              timeLeft: payload.new.time_left,
              isRunning: payload.new.is_running,
              isPaused: payload.new.is_paused,
              currentType: payload.new.current_type,
              sessionCount: payload.new.session_count,
              currentTags: payload.new.current_tags || [],
              sessionNotes: payload.new.session_notes,
              sessionStartTime: payload.new.session_start_time ? new Date(payload.new.session_start_time) : null,
              currentSessionId: payload.new.current_session_id
            }
            
            // Store the last synced state to avoid echo effects
            this.lastSyncedState = newState
            
            // Call the callback with the new state
            this.onTimerStateChange(newState)
          }
        }
      )
      .subscribe()
    
    // Fetch the initial state
    this.fetchTimerState()
  }
  
  // Unsubscribe from real-time updates
  public unsubscribe() {
    if (this.subscription) {
      supabase.removeChannel(this.subscription)
      this.subscription = null
    }
  }
  
  // Fetch the current timer state from the database
  public async fetchTimerState(): Promise<ActiveTimerState | null> {
    if (!this.userId) return null
    
    try {
      const { data, error } = await supabase
        .from('active_timer_state')
        .select('*')
        .eq('user_id', this.userId)
        .single()
      
      if (error) {
        console.error('Error fetching timer state:', error)
        return null
      }
      
      if (!data) {
        console.log('No timer state found for user:', this.userId)
        return null
      }
      
      const state: ActiveTimerState = {
        timeLeft: data.time_left,
        isRunning: data.is_running,
        isPaused: data.is_paused,
        currentType: data.current_type,
        sessionCount: data.session_count,
        currentTags: data.current_tags || [],
        sessionNotes: data.session_notes,
        sessionStartTime: data.session_start_time ? new Date(data.session_start_time) : null,
        currentSessionId: data.current_session_id
      }
      
      // Store the last synced state
      this.lastSyncedState = state
      
      // If we have a callback, call it with the new state
      if (this.onTimerStateChange) {
        this.onTimerStateChange(state)
      }
      
      return state
    } catch (error) {
      console.error('Error fetching timer state:', error)
      return null
    }
  }
  
  // Update the timer state in the database
  public async updateTimerState(state: Partial<ActiveTimerState>): Promise<void> {
    if (!this.userId) return
    
    // Debounce updates to avoid too many writes
    if (this.syncDebounceTimeout) {
      clearTimeout(this.syncDebounceTimeout)
    }
    
    this.syncDebounceTimeout = setTimeout(async () => {
      try {
        // Convert the state to the database format
        const dbState: any = {
          user_id: this.userId,
          time_left: state.timeLeft,
          is_running: state.isRunning,
          is_paused: state.isPaused,
          current_type: state.currentType,
          session_count: state.sessionCount,
          current_tags: state.currentTags,
          session_notes: state.sessionNotes,
          session_start_time: state.sessionStartTime ? state.sessionStartTime.toISOString() : null,
          current_session_id: state.currentSessionId,
          last_updated: new Date().toISOString()
        }
        
        // Only include defined fields
        Object.keys(dbState).forEach(key => {
          if (dbState[key] === undefined) {
            delete dbState[key]
          }
        })
        
        console.log('Updating timer state:', dbState)
        
        // Upsert the timer state
        const { error } = await supabase
          .from('active_timer_state')
          .upsert(dbState, {
            onConflict: 'user_id'
          })
        
        if (error) {
          console.error('Error updating timer state:', error)
          
          // Try insert if upsert failed
          if (error.code === '23505') { // Unique violation
            const { error: insertError } = await supabase
              .from('active_timer_state')
              .insert(dbState)
            
            if (insertError) {
              console.error('Error inserting timer state:', insertError)
            }
          }
        }
      } catch (error) {
        console.error('Error updating timer state:', error)
      }
    }, 300) // Debounce for 300ms
  }
  
  // Check if a state update is from our own sync (to avoid loops)
  public isOwnUpdate(state: Partial<ActiveTimerState>): boolean {
    if (!this.lastSyncedState) return false
    
    // Check if the important fields match
    return (
      state.timeLeft === this.lastSyncedState.timeLeft &&
      state.isRunning === this.lastSyncedState.isRunning &&
      state.isPaused === this.lastSyncedState.isPaused &&
      state.currentType === this.lastSyncedState.currentType &&
      state.sessionCount === this.lastSyncedState.sessionCount
    )
  }
}

// Export a singleton instance
export const timerSyncService = new TimerSyncService()
