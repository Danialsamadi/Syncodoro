import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { SyncProvider } from './contexts/SyncContext'
import { TimerProvider } from './contexts/TimerContext'
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
    <AuthProvider>
      <SyncProvider>
        <TimerProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
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
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
            </div>
          </Router>
        </TimerProvider>
      </SyncProvider>
    </AuthProvider>
  )
}

export default App
