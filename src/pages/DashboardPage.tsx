import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSync } from '../contexts/SyncContext'
import { dbHelpers } from '../services/dbHelpers'
import { PomodoroSession } from '../services/database'
import { dashboardSyncService } from '../services/dashboardSyncService'
import { formatDuration, getDateRange, groupSessionsByDate } from '../utils/helpers'
import { Calendar, Clock, Target, TrendingUp, Download, RefreshCw } from 'lucide-react'
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
  const { syncNow, isSyncing, syncStatus, lastSyncTime } = useSync()
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
  const [isCleaningUp, setIsCleaningUp] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [user, period])
  
  // Refresh data when sync status changes to success
  // Use a ref to prevent multiple refreshes
  const lastSyncStatusRef = React.useRef(syncStatus);
  
  useEffect(() => {
    // Only refresh if status changed from something else to 'success'
    if (syncStatus === 'success' && lastSyncStatusRef.current !== 'success' && user) {
      console.log('Sync completed, refreshing dashboard data')
      loadDashboardData()
    }
    
    // Update the ref
    lastSyncStatusRef.current = syncStatus;
  }, [syncStatus, user])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Set a loading timeout to prevent infinite loading state
      const loadingTimeout = setTimeout(() => {
        console.warn('Dashboard loading timed out, forcing completion');
        setLoading(false);
      }, 10000); // 10 second timeout
      
      // Get sessions for the selected period
      const { start, end } = getDateRange(period)
      const periodSessions = await dbHelpers.getSessionsByDateRange(start, end, user.id)
      setSessions(periodSessions)

      // First try to get stats from the server for consistent data across browsers
      const serverStats = await dashboardSyncService.getServerSessionStats(user.id, 30)
      
      if (serverStats) {
        console.log('Using server-side stats for dashboard')
        setStats(serverStats)
      } else {
        // Fall back to local stats if server fetch fails
        console.log('Falling back to local stats for dashboard')
        const localStatsData = await dbHelpers.getSessionStats(user.id, 30)
        setStats(localStatsData)
      }
      
      // Clear the timeout since we completed successfully
      clearTimeout(loadingTimeout);
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const cleanupDuplicates = async () => {
    if (!user || isCleaningUp) return
    
    setIsCleaningUp(true)
    try {
      console.log('Starting manual duplicate cleanup...')
      await dbHelpers.cleanupDuplicateSessions(user.id)
      // Refresh the dashboard after cleanup
      await loadDashboardData()
      console.log('Duplicate cleanup completed')
    } catch (error) {
      console.error('Error during cleanup:', error)
    } finally {
      setIsCleaningUp(false)
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

  const COLORS = ['#262626', '#404040', '#525252', '#737373', '#a3a3a3']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-700"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="responsive-container py-6 md:py-8">
        {/* Header Section */}
        <div className="mb-8 md:mb-12">
          <div className="responsive-stack justify-between items-start">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Track your productivity and focus sessions</p>
            </div>
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 mt-4 md:mt-0 w-full md:w-auto">
              <div className="flex flex-col w-full md:w-auto">
                <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={() => syncNow()}
                  disabled={isSyncing}
                  className={`btn-secondary flex items-center justify-center gap-2 ${isSyncing ? 'bg-gray-100' : ''}`}
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Data'}</span>
                  {syncStatus === 'success' && <span className="text-gray-900 text-xs ml-1">✓</span>}
                </button>
                
                <button
                  onClick={cleanupDuplicates}
                  disabled={isCleaningUp}
                  className={`btn-icon ${isCleaningUp ? 'animate-pulse' : ''}`}
                  title="Clean up duplicate sessions"
                >
                  <svg className={`w-4 h-4 ${isCleaningUp ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
                {lastSyncTime && (
                  <span className="text-xs text-gray-500 mt-1 text-center md:text-left">
                    Last synced: {lastSyncTime.toLocaleTimeString()}
                  </span>
                )}
              </div>
              
              <button
                onClick={() => setShowExportModal(true)}
                className="btn-secondary flex items-center justify-center gap-2 mt-2 md:mt-0"
              >
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </button>
              
              <div className="flex bg-white rounded-md p-1 shadow-sm border border-gray-200 mt-2 md:mt-0 w-full md:w-auto">
                {(['week', 'month', 'year'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1 md:px-4 md:py-2 rounded-md text-sm font-medium transition-all duration-200 flex-1 md:flex-auto ${
                      period === p
                        ? 'bg-gray-800 text-white'
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          <div className="card hover:shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-gray-100 rounded-md">
                <Target className="w-5 h-5 text-gray-700" />
              </div>
              <div className="text-right">
                <p className="stat-number">
                  {stats.completedSessions}
                </p>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Completed Sessions</p>
            <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gray-700 rounded-full" style={{width: '75%'}}></div>
            </div>
          </div>

          <div className="card hover:shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-gray-100 rounded-md">
                <Clock className="w-5 h-5 text-gray-700" />
              </div>
              <div className="text-right">
                <p className="stat-number">
                  {formatDuration(stats.totalFocusTime)}
                </p>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Total Focus Time</p>
            <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gray-700 rounded-full" style={{width: '90%'}}></div>
            </div>
          </div>

          <div className="card hover:shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-gray-100 rounded-md">
                <TrendingUp className="w-5 h-5 text-gray-700" />
              </div>
              <div className="text-right">
                <p className="stat-number">
                  {stats.streakDays}
                </p>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Current Streak (days)</p>
            <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gray-700 rounded-full" style={{width: '60%'}}></div>
            </div>
          </div>

          <div className="card hover:shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-gray-100 rounded-md">
                <Calendar className="w-5 h-5 text-gray-700" />
              </div>
              <div className="text-right">
                <p className="stat-number">
                  {formatDuration(stats.averageSessionLength)}
                </p>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Average Session</p>
            <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gray-700 rounded-full" style={{width: '80%'}}></div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        {completedSessions.length > 0 && (
          <div className="space-y-6 md:space-y-8">
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                Analytics Overview
              </h2>
              <p className="text-gray-600 text-sm md:text-base">Visual insights into your productivity patterns</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Daily Focus Time Chart */}
              <div className="card">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-gray-100 rounded-md mr-3">
                    <Clock className="w-4 h-4 text-gray-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Daily Focus Time</h3>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#737373"
                        fontSize={11}
                      />
                      <YAxis 
                        stroke="#737373"
                        fontSize={11}
                        label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: { fontSize: '11px', fill: '#737373' } }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e4e4e4',
                          borderRadius: '4px',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
                        }}
                        formatter={(value: number) => [`${value} min`, 'Focus Time']}
                      />
                      <Bar 
                        dataKey="focusTime" 
                        fill="#404040" 
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Session Count Trend */}
              <div className="card">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-gray-100 rounded-md mr-3">
                    <TrendingUp className="w-4 h-4 text-gray-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Session Trend</h3>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#737373"
                        fontSize={11}
                      />
                      <YAxis 
                        stroke="#737373"
                        fontSize={11}
                        label={{ value: 'Sessions', angle: -90, position: 'insideLeft', style: { fontSize: '11px', fill: '#737373' } }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e4e4e4',
                          borderRadius: '4px',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
                        }}
                        formatter={(value: number) => [`${value}`, 'Sessions']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sessions" 
                        stroke="#404040" 
                        strokeWidth={2}
                        dot={{ fill: '#404040', strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 5, stroke: '#404040', strokeWidth: 2 }}
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
          <div className="card">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-gray-100 rounded-md mr-3">
                <Target className="w-4 h-4 text-gray-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Most Used Tags</h3>
            </div>
            <div className="flex flex-col lg:flex-row items-center">
              <div className="h-56 md:h-64 w-full lg:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tagData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {tagData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e4e4e4',
                        borderRadius: '4px',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
                      }}
                      formatter={(value: number) => [`${value}`, 'Sessions']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full lg:w-1/2 lg:pl-6 mt-4 lg:mt-0">
                <div className="space-y-2">
                  {tagData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between text-sm md:text-base">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 md:w-4 md:h-4 rounded-sm"
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
        <div className="card">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-gray-100 rounded-md mr-3">
              <Calendar className="w-4 h-4 text-gray-700" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Sessions</h3>
          </div>
        
        {completedSessions.length === 0 ? (
          <div className="text-center py-6">
            <Target className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No completed sessions yet</p>
            <p className="text-sm text-gray-500 mt-1">Start a timer to see your progress here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(groupedSessions)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .slice(0, 7)
              .map(([date, daySessions]) => (
                <div key={date} className="relative bg-white rounded-md p-3 border border-gray-200 hover:border-gray-400 hover:shadow-sm transition-all duration-200">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-700 rounded-r"></div>
                  <div className="flex justify-between items-start ml-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm md:text-base mb-1">
                        {new Date(date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </h4>
                      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-1 md:space-y-0 text-xs md:text-sm text-gray-600">
                        <span className="flex items-center">
                          <Target className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                          {daySessions.length} sessions
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                          {formatDuration(daySessions.reduce((sum, s) => sum + s.duration, 0))}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 md:gap-2 ml-2 md:ml-4">
                      {daySessions.slice(0, 6).map((session, index) => (
                        <div
                          key={index}
                          className="w-3 h-3 md:w-4 md:h-4 bg-gray-700 rounded-sm shadow-sm"
                          title={`${formatDuration(session.duration)} - ${session.tags.join(', ')}`}
                        />
                      ))}
                      {daySessions.length > 6 && (
                        <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-300 rounded-sm flex items-center justify-center text-[10px] md:text-xs text-gray-600 font-bold">
                          +{daySessions.length - 6}
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
        <div className="card">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-gray-100 rounded-md mr-3">
              <TrendingUp className="w-4 h-4 text-gray-700" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <button
              onClick={() => window.location.href = '/'}
              className="bg-white border border-gray-200 rounded-md p-4 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-center"
            >
              <div className="p-2 bg-gray-100 rounded-md mx-auto mb-3 w-fit">
                <Target className="w-5 h-5 text-gray-700" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">Start Timer</h4>
              <p className="text-xs md:text-sm text-gray-600">Begin a new focus session</p>
            </button>
            
            <button
              onClick={() => window.location.href = '/profile'}
              className="bg-white border border-gray-200 rounded-md p-4 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-center"
            >
              <div className="p-2 bg-gray-100 rounded-md mx-auto mb-3 w-fit">
                <Calendar className="w-5 h-5 text-gray-700" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">View Profile</h4>
              <p className="text-xs md:text-sm text-gray-600">Manage your public profile</p>
            </button>
            
            <button
              onClick={() => window.location.href = '/settings'}
              className="bg-white border border-gray-200 rounded-md p-4 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-center"
            >
              <div className="p-2 bg-gray-100 rounded-md mx-auto mb-3 w-fit">
                <TrendingUp className="w-5 h-5 text-gray-700" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">Settings</h4>
              <p className="text-xs md:text-sm text-gray-600">Customize your experience</p>
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
