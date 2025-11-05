import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Story from './pages/Story'
import Character from './pages/Character'
import Challenge from './pages/Challenge'
import DemoPage from './pages/Demo'
import ApiTest from './pages/APITest'

function App() {
  console.log('🚀 App Component Rendering')
  
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/api-test" element={<ApiTest />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/story"
          element={
            <ProtectedRoute>
              <Story />
            </ProtectedRoute>
          }
        />
        <Route
          path="/character"
          element={
            <ProtectedRoute>
              <Character />
            </ProtectedRoute>
          }
        />
        <Route
          path="/challenge"
          element={
            <ProtectedRoute>
              <Challenge />
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
