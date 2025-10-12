import { Router } from 'express';
import { ApiResponse } from '@/types';

const router = Router();

// GET /api/auth - Get authentication info
router.get('/', (_req, res) => {
  const response: ApiResponse = {
    success: true,
    message: 'Authentication endpoints',
    data: {
      endpoints: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        logout: 'POST /api/auth/logout',
        refresh: 'POST /api/auth/refresh',
      },
    },
    timestamp: new Date().toISOString(),
  };
  res.json(response);
});

// TODO: Implement authentication routes
// router.post('/login', authController.login);
// router.post('/register', authController.register);
// router.post('/logout', authController.logout);
// router.post('/refresh', authController.refresh);

export default router;