import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'

// Pages
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import DashboardPage from './pages/Dashboard'
import TasksPage from './pages/Tasks'
import StoryPage from './pages/Story'
import CharacterPage from './pages/Character'
import ChallengePage from './pages/Challenge'
import APITestPage from './pages/APITest'
import DemoPage from './pages/Demo'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/api-test" element={<APITestPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/story"
          element={
            <ProtectedRoute>
              <StoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/character"
          element={
            <ProtectedRoute>
              <CharacterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/challenge"
          element={
            <ProtectedRoute>
              <ChallengePage />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/demo" replace />} />
        <Route path="*" element={<Navigate to="/demo" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
