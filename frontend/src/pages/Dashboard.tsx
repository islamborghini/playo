/**
 * Dashboard Page - Main hub
 */

import { useAuthContext } from '../context/AuthContext'
import Layout from '../components/Layout'

const Dashboard = () => {
  const { user } = useAuthContext()

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">
            Welcome back, {user?.characterName}! ⚔️
          </h1>
          <p className="text-slate-400">
            Ready to continue your adventure? Check your quests below.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Level</p>
                <p className="text-3xl font-bold text-amber-400">{user?.level}</p>
              </div>
              <span className="text-4xl">📊</span>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Experience</p>
                <p className="text-3xl font-bold text-blue-400">{user?.xp} XP</p>
              </div>
              <span className="text-4xl">⭐</span>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Tasks Completed</p>
                <p className="text-3xl font-bold text-green-400">0</p>
              </div>
              <span className="text-4xl">✅</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-slate-100 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-slate-700 hover:bg-slate-600 text-slate-100 p-4 rounded-lg transition-colors">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-sm font-medium">New Task</div>
            </button>
            <button className="bg-slate-700 hover:bg-slate-600 text-slate-100 p-4 rounded-lg transition-colors">
              <div className="text-3xl mb-2">📖</div>
              <div className="text-sm font-medium">Read Story</div>
            </button>
            <button className="bg-slate-700 hover:bg-slate-600 text-slate-100 p-4 rounded-lg transition-colors">
              <div className="text-3xl mb-2">⚔️</div>
              <div className="text-sm font-medium">View Character</div>
            </button>
            <button className="bg-slate-700 hover:bg-slate-600 text-slate-100 p-4 rounded-lg transition-colors">
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-sm font-medium">Take Challenge</div>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
