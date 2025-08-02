import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { formatDuration } from '../utils/helpers'
import { User, Calendar, Target, TrendingUp, Clock } from 'lucide-react'

interface PublicProfile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  profile_public: boolean
  created_at: string
}

interface ProfileStats {
  totalSessions: number
  totalFocusTime: number
  streakDays: number
  averageSessionLength: number
  topTags: Array<{ name: string; count: number }>
}

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>()
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (username) {
      loadPublicProfile()
    }
  }, [username])

  const loadPublicProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get profile by username
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .eq('profile_public', true)
        .single()

      if (profileError || !profileData) {
        setError('Profile not found or is private')
        return
      }

      setProfile(profileData)

      // Get profile stats
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', profileData.id)
        .eq('completed', true)
        .eq('type', 'pomodoro')

      if (!sessionsError && sessionsData) {
        const totalSessions = sessionsData.length
        const totalFocusTime = sessionsData.reduce((sum, session) => sum + session.duration, 0)
        const averageSessionLength = totalSessions > 0 ? totalFocusTime / totalSessions : 0

        // Calculate streak (simplified - last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        const recentSessions = sessionsData.filter(session => 
          new Date(session.start_time) >= thirtyDaysAgo
        )

        // Group by date and count consecutive days
        const sessionDates = new Set(
          recentSessions.map(session => 
            new Date(session.start_time).toDateString()
          )
        )

        let streakDays = 0
        const today = new Date()
        for (let i = 0; i < 30; i++) {
          const checkDate = new Date(today)
          checkDate.setDate(today.getDate() - i)
          
          if (sessionDates.has(checkDate.toDateString())) {
            streakDays++
          } else if (i > 0) {
            break
          }
        }

        // Calculate top tags
        const tagCounts: Record<string, number> = {}
        sessionsData.forEach(session => {
          session.tags.forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1
          })
        })

        const topTags = Object.entries(tagCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)

        setStats({
          totalSessions,
          totalFocusTime,
          streakDays,
          averageSessionLength,
          topTags
        })
      }
    } catch (error) {
      console.error('Failed to load public profile:', error)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
          <p className="text-gray-600">
            {error || 'This profile does not exist or is set to private.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.display_name || profile.username}
              </h1>
              <p className="text-gray-600">@{profile.username}</p>
              {profile.bio && (
                <p className="text-gray-700 mt-2">{profile.bio}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 py-8">
        {stats ? (
          <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Target className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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

            {/* Top Tags */}
            {stats.topTags.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Most Used Tags</h2>
                <div className="space-y-3">
                  {stats.topTags.map((tag, index) => (
                    <div key={tag.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                          {tag.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">{tag.count} sessions</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Member Since */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Member Since</h2>
              <p className="text-gray-600">
                {new Date(profile.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Activity Yet</h2>
            <p className="text-gray-600">This user hasn't completed any focus sessions yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
