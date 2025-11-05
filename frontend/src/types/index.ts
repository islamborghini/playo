/**
 * TypeScript Type Definitions for Playo Frontend
 */

// ============================================
// USER & AUTH TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  username: string;
  characterName: string;
  level: number;
  xp: number;
  stats: CharacterStats;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterStats {
  strength: number;
  wisdom: number;
  agility: number;
  endurance: number;
  luck: number;
  charisma: number;
}

export interface UserPreferences {
  theme?: 'dark' | 'light';
  notifications?: boolean;
  soundEffects?: boolean;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  characterName: string;
}

// ============================================
// TASK TYPES
// ============================================

export type TaskType = 'DAILY' | 'HABIT' | 'TODO';
export type TaskDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: TaskType;
  difficulty: TaskDifficulty;
  category: string;
  recurrenceRule?: string;
  streakCount: number;
  lastCompleted?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  type: TaskType;
  difficulty: TaskDifficulty;
  category: string;
  recurrenceRule?: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  active: number;
  streak: number;
  xpEarned: number;
}

export interface CompleteTaskResponse {
  success: boolean;
  data: {
    task: Task;
    xpGained: number;
    newLevel?: number;
    leveledUp: boolean;
  };
  message: string;
}

// ============================================
// STORY TYPES
// ============================================

export interface Story {
  id: string;
  userId: string;
  title: string;
  description?: string;
  content: string;
  currentChapter: number;
  totalChapters: number;
  chapterData: ChapterData;
  branchesTaken: string[];
  activeQuests: Quest[];
  unlockedChallenges: Challenge[];
  worldState: Record<string, any>;
  isActive: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChapterData {
  chapterNumber: number;
  title: string;
  content: string;
  choices?: Choice[];
  questsUnlocked?: string[];
  challengesUnlocked?: string[];
}

export interface Choice {
  id: string;
  text: string;
  consequence: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  taskRequirements: TaskRequirement[];
  completed: boolean;
  reward: Reward;
}

export interface TaskRequirement {
  taskType: TaskType;
  count: number;
  difficulty?: TaskDifficulty;
}

export interface Reward {
  xp: number;
  items?: string[];
  gold?: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC';
  statRequirements: Partial<CharacterStats>;
  completed: boolean;
  reward: Reward;
}

export interface CreateStoryData {
  characterName: string;
  characterLevel: number;
  characterClass: string;
}

// ============================================
// CHARACTER & INVENTORY TYPES
// ============================================

export type ItemType = 'WEAPON' | 'ARMOR' | 'ACCESSORY' | 'CONSUMABLE' | 'QUEST_ITEM' | 'COSMETIC';
export type ItemRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface InventoryItem {
  id: string;
  userId: string;
  itemId: string;
  itemName: string;
  itemType: ItemType;
  equipped: boolean;
  quantity: number;
  metadata: ItemMetadata;
  obtainedAt: string;
}

export interface ItemMetadata {
  rarity: ItemRarity;
  description?: string;
  stats?: Partial<CharacterStats>;
  effectDescription?: string;
}

export interface CharacterProfile {
  user: User;
  inventory: InventoryItem[];
  equippedItems: InventoryItem[];
  totalXP: number;
  nextLevelXP: number;
  completedTasks: number;
  currentStreak: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message: string;
}

// ============================================
// UI COMPONENT TYPES
// ============================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
