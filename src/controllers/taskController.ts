import { Request, Response } from 'express';
import { TaskService } from '@/services/taskService';
import { ApiResponse } from '@/types';
import { CreateTaskRequest, UpdateTaskRequest, TaskQueryParams } from '@/types/task';
import { TaskType, TaskDifficulty } from '@/generated/prisma';

const taskService = new TaskService();

export class TaskController {
  /**
   * Create a new task
   * POST /api/tasks
   */
  async createTask(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const taskData: CreateTaskRequest = req.body;

      // Validate required fields
      if (!taskData.title || !taskData.type || !taskData.difficulty || !taskData.category) {
        const response: ApiResponse = {
          success: false,
          message: 'Title, type, difficulty, and category are required',
          error: 'MISSING_REQUIRED_FIELDS',
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      // Validate task type
      if (!Object.values(TaskType).includes(taskData.type as TaskType)) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid task type. Must be DAILY, HABIT, or TODO',
          error: 'INVALID_TASK_TYPE',
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      // Validate difficulty
      if (!Object.values(TaskDifficulty).includes(taskData.difficulty as TaskDifficulty)) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid difficulty. Must be EASY, MEDIUM, or HARD',
          error: 'INVALID_DIFFICULTY',
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      const task = await taskService.createTask(user.id, {
        title: taskData.title,
        ...(taskData.description && { description: taskData.description }),
        type: taskData.type as TaskType,
        difficulty: taskData.difficulty as TaskDifficulty,
        category: taskData.category,
        ...(taskData.recurrenceRule && { recurrenceRule: taskData.recurrenceRule }),
      });

      const response: ApiResponse = {
        success: true,
        message: 'Task created successfully',
        data: { task },
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error: any) {
      console.error('Create task error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to create task',
        error: 'TASK_CREATION_FAILED',
        timestamp: new Date().toISOString(),
      };
      
      res.status(400).json(response);
    }
  }

  /**
   * Get user's tasks with filtering
   * GET /api/tasks
   */
  async getTasks(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const query: TaskQueryParams = req.query;

      // Parse filters
      const filters: any = {};
      
      if (query.type && Object.values(TaskType).includes(query.type as TaskType)) {
        filters.type = query.type as TaskType;
      }

      if (query.isActive !== undefined) {
        filters.isActive = query.isActive === 'true';
      }

      if (query.category) {
        filters.category = query.category;
      }

      if (query.difficulty && Object.values(TaskDifficulty).includes(query.difficulty as TaskDifficulty)) {
        filters.difficulty = query.difficulty as TaskDifficulty;
      }

      if (query.limit) {
        const limit = parseInt(query.limit);
        if (!isNaN(limit) && limit > 0 && limit <= 100) {
          filters.limit = limit;
        }
      }

      if (query.offset) {
        const offset = parseInt(query.offset);
        if (!isNaN(offset) && offset >= 0) {
          filters.offset = offset;
        }
      }

      const tasks = await taskService.getTasks(user.id, filters);

      const response: ApiResponse = {
        success: true,
        message: 'Tasks retrieved successfully',
        data: { 
          tasks,
          count: tasks.length,
          filters: filters
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      console.error('Get tasks error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve tasks',
        error: 'TASK_RETRIEVAL_FAILED',
        timestamp: new Date().toISOString(),
      };
      
      res.status(500).json(response);
    }
  }

  /**
   * Get a specific task
   * GET /api/tasks/:id
   */
  async getTask(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const taskId = req.params.id;

      if (!taskId) {
        const response: ApiResponse = {
          success: false,
          message: 'Task ID is required',
          error: 'MISSING_TASK_ID',
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      const tasks = await taskService.getTasks(user.id, {});
      const task = tasks.find(t => t.id === taskId);

      if (!task) {
        const response: ApiResponse = {
          success: false,
          message: 'Task not found or access denied',
          error: 'TASK_NOT_FOUND',
          timestamp: new Date().toISOString(),
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Task retrieved successfully',
        data: { task },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      console.error('Get task error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve task',
        error: 'TASK_RETRIEVAL_FAILED',
        timestamp: new Date().toISOString(),
      };
      
      res.status(500).json(response);
    }
  }

  /**
   * Update a task
   * PUT /api/tasks/:id
   */
  async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const taskId = req.params.id;
      const updates: UpdateTaskRequest = req.body;

      if (!taskId) {
        const response: ApiResponse = {
          success: false,
          message: 'Task ID is required',
          error: 'MISSING_TASK_ID',
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      // Validate update data
      if (updates.type && !Object.values(TaskType).includes(updates.type as TaskType)) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid task type',
          error: 'INVALID_TASK_TYPE',
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      if (updates.difficulty && !Object.values(TaskDifficulty).includes(updates.difficulty as TaskDifficulty)) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid difficulty',
          error: 'INVALID_DIFFICULTY',
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      const updatedTask = await taskService.updateTask(taskId, user.id, updates);

      const response: ApiResponse = {
        success: true,
        message: 'Task updated successfully',
        data: { task: updatedTask },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      console.error('Update task error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to update task',
        error: 'TASK_UPDATE_FAILED',
        timestamp: new Date().toISOString(),
      };
      
      const statusCode = error.message.includes('not found') || error.message.includes('access denied') ? 404 : 400;
      res.status(statusCode).json(response);
    }
  }

  /**
   * Delete a task (soft delete)
   * DELETE /api/tasks/:id
   */
  async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const taskId = req.params.id;

      if (!taskId) {
        const response: ApiResponse = {
          success: false,
          message: 'Task ID is required',
          error: 'MISSING_TASK_ID',
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      const deletedTask = await taskService.deleteTask(taskId, user.id);

      const response: ApiResponse = {
        success: true,
        message: 'Task deleted successfully',
        data: { task: deletedTask },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      console.error('Delete task error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to delete task',
        error: 'TASK_DELETION_FAILED',
        timestamp: new Date().toISOString(),
      };
      
      const statusCode = error.message.includes('not found') || error.message.includes('access denied') ? 404 : 500;
      res.status(statusCode).json(response);
    }
  }

  /**
   * Complete a task
   * POST /api/tasks/:id/complete
   */
  async completeTask(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const taskId = req.params.id;

      if (!taskId) {
        const response: ApiResponse = {
          success: false,
          message: 'Task ID is required',
          error: 'MISSING_TASK_ID',
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      const completionResult = await taskService.completeTask(taskId, user.id);

      const response: ApiResponse = {
        success: true,
        message: 'Task completed successfully',
        data: {
          task: completionResult.task,
          xpGained: completionResult.xpGained,
          newStreak: completionResult.newStreak,
          storyUnlocked: completionResult.storyUnlocked,
          ...(completionResult.newLevel && { newLevel: completionResult.newLevel }),
          ...(completionResult.achievements && { achievements: completionResult.achievements }),
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      console.error('Complete task error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to complete task',
        error: 'TASK_COMPLETION_FAILED',
        timestamp: new Date().toISOString(),
      };
      
      const statusCode = error.message.includes('not found') || error.message.includes('access denied') ? 404 : 500;
      res.status(statusCode).json(response);
    }
  }

  /**
   * Get task statistics for the user
   * GET /api/tasks/stats
   */
  async getTaskStats(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;

      const stats = await taskService.getTaskStats(user.id);

      const response: ApiResponse = {
        success: true,
        message: 'Task statistics retrieved successfully',
        data: { stats },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error: any) {
      console.error('Get task stats error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve task statistics',
        error: 'TASK_STATS_FAILED',
        timestamp: new Date().toISOString(),
      };
      
      res.status(500).json(response);
    }
  }
}