import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Example from './src/App.pomodoroMobile'
import KombaiWrapper from './KombaiWrapper'
import ErrorBoundary from '@kombai/react-error-boundary'
import { ThemeProvider } from './src/contexts/ThemeContext'
import './src/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <KombaiWrapper>
          <Example />
        </KombaiWrapper>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)