/**
 * Tasks Page - Task management
 */

import { useEffect } from 'react'
import { useAuthContext } from '../context/AuthContext'

const Tasks = () => {
  const { user, logout } = useAuthContext()

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
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-slate-100">
            ✅ Tasks & Quests
          </h1>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
          >
            Logout
          </button>
        </div>
        
        {/* Content */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <p className="text-slate-300">Task management interface coming soon...</p>
          <p className="text-slate-400 mt-4">
            Welcome, {user?.characterName || 'Hero'}!
          </p>
          
          {/* Debug Info */}
          <div className="mt-6 p-4 bg-slate-700 rounded text-xs">
            <p className="text-slate-300 font-mono">User ID: {user?.id}</p>
            <p className="text-slate-300 font-mono">Character: {user?.characterName}</p>
            <p className="text-slate-300 font-mono">Level: {user?.level}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Tasks
