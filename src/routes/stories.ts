import { Router } from 'express';
import { ApiResponse } from '@/types';

const router = Router();

// GET /api/stories - Get stories info
router.get('/', (_req, res) => {
  const response: ApiResponse = {
    success: true,
    message: 'Stories endpoints',
    data: {
      endpoints: {
        current: 'GET /api/stories/current',
        generate: 'POST /api/stories/generate',
        progress: 'GET /api/stories/progress',
        chapters: 'GET /api/stories/chapters',
      },
    },
    timestamp: new Date().toISOString(),
  };
  res.json(response);
});

// TODO: Implement story routes
// router.get('/current', authMiddleware, storyController.getCurrentStory);
// router.post('/generate', authMiddleware, storyController.generateStory);
// router.get('/progress', authMiddleware, storyController.getProgress);
// router.get('/chapters', authMiddleware, storyController.getChapters);

export default router;