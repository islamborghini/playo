import { Router } from 'express';
import { AuthController } from '@/controllers/authController';
import { authenticate } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { schemas } from '@/schemas/validation.schemas';
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
        refresh: 'POST /api/auth/refresh',
        me: 'GET /api/auth/me',
        profile: 'GET /api/auth/profile',
        updateProfile: 'PUT /api/auth/profile',
        changePassword: 'PUT /api/auth/change-password',
        logout: 'POST /api/auth/logout',
      },
    },
    timestamp: new Date().toISOString(),
  };
  res.json(response);
});

// POST /api/auth/login - User login
router.post('/login', validate(schemas.login), authController.login.bind(authController));

// POST /api/auth/register - User registration
router.post('/register', validate(schemas.register), authController.register.bind(authController));

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', authController.refreshToken.bind(authController));

// GET /api/auth/me - Get current user profile (protected)
router.get('/me', authenticate, authController.getCurrentUser.bind(authController));

// GET /api/auth/profile - Get current user profile (protected, legacy)
router.get('/profile', authenticate, authController.getProfile.bind(authController));

// PUT /api/auth/profile - Update user profile (protected)
router.put('/profile', authenticate, authController.updateProfile.bind(authController));

// PUT /api/auth/change-password - Change user password (protected)
router.put('/change-password', authenticate, validate(schemas.changePassword), authController.changePassword.bind(authController));

// POST /api/auth/logout - User logout
router.post('/logout', authenticate, authController.logout.bind(authController));

export default router;