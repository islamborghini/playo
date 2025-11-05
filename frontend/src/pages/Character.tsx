/**
 * Character Page - Character sheet and inventory
 */

import { useAuthContext } from '../context/AuthContext'
import Layout from '../components/Layout'

const Character = () => {
  const { user } = useAuthContext()

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">
            ⚔️ Character Profile
          </h1>
          <p className="text-slate-400">
            View your stats, inventory, and achievements
          </p>
        </div>

        {/* Character Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar & Basic Info */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-linear-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold mb-4">
                {user?.characterName?.[0]?.toUpperCase() || '?'}
              </div>
              <h2 className="text-2xl font-bold text-slate-100">
                {user?.characterName}
              </h2>
              <p className="text-slate-400 text-sm">@{user?.username}</p>
              <div className="mt-4 inline-block bg-amber-500/20 text-amber-400 px-4 py-2 rounded-full font-bold">
                Level {user?.level}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-slate-100 mb-4">Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">Experience</p>
                <p className="text-2xl font-bold text-blue-400">{user?.xp} XP</p>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">Next Level</p>
                <p className="text-2xl font-bold text-purple-400">
                  {(user?.level || 1) * 100} XP
                </p>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">Tasks Completed</p>
                <p className="text-2xl font-bold text-green-400">0</p>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">Current Streak</p>
                <p className="text-2xl font-bold text-orange-400">0 days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Placeholder */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-slate-100 mb-4">🎒 Inventory</h3>
          <div className="text-center py-8">
            <p className="text-slate-400">Your inventory is empty</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Character

