import Timer from '../components/Timer'
import TagSelector from '../components/TagSelector'
import SessionNotes from '../components/SessionNotes'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

export default function HomePage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Syncodoro
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A powerful Pomodoro timer that works offline and syncs across all your devices
          </p>
          <Link to="/login" className="btn-primary text-lg px-8 py-3">
            Get Started
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🍅</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Focus Sessions</h3>
            <p className="text-gray-600">Customizable Pomodoro timer with break management</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Analytics</h3>
            <p className="text-gray-600">Track your productivity with detailed insights</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">☁️</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Sync & Export</h3>
            <p className="text-gray-600">Works offline and syncs across devices</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Focus Timer
        </h1>
        <p className="text-gray-600">
          Stay productive with the Pomodoro Technique
        </p>
      </div>

      <div className="space-y-8">
        <Timer />
        <TagSelector />
        <SessionNotes />
      </div>
    </div>
  )
}
