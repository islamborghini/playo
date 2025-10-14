import { Router } from 'express';
import { TaskController } from '@/controllers/taskController';
import { authenticate } from '@/middleware/auth';
import { ApiResponse } from '@/types';

const router = Router();
const taskController = new TaskController();

// GET /api/tasks/info - Get tasks endpoint info
router.get('/info', (_req, res) => {
  const response: ApiResponse = {
    success: true,
    message: 'Tasks endpoints',
    data: {
      endpoints: {
        list: 'GET /api/tasks',
        create: 'POST /api/tasks',
        get: 'GET /api/tasks/:id',
        update: 'PUT /api/tasks/:id',
        delete: 'DELETE /api/tasks/:id',
        complete: 'POST /api/tasks/:id/complete',
        stats: 'GET /api/tasks/stats',
      },
    },
    timestamp: new Date().toISOString(),
  };
  res.json(response);
});

// Task CRUD and management routes (all require authentication)
router.get('/stats', authenticate, taskController.getTaskStats.bind(taskController));
router.get('/', authenticate, taskController.getTasks.bind(taskController));
router.post('/', authenticate, taskController.createTask.bind(taskController));
router.get('/:id', authenticate, taskController.getTask.bind(taskController));
router.put('/:id', authenticate, taskController.updateTask.bind(taskController));
router.delete('/:id', authenticate, taskController.deleteTask.bind(taskController));
router.post('/:id/complete', authenticate, taskController.completeTask.bind(taskController));

export default router;