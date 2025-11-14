/**
 * Task Filters Component
 * Filter tasks by type, difficulty, and category
 */

import { X } from 'lucide-react'
import type { TaskType, TaskDifficulty } from '../../types'

interface TaskFiltersProps {
  selectedType: TaskType | 'ALL'
  selectedDifficulty: TaskDifficulty | 'ALL'
  selectedCategory: string | 'ALL'
  showActive: boolean
  onTypeChange: (type: TaskType | 'ALL') => void
  onDifficultyChange: (difficulty: TaskDifficulty | 'ALL') => void
  onCategoryChange: (category: string | 'ALL') => void
  onActiveToggle: (showActive: boolean) => void
  onClearFilters: () => void
}

const TASK_TYPES: { value: TaskType | 'ALL'; label: string; icon: string }[] = [
  { value: 'ALL', label: 'All', icon: '📋' },
  { value: 'DAILY', label: 'Daily', icon: '🌅' },
  { value: 'HABIT', label: 'Habit', icon: '🔄' },
  { value: 'TODO', label: 'To-Do', icon: '✅' },
]

const DIFFICULTIES: { value: TaskDifficulty | 'ALL'; label: string; color: string }[] = [
  { value: 'ALL', label: 'All', color: 'border-slate-600 text-slate-300' },
  { value: 'EASY', label: 'Easy', color: 'border-green-500 text-green-400' },
  { value: 'MEDIUM', label: 'Medium', color: 'border-yellow-500 text-yellow-400' },
  { value: 'HARD', label: 'Hard', color: 'border-red-500 text-red-400' },
]

const CATEGORIES: { value: string; label: string; icon: string }[] = [
  { value: 'ALL', label: 'All Categories', icon: '📋' },
  { value: 'Fitness', label: 'Fitness', icon: '💪' },
  { value: 'Learning', label: 'Learning', icon: '📚' },
  { value: 'Wellness', label: 'Wellness', icon: '🧘' },
  { value: 'Productivity', label: 'Productivity', icon: '💼' },
  { value: 'Creative', label: 'Creative', icon: '🎨' },
  { value: 'Social', label: 'Social', icon: '👥' },
  { value: 'Other', label: 'Other', icon: '📌' },
]

const TaskFilters = ({
  selectedType,
  selectedDifficulty,
  selectedCategory,
  showActive,
  onTypeChange,
  onDifficultyChange,
  onCategoryChange,
  onActiveToggle,
  onClearFilters,
}: TaskFiltersProps) => {
  const hasActiveFilters =
    selectedType !== 'ALL' ||
    selectedDifficulty !== 'ALL' ||
    selectedCategory !== 'ALL' ||
    !showActive

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-100">🔍 Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg transition-colors"
          >
            <X size={14} />
            Clear All
          </button>
        )}
      </div>

      {/* Task Type Filter */}
      <div>
        <label className="block text-slate-400 text-sm font-semibold mb-2">Task Type</label>
        <div className="flex gap-2 flex-wrap">
          {TASK_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => onTypeChange(type.value)}
              className={`px-4 py-2 rounded-lg border-2 font-semibold text-sm transition-all ${
                selectedType === type.value
                  ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                  : 'border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <span className="mr-1">{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Filter */}
      <div>
        <label className="block text-slate-400 text-sm font-semibold mb-2">Difficulty</label>
        <div className="flex gap-2 flex-wrap">
          {DIFFICULTIES.map((diff) => (
            <button
              key={diff.value}
              onClick={() => onDifficultyChange(diff.value)}
              className={`px-4 py-2 rounded-lg border-2 font-semibold text-sm transition-all ${
                selectedDifficulty === diff.value
                  ? `${diff.color} bg-opacity-20`
                  : 'border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              {diff.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-slate-400 text-sm font-semibold mb-2">Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-lg text-slate-100 focus:border-purple-500 focus:outline-none transition-colors"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.icon} {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Active/Completed Toggle */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={showActive}
            onChange={(e) => onActiveToggle(e.target.checked)}
            className="w-5 h-5 rounded border-2 border-slate-700 bg-slate-900 checked:bg-purple-600 checked:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all cursor-pointer"
          />
          <span className="text-slate-300 font-semibold">Show only active tasks</span>
        </label>
      </div>
    </div>
  )
}

export default TaskFilters
