/**
 * Task Card Component
 * Display individual tasks with actions
 */

import { useState } from 'react'
import { Edit2, Trash2, CheckCircle, Flame } from 'lucide-react'
import type { Task } from '../../types'

interface TaskCardProps {
  task: Task
  onComplete: (taskId: string) => Promise<void>
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => Promise<void>
}

const TaskCard = ({ task, onComplete, onEdit, onDelete }: TaskCardProps) => {
  const [isCompleting, setIsCompleting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Get task type icon
  const getTypeIcon = () => {
    switch (task.type) {
      case 'DAILY':
        return '🌅'
      case 'HABIT':
        return '🔄'
      case 'TODO':
        return '✅'
      default:
        return '📝'
    }
  }

  // Get category icon
  const getCategoryIcon = () => {
    const icons: Record<string, string> = {
      Fitness: '💪',
      Learning: '📚',
      Wellness: '🧘',
      Productivity: '💼',
      Creative: '🎨',
      Social: '👥',
      Other: '📌',
    }
    return icons[task.category] || '📌'
  }

  // Get difficulty colors
  const getDifficultyStyles = () => {
    switch (task.difficulty) {
      case 'EASY':
        return {
          badge: 'bg-green-500/20 text-green-400 border-green-500',
          border: 'border-green-500/30',
          glow: 'shadow-green-500/20',
          xp: 10,
        }
      case 'MEDIUM':
        return {
          badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
          border: 'border-yellow-500/30',
          glow: 'shadow-yellow-500/20',
          xp: 25,
        }
      case 'HARD':
        return {
          badge: 'bg-red-500/20 text-red-400 border-red-500',
          border: 'border-red-500/30',
          glow: 'shadow-red-500/20',
          xp: 50,
        }
      default:
        return {
          badge: 'bg-slate-500/20 text-slate-400 border-slate-500',
          border: 'border-slate-500/30',
          glow: 'shadow-slate-500/20',
          xp: 0,
        }
    }
  }

  const difficultyStyles = getDifficultyStyles()

  // Handle complete task
  const handleComplete = async () => {
    setIsCompleting(true)
    try {
      await onComplete(task.id)
    } catch (error) {
      console.error('Failed to complete task:', error)
    } finally {
      setIsCompleting(false)
    }
  }

  // Handle delete task
  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      setTimeout(() => setShowDeleteConfirm(false), 3000)
      return
    }

    setIsDeleting(true)
    try {
      await onDelete(task.id)
    } catch (error) {
      console.error('Failed to delete task:', error)
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  // Format last completed date
  const formatLastCompleted = () => {
    if (!task.lastCompleted) return null
    const date = new Date(task.lastCompleted)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div
      className={`bg-slate-800 border-2 ${difficultyStyles.border} rounded-lg p-5 transition-all duration-300 hover:shadow-lg ${difficultyStyles.glow} hover:scale-105 animate-fade-in`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getTypeIcon()}</span>
          <span className="text-xl">{getCategoryIcon()}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Difficulty Badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${difficultyStyles.badge}`}
          >
            {task.difficulty}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-slate-100 mb-2">{task.title}</h3>

      {/* Description */}
      {task.description && (
        <p className="text-slate-400 text-sm mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Stats Row */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        {/* XP Reward */}
        <div className="flex items-center gap-1 text-amber-400">
          <span className="font-bold">⭐ +{difficultyStyles.xp} XP</span>
        </div>

        {/* Streak Counter */}
        {task.streakCount > 0 && (
          <div className="flex items-center gap-1 text-orange-400">
            <Flame size={16} className="animate-pulse" />
            <span className="font-bold">{task.streakCount}</span>
          </div>
        )}

        {/* Last Completed */}
        {task.lastCompleted && (
          <div className="text-slate-500 text-xs ml-auto">{formatLastCompleted()}</div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {/* Complete Button */}
        <button
          onClick={handleComplete}
          disabled={isCompleting || !task.isActive}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
        >
          {isCompleting ? (
            <>
              <span className="animate-spin">⚙️</span>
              <span>Completing...</span>
            </>
          ) : (
            <>
              <CheckCircle size={18} />
              <span>Complete</span>
            </>
          )}
        </button>

        {/* Edit Button */}
        <button
          onClick={() => onEdit(task)}
          className="p-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
          title="Edit task"
        >
          <Edit2 size={18} />
        </button>

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={`p-3 rounded-lg transition-all ${
            showDeleteConfirm
              ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
          }`}
          title={showDeleteConfirm ? 'Click again to confirm' : 'Delete task'}
        >
          {isDeleting ? (
            <span className="animate-spin">⚙️</span>
          ) : (
            <Trash2 size={18} />
          )}
        </button>
      </div>

      {/* Delete Confirmation Message */}
      {showDeleteConfirm && (
        <div className="mt-2 text-center">
          <p className="text-red-400 text-xs font-semibold animate-pulse">
            Click delete again to confirm
          </p>
        </div>
      )}
    </div>
  )
}

export default TaskCard
