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

// Story Arc System Types
export interface MainStoryArc {
  id: string;
  title: string;
  description: string;
  currentChapter: number;
  totalChapters: number;
  worldState: WorldState;
  activeQuests: Quest[];
  unlockedChallenges: Challenge[];
  plotPoints: PlotPoint[];
}

export interface WorldState {
  location: string;
  timeOfDay: string;
  weatherCondition: string;
  npcsAvailable: NPC[];
  environmentalFactors: string[];
}

export interface NPC {
  name: string;
  role: string;
  personality: string;
  relationship: string;
  dialogue?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'main' | 'side' | 'daily' | 'challenge';
  status: 'available' | 'active' | 'completed' | 'failed';
  requirements: StatRequirements;
  rewards: QuestRewards;
  tasksTiedTo?: string[];
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'combat' | 'puzzle' | 'social' | 'exploration';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC';
  requirements: StatRequirements;
  enemy?: Enemy;
  rewards: QuestRewards;
  unlocked: boolean;
}

export interface StatRequirements {
  minLevel?: number;
  minStrength?: number;
  minWisdom?: number;
  minAgility?: number;
  minEndurance?: number;
  minLuck?: number;
  completedQuests?: string[];
}

export interface Enemy {
  name: string;
  level: number;
  stats: {
    health: number;
    attack: number;
    defense: number;
    speed: number;
  };
  weaknesses: string[];
  abilities: string[];
  loot: string[];
}

export interface QuestRewards {
  xp: number;
  gold?: number;
  items?: string[];
  statBoosts?: {
    strength?: number;
    wisdom?: number;
    agility?: number;
    endurance?: number;
    luck?: number;
  };
  unlocksQuest?: string;
  unlocksChallenge?: string;
  storyProgression?: boolean;
}

export interface PlotPoint {
  chapterId: number;
  event: string;
  timestamp: Date;
  choices: StoryChoice[];
  outcome?: string;
}

export interface StoryChoice {
  id: string;
  text: string;
  requirements?: StatRequirements;
  consequences: string;
  leadsToChapter?: number;
  affectsRelationship?: { npc: string; change: number };
}

export interface StoryGenerationContext {
  mainStoryArc: MainStoryArc;
  characterState: {
    characterName: string;
    level: number;
    stats: {
      strength: number;
      wisdom: number;
      agility: number;
      endurance: number;
      luck: number;
    };
    preferences?: any;
  };
  recentProgress: Array<{
    title: string;
    category: string;
    difficulty: string;
    streakCount: number;
  }>;
  pendingChallenges: Challenge[];
  worldState: WorldState;
  previousChoices: PlotPoint[];
}

export interface CombatResult {
  victory: boolean;
  playerHealth: number;
  enemyHealth: number;
  damageDealt: number;
  damageTaken: number;
  xpGained: number;
  lootObtained: string[];
  storyConsequence: string;
}

export interface StoryArcPreferences {
  theme?: string;
  setting?: string;
  plotFocus?: 'action' | 'mystery' | 'exploration' | 'character';
  estimatedChapters?: number;
}
