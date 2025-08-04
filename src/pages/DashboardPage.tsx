import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { dbHelpers } from '../services/dbHelpers'
import { PomodoroSession } from '../services/database'
import { formatDuration, getDateRange, groupSessionsByDate } from '../utils/helpers'
import { Calendar, Clock, Target, TrendingUp, Download } from 'lucide-react'
import ExportModal from '../components/ExportModal'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

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
  const [showExportModal, setShowExportModal] = useState(false)

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
  const groupedSessions = groupSessionsByDate(completedSessions)

  // Prepare chart data
  const chartData = Object.entries(groupedSessions)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, daySessions]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sessions: daySessions.length,
      focusTime: Math.round(daySessions.reduce((sum, s) => sum + s.duration, 0) / 60), // in minutes
      completionRate: Math.round((daySessions.filter(s => s.completed).length / daySessions.length) * 100)
    }))

  // Prepare tag distribution data
  const tagCounts = completedSessions.reduce((acc, session) => {
    session.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  const tagData = Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([tag, count]) => ({ name: tag, value: count }))

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Track your productivity and focus sessions</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                onClick={() => setShowExportModal(true)}
                className="group relative overflow-hidden bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100 flex items-center space-x-2"
              >
                <Download className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>Export Data</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </button>
              
              <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-200">
                {(['week', 'month', 'year'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      period === p
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-red-100 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                    {stats.completedSessions}
                  </p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600">Completed Sessions</p>
              <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transform origin-left scale-x-75 transition-transform duration-1000"></div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-blue-100 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                    {formatDuration(stats.totalFocusTime)}
                  </p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600">Total Focus Time</p>
              <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transform origin-left scale-x-90 transition-transform duration-1000"></div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-green-100 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                    {stats.streakDays}
                  </p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600">Current Streak (days)</p>
              <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transform origin-left scale-x-60 transition-transform duration-1000"></div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-purple-100 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                    {formatDuration(stats.averageSessionLength)}
                  </p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600">Average Session</p>
              <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transform origin-left scale-x-80 transition-transform duration-1000"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        {completedSessions.length > 0 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-2">
                Analytics Overview
              </h2>
              <p className="text-gray-600">Visual insights into your productivity patterns</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Daily Focus Time Chart */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg mr-3">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Daily Focus Time</h3>
                </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: number) => [`${value} min`, 'Focus Time']}
                  />
                  <Bar 
                    dataKey="focusTime" 
                    fill="#ef4444" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

              {/* Session Count Trend */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Session Trend</h3>
                </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    label={{ value: 'Sessions', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: number) => [`${value}`, 'Sessions']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sessions" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
            </div>
          </div>
        )}

        {/* Tag Distribution Chart */}
        {tagData.length > 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg mr-3">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Most Used Tags</h3>
            </div>
          <div className="flex flex-col lg:flex-row items-center">
            <div className="h-64 w-full lg:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tagData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {tagData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: number) => [`${value}`, 'Sessions']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full lg:w-1/2 lg:pl-8">
              <div className="space-y-3">
                {tagData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium text-gray-900">{entry.name}</span>
                    </div>
                    <span className="text-gray-600">{entry.value} sessions</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
        )}

        {/* Recent Sessions */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg mr-3">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Recent Sessions</h3>
          </div>
        
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
                <div key={date} className="group relative overflow-hidden bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-r"></div>
                  <div className="flex justify-between items-start ml-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {new Date(date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Target className="w-4 h-4 mr-1" />
                          {daySessions.length} sessions
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDuration(daySessions.reduce((sum, s) => sum + s.duration, 0))}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-4">
                      {daySessions.slice(0, 8).map((session, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-sm transform hover:scale-125 transition-transform duration-200"
                          title={`${formatDuration(session.duration)} - ${session.tags.join(', ')}`}
                        />
                      ))}
                      {daySessions.length > 8 && (
                        <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-600 font-bold">
                          +{daySessions.length - 8}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg mr-3">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => window.location.href = '/'}
              className="group relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-6 hover:shadow-lg hover:shadow-red-100 hover:-translate-y-1 transition-all duration-300 text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl mx-auto mb-4 w-fit">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Start Timer</h4>
                <p className="text-sm text-gray-600">Begin a new focus session</p>
              </div>
            </button>
            
            <button
              onClick={() => window.location.href = '/profile'}
              className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 hover:shadow-lg hover:shadow-blue-100 hover:-translate-y-1 transition-all duration-300 text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mx-auto mb-4 w-fit">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">View Profile</h4>
                <p className="text-sm text-gray-600">Manage your public profile</p>
              </div>
            </button>
            
            <button
              onClick={() => window.location.href = '/settings'}
              className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 hover:shadow-lg hover:shadow-purple-100 hover:-translate-y-1 transition-all duration-300 text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mx-auto mb-4 w-fit">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Settings</h4>
                <p className="text-sm text-gray-600">Customize your experience</p>
              </div>
            </button>
          </div>
        </div>
        
        <ExportModal 
          isOpen={showExportModal} 
          onClose={() => setShowExportModal(false)} 
        />
      </div>
    </div>
  )
}
