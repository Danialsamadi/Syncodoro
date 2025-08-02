import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { dbHelpers } from '../services/dbHelpers'
import { ExportService } from '../services/exportService'
import { PomodoroSession } from '../services/database'
import { getDateRange, formatDuration } from '../utils/helpers'
import { Download, FileText, Calendar, BarChart3, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<PomodoroSession[]>([])
  const [period, setPeriod] = useState<'week' | 'month' | 'year' | 'all'>('month')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    totalFocusTime: 0,
    dateRange: null as { start: Date; end: Date } | null
  })

  useEffect(() => {
    if (isOpen && user) {
      loadSessions()
    }
  }, [isOpen, user, period])

  const loadSessions = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      let sessionData: PomodoroSession[]
      
      if (period === 'all') {
        // Get all sessions
        sessionData = await dbHelpers.getRecentSessions(10000, user.id)
      } else {
        // Get sessions for the selected period
        const { start, end } = getDateRange(period)
        sessionData = await dbHelpers.getSessionsByDateRange(start, end, user.id)
      }
      
      setSessions(sessionData)
      setStats(ExportService.getExportStats(sessionData))
    } catch (error) {
      console.error('Failed to load sessions for export:', error)
      toast.error('Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      await ExportService.exportToCSV(sessions)
      toast.success('CSV exported successfully!')
    } catch (error) {
      console.error('Failed to export CSV:', error)
      toast.error('Failed to export CSV')
    }
  }

  const handleExportICS = async () => {
    try {
      await ExportService.exportToICS(sessions)
      toast.success('Calendar file exported successfully!')
    } catch (error) {
      console.error('Failed to export ICS:', error)
      toast.error('Failed to export calendar file')
    }
  }

  const handleExportReport = async () => {
    try {
      await ExportService.exportSessionsReport(sessions)
      toast.success('Report exported successfully!')
    } catch (error) {
      console.error('Failed to export report:', error)
      toast.error('Failed to export report')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Export Data</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Period Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Period
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(['week', 'month', 'year', 'all'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    period === p
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {p === 'all' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Export Stats */}
          {!loading && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Export Preview</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Sessions:</span>
                  <span className="ml-2 font-medium">{stats.totalSessions}</span>
                </div>
                <div>
                  <span className="text-gray-600">Completed:</span>
                  <span className="ml-2 font-medium">{stats.completedSessions}</span>
                </div>
                <div>
                  <span className="text-gray-600">Focus Time:</span>
                  <span className="ml-2 font-medium">{formatDuration(stats.totalFocusTime)}</span>
                </div>
              </div>
              {stats.dateRange && (
                <div className="mt-2 text-sm text-gray-600">
                  <span>Date Range: </span>
                  <span>{stats.dateRange.start.toLocaleDateString()} - {stats.dateRange.end.toLocaleDateString()}</span>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          )}

          {/* Export Options */}
          {!loading && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Export Formats</h3>
              
              <div className="grid gap-4">
                {/* CSV Export */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FileText className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">CSV Spreadsheet</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Export sessions as a CSV file for Excel, Google Sheets, or other spreadsheet applications.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleExportCSV}
                      disabled={sessions.length === 0}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* ICS Export */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Calendar File (ICS)</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Import your focus sessions into Google Calendar, Outlook, or other calendar applications.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleExportICS}
                      disabled={sessions.filter(s => s.completed && s.endTime).length === 0}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export ICS</span>
                    </button>
                  </div>
                </div>

                {/* Report Export */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Detailed Report</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Generate a comprehensive markdown report with statistics and session details.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleExportReport}
                      disabled={sessions.length === 0}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export Report</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && sessions.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Data to Export</h3>
              <p className="text-gray-600">
                No sessions found for the selected period. Try selecting a different time range or complete some focus sessions first.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
