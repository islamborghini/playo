/**
 * API Routes for AI Story Generation using Google Gemini
 * 
 * Endpoints:
 * - POST /api/ai/story/generate - Generate a new story based on character and tasks
 * - POST /api/ai/story/chapter - Generate a chapter continuation
 * - POST /api/ai/npc/dialogue - Generate NPC dialogue
 * - POST /api/ai/moderate - Moderate content for appropriateness
 * - GET /api/ai/rate-limit - Get current rate limit status
 * - GET /api/ai/health - Health check for Gemini service
 */

import { Router } from 'express';
import geminiService from '../services/geminiService';
import { authenticate } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import {
  GenerateStoryOptions,
  GenerateChapterOptions,
  GenerateNPCDialogueOptions,
  ModerateContentOptions,
} from '../types/gemini';

const router = Router();

/**
 * POST /api/ai/story/generate
 * Generate a personalized RPG story based on character state and completed tasks
 */
router.post('/story/generate', authenticate, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = parseInt(authReq.user.id);

    const {
      characterName,
      characterLevel,
      characterClass,
      recentTasks,
      tone,
      length,
    } = req.body;

    // Validation
    if (!characterName || !characterLevel || !characterClass) {
      return res.status(400).json({
        error: 'Missing required fields: characterName, characterLevel, characterClass',
      });
    }

    const options: GenerateStoryOptions = {
      userId,
      characterName,
      characterLevel: parseInt(characterLevel),
      characterClass,
      recentTasks: recentTasks || [],
      tone: tone || 'epic',
      length: length || 'medium',
    };

    const result = await geminiService.generateStory(options);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error generating story:', error);
    
    if (error.code === 'RATE_LIMIT_EXCEEDED' || error.code === 'DAILY_QUOTA_EXCEEDED') {
      return res.status(429).json({
        error: error.message,
        code: error.code,
      });
    }

    return res.status(500).json({
      error: 'Failed to generate story',
      message: error.message,
    });
  }
});

/**
 * POST /api/ai/story/chapter
 * Generate a chapter continuation for an ongoing story
 */
router.post('/story/chapter', authenticate, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = parseInt(authReq.user.id);

    const {
      previousChapter,
      characterState,
      recentActions,
      plotDirection,
    } = req.body;

    // Validation
    if (!previousChapter || !characterState) {
      return res.status(400).json({
        error: 'Missing required fields: previousChapter, characterState',
      });
    }

    const options: GenerateChapterOptions = {
      userId,
      previousChapter,
      characterState,
      recentActions: recentActions || [],
      plotDirection,
    };

    const result = await geminiService.generateChapterContinuation(options);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error generating chapter:', error);
    
    if (error.code === 'RATE_LIMIT_EXCEEDED' || error.code === 'DAILY_QUOTA_EXCEEDED') {
      return res.status(429).json({
        error: error.message,
        code: error.code,
      });
    }

    return res.status(500).json({
      error: 'Failed to generate chapter',
      message: error.message,
    });
  }
});

/**
 * POST /api/ai/npc/dialogue
 * Generate contextual NPC dialogue
 */
router.post('/npc/dialogue', authenticate, async (req, res) => {
  try {
    const {
      npcName,
      npcRole,
      context,
      characterName,
      characterLevel,
      mood,
    } = req.body;

    // Validation
    if (!npcName || !npcRole || !context || !characterName || !characterLevel) {
      return res.status(400).json({
        error: 'Missing required fields: npcName, npcRole, context, characterName, characterLevel',
      });
    }

    const options: GenerateNPCDialogueOptions = {
      npcName,
      npcRole,
      context,
      characterName,
      characterLevel: parseInt(characterLevel),
      mood: mood || 'neutral',
    };

    const result = await geminiService.generateNPCDialogue(options);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error generating NPC dialogue:', error);
    
    if (error.code === 'RATE_LIMIT_EXCEEDED' || error.code === 'DAILY_QUOTA_EXCEEDED') {
      return res.status(429).json({
        error: error.message,
        code: error.code,
      });
    }

    return res.status(500).json({
      error: 'Failed to generate NPC dialogue',
      message: error.message,
    });
  }
});

/**
 * POST /api/ai/moderate
 * Moderate content for appropriateness
 */
router.post('/moderate', authenticate, async (req, res) => {
  try {
    const { content, context } = req.body;

    // Validation
    if (!content) {
      return res.status(400).json({
        error: 'Missing required field: content',
      });
    }

    const options: ModerateContentOptions = {
      content,
      context,
    };

    const result = await geminiService.moderateContent(options);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error moderating content:', error);
    
    if (error.code === 'RATE_LIMIT_EXCEEDED' || error.code === 'DAILY_QUOTA_EXCEEDED') {
      return res.status(429).json({
        error: error.message,
        code: error.code,
      });
    }

    return res.status(500).json({
      error: 'Failed to moderate content',
      message: error.message,
    });
  }
});

/**
 * GET /api/ai/rate-limit
 * Get current rate limit status
 */
router.get('/rate-limit', authenticate, (_req, res) => {
  try {
    const rateLimitInfo = geminiService.getRateLimitInfo();

    return res.status(200).json({
      success: true,
      data: rateLimitInfo,
    });
  } catch (error: any) {
    console.error('Error getting rate limit info:', error);
    return res.status(500).json({
      error: 'Failed to get rate limit info',
      message: error.message,
    });
  }
});

/**
 * GET /api/ai/health
 * Health check for Gemini service
 */
router.get('/health', async (_req, res) => {
  try {
    const health = await geminiService.healthCheck();

    const statusCode = health.status === 'healthy' ? 200 : 503;
    return res.status(statusCode).json({
      success: health.status === 'healthy',
      data: health,
    });
  } catch (error: any) {
    console.error('Error checking health:', error);
    return res.status(500).json({
      success: false,
      error: 'Health check failed',
      message: error.message,
    });
  }
});

export default router;
