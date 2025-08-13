import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { Github, Mail, ArrowLeft, Circle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPageNew() {
  const { user, signInWithGoogle, signInWithGithub } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as any)?.from?.pathname || '/'

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true })
    }
  }, [user, navigate, from])

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
      toast.success('Welcome! Successfully signed in.')
    } catch (error) {
      console.error('Google sign-in error:', error)
      toast.error('Failed to sign in with Google. Please try again.')
    }
  }

  const handleGithubSignIn = async () => {
    try {
      await signInWithGithub()
      toast.success('Welcome! Successfully signed in.')
    } catch (error) {
      console.error('GitHub sign-in error:', error)
      toast.error('Failed to sign in with GitHub. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-primary-950 flex flex-col" style={{ backgroundColor: "#0A1F3F" }}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 pt-12">
        <button 
          onClick={() => navigate('/')}
          className="p-2 rounded-xl hover:bg-surface-level-2 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-text-secondary" />
        </button>
        <h1 className="text-2xl font-bold text-text-primary">Sign In</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center mb-4 shadow-elevation-3">
            <Circle className="w-10 h-10 text-white" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Welcome to Syncodoro</h2>
            <p className="text-text-secondary">
              Stay focused and productive with the Pomodoro Technique
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="w-full max-w-sm mb-8">
          <div className="grid gap-4">
            <div className="flex items-center space-x-3 p-4 bg-surface-level-2 rounded-xl border border-border-secondary">
              <div className="w-8 h-8 bg-primary-600/10 rounded-lg flex items-center justify-center">
                <Circle className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <div className="font-medium text-text-primary text-sm">Track Sessions</div>
                <div className="text-xs text-text-tertiary">Monitor your focus time and productivity</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-surface-level-2 rounded-xl border border-border-secondary">
              <div className="w-8 h-8 bg-success-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-text-primary text-sm">View Reports</div>
                <div className="text-xs text-text-tertiary">Analyze your productivity patterns</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-surface-level-2 rounded-xl border border-border-secondary">
              <div className="w-8 h-8 bg-warning-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-text-primary text-sm">Sync Everywhere</div>
                <div className="text-xs text-text-tertiary">Access your data across all devices</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sign In Buttons */}
        <div className="w-full max-w-sm space-y-4">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center space-x-3 py-4 px-6 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl border border-gray-200 transition-all duration-200 shadow-elevation-1 hover:shadow-elevation-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            onClick={handleGithubSignIn}
            className="w-full flex items-center justify-center space-x-3 py-4 px-6 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-elevation-2 hover:shadow-elevation-3"
          >
            <Github className="w-5 h-5" />
            <span>Continue with GitHub</span>
          </button>
        </div>

        {/* Privacy Note */}
        <div className="mt-8 text-center max-w-sm">
          <p className="text-xs text-text-tertiary leading-relaxed">
            By signing in, you agree to our Terms of Service and Privacy Policy. 
            Your data is encrypted and secure.
          </p>
        </div>

        {/* Continue Without Account */}
        <div className="mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-text-secondary hover:text-text-primary font-medium transition-colors"
          >
            Continue without account
          </button>
        </div>
      </div>

      {/* Bottom Decoration */}
      <div className="p-6">
        <div className="h-1 bg-gradient-to-r from-primary-600 via-primary-400 to-primary-800 rounded-full opacity-20"></div>
      </div>
    </div>
  )
}
