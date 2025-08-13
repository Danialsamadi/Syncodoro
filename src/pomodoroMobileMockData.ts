// Mock data for Pomodoro timer states
export const mockRootProps = {
  currentTask: "Making UI design for an app" as const,
  sessionCount: 3 as const,
  totalSessions: 4 as const,
  timerStates: {
    interval: {
      timeRemaining: 1800, // 30:00 in seconds
      finishedAt: new Date(2024, 0, 1, 11, 15),
      phase: "interval" as const
    },
    break: {
      timeRemaining: 300, // 05:00 in seconds  
      finishedAt: new Date(2024, 0, 1, 11, 0),
      phase: "break" as const
    },
    newSession: {
      timeRemaining: 5400, // 90:00 in seconds
      finishedAt: new Date(2024, 0, 1, 12, 15), 
      phase: "new-session" as const
    }
  },
  currentPhase: "interval" as const,
  isRunning: false as const,
  currentType: "pomodoro" as const
};

// ... existing code ...