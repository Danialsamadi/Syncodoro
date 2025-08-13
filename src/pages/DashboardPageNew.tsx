import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSyncContext } from '../contexts/SyncContext'
import MobileLayout from '../components/MobileLayout'
import { Calendar, Clock, Target, TrendingUp, Play, Pause } from 'lucide-react'

interface SessionStats {
  totalSessions: number
  totalFocusTime: number
  todayFocusTime: number
  weekFocusTime: number
  averageSessionLength: number
  completionRate: number
}

export default function DashboardPageNew() {
  const { user } = useAuth()
  const { syncStatus } = useSyncContext()
  const [stats, setStats] = useState<SessionStats>({
    totalSessions: 0,
    totalFocusTime: 0,
    todayFocusTime: 0,
    weekFocusTime: 0,
    averageSessionLength: 0,
    completionRate: 0
  })
  const [loading, setLoading] = useState(true)

  // Mock data for demo - replace with actual data fetching
  useEffect(() => {
    const loadStats = async () => {
      // Simulate loading
      setTimeout(() => {
        setStats({
          totalSessions: 47,
          totalFocusTime: 1180, // minutes
          todayFocusTime: 125,
          weekFocusTime: 420,
          averageSessionLength: 25,
          completionRate: 85
        })
        setLoading(false)
      }, 1000)
    }

    loadStats()
  }, [user])

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const StatCard = ({ icon: Icon, label, value, subtitle, color = 'primary' }: {
    icon: any
    label: string
    value: string
    subtitle?: string
    color?: 'primary' | 'success' | 'warning'
  }) => {
    const colorClasses = {
      primary: 'text-primary-600 bg-primary-600/10',
      success: 'text-success-500 bg-success-500/10',
      warning: 'text-warning-500 bg-warning-500/10'
    }

    return (
      <div className="bg-surface-level-2 rounded-2xl p-6 border border-border-secondary">
        <div className="flex items-center space-x-3 mb-4">
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-text-tertiary uppercase tracking-wider">
              {label}
            </h3>
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-3xl font-light text-text-primary font-mono">
            {value}
          </div>
          {subtitle && (
            <div className="text-sm text-text-tertiary">
              {subtitle}
            </div>
          )}
        </div>
      </div>
    )
  }

  const RecentSession = ({ type, duration, completed, time }: {
    type: 'Focus' | 'Short Break' | 'Long Break'
    duration: string
    completed: boolean
    time: string
  }) => {
    const getTypeColor = () => {
      switch (type) {
        case 'Focus': return 'text-primary-600 bg-primary-600/10'
        case 'Short Break': return 'text-primary-400 bg-primary-400/10'
        case 'Long Break': return 'text-primary-800 bg-primary-800/10'
        default: return 'text-primary-600 bg-primary-600/10'
      }
    }

    return (
      <div className="flex items-center space-x-4 p-4 bg-surface-level-2 rounded-xl border border-border-secondary">
        <div className={`p-2 rounded-lg ${getTypeColor()}`}>
          {completed ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-medium text-text-primary">{type}</span>
            <span className="text-sm text-text-tertiary">{time}</span>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-sm text-text-secondary">{duration}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              completed 
                ? 'bg-success-500/10 text-success-500' 
                : 'bg-warning-500/10 text-warning-500'
            }`}>
              {completed ? 'Completed' : 'Interrupted'}
            </span>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <MobileLayout title="Reports">
        <div className="flex flex-col items-center justify-center h-full px-6 text-center">
          <div className="w-20 h-20 bg-surface-level-2 rounded-full flex items-center justify-center mb-6">
            <TrendingUp className="w-10 h-10 text-text-tertiary" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Sign in to view reports
          </h2>
          <p className="text-text-secondary mb-6">
            Track your productivity and see detailed statistics about your focus sessions.
          </p>
          <button className="btn-primary">
            Sign In
          </button>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout title="Reports">
      <div className="px-6 pb-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon={Target}
                label="Total Sessions"
                value={stats.totalSessions.toString()}
                subtitle="All time"
              />
              <StatCard
                icon={Clock}
                label="Focus Time"
                value={formatTime(stats.totalFocusTime)}
                subtitle="All time"
                color="success"
              />
              <StatCard
                icon={Calendar}
                label="Today"
                value={formatTime(stats.todayFocusTime)}
                subtitle="Focus time"
              />
              <StatCard
                icon={TrendingUp}
                label="This Week"
                value={formatTime(stats.weekFocusTime)}
                subtitle="Focus time"
                color="warning"
              />
            </div>

            {/* Progress Overview */}
            <div className="bg-surface-level-2 rounded-2xl p-6 border border-border-secondary">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Weekly Progress
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Completion Rate</span>
                  <span className="text-sm font-semibold text-text-primary">{stats.completionRate}%</span>
                </div>
                <div className="w-full bg-surface-level-3 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-text-tertiary">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="bg-surface-level-2 rounded-2xl p-6 border border-border-secondary">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Recent Sessions
              </h3>
              <div className="space-y-3">
                <RecentSession
                  type="Focus"
                  duration="25 min"
                  completed={true}
                  time="2 hours ago"
                />
                <RecentSession
                  type="Short Break"
                  duration="5 min"
                  completed={true}
                  time="2 hours ago"
                />
                <RecentSession
                  type="Focus"
                  duration="18 min"
                  completed={false}
                  time="3 hours ago"
                />
                <RecentSession
                  type="Long Break"
                  duration="15 min"
                  completed={true}
                  time="4 hours ago"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-surface-level-2 rounded-2xl p-6 border border-border-secondary">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="btn-outline flex items-center justify-center space-x-2 py-4">
                  <Calendar className="w-5 h-5" />
                  <span>View Calendar</span>
                </button>
                <button className="btn-secondary flex items-center justify-center space-x-2 py-4">
                  <TrendingUp className="w-5 h-5" />
                  <span>Export Data</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </MobileLayout>
  )
}
