/**
 * Task Modal Component
 * Create/Edit tasks with a clean form
 */

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Task, TaskType, TaskDifficulty, CreateTaskData } from '../../types'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateTaskData) => Promise<void>
  task?: Task | null // For editing
}

const TASK_TYPES: { value: TaskType; label: string; icon: string; description: string }[] = [
  { value: 'DAILY', label: 'Daily', icon: '🌅', description: 'Repeats every day' },
  { value: 'HABIT', label: 'Habit', icon: '🔄', description: 'Weekly/monthly goal' },
  { value: 'TODO', label: 'To-Do', icon: '✅', description: 'One-time task' },
]

const DIFFICULTIES: { value: TaskDifficulty; label: string; xp: number; color: string }[] = [
  { value: 'EASY', label: 'Easy', xp: 10, color: 'text-green-400 border-green-500' },
  { value: 'MEDIUM', label: 'Medium', xp: 25, color: 'text-yellow-400 border-yellow-500' },
  { value: 'HARD', label: 'Hard', xp: 50, color: 'text-red-400 border-red-500' },
]

const CATEGORIES: { value: string; label: string; icon: string }[] = [
  { value: 'Fitness', label: 'Fitness', icon: '💪' },
  { value: 'Learning', label: 'Learning', icon: '📚' },
  { value: 'Wellness', label: 'Wellness', icon: '🧘' },
  { value: 'Productivity', label: 'Productivity', icon: '💼' },
  { value: 'Creative', label: 'Creative', icon: '🎨' },
  { value: 'Social', label: 'Social', icon: '👥' },
  { value: 'Other', label: 'Other', icon: '📌' },
]

const TaskModal = ({ isOpen, onClose, onSubmit, task }: TaskModalProps) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<TaskType>('DAILY')
  const [difficulty, setDifficulty] = useState<TaskDifficulty>('MEDIUM')
  const [category, setCategory] = useState('Fitness')
  const [recurrenceRule, setRecurrenceRule] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Populate form when editing
  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setType(task.type)
      setDifficulty(task.difficulty)
      setCategory(task.category)
      setRecurrenceRule(task.recurrenceRule || '')
    } else {
      // Reset form for new task
      setTitle('')
      setDescription('')
      setType('DAILY')
      setDifficulty('MEDIUM')
      setCategory('Fitness')
      setRecurrenceRule('')
    }
    setError('')
  }, [task, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    setIsSubmitting(true)

    try {
      const taskData: CreateTaskData = {
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        difficulty,
        category,
        recurrenceRule: recurrenceRule.trim() || undefined,
      }

      await onSubmit(taskData)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to save task')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-800 border-2 border-slate-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-slate-100">
            {task ? '✏️ Edit Task' : '✨ Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border-2 border-red-600 rounded-lg p-4">
              <p className="text-red-400 text-sm">⚠️ {error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-slate-300 mb-2 font-semibold">
              Task Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-lg text-slate-100 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="e.g., Morning workout"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 mb-2 font-semibold">
              Description <span className="text-slate-500 text-sm">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-lg text-slate-100 focus:border-purple-500 focus:outline-none transition-colors resize-none"
              placeholder="Add details about your task..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Task Type */}
          <div>
            <label className="block text-slate-300 mb-3 font-semibold">
              Task Type <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {TASK_TYPES.map((taskType) => (
                <button
                  key={taskType.value}
                  type="button"
                  onClick={() => setType(taskType.value)}
                  disabled={isSubmitting}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    type === taskType.value
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="text-3xl mb-2">{taskType.icon}</div>
                  <div className="text-sm font-semibold text-slate-100">{taskType.label}</div>
                  <div className="text-xs text-slate-400 mt-1">{taskType.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-slate-300 mb-3 font-semibold">
              Difficulty <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff.value}
                  type="button"
                  onClick={() => setDifficulty(diff.value)}
                  disabled={isSubmitting}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    difficulty === diff.value
                      ? `${diff.color} bg-opacity-20`
                      : 'border-slate-700 hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <div className="text-sm font-semibold">{diff.label}</div>
                  <div className="text-xl font-bold mt-1">+{diff.xp} XP</div>
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-slate-300 mb-2 font-semibold">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-lg text-slate-100 focus:border-purple-500 focus:outline-none transition-colors"
              disabled={isSubmitting}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Recurrence Rule (for HABIT type) */}
          {type === 'HABIT' && (
            <div>
              <label className="block text-slate-300 mb-2 font-semibold">
                Recurrence Rule <span className="text-slate-500 text-sm">(optional)</span>
              </label>
              <input
                type="text"
                value={recurrenceRule}
                onChange={(e) => setRecurrenceRule(e.target.value)}
                className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-lg text-slate-100 focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="e.g., 3 times per week"
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg font-semibold transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚙️</span>
                  Saving...
                </span>
              ) : task ? (
                '💾 Update Task'
              ) : (
                '✨ Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskModal
