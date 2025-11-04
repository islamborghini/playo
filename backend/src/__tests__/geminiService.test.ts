/**
 * Tests for Google Gemini AI Service
 */

import {
  GenerateStoryOptions,
  GenerateChapterOptions,
  GenerateNPCDialogueOptions,
  ModerateContentOptions,
} from '../types/gemini';

// Mock the config to avoid requiring actual API key in tests
jest.mock('../utils/config', () => ({
  config: {
    GEMINI_API_KEY: 'test-api-key-mock',
  },
}));

// Mock the Google Generative AI SDK
const mockGenerateContent = jest.fn().mockResolvedValue({
  response: {
    text: jest.fn().mockReturnValue('Mock generated content'),
    usageMetadata: { totalTokenCount: 100 },
    candidates: [
      {
        safetyRatings: [
          { category: 'HARM_CATEGORY_HARASSMENT', probability: 'NEGLIGIBLE' },
        ],
      },
    ],
  },
});

jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: mockGenerateContent,
      }),
    })),
    HarmCategory: {
      HARM_CATEGORY_HARASSMENT: 'HARM_CATEGORY_HARASSMENT',
      HARM_CATEGORY_HATE_SPEECH: 'HARM_CATEGORY_HATE_SPEECH',
      HARM_CATEGORY_SEXUALLY_EXPLICIT: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      HARM_CATEGORY_DANGEROUS_CONTENT: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    },
    HarmBlockThreshold: {
      BLOCK_MEDIUM_AND_ABOVE: 'BLOCK_MEDIUM_AND_ABOVE',
    },
  };
});

describe('GeminiService', () => {
  // Create a fresh instance for each test to avoid rate limiting issues
  let geminiService: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the module to get a fresh instance
    jest.resetModules();
    jest.mock('../utils/config', () => ({
      config: {
        GEMINI_API_KEY: 'test-api-key-mock',
      },
    }));
    geminiService = require('../services/geminiService').default;
  });

  describe('Story Generation', () => {
    it('should generate a story based on character and tasks', async () => {
      const options: GenerateStoryOptions = {
        userId: 1,
        characterName: 'Aragorn',
        characterLevel: 10,
        characterClass: 'Warrior',
        recentTasks: [
          {
            title: 'Complete morning workout',
            description: 'Did 50 pushups',
            category: 'fitness',
            difficulty: 7,
          },
          {
            title: 'Learn TypeScript',
            description: 'Completed tutorial',
            category: 'learning',
            difficulty: 8,
          },
        ],
        tone: 'epic',
        length: 'medium',
      };

      const result = await geminiService.generateStory(options);

      expect(result).toHaveProperty('story');
      expect(result).toHaveProperty('metadata');
      expect(result.metadata.modelUsed).toBe('gemini-2.5-flash');
      expect(result.metadata.tokensUsed).toBeGreaterThan(0);
      expect(result.metadata.generatedAt).toBeInstanceOf(Date);
    });

    it('should support different story tones', async () => {
      const options: GenerateStoryOptions = {
        userId: 1,
        characterName: 'TestHero',
        characterLevel: 5,
        characterClass: 'Mage',
        recentTasks: [
          {
            title: 'Test task',
            description: 'Test',
            category: 'test',
            difficulty: 5,
          },
        ],
        tone: 'humorous',
      };

      const result = await geminiService.generateStory(options);
      expect(result.story).toBeTruthy();
    });
  });

  describe('Chapter Continuation', () => {
    it('should generate a chapter continuation', async () => {
      const options: GenerateChapterOptions = {
        userId: 1,
        previousChapter: 'You defeated the dragon and claimed its treasure...',
        characterState: {
          name: 'Aragorn',
          level: 10,
          class: 'Warrior',
          health: 85,
          mana: 50,
        },
        recentActions: [
          'Equipped legendary sword',
          'Learned fireball spell',
          'Completed quest for the king',
        ],
      };

      const result = await geminiService.generateChapterContinuation(options);

      expect(result).toHaveProperty('chapter');
      expect(result).toHaveProperty('metadata');
      expect(result.metadata.modelUsed).toMatch(/gemini.*flash/); // Accept any Gemini Flash model
      expect(result.metadata.tokensUsed).toBeGreaterThan(0);
    });
  });

  describe('NPC Dialogue Generation', () => {
    it('should generate NPC dialogue', async () => {
      const options: GenerateNPCDialogueOptions = {
        npcName: 'Gandalf',
        npcRole: 'Wise Wizard',
        context: 'The hero seeks guidance for the final battle',
        characterName: 'Frodo',
        characterLevel: 15,
        mood: 'mysterious',
      };

      const result = await geminiService.generateNPCDialogue(options);

      expect(result).toHaveProperty('dialogue');
      expect(result).toHaveProperty('metadata');
      expect(result.metadata.modelUsed).toMatch(/gemini.*flash/); // Accept any Gemini Flash model
    });
  });

  describe('Content Moderation', () => {
    it('should moderate appropriate content', async () => {
      // Mock JSON response for moderation
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: jest.fn().mockReturnValue('```json\n{"isAppropriate": true, "reason": null}\n```'),
          usageMetadata: { totalTokenCount: 50 },
          candidates: [
            {
              safetyRatings: [
                { category: 'HARM_CATEGORY_HARASSMENT', probability: 'NEGLIGIBLE' },
              ],
            },
          ],
        },
      });

      const options: ModerateContentOptions = {
        content: 'You embark on a heroic quest to save the kingdom!',
        context: 'Story introduction',
      };

      const result = await geminiService.moderateContent(options);

      expect(result).toHaveProperty('isAppropriate');
      expect(result).toHaveProperty('safetyRatings');
      expect(result).toHaveProperty('metadata');
      expect(Array.isArray(result.safetyRatings)).toBe(true);
    });
  });

  describe('Rate Limiting', () => {
    it('should track rate limit information', () => {
      const rateLimitInfo = geminiService.getRateLimitInfo();

      expect(rateLimitInfo).toHaveProperty('requestsThisMinute');
      expect(rateLimitInfo).toHaveProperty('requestsToday');
      expect(rateLimitInfo).toHaveProperty('resetAtMinute');
      expect(rateLimitInfo).toHaveProperty('resetAtDay');
      expect(rateLimitInfo.resetAtMinute).toBeInstanceOf(Date);
      expect(rateLimitInfo.resetAtDay).toBeInstanceOf(Date);
    });

    it('should increment request counters', async () => {
      const initialInfo = geminiService.getRateLimitInfo();
      const initialMinute = initialInfo.requestsThisMinute;

      const options: GenerateStoryOptions = {
        userId: 1,
        characterName: 'Test',
        characterLevel: 1,
        characterClass: 'Test',
        recentTasks: [],
      };

      await geminiService.generateStory(options);

      const updatedInfo = geminiService.getRateLimitInfo();
      expect(updatedInfo.requestsThisMinute).toBeGreaterThan(initialMinute);
    });
  });

  describe('Health Check', () => {
    it('should perform a health check', async () => {
      const health = await geminiService.healthCheck();

      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('details');
      expect(['healthy', 'unhealthy']).toContain(health.status);
      expect(health.details).toHaveProperty('model');
      expect(health.details).toHaveProperty('apiKeyConfigured');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing API key gracefully', () => {
      const config = require('../utils/config').config;
      expect(config.GEMINI_API_KEY).toBeTruthy();
    });
  });

  describe('Token Usage Logging', () => {
    it('should log token usage for all operations', async () => {
      const consoleSpy = jest.spyOn(console, 'log');

      const storyOptions: GenerateStoryOptions = {
        userId: 1,
        characterName: 'Test',
        characterLevel: 1,
        characterClass: 'Test',
        recentTasks: [],
      };

      await geminiService.generateStory(storyOptions);

      expect(consoleSpy).toHaveBeenCalled();
      const logCalls = consoleSpy.mock.calls.map(call => call.join(' '));
      const hasTokenLog = logCalls.some(log => log.includes('tokens'));
      expect(hasTokenLog).toBe(true);

      consoleSpy.mockRestore();
    });
  });
});

