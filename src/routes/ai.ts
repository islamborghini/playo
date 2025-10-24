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
import prisma from '../utils/prisma';

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

// ============================================================================
// HYBRID STORY SYSTEM ROUTES
// ============================================================================

/**
 * POST /api/ai/story/arc/create
 * Create a new main story arc with chapters, quests, and challenges
 * 
 * Body:
 * - characterName: string
 * - characterLevel: number
 * - characterClass: string
 * - theme?: string (e.g., "Epic Fantasy", "Sci-Fi")
 * - setting?: string (e.g., "Medieval Kingdom", "Space Station")
 * - plotFocus?: 'action' | 'mystery' | 'exploration' | 'character'
 */
router.post('/story/arc/create', authenticate, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = parseInt(authReq.user.id);

    const {
      characterName,
      characterLevel,
      characterClass,
      theme,
      setting,
      plotFocus,
    } = req.body;

    // Validation
    if (!characterName || !characterLevel || !characterClass) {
      return res.status(400).json({
        error: 'Missing required fields: characterName, characterLevel, characterClass',
      });
    }

    const result = await geminiService.generateMainStoryArc({
      characterName,
      characterLevel: parseInt(characterLevel),
      characterClass,
      theme,
      setting,
      plotFocus,
    });

    // Save story to database
    const savedStory = await prisma.story.create({
      data: {
        userId: authReq.user.id,
        title: result.title || `${characterName}'s Adventure`,
        description: result.description || 'An epic quest awaits...',
        content: JSON.stringify(result),
        currentChapter: result.currentChapter || 1,
        totalChapters: result.totalChapters || 10,
        chapterData: JSON.stringify(result.chapters?.[0] || {}),
        branchesTaken: JSON.stringify([]),
        activeQuests: JSON.stringify(result.mainQuests || []),
        unlockedChallenges: JSON.stringify(result.challenges || []),
        worldState: JSON.stringify(result.worldState || {}),
        isActive: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Story arc created successfully',
      data: {
        storyId: savedStory.id,
        userId,
        arc: result,
      },
    });
  } catch (error: any) {
    console.error('Error creating story arc:', error);
    
    if (error.code === 'RATE_LIMIT_EXCEEDED' || error.code === 'DAILY_QUOTA_EXCEEDED') {
      return res.status(429).json({
        error: error.message,
        code: error.code,
      });
    }

    return res.status(500).json({
      error: 'Failed to create story arc',
      message: error.message,
    });
  }
});

/**
 * POST /api/ai/story/chapter/next
 * Generate the next chapter based on player progress
 * 
 * Body:
 * - mainStoryArc: object (current story arc state)
 * - characterState: object (name, level, stats)
 * - recentProgress: array (completed tasks/habits)
 * - previousChoices: array (story choices made)
 * - pendingChallenges: array (challenges available)
 */
router.post('/story/chapter/next', authenticate, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = parseInt(authReq.user.id);

    const {
      mainStoryArc,
      characterState,
      recentProgress,
      previousChoices,
      pendingChallenges,
    } = req.body;

    // Validation
    if (!mainStoryArc || !characterState) {
      return res.status(400).json({
        error: 'Missing required fields: mainStoryArc, characterState',
      });
    }

    const context = {
      mainStoryArc,
      characterState,
      recentProgress: recentProgress || [],
      previousChoices: previousChoices || [],
      pendingChallenges: pendingChallenges || [],
      worldState: mainStoryArc.worldState,
    };

    const result = await geminiService.generateNextChapter(context);

    return res.status(200).json({
      success: true,
      data: {
        userId,
        chapter: result,
      },
    });
  } catch (error: any) {
    console.error('Error generating next chapter:', error);
    
    if (error.code === 'RATE_LIMIT_EXCEEDED' || error.code === 'DAILY_QUOTA_EXCEEDED') {
      return res.status(429).json({
        error: error.message,
        code: error.code,
      });
    }

    return res.status(500).json({
      error: 'Failed to generate next chapter',
      message: error.message,
    });
  }
});

/**
 * POST /api/ai/challenge/check
 * Check if character meets requirements for a challenge
 * 
 * Body:
 * - challenge: object (challenge to check)
 * - characterState: object (name, level, stats)
 */
router.post('/challenge/check', authenticate, async (req, res) => {
  try {
    const { challenge, characterState } = req.body;

    // Validation
    if (!challenge || !characterState) {
      return res.status(400).json({
        error: 'Missing required fields: challenge, characterState',
      });
    }

    const readiness = geminiService.checkChallengeReadiness(challenge, characterState);

    return res.status(200).json({
      success: true,
      data: readiness,
    });
  } catch (error: any) {
    console.error('Error checking challenge readiness:', error);
    return res.status(500).json({
      error: 'Failed to check challenge readiness',
      message: error.message,
    });
  }
});

/**
 * POST /api/ai/challenge/attempt
 * Attempt a combat challenge and get narrative results
 * 
 * Body:
 * - characterName: string
 * - characterState: object (level, stats)
 * - challenge: object (challenge details with enemy)
 */
router.post('/challenge/attempt', authenticate, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = parseInt(authReq.user.id);

    const { characterName, characterState, challenge } = req.body;

    // Validation
    if (!characterName || !characterState || !challenge || !challenge.enemy) {
      return res.status(400).json({
        error: 'Missing required fields: characterName, characterState, challenge (with enemy)',
      });
    }

    // Check if character can attempt
    const readiness = geminiService.checkChallengeReadiness(challenge, characterState);
    if (!readiness.canAttempt) {
      return res.status(403).json({
        error: 'Character does not meet challenge requirements',
        reason: readiness.reason,
      });
    }

    // Simulate combat
    const combatResult = geminiService.simulateCombat(characterState, challenge.enemy);

    // Generate narrative
    const narrative = await geminiService.generateCombatNarrative(
      combatResult,
      characterName,
      challenge.enemy
    );

    return res.status(200).json({
      success: true,
      data: {
        userId,
        combatResult,
        narrative,
        rewards: combatResult.victory ? challenge.rewards : null,
      },
    });
  } catch (error: any) {
    console.error('Error attempting challenge:', error);
    
    if (error.code === 'RATE_LIMIT_EXCEEDED' || error.code === 'DAILY_QUOTA_EXCEEDED') {
      return res.status(429).json({
        error: error.message,
        code: error.code,
      });
    }

    return res.status(500).json({
      error: 'Failed to attempt challenge',
      message: error.message,
    });
  }
});

/**
 * GET /api/ai/story/current
 * Get the current active story for the authenticated user
 */
router.get('/story/current', authenticate, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;

    // Find the most recent active story for this user
    const story = await prisma.story.findFirst({
      where: {
        userId: userId,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'No active story found. Create one first!',
        data: {
          userId,
          suggestion: 'Use POST /api/ai/story/arc/create to generate a new story arc',
        },
      });
    }

    // Parse the stored story data
    const storyArc = JSON.parse(story.content);
    const currentChapterData = JSON.parse(story.chapterData);
    const activeQuests = JSON.parse(story.activeQuests);
    const unlockedChallenges = JSON.parse(story.unlockedChallenges);
    const worldState = JSON.parse(story.worldState);
    const branchesTaken = JSON.parse(story.branchesTaken);

    return res.status(200).json({
      success: true,
      message: 'Current story retrieved successfully',
      data: {
        storyId: story.id,
        userId,
        title: story.title,
        description: story.description,
        currentChapter: story.currentChapter,
        totalChapters: story.totalChapters,
        arc: {
          ...storyArc,
          currentChapter: story.currentChapter,
          worldState,
          activeQuests,
          unlockedChallenges,
        },
        currentChapterData,
        branchesTaken,
        progress: {
          percentage: Math.round((story.currentChapter / story.totalChapters) * 100),
          chaptersCompleted: story.currentChapter - 1,
          chaptersRemaining: story.totalChapters - story.currentChapter + 1,
        },
        timestamps: {
          createdAt: story.createdAt,
          updatedAt: story.updatedAt,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching current story:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch current story',
      message: error.message,
    });
  }
});

export default router;
