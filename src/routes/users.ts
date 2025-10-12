import { Router } from 'express';
import { ApiResponse } from '@/types';

const router = Router();

// GET /api/users - Get users info
router.get('/', (_req, res) => {
  const response: ApiResponse = {
    success: true,
    message: 'Users endpoints',
    data: {
      endpoints: {
        profile: 'GET /api/users/profile',
        updateProfile: 'PUT /api/users/profile',
        character: 'GET /api/users/character',
        updateCharacter: 'PUT /api/users/character',
      },
    },
    timestamp: new Date().toISOString(),
  };
  res.json(response);
});

// TODO: Implement user routes
// router.get('/profile', authMiddleware, userController.getProfile);
// router.put('/profile', authMiddleware, userController.updateProfile);
// router.get('/character', authMiddleware, userController.getCharacter);
// router.put('/character', authMiddleware, userController.updateCharacter);

export default router;