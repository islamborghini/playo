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
  private readonly MODEL_NAME = 'gemini-2.5-flash'; // Using Gemini 2.5 Flash
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

  // ============================================================================
  // HYBRID STORY SYSTEM - Main Story Arc + Task Integration + Challenges
  // ============================================================================

  /**
   * Generate a complete main story arc with branching paths and challenges
   * 
   * Creates a 10-chapter narrative with:
   * - Main quests tied to real-life tasks
   * - Side quests for variety
   * - Combat challenges unlocked by stat requirements
   * - Dynamic world state that evolves
   * - Multiple story branches based on player choices
   * 
   * @param options Story arc preferences (theme, setting, plotFocus)
   * @param characterState Current character information
   * @returns Complete MainStoryArc with quests, challenges, and world state
   */
  public async generateMainStoryArc(
    options: {
      characterName: string;
      characterLevel: number;
      characterClass: string;
      theme?: string;
      setting?: string;
      plotFocus?: 'action' | 'mystery' | 'exploration' | 'character';
    }
  ): Promise<any> {
    await this.checkRateLimit();

    const { characterName, characterLevel, characterClass, theme, setting, plotFocus } = options;

    const prompt = `You are a master RPG storyteller creating an epic 10-chapter story arc for a habit-tracking game.

CHARACTER INFORMATION:
- Name: ${characterName}
- Level: ${characterLevel}
- Class: ${characterClass}

STORY PREFERENCES:
- Theme: ${theme || 'Epic Fantasy Adventure'}
- Setting: ${setting || 'Medieval Fantasy World'}
- Plot Focus: ${plotFocus || 'balanced mix'}

TASK: Create a complete story arc with the following structure in JSON format:

\`\`\`json
{
  "id": "unique-arc-id",
  "title": "Epic arc title",
  "description": "Brief overview of the arc",
  "totalChapters": 10,
  "worldState": {
    "location": "Starting location",
    "timeOfDay": "morning/afternoon/evening/night",
    "weatherCondition": "clear/rainy/stormy/foggy",
    "npcsAvailable": [
      {
        "name": "NPC Name",
        "role": "mentor/merchant/quest-giver/villain",
        "personality": "Brief personality description",
        "relationship": "ally/neutral/enemy"
      }
    ],
    "environmentalFactors": ["factor1", "factor2"]
  },
  "chapters": [
    {
      "chapterNumber": 1,
      "title": "Chapter title",
      "content": "Opening chapter narrative (300-500 words). Start with an exciting hook that introduces the world and conflict.",
      "choices": [
        {
          "id": "choice-1-a",
          "text": "Choice description",
          "consequences": "What happens if chosen",
          "leadsToChapter": 2
        }
      ]
    }
  ],
  "mainQuests": [
    {
      "id": "quest-1",
      "title": "Quest title",
      "description": "Quest objective",
      "type": "main",
      "requirements": {
        "minLevel": 1
      },
      "rewards": {
        "xp": 100,
        "gold": 50,
        "items": ["Reward item"],
        "storyProgression": true
      },
      "tasksTiedTo": ["Complete 3 daily habits", "Achieve 7-day streak"]
    }
  ],
  "challenges": [
    {
      "id": "challenge-1",
      "title": "Challenge title",
      "description": "Challenge description",
      "type": "combat",
      "difficulty": "MEDIUM",
      "requirements": {
        "minLevel": 3,
        "minStrength": 5
      },
      "enemy": {
        "name": "Enemy name",
        "level": 3,
        "stats": {
          "health": 100,
          "attack": 15,
          "defense": 10,
          "speed": 12
        },
        "weaknesses": ["fire", "holy"],
        "abilities": ["Slash", "Block"],
        "loot": ["Enemy weapon", "Gold coins"]
      },
      "rewards": {
        "xp": 200,
        "gold": 100,
        "items": ["Epic reward"]
      },
      "unlocked": false
    }
  ]
}
\`\`\`

REQUIREMENTS:
1. Create ALL 10 chapters with engaging narratives
2. Each chapter should be 300-500 words
3. Include 2-3 choices per chapter that branch the story
4. Create 5-7 main quests tied to real-life habit completion
5. Include 3-5 combat challenges with proper stat requirements
6. Make the story personal to ${characterName} as a ${characterClass}
7. Build tension and excitement throughout
8. Ensure choices have meaningful consequences
9. Balance difficulty progression (challenges get harder)
10. Create memorable NPCs that players will care about

Generate the complete JSON now:`;

    return this.retryWithBackoff(async () => {
      const startTime = Date.now();
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const tokensUsed = (response.usageMetadata?.totalTokenCount || 0);

      const arcData = this.extractJsonFromMarkdown(text);
      
      console.log(`Main story arc generated (${tokensUsed} tokens, ${Date.now() - startTime}ms)`);

      return {
        ...arcData,
        currentChapter: 1,
        metadata: {
          tokensUsed,
          modelUsed: this.MODEL_NAME,
          generatedAt: new Date(),
        },
      };
    }, 'generateMainStoryArc');
  }

  /**
   * Generate the next chapter based on player progress and choices
   * 
   * This method creates dynamic story continuation that reflects:
   * - Tasks the player has completed
   * - Stats and level progression
   * - Previous story choices
   * - Current world state
   * - Unlocked challenges
   * 
   * @param context Complete story generation context
   * @returns Next chapter with updated world state and new choices
   */
  public async generateNextChapter(context: any): Promise<any> {
    await this.checkRateLimit();

    const { mainStoryArc, characterState, recentProgress, previousChoices } = context;

    const completedTasksSummary = recentProgress
      .map((task: any) => `- ${task.title} (${task.category}, streak: ${task.streakCount})`)
      .join('\n');

    const previousChoicesSummary = previousChoices
      .slice(-3)
      .map((choice: any) => `Chapter ${choice.chapterId}: ${choice.event} -> ${choice.outcome}`)
      .join('\n');

    const prompt = `You are continuing an epic RPG story for ${characterState.characterName}.

CURRENT STORY STATE:
Arc Title: ${mainStoryArc.title}
Current Chapter: ${mainStoryArc.currentChapter}
Location: ${mainStoryArc.worldState.location}

CHARACTER PROGRESS:
- Level: ${characterState.level}
- Stats: STR ${characterState.stats.strength}, WIS ${characterState.stats.wisdom}, AGI ${characterState.stats.agility}

RECENT REAL-LIFE ACCOMPLISHMENTS (reflect these in the story):
${completedTasksSummary}

PREVIOUS STORY CHOICES:
${previousChoicesSummary}

TASK: Generate the next chapter that:
1. Acknowledges the player's real-life progress (completed tasks = character power growth)
2. Continues the main narrative arc
3. Reflects previous choices
4. Introduces new challenges or quests
5. Advances the plot meaningfully

Respond in JSON format:
\`\`\`json
{
  "chapterNumber": ${mainStoryArc.currentChapter + 1},
  "title": "Chapter title",
  "content": "Chapter narrative (400-600 words). Reference the player's real achievements and integrate them into the story.",
  "worldState": {
    "location": "Updated location if moved",
    "timeOfDay": "current time",
    "weatherCondition": "current weather",
    "environmentalFactors": ["updated factors"]
  },
  "choices": [
    {
      "id": "choice-id",
      "text": "Choice description",
      "requirements": {
        "minLevel": ${characterState.level}
      },
      "consequences": "What happens",
      "leadsToChapter": ${mainStoryArc.currentChapter + 2}
    }
  ],
  "newQuestsUnlocked": [
    {
      "id": "quest-id",
      "title": "New quest",
      "description": "Quest description",
      "requirements": {
        "minLevel": ${characterState.level}
      },
      "tasksTiedTo": ["Real-life habit example"]
    }
  ],
  "challengesUnlocked": []
}
\`\`\``;

    return this.retryWithBackoff(async () => {
      const startTime = Date.now();
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const tokensUsed = (response.usageMetadata?.totalTokenCount || 0);

      const chapterData = this.extractJsonFromMarkdown(text);
      
      console.log(`Next chapter generated (${tokensUsed} tokens, ${Date.now() - startTime}ms)`);

      return {
        ...chapterData,
        metadata: {
          tokensUsed,
          modelUsed: this.MODEL_NAME,
          generatedAt: new Date(),
        },
      };
    }, 'generateNextChapter');
  }

  /**
   * Check if a challenge can be attempted based on character stats
   * 
   * @param challenge Challenge to check
   * @param characterState Current character state
   * @returns Object with canAttempt boolean and reason if locked
   */
  public checkChallengeReadiness(challenge: any, characterState: any): { canAttempt: boolean; reason?: string } {
    const { requirements } = challenge;
    const { level, stats } = characterState;

    if (requirements.minLevel && level < requirements.minLevel) {
      return { canAttempt: false, reason: `Requires level ${requirements.minLevel} (you are level ${level})` };
    }

    if (requirements.minStrength && stats.strength < requirements.minStrength) {
      return { canAttempt: false, reason: `Requires ${requirements.minStrength} strength (you have ${stats.strength})` };
    }

    if (requirements.minWisdom && stats.wisdom < requirements.minWisdom) {
      return { canAttempt: false, reason: `Requires ${requirements.minWisdom} wisdom (you have ${stats.wisdom})` };
    }

    if (requirements.minAgility && stats.agility < requirements.minAgility) {
      return { canAttempt: false, reason: `Requires ${requirements.minAgility} agility (you have ${stats.agility})` };
    }

    if (requirements.minEndurance && stats.endurance < requirements.minEndurance) {
      return { canAttempt: false, reason: `Requires ${requirements.minEndurance} endurance (you have ${stats.endurance})` };
    }

    if (requirements.minLuck && stats.luck < requirements.minLuck) {
      return { canAttempt: false, reason: `Requires ${requirements.minLuck} luck (you have ${stats.luck})` };
    }

    return { canAttempt: true };
  }

  /**
   * Simulate combat between player and enemy
   * 
   * Uses character stats vs enemy stats to determine outcome
   * Includes randomness and strategy elements
   * 
   * @param characterState Player stats
   * @param enemy Enemy stats
   * @returns Combat result with damage, xp, loot
   */
  public simulateCombat(characterState: any, enemy: any): any {
    const playerStats = characterState.stats;
    const enemyStats = enemy.stats;

    // Calculate effective combat stats
    const playerAttack = playerStats.strength + (playerStats.agility * 0.5);
    const playerDefense = playerStats.endurance + (playerStats.agility * 0.3);
    const playerSpeed = playerStats.agility;
    const playerLuck = playerStats.luck || 5;

    const enemyAttack = enemyStats.attack;
    const enemyDefense = enemyStats.defense;
    const enemySpeed = enemyStats.speed;

    // Determine who attacks first
    const playerGoesFirst = playerSpeed >= enemySpeed;

    // Combat simulation (simplified turn-based)
    let playerHealth = 100;
    let enemyHealth = enemyStats.health;
    let damageDealt = 0;
    let damageTaken = 0;
    let rounds = 0;

    while (playerHealth > 0 && enemyHealth > 0 && rounds < 20) {
      rounds++;

      if (playerGoesFirst || rounds % 2 === 1) {
        // Player's turn
        const baseDamage = playerAttack - (enemyDefense * 0.5);
        const critChance = playerLuck / 100;
        const isCrit = Math.random() < critChance;
        const damage = Math.max(5, Math.floor(baseDamage * (isCrit ? 2 : 1) * (0.8 + Math.random() * 0.4)));
        
        enemyHealth -= damage;
        damageDealt += damage;
      }

      if (enemyHealth > 0) {
        // Enemy's turn
        const baseDamage = enemyAttack - (playerDefense * 0.5);
        const damage = Math.max(3, Math.floor(baseDamage * (0.8 + Math.random() * 0.4)));
        
        playerHealth -= damage;
        damageTaken += damage;
      }
    }

    const victory = enemyHealth <= 0 && playerHealth > 0;
    const xpGained = victory ? Math.floor(enemy.level * 50 * (1 + (enemy.stats.health / 100))) : 0;
    const lootObtained = victory ? enemy.loot : [];

    return {
      victory,
      playerHealth: Math.max(0, playerHealth),
      enemyHealth: Math.max(0, enemyHealth),
      damageDealt,
      damageTaken,
      rounds,
      xpGained,
      lootObtained,
      storyConsequence: victory 
        ? `You have defeated ${enemy.name}! Your victory will be remembered.`
        : `${enemy.name} has bested you in combat. Perhaps you need more training...`
    };
  }

  /**
   * Generate an exciting combat narrative based on combat results
   * 
   * @param combatResult Result from simulateCombat
   * @param characterName Player's name
   * @param enemy Enemy that was fought
   * @returns Engaging narrative description of the combat
   */
  public async generateCombatNarrative(
    combatResult: any,
    characterName: string,
    enemy: any
  ): Promise<string> {
    await this.checkRateLimit();

    const prompt = `You are a master combat narrator for an RPG game. Describe this epic battle:

COMBATANTS:
- Hero: ${characterName}
- Enemy: ${enemy.name} (Level ${enemy.level})

COMBAT RESULTS:
- Victor: ${combatResult.victory ? characterName : enemy.name}
- Rounds: ${combatResult.rounds}
- Damage Dealt by ${characterName}: ${combatResult.damageDealt}
- Damage Taken by ${characterName}: ${combatResult.damageTaken}
- Final HP: ${characterName} = ${combatResult.playerHealth}, ${enemy.name} = ${combatResult.enemyHealth}

Write an exciting 200-300 word combat narrative that:
1. Describes the tension and stakes
2. Highlights key moments and turning points
3. Includes specific actions and reactions
4. Makes the reader feel the intensity
5. Ends with the outcome and consequences

Write ONLY the narrative, no JSON:`;

    return this.retryWithBackoff(async () => {
      const startTime = Date.now();
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const tokensUsed = (response.usageMetadata?.totalTokenCount || 0);

      console.log(`Combat narrative generated (${tokensUsed} tokens, ${Date.now() - startTime}ms)`);

      return text.trim();
    }, 'generateCombatNarrative');
  }
}

// Export singleton instance
export const geminiService = new GeminiService();
export default geminiService;
