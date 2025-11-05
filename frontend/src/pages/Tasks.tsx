/**
 * Tasks Page - Task management
 */

import { useEffect } from 'react'
import { useAuthContext } from '../context/AuthContext'
import Layout from '../components/Layout'

const Tasks = () => {
  const { user } = useAuthContext()

  useEffect(() => {
    console.log('📋 Tasks Page Mounted:', {
      hasUser: !!user,
      userId: user?.id,
      characterName: user?.characterName,
      timestamp: new Date().toISOString()
    })
  }, [user])

  console.log('📋 Tasks Page Rendering:', { user })

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">
            ✅ Tasks & Quests
          </h1>
          <p className="text-slate-400">
            Manage your daily quests and earn XP to level up!
          </p>
        </div>
        
        {/* Task List Placeholder */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-slate-300 text-lg mb-2">No tasks yet</p>
            <p className="text-slate-400 mb-6">
              Create your first quest to start your adventure!
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              + Create New Task
            </button>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <p className="text-slate-400 text-xs font-mono mb-2">Debug Info:</p>
          <div className="space-y-1 text-xs font-mono">
            <p className="text-slate-300">User ID: {user?.id}</p>
            <p className="text-slate-300">Character: {user?.characterName}</p>
            <p className="text-slate-300">Level: {user?.level}</p>
            <p className="text-slate-300">XP: {user?.xp}</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Tasks
