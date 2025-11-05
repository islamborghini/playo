/**
 * Layout Component
 * Main layout wrapper with header, navigation, and user menu
 */

import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuthContext()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Calculate XP progress percentage
  const getXPProgress = () => {
    if (!user) return 0
    const xpForNextLevel = user.level * 100 // Simple formula: level * 100
    return Math.min((user.xp / xpForNextLevel) * 100, 100)
  }

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/tasks', label: 'Tasks', icon: '✅' },
    { path: '/story', label: 'Story', icon: '📖' },
    { path: '/character', label: 'Character', icon: '⚔️' },
    { path: '/challenge', label: 'Challenge', icon: '🏆' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-3">
              <span className="text-3xl">⚔️</span>
              <span className="text-2xl font-bold text-slate-100">Playo</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive(link.path)
                        ? 'bg-slate-700 text-slate-100'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700/50'
                    }
                  `}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Level & XP */}
              {user && (
                <div className="hidden sm:block">
                  <div className="flex items-center space-x-3">
                    {/* Level Badge */}
                    <div className="bg-slate-700 px-3 py-1 rounded-lg">
                      <span className="text-xs text-slate-400">Level</span>
                      <span className="ml-2 text-lg font-bold text-amber-400">
                        {user.level}
                      </span>
                    </div>

                    {/* XP Bar */}
                    <div className="w-32">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400">XP</span>
                        <span className="text-xs text-slate-400">
                          {user.xp}/{user.level * 100}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                          style={{ width: `${getXPProgress()}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* User Avatar & Dropdown */}
              {user && (
                <div className="relative group">
                  <button className="flex items-center space-x-3 bg-slate-700 hover:bg-slate-600 rounded-lg px-3 py-2 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {user.characterName?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium text-slate-100">
                        {user.characterName}
                      </p>
                      <p className="text-xs text-slate-400">{user.username}</p>
                    </div>
                    <svg
                      className="w-4 h-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <Link
                        to="/character"
                        className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                      >
                        ⚔️ Character Profile
                      </Link>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                      >
                        🏠 Dashboard
                      </Link>
                      <hr className="my-2 border-slate-700" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden border-t border-slate-700 py-3 overflow-x-auto">
            <nav className="flex space-x-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive(link.path)
                        ? 'bg-slate-700 text-slate-100'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700/50'
                    }
                  `}
                >
                  <span className="mr-1">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Mobile XP Bar */}
          {user && (
            <div className="sm:hidden border-t border-slate-700 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Level</span>
                  <span className="text-sm font-bold text-amber-400">
                    {user.level}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {user.xp}/{user.level * 100} XP
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${getXPProgress()}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer (Optional) */}
      <footer className="bg-slate-800 border-t border-slate-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-slate-400 text-sm">
            <p>⚔️ Playo - Level Up Your Life</p>
            <p className="mt-1 text-xs">
              Turn your tasks into an epic adventure
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
