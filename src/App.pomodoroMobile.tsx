import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { TimerProvider } from './contexts/TimerContext'
import PomodoroMobile from './components/mobile/PomodoroMobile'

function App() {
  return (
    <TimerProvider>
      <Router>
        <div className="min-h-screen bg-white">
          <Routes>
            <Route path="/" element={<PomodoroMobile />} />
            <Route path="/dashboard" element={<PomodoroMobile />} />
            <Route path="/profile" element={<PomodoroMobile />} />
            <Route path="/settings" element={<PomodoroMobile />} />
          </Routes>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#FFFFFF',
                color: '#1F2937',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#FFFFFF',
                },
                style: {
                  border: '1px solid #10B981',
                  background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(16, 185, 129, 0.05) 100%)',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#FFFFFF',
                },
                style: {
                  border: '1px solid #EF4444',
                  background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(239, 68, 68, 0.05) 100%)',
                },
              },
            }}
          />
        </div>
      </Router>
    </TimerProvider>
  )
}

export default App