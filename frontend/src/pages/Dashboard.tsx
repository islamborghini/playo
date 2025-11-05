/**
 * Dashboard Page - Main hub
 */

import { useAuthContext } from '../context/AuthContext'

const Dashboard = () => {
  const { user, logout } = useAuthContext()

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-100">
              🏰 Dashboard
            </h1>
            <p className="text-slate-400 mt-2">
              Welcome back, {user?.characterName || user?.username || 'Hero'}!
            </p>
          </div>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
          >
            Logout
          </button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-slate-100 mb-4">📊 Stats</h2>
            <p className="text-slate-300">Level: {user?.level || 1}</p>
            <p className="text-slate-300">XP: {user?.xp || 0}</p>
          </div>
          
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-slate-100 mb-4">✅ Tasks</h2>
            <p className="text-slate-400">Coming soon...</p>
          </div>
          
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-slate-100 mb-4">📖 Story</h2>
            <p className="text-slate-400">Coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
