/**
 * Tasks Page - Task management
 */

import { useState } from 'react'
import { Plus, AlertCircle } from 'lucide-react'
import { useAuthContext } from '../context/AuthContext'
import { useTasks } from '../hooks/useTasks'
import Layout from '../components/Layout'
import TaskCard from '../components/tasks/TaskCard'
import TaskModal from '../components/tasks/TaskModal'
import TaskFilters from '../components/tasks/TaskFilters'
import XPGainAnimation from '../components/tasks/XPGainAnimation'
import type { Task, TaskType, TaskDifficulty, CreateTaskData } from '../types'

const Tasks = () => {
  const { user, updateUser } = useAuthContext()

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Filter state
  const [selectedType, setSelectedType] = useState<TaskType | 'ALL'>('ALL')
  const [selectedDifficulty, setSelectedDifficulty] = useState<TaskDifficulty | 'ALL'>('ALL')
  const [selectedCategory, setSelectedCategory] = useState<string | 'ALL'>('ALL')
  const [showActive, setShowActive] = useState(true)

  // XP Animation state
  const [xpAnimation, setXpAnimation] = useState<{
    xpGained: number
    leveledUp?: boolean
    newLevel?: number
  } | null>(null)

  // Build filters object
  const filters = {
    ...(selectedType !== 'ALL' && { type: selectedType }),
    ...(selectedDifficulty !== 'ALL' && { difficulty: selectedDifficulty }),
    ...(selectedCategory !== 'ALL' && { category: selectedCategory }),
    isActive: showActive,
  }

  // Fetch tasks with filters
  const { tasks, isLoading, error, createTask, updateTask, deleteTask, completeTask } =
    useTasks(filters)

  // Handle create new task
  const handleCreateTask = async (data: CreateTaskData) => {
    await createTask(data)
    setIsModalOpen(false)
  }

  // Handle update task
  const handleUpdateTask = async (data: CreateTaskData) => {
    if (editingTask) {
      await updateTask({ id: editingTask.id, data })
      setIsModalOpen(false)
      setEditingTask(null)
    }
  }

  // Handle edit task
  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  // Handle delete task
  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId)
  }

  // Handle complete task
  const handleCompleteTask = async (taskId: string) => {
    try {
      const response = await completeTask(taskId)

      // Show XP animation
      setXpAnimation({
        xpGained: response.data.xpGained,
        leveledUp: response.data.leveledUp,
        newLevel: response.data.newLevel,
      })

      // Update user context if leveled up
      if (response.data.leveledUp && response.data.newLevel && user) {
        updateUser({ ...user, level: response.data.newLevel })
      }
    } catch (err) {
      console.error('Failed to complete task:', err)
    }
  }

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedType('ALL')
    setSelectedDifficulty('ALL')
    setSelectedCategory('ALL')
    setShowActive(true)
  }

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTask(null)
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-100 mb-2">✅ Tasks & Quests</h1>
              <p className="text-slate-400">
                Complete tasks to earn XP and level up your character!
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all hover:scale-105"
            >
              <Plus size={20} />
              New Task
            </button>
          </div>
        </div>

        {/* Filters */}
        <TaskFilters
          selectedType={selectedType}
          selectedDifficulty={selectedDifficulty}
          selectedCategory={selectedCategory}
          showActive={showActive}
          onTypeChange={setSelectedType}
          onDifficultyChange={setSelectedDifficulty}
          onCategoryChange={setSelectedCategory}
          onActiveToggle={setShowActive}
          onClearFilters={handleClearFilters}
        />

        {/* Task Stats Summary */}
        {tasks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Total Tasks</p>
              <p className="text-3xl font-bold text-purple-400">{tasks.length}</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Active Tasks</p>
              <p className="text-3xl font-bold text-blue-400">
                {tasks.filter((t) => t.isActive).length}
              </p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Current Streak</p>
              <p className="text-3xl font-bold text-orange-400 flex items-center gap-2">
                🔥 {Math.max(...tasks.map((t) => t.streakCount), 0)}
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/30 border-2 border-red-600 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="text-red-400" size={24} />
            <div>
              <p className="text-red-400 font-semibold">Failed to load tasks</p>
              <p className="text-red-300 text-sm">Please try refreshing the page</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-slate-800 border border-slate-700 rounded-lg p-6 animate-pulse"
              >
                <div className="h-6 bg-slate-700 rounded mb-4"></div>
                <div className="h-4 bg-slate-700 rounded mb-2"></div>
                <div className="h-4 bg-slate-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Tasks Grid */}
        {!isLoading && !error && tasks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={handleCompleteTask}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && tasks.length === 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-12">
            <div className="text-center">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-slate-300 text-lg mb-2">No tasks found</p>
              <p className="text-slate-400 mb-6">
                {selectedType !== 'ALL' ||
                selectedDifficulty !== 'ALL' ||
                selectedCategory !== 'ALL'
                  ? 'Try adjusting your filters or create a new task'
                  : 'Create your first quest to start your adventure!'}
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                + Create New Task
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
      />

      {/* XP Gain Animation */}
      {xpAnimation && (
        <XPGainAnimation
          xpGained={xpAnimation.xpGained}
          leveledUp={xpAnimation.leveledUp}
          newLevel={xpAnimation.newLevel}
          onComplete={() => setXpAnimation(null)}
        />
      )}
    </Layout>
  )
}

export default Tasks
