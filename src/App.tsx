import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { SyncProvider } from './contexts/SyncContext'
import { TimerProvider } from './contexts/TimerContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import PublicProfilePage from './pages/PublicProfilePage'
import SettingsPage from './pages/SettingsPage'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './components/ProtectedRoute'
import { pwaManager } from './utils/pwa'
import { offlineSyncService } from './services/offlineSync'
import toast from 'react-hot-toast'

function App() {
  // Initialize PWA functionality
  useEffect(() => {
    // Initialize PWA manager
    pwaManager.initialize().catch(console.error)
    
    // Setup offline sync service
    const unsubscribeSync = offlineSyncService.onSyncStatusChange((status) => {
      if (status.status === 'completed' && status.successful && status.successful > 0) {
        toast.success(`Synced ${status.successful} items successfully!`, {
          icon: '🔄',
          duration: 3000
        })
      } else if (status.status === 'error') {
        toast.error('Sync failed. Will retry when back online.', {
          icon: '⚠️',
          duration: 4000
        })
      }
    })
    
    // Setup PWA update notifications
    const unsubscribePWA = pwaManager.onUpdateAvailable((info) => {
      if (info.updateAvailable) {
        toast('App update available!', {
          icon: '🔄',
          duration: 6000
        })
      }
    })
    
    return () => {
      unsubscribeSync()
      unsubscribePWA()
    }
  }, [])

  return (
    <ThemeProvider>
      <AuthProvider>
        <SyncProvider>
          <TimerProvider>
            <Router>
              <div className="min-h-screen bg-bg-primary">
                <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/u/:username" element={<PublicProfilePage />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />
                </Route>
              </Routes>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#171717',
                    color: '#f8f8f8',
                    border: '1px solid #404040',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -2px rgba(0, 0, 0, 0.4)',
                  },
                  success: {
                    iconTheme: {
                      primary: '#22c55e',
                      secondary: '#f8f8f8',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#f8f8f8',
                    },
                  },
                }}
              />
            </div>
            </Router>
          </TimerProvider>
        </SyncProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
