import Timer from '../components/Timer'
import SessionNotes from '../components/SessionNotes'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

export default function HomePage() {
  const { user } = useAuth()

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
        <SessionNotes />
        
        {!user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-blue-800 text-sm">
              🚀 <strong>Offline Mode:</strong> Your sessions are saved locally and will sync when you sign in.
              <Link to="/login" className="ml-2 text-blue-600 hover:text-blue-700 underline">
                Sign in to unlock all features
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
