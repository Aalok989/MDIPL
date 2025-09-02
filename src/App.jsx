import { useState } from 'react'
import './App.css'
import Dashboard from './components/dashboard.jsx'
import { DateFilterProvider } from './contexts/DateFilterContext'
import ErrorBoundary from './components/ErrorBoundary'
import GlobalErrorHandler from './components/GlobalErrorHandler'

function App() {

  return (
    <ErrorBoundary>
      <GlobalErrorHandler>
        <DateFilterProvider>
          <Dashboard />
        </DateFilterProvider>
      </GlobalErrorHandler>
    </ErrorBoundary>
  )
}

export default App
