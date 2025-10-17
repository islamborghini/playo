/**
 * Google Gemini AI Service for RPG Story Generation
 * 
 * Features:
 * - Story generation based on character progression and completed tasks
 * - Chapter continuation for ongoing narratives
 * - NPC dialogue generation with contextual awareness
 * - Content moderation using Gemini safety settings
 * - Exponential backoff retry logic (up to 3 attempts)
 * - Rate limiting (15 requests/minute, 1500 requests/day)
 * - JSON extraction from markdown code blocks
 * - Token usage logging
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GenerativeModel } from '@google/generative-ai';
import { config } from '../utils/config';
import {
  GenerateStoryOptions,
  GenerateChapterOptions,
  GenerateNPCDialogueOptions,
  ModerateContentOptions,
  StoryGenerationResult,
  ChapterContinuationResult,
  NPCDialogueResult,
  ModerationResult,
  RateLimitInfo,
  GeminiError
} from '../types/gemini';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private readonly MODEL_NAME = 'gemini-1.5-flash';
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_BASE = 1000; // 1 second

  // Rate limiting
  private requestsThisMinute: number = 0;
  private requestsToday: number = 0;
  private minuteResetTime: Date = new Date();
  private dayResetTime: Date = new Date();
  private readonly MAX_REQUESTS_PER_MINUTE = 15;
  private readonly MAX_REQUESTS_PER_DAY = 1500;

  constructor() {
    if (!config.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured in environment variables');
    }

    this.genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
    
    // Initialize model with safety settings
    this.model = this.genAI.getGenerativeModel({
      model: this.MODEL_NAME,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    // Initialize rate limit reset times
    this.resetRateLimitTimers();
  }

  /**
   * Reset rate limit timers
   */
  private resetRateLimitTimers(): void {
    const now = new Date();
    
    // Set minute reset to next minute
    this.minuteResetTime = new Date(now);
    this.minuteResetTime.setMinutes(now.getMinutes() + 1);
    this.minuteResetTime.setSeconds(0);
    this.minuteResetTime.setMilliseconds(0);

    // Set day reset to next day at midnight
    this.dayResetTime = new Date(now);
    this.dayResetTime.setDate(now.getDate() + 1);
    this.dayResetTime.setHours(0, 0, 0, 0);
  }

  /**
   * Check and update rate limits
   */
  private async checkRateLimit(): Promise<void> {
    const now = new Date();

    // Reset minute counter if needed
    if (now >= this.minuteResetTime) {
      this.requestsThisMinute = 0;
      this.minuteResetTime = new Date(now);
      this.minuteResetTime.setMinutes(now.getMinutes() + 1);
      this.minuteResetTime.setSeconds(0);
      this.minuteResetTime.setMilliseconds(0);
    }

    // Reset day counter if needed
    if (now >= this.dayResetTime) {
      this.requestsToday = 0;
      this.dayResetTime = new Date(now);
      this.dayResetTime.setDate(now.getDate() + 1);
      this.dayResetTime.setHours(0, 0, 0, 0);
    }

    // Check limits
    if (this.requestsThisMinute >= this.MAX_REQUESTS_PER_MINUTE) {
      const waitTime = Math.ceil((this.minuteResetTime.getTime() - now.getTime()) / 1000);
      throw this.createError(
        'RATE_LIMIT_EXCEEDED',
        `Rate limit exceeded: ${this.MAX_REQUESTS_PER_MINUTE} requests per minute. Reset in ${waitTime} seconds.`,
        429,
        false
      );
    }

    if (this.requestsToday >= this.MAX_REQUESTS_PER_DAY) {
      const waitTime = Math.ceil((this.dayResetTime.getTime() - now.getTime()) / 1000 / 60);
      throw this.createError(
        'DAILY_QUOTA_EXCEEDED',
        `Daily quota exceeded: ${this.MAX_REQUESTS_PER_DAY} requests per day. Reset in ${waitTime} minutes.`,
        429,
        false
      );
    }

    // Increment counters
    this.requestsThisMinute++;
    this.requestsToday++;
  }

  /**
   * Get current rate limit status
   */
  public getRateLimitInfo(): RateLimitInfo {
    return {
      requestsThisMinute: this.requestsThisMinute,
      requestsToday: this.requestsToday,
      resetAtMinute: new Date(this.minuteResetTime),
      resetAtDay: new Date(this.dayResetTime),
    };
  }

  /**
   * Create a standardized error
   */
  private createError(code: string, message: string, status?: number, retryable: boolean = false): GeminiError {
    return {
      code,
      message,
      status,
      retryable,
    };
  }

  /**
   * Retry wrapper with exponential backoff
   */
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        // Check if error is retryable
        const isRetryable = 
          error.status === 429 || // Rate limit
          error.status === 500 || // Internal server error
          error.status === 503 || // Service unavailable
          error.code === 'ECONNRESET' ||
          error.code === 'ETIMEDOUT' ||
          error.retryable === true;

        if (!isRetryable || attempt === this.MAX_RETRIES - 1) {
          break;
        }

        // Calculate exponential backoff delay
        const delay = this.RETRY_DELAY_BASE * Math.pow(2, attempt);
        console.log(`${operationName} failed (attempt ${attempt + 1}/${this.MAX_RETRIES}), retrying in ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // All retries failed
    console.error(`${operationName} failed after ${this.MAX_RETRIES} attempts:`, lastError);
    throw lastError;
  }

  /**
   * Extract JSON from markdown code blocks
   */
  private extractJsonFromMarkdown(text: string): any {
    // Try to find JSON in markdown code blocks
    const jsonBlockRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/;
    const match = text.match(jsonBlockRegex);
    
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]);
      } catch (error) {
        console.warn('Failed to parse JSON from markdown block');
      }
    }

    // Try to parse the entire text as JSON
    try {
      return JSON.parse(text);
    } catch (error) {
      // Not JSON, return as-is
      return text;
    }
  }

  /**
   * Generate a personalized RPG story based on character state and completed tasks
   */
  public async generateStory(options: GenerateStoryOptions): Promise<StoryGenerationResult> {
    await this.checkRateLimit();

    const {
      characterName,
      characterLevel,
      characterClass,
      recentTasks,
      tone = 'epic',
      length = 'medium'
    } = options;

    const wordCount = {
      short: '100-150',
      medium: '200-300',
      long: '400-500'
    }[length];

    const tasksDescription = recentTasks
      .map(task => `- ${task.title} (${task.category}, difficulty: ${task.difficulty}/10)`)
      .join('\n');

    const prompt = `You are a creative RPG storyteller. Generate a ${tone} story for a character based on their recent achievements.

Character Details:
- Name: ${characterName}
- Level: ${characterLevel}
- Class: ${characterClass}

Recent Accomplishments:
${tasksDescription}

Requirements:
- Write a ${tone} narrative that incorporates these accomplishments as heroic quests
- Target length: ${wordCount} words
- Use second person ("you") to address the character
- Make the story engaging and personalized
- Connect the tasks to a larger narrative arc
- End with a hint of what challenges lie ahead

Generate the story now:`;

    return this.retryWithBackoff(async () => {
      const startTime = Date.now();
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const tokensUsed = (response.usageMetadata?.totalTokenCount || 0);

      console.log(`Story generated for ${characterName} (${tokensUsed} tokens, ${Date.now() - startTime}ms)`);

      const safetyRatings = response.candidates?.[0]?.safetyRatings?.map(rating => ({
        category: rating.category,
        probability: rating.probability,
      })) || [];

      return {
        story: text,
        metadata: {
          tokensUsed,
          modelUsed: this.MODEL_NAME,
          generatedAt: new Date(),
          safetyRatings,
        },
      };
    }, 'generateStory');
  }

  /**
   * Generate a chapter continuation for an ongoing story
   */
  public async generateChapterContinuation(options: GenerateChapterOptions): Promise<ChapterContinuationResult> {
    await this.checkRateLimit();

    const {
      previousChapter,
      characterState,
      recentActions,
      plotDirection = 'Continue the adventure with new challenges'
    } = options;

    const actionsDescription = recentActions
      .map((action, index) => `${index + 1}. ${action}`)
      .join('\n');

    const prompt = `You are a creative RPG storyteller. Continue this story with a new chapter.

Previous Chapter:
${previousChapter}

Current Character State:
- Name: ${characterState.name}
- Level: ${characterState.level}
- Class: ${characterState.class}
- Health: ${characterState.health}
- Mana: ${characterState.mana}

Recent Actions Taken:
${actionsDescription}

Plot Direction:
${plotDirection}

Requirements:
- Write a compelling continuation that builds on the previous chapter
- Incorporate the character's recent actions into the narrative
- Length: 200-300 words
- Use second person ("you") to address the character
- Create tension and excitement
- End with a cliffhanger or decision point

Generate the next chapter now:`;

    return this.retryWithBackoff(async () => {
      const startTime = Date.now();
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const tokensUsed = (response.usageMetadata?.totalTokenCount || 0);

      console.log(`Chapter continuation generated (${tokensUsed} tokens, ${Date.now() - startTime}ms)`);

      return {
        chapter: text,
        metadata: {
          tokensUsed,
          modelUsed: this.MODEL_NAME,
          generatedAt: new Date(),
        },
      };
    }, 'generateChapterContinuation');
  }

  /**
   * Generate contextual NPC dialogue
   */
  public async generateNPCDialogue(options: GenerateNPCDialogueOptions): Promise<NPCDialogueResult> {
    await this.checkRateLimit();

    const {
      npcName,
      npcRole,
      context,
      characterName,
      characterLevel,
      mood = 'neutral'
    } = options;

    const prompt = `You are creating dialogue for an NPC in an RPG game.

NPC Details:
- Name: ${npcName}
- Role: ${npcRole}
- Current Mood: ${mood}

Player Character:
- Name: ${characterName}
- Level: ${characterLevel}

Situation Context:
${context}

Requirements:
- Generate 2-4 lines of dialogue from ${npcName}
- Dialogue should match the NPC's role and mood
- Make it appropriate for the character's level
- Include personality and emotion
- Keep it concise and engaging
- Use quotation marks for spoken dialogue

Generate the NPC dialogue now:`;

    return this.retryWithBackoff(async () => {
      const startTime = Date.now();
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const tokensUsed = (response.usageMetadata?.totalTokenCount || 0);

      console.log(`NPC dialogue generated for ${npcName} (${tokensUsed} tokens, ${Date.now() - startTime}ms)`);

      return {
        dialogue: text,
        metadata: {
          tokensUsed,
          modelUsed: this.MODEL_NAME,
          generatedAt: new Date(),
        },
      };
    }, 'generateNPCDialogue');
  }

  /**
   * Moderate content using Gemini's safety features
   */
  public async moderateContent(options: ModerateContentOptions): Promise<ModerationResult> {
    await this.checkRateLimit();

    const { content, context = '' } = options;

    const prompt = `You are a content moderator for a family-friendly RPG game. Analyze the following content and determine if it's appropriate.

Content to Moderate:
${content}

${context ? `Context:\n${context}` : ''}

Evaluate for:
- Inappropriate language or profanity
- Violence beyond typical fantasy RPG themes
- Sexual content
- Harassment or bullying
- Hate speech
- Dangerous activities

Respond in this exact JSON format:
\`\`\`json
{
  "isAppropriate": true/false,
  "reason": "Brief explanation if not appropriate"
}
\`\`\``;

    return this.retryWithBackoff(async () => {
      const startTime = Date.now();
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const tokensUsed = (response.usageMetadata?.totalTokenCount || 0);

      // Extract JSON from response
      const moderationData = this.extractJsonFromMarkdown(text);
      
      // Default to blocking if parsing fails
      const isAppropriate = moderationData?.isAppropriate ?? false;
      const reason = moderationData?.reason;

      const safetyRatings = response.candidates?.[0]?.safetyRatings?.map(rating => ({
        category: rating.category,
        probability: rating.probability,
      })) || [];

      console.log(`Content moderated (${tokensUsed} tokens, ${Date.now() - startTime}ms) - Appropriate: ${isAppropriate}`);

      return {
        isAppropriate,
        reason,
        safetyRatings,
        metadata: {
          tokensUsed,
          modelUsed: this.MODEL_NAME,
          checkedAt: new Date(),
        },
      };
    }, 'moderateContent');
  }

  /**
   * Health check for the service
   */
  public async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: any }> {
    try {
      // Try a simple generation to check API connectivity
      const result = await this.model.generateContent('Say "OK" if you can read this.');
      const response = await result.response;
      const text = response.text();

      return {
        status: 'healthy',
        details: {
          model: this.MODEL_NAME,
          apiKeyConfigured: !!config.GEMINI_API_KEY,
          responseReceived: !!text,
          rateLimits: this.getRateLimitInfo(),
        },
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        details: {
          error: error.message,
          code: error.code,
          apiKeyConfigured: !!config.GEMINI_API_KEY,
        },
      };
    }
  }
}

// Export singleton instance
export const geminiService = new GeminiService();
export default geminiService;
