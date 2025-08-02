import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { dbHelpers } from '../services/dbHelpers'
import { PomodoroSession } from '../services/database'
import { formatDuration, getDateRange, groupSessionsByDate } from '../utils/helpers'
import { Calendar, Clock, Target, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<PomodoroSession[]>([])
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    totalFocusTime: 0,
    averageSessionLength: 0,
    streakDays: 0
  })
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [user, period])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Get sessions for the selected period
      const { start, end } = getDateRange(period)
      const periodSessions = await dbHelpers.getSessionsByDateRange(start, end, user.id)
      setSessions(periodSessions)

      // Get overall stats
      const statsData = await dbHelpers.getSessionStats(user.id, 30)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const completedSessions = sessions.filter(s => s.completed && s.type === 'pomodoro')
  const totalFocusTime = completedSessions.reduce((sum, session) => sum + session.duration, 0)
  const groupedSessions = groupSessionsByDate(completedSessions)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        
        <div className="flex space-x-2">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Target className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedSessions}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Focus Time</p>
              <p className="text-2xl font-bold text-gray-900">{formatDuration(stats.totalFocusTime)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current Streak</p>
              <p className="text-2xl font-bold text-gray-900">{stats.streakDays} days</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Session</p>
              <p className="text-2xl font-bold text-gray-900">{formatDuration(stats.averageSessionLength)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Sessions</h2>
        
        {completedSessions.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No completed sessions yet</p>
            <p className="text-sm text-gray-500 mt-1">Start a timer to see your progress here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedSessions)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .slice(0, 7)
              .map(([date, daySessions]) => (
                <div key={date} className="border-l-4 border-primary-500 pl-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {new Date(date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {daySessions.length} sessions • {formatDuration(
                          daySessions.reduce((sum, s) => sum + s.duration, 0)
                        )}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {daySessions.map((session, index) => (
                        <div
                          key={index}
                          className="w-3 h-3 bg-primary-500 rounded-full"
                          title={`${formatDuration(session.duration)} - ${session.tags.join(', ')}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.location.href = '/'}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
          >
            <Target className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Start Timer</p>
            <p className="text-sm text-gray-600">Begin a new focus session</p>
          </button>
          
          <button
            onClick={() => window.location.href = '/profile'}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
          >
            <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="font-medium text-gray-900">View Profile</p>
            <p className="text-sm text-gray-600">Manage your public profile</p>
          </button>
          
          <button
            onClick={() => window.location.href = '/settings'}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
          >
            <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Settings</p>
            <p className="text-sm text-gray-600">Customize your experience</p>
          </button>
        </div>
      </div>
    </div>
  )
}
