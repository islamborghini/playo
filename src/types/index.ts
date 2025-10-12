import { Request, Response } from 'express';
import type { 
  User, 
  Task, 
  StoryProgression,
  CompletedTask,
  CharacterInventory,
  AIGenerationLog,
  TaskType,
  TaskDifficulty,
  ItemType,
  PrismaClient
} from '@/generated/prisma';

// Re-export Prisma types for convenience
export type { 
  User, 
  Task, 
  StoryProgression,
  CompletedTask,
  CharacterInventory,
  AIGenerationLog,
  TaskType,
  TaskDifficulty,
  ItemType,
  PrismaClient
};

// Base API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: unknown;
}

// Express Request/Response types with authentication
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    level: number;
    characterName: string;
  };
}

export type TypedResponse<T = unknown> = Response<ApiResponse<T>>;

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  characterName: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
}

// Task creation/update types
export interface CreateTaskRequest {
  title: string;
  description?: string;
  type: TaskType;
  difficulty: TaskDifficulty;
  category: string;
  recurrenceRule?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  difficulty?: TaskDifficulty;
  category?: string;
  recurrenceRule?: string;
  isActive?: boolean;
}

// Story types
export interface StoryGenerationRequest {
  userPreferences: Record<string, unknown>;
  completedTasks: string[];
  currentChapter: number;
  previousChoices: string[];
}

export interface StoryContent {
  title: string;
  content: string;
  choices: string[];
  xpReward: number;
  itemRewards?: string[];
}

// Character progression types
export interface CharacterStats {
  strength: number;
  wisdom: number;
  agility: number;
  endurance: number;
  luck: number;
}

export interface UserPreferences {
  storyGenre: string;
  difficulty: string;
  notifications: boolean;
  theme: string;
}

// Validation error type
export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

// AI Generation types
export interface AIGenerationRequest {
  prompt: string;
  purpose: string;
  modelPreference?: string;
}

export interface AIGenerationResponse {
  content: string;
  tokensUsed: number;
  cost: number;
  generationTime: number;
}

export default {};