import { Suspense } from 'react'
import MusicTracker from './components/MusicTracker'
import LoadingSpinner from './components/LoadingSpinner'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <MusicTracker />
      </Suspense>
    </ErrorBoundary>
  )
}

export default App