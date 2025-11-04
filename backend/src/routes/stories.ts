import { Router } from 'express';
// import { validate } from '@/middleware/validate';
// import { schemas } from '@/schemas/validation.schemas';
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
// When implementing, add validation like this:
// router.post('/generate', authMiddleware, validate(schemas.generateStory), storyController.generateStory);
// router.put('/preferences', authMiddleware, validate(schemas.storyPreferences), storyController.updatePreferences);

export default router;