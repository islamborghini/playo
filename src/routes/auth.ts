import { Router } from 'express';
import { AuthController } from '@/controllers/authController';
import { authenticate } from '@/middleware/auth';
import { ApiResponse } from '@/types';

const router = Router();
const authController = new AuthController();

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
        profile: 'GET /api/auth/profile',
      },
    },
    timestamp: new Date().toISOString(),
  };
  res.json(response);
});

// POST /api/auth/login - User login
router.post('/login', authController.login.bind(authController));

// POST /api/auth/register - User registration
router.post('/register', authController.register.bind(authController));

// GET /api/auth/profile - Get current user profile (protected)
router.get('/profile', authenticate, authController.getProfile.bind(authController));

// POST /api/auth/logout - User logout
router.post('/logout', authenticate, authController.logout.bind(authController));

export default router;