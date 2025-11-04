import { Task, TaskType, TaskDifficulty } from '@/generated/prisma';

export interface CreateTaskRequest {
  title: string;
  description?: string;
  type: TaskType;
  difficulty: TaskDifficulty;
  category: string;
  recurrenceRule?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  type?: TaskType;
  difficulty?: TaskDifficulty;
  category?: string;
  recurrenceRule?: string;
  isActive?: boolean;
}

export interface TaskQueryParams {
  type?: string;
  isActive?: string;
  category?: string;
  difficulty?: string;
  limit?: string;
  offset?: string;
}

export interface TaskWithCompletion extends Task {
  completedCount?: number;
  lastCompletedAt?: Date;
  currentStreak?: number;
}

export interface TaskStats {
  totalTasks: number;
  activeTasks: number;
  completedToday: number;
  longestStreak: number;
  totalXPEarned: number;
  tasksByType: Record<TaskType, number>;
  tasksByDifficulty: Record<TaskDifficulty, number>;
}

export interface CompletionReward {
  xp: number;
  level?: number;
  storyUnlocked: boolean;
  achievements: string[];
  streakBonus?: number;
}

export interface TaskCompletionSummary {
  task: Task;
  reward: CompletionReward;
  userStats: {
    newXP: number;
    newLevel: number;
    totalCompleted: number;
  };
}