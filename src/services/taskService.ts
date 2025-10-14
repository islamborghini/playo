import { PrismaClient, Task, TaskType, TaskDifficulty } from '@/generated/prisma';
import prisma from '@/utils/prisma';

export interface CreateTaskData {
  title: string;
  description?: string;
  type: TaskType;
  difficulty: TaskDifficulty;
  category: string;
  recurrenceRule?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  type?: TaskType;
  difficulty?: TaskDifficulty;
  category?: string;
  recurrenceRule?: string;
  isActive?: boolean;
}

export interface TaskFilters {
  type?: TaskType;
  isActive?: boolean;
  category?: string;
  difficulty?: TaskDifficulty;
  limit?: number;
  offset?: number;
}

export interface TaskCompletionResult {
  task: Task;
  xpGained: number;
  newLevel?: number;
  newStreak: number;
  storyUnlocked: boolean;
  achievements?: string[];
}

export class TaskService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Create a new task for a user
   */
  async createTask(userId: string, taskData: CreateTaskData): Promise<Task> {
    // Validate task data
    this.validateTaskData(taskData);

    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    try {
      const task = await this.prisma.task.create({
        data: {
          userId,
          title: taskData.title.trim(),
          description: taskData.description?.trim() || null,
          type: taskData.type,
          difficulty: taskData.difficulty,
          category: taskData.category.trim(),
          recurrenceRule: taskData.recurrenceRule || null,
          streakCount: 0,
          isActive: true,
        },
      });

      console.log('✅ Task created successfully:', task.id);
      return task;
    } catch (error) {
      console.error('❌ Task creation failed:', error);
      throw new Error('Failed to create task');
    }
  }

  /**
   * Get user tasks with optional filtering
   */
  async getTasks(userId: string, filters: TaskFilters = {}): Promise<Task[]> {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    try {
      const whereClause: any = {
        userId,
      };

      // Apply filters
      if (filters.type) {
        whereClause.type = filters.type;
      }

      if (filters.isActive !== undefined) {
        whereClause.isActive = filters.isActive;
      }

      if (filters.category) {
        whereClause.category = {
          contains: filters.category,
          mode: 'insensitive',
        };
      }

      if (filters.difficulty) {
        whereClause.difficulty = filters.difficulty;
      }

      const tasks = await this.prisma.task.findMany({
        where: whereClause,
        orderBy: [
          { isActive: 'desc' },
          { createdAt: 'desc' },
        ],
        ...(filters.limit && { take: filters.limit }),
        skip: filters.offset || 0,
      });

      console.log(`✅ Retrieved ${tasks.length} tasks for user ${userId}`);
      return tasks;
    } catch (error) {
      console.error('❌ Failed to retrieve tasks:', error);
      throw new Error('Failed to retrieve tasks');
    }
  }

  /**
   * Update a task ensuring user ownership
   */
  async updateTask(taskId: string, userId: string, updates: UpdateTaskData): Promise<Task> {
    // Validate updates
    if (Object.keys(updates).length === 0) {
      throw new Error('No updates provided');
    }

    // Verify task exists and user owns it
    const existingTask = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
    });

    if (!existingTask) {
      throw new Error('Task not found or access denied');
    }

    // Validate update data
    if (updates.title) {
      this.validateTitle(updates.title);
    }

    if (updates.category) {
      this.validateCategory(updates.category);
    }

    try {
      const updateData: any = {};

      // Prepare update data
      if (updates.title) updateData.title = updates.title.trim();
      if (updates.description !== undefined) {
        updateData.description = updates.description?.trim() || null;
      }
      if (updates.type) updateData.type = updates.type;
      if (updates.difficulty) updateData.difficulty = updates.difficulty;
      if (updates.category) updateData.category = updates.category.trim();
      if (updates.recurrenceRule !== undefined) {
        updateData.recurrenceRule = updates.recurrenceRule || null;
      }
      if (updates.isActive !== undefined) updateData.isActive = updates.isActive;

      const updatedTask = await this.prisma.task.update({
        where: { id: taskId },
        data: updateData,
      });

      console.log('✅ Task updated successfully:', taskId);
      return updatedTask;
    } catch (error) {
      console.error('❌ Task update failed:', error);
      throw new Error('Failed to update task');
    }
  }

  /**
   * Soft delete a task (mark as inactive)
   */
  async deleteTask(taskId: string, userId: string): Promise<Task> {
    // Verify task exists and user owns it
    const existingTask = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
    });

    if (!existingTask) {
      throw new Error('Task not found or access denied');
    }

    try {
      const deletedTask = await this.prisma.task.update({
        where: { id: taskId },
        data: {
          isActive: false,
        },
      });

      console.log('✅ Task soft deleted successfully:', taskId);
      return deletedTask;
    } catch (error) {
      console.error('❌ Task deletion failed:', error);
      throw new Error('Failed to delete task');
    }
  }

  /**
   * Complete a task: mark complete, update streak, calculate XP, trigger story progression
   */
  async completeTask(taskId: string, userId: string): Promise<TaskCompletionResult> {
    // Verify task exists and user owns it
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
        isActive: true,
      },
    });

    if (!task) {
      throw new Error('Task not found, inactive, or access denied');
    }

    // Get user data
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    try {
      // Calculate XP based on difficulty
      const xpGained = this.calculateXP(task.difficulty, task.streakCount);
      
      // Calculate new streak
      const newStreak = this.calculateStreak(task);
      
      // Calculate if user levels up
      const newUserXP = user.xp + xpGained;
      const newLevel = this.calculateLevel(newUserXP);
      const leveledUp = newLevel > user.level;

      // Check if story should be unlocked
      const storyUnlocked = this.shouldUnlockStory(user.level, newLevel, task.category);

      // Perform database transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Update task completion
        const updatedTask = await tx.task.update({
          where: { id: taskId },
          data: {
            streakCount: newStreak,
            lastCompleted: new Date(),
          },
        });

        // Create completion record
        await tx.completedTask.create({
          data: {
            userId,
            taskId,
            xpGained,
            storyUnlocked,
          },
        });

        // Update user XP and level
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            xp: newUserXP,
            level: newLevel,
          },
        });

        return { task: updatedTask, user: updatedUser };
      });

      console.log(`✅ Task completed: ${taskId}, XP gained: ${xpGained}, New streak: ${newStreak}`);

      // Prepare result
      const completionResult: TaskCompletionResult = {
        task: result.task,
        xpGained,
        newStreak,
        storyUnlocked,
      };

      if (leveledUp) {
        completionResult.newLevel = newLevel;
        console.log(`🎉 User leveled up to level ${newLevel}!`);
      }

      return completionResult;
    } catch (error) {
      console.error('❌ Task completion failed:', error);
      throw new Error('Failed to complete task');
    }
  }

  /**
   * Get task completion statistics for a user
   */
  async getTaskStats(userId: string): Promise<any> {
    try {
      const stats = await this.prisma.completedTask.groupBy({
        by: ['userId'],
        where: { userId },
        _count: {
          id: true,
        },
        _sum: {
          xpGained: true,
        },
      });

      const taskCounts = await this.prisma.task.groupBy({
        by: ['type', 'isActive'],
        where: { userId },
        _count: {
          id: true,
        },
      });

      return {
        totalCompleted: stats[0]?._count.id || 0,
        totalXPGained: stats[0]?._sum.xpGained || 0,
        taskBreakdown: taskCounts,
      };
    } catch (error) {
      console.error('❌ Failed to get task stats:', error);
      throw new Error('Failed to retrieve task statistics');
    }
  }

  // Private helper methods

  private validateTaskData(data: CreateTaskData): void {
    this.validateTitle(data.title);
    this.validateCategory(data.category);

    if (!Object.values(TaskType).includes(data.type)) {
      throw new Error('Invalid task type');
    }

    if (!Object.values(TaskDifficulty).includes(data.difficulty)) {
      throw new Error('Invalid task difficulty');
    }
  }

  private validateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Task title is required');
    }

    if (title.trim().length > 200) {
      throw new Error('Task title must be less than 200 characters');
    }
  }

  private validateCategory(category: string): void {
    if (!category || category.trim().length === 0) {
      throw new Error('Task category is required');
    }

    if (category.trim().length > 50) {
      throw new Error('Task category must be less than 50 characters');
    }
  }

  private calculateXP(difficulty: TaskDifficulty, streakCount: number): number {
    const baseXP = {
      [TaskDifficulty.EASY]: 10,
      [TaskDifficulty.MEDIUM]: 25,
      [TaskDifficulty.HARD]: 50,
    };

    const base = baseXP[difficulty];
    const streakBonus = Math.floor(streakCount / 3) * 5; // +5 XP for every 3-day streak
    
    return base + streakBonus;
  }

  private calculateStreak(task: Task): number {
    const now = new Date();
    const lastCompleted = task.lastCompleted;

    if (!lastCompleted) {
      return 1; // First completion
    }

    const daysSinceLastCompletion = Math.floor(
      (now.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24)
    );

    // For daily tasks, maintain streak if completed yesterday or today
    if (task.type === TaskType.DAILY) {
      if (daysSinceLastCompletion <= 1) {
        return task.streakCount + 1;
      } else {
        return 1; // Reset streak
      }
    }

    // For habits and todos, always increment
    return task.streakCount + 1;
  }

  private calculateLevel(totalXP: number): number {
    // Level formula: level = floor(sqrt(totalXP / 100)) + 1
    return Math.floor(Math.sqrt(totalXP / 100)) + 1;
  }

  private shouldUnlockStory(oldLevel: number, newLevel: number, category: string): boolean {
    // Unlock story progression on level up and for certain categories
    const storyCategories = ['fitness', 'learning', 'creative', 'social'];
    return newLevel > oldLevel && storyCategories.includes(category.toLowerCase());
  }
}