import { Router } from 'express';
import { ApiResponse } from '@/types';

const router = Router();

// GET /api/tasks - Get tasks info
router.get('/', (_req, res) => {
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
      },
    },
    timestamp: new Date().toISOString(),
  };
  res.json(response);
});

// TODO: Implement task routes
// router.get('/', authMiddleware, taskController.getTasks);
// router.post('/', authMiddleware, taskController.createTask);
// router.get('/:id', authMiddleware, taskController.getTask);
// router.put('/:id', authMiddleware, taskController.updateTask);
// router.delete('/:id', authMiddleware, taskController.deleteTask);
// router.post('/:id/complete', authMiddleware, taskController.completeTask);

export default router;