/**
 * Type definitions for Google Gemini AI story generation service
 */

export interface GenerateStoryOptions {
  userId: number;
  characterName: string;
  characterLevel: number;
  characterClass: string;
  recentTasks: Array<{
    title: string;
    description: string;
    category: string;
    difficulty: number;
    completedAt?: Date;
  }>;
  tone?: 'epic' | 'humorous' | 'dark' | 'inspirational' | 'casual';
  length?: 'short' | 'medium' | 'long';
}

export interface GenerateChapterOptions {
  userId: number;
  previousChapter: string;
  characterState: {
    name: string;
    level: number;
    class: string;
    health: number;
    mana: number;
  };
  recentActions: string[];
  plotDirection?: string;
}

export interface GenerateNPCDialogueOptions {
  npcName: string;
  npcRole: string;
  context: string;
  characterName: string;
  characterLevel: number;
  mood?: 'friendly' | 'hostile' | 'neutral' | 'mysterious' | 'urgent';
}

export interface ModerateContentOptions {
  content: string;
  context?: string;
}

export interface StoryGenerationResult {
  story: string;
  metadata: {
    tokensUsed: number;
    modelUsed: string;
    generatedAt: Date;
    safetyRatings?: Array<{
      category: string;
      probability: string;
    }>;
  };
}

export interface ChapterContinuationResult {
  chapter: string;
  metadata: {
    tokensUsed: number;
    modelUsed: string;
    generatedAt: Date;
  };
}

export interface NPCDialogueResult {
  dialogue: string;
  metadata: {
    tokensUsed: number;
    modelUsed: string;
    generatedAt: Date;
  };
}

export interface ModerationResult {
  isAppropriate: boolean;
  reason?: string;
  safetyRatings: Array<{
    category: string;
    probability: string;
  }>;
  metadata: {
    tokensUsed: number;
    modelUsed: string;
    checkedAt: Date;
  };
}

export interface RateLimitInfo {
  requestsThisMinute: number;
  requestsToday: number;
  resetAtMinute: Date;
  resetAtDay: Date;
}

export interface GeminiError {
  code: string;
  message: string;
  status: number | undefined;
  retryable: boolean;
}
