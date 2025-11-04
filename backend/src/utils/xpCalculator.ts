import { TaskDifficulty } from '@/generated/prisma';

// Base XP values for each difficulty level
export const BASE_XP_VALUES = {
  [TaskDifficulty.EASY]: 10,
  [TaskDifficulty.MEDIUM]: 25,
  [TaskDifficulty.HARD]: 50,
} as const;

// Task category to stat mapping
export const TASK_CATEGORY_STATS = {
  fitness: 'strength',
  learning: 'wisdom',
  creative: 'wisdom',
  social: 'agility',
  productivity: 'endurance',
  mindfulness: 'wisdom',
  health: 'endurance',
  skills: 'wisdom',
  work: 'endurance',
  hobby: 'agility',
} as const;

// RPG constants
export const RPG_CONSTANTS = {
  STREAK_MULTIPLIER_INTERVAL: 5, // Apply multiplier every 5 days
  STREAK_MULTIPLIER_RATE: 1.1, // 1.1x multiplier per interval
  MAX_STREAK_MULTIPLIER: 2.0, // Maximum 2x multiplier
  LEVEL_XP_BASE: 100, // Base XP for level calculation
  STAT_BONUS_PER_CATEGORY: 1, // Stat points gained per category completion
} as const;

export interface XPCalculationResult {
  baseXP: number;
  streakMultiplier: number;
  finalXP: number;
  totalXPAfter: number;
  levelBefore: number;
  levelAfter: number;
  leveledUp: boolean;
  xpForNextLevel: number;
  statBonuses: StatBonuses;
}

export interface StatBonuses {
  strength?: number;
  wisdom?: number;
  agility?: number;
  endurance?: number;
  luck?: number;
}

export interface UserStats {
  strength: number;
  wisdom: number;
  agility: number;
  endurance: number;
  luck: number;
}

export class XPCalculator {
  /**
   * Calculate XP for task completion with all bonuses
   */
  static calculateTaskXP(
    difficulty: TaskDifficulty,
    streakCount: number,
    currentTotalXP: number,
    taskCategory: string
  ): XPCalculationResult {
    // Get base XP for difficulty
    const baseXP = this.getBaseXP(difficulty);
    
    // Calculate streak multiplier
    const streakMultiplier = this.calculateStreakMultiplier(streakCount);
    
    // Apply multiplier to get final XP
    const finalXP = Math.floor(baseXP * streakMultiplier);
    
    // Calculate levels
    const levelBefore = this.calculateLevel(currentTotalXP);
    const totalXPAfter = currentTotalXP + finalXP;
    const levelAfter = this.calculateLevel(totalXPAfter);
    const leveledUp = levelAfter > levelBefore;
    
    // Calculate XP needed for next level
    const xpForNextLevel = this.calculateXPForNextLevel(totalXPAfter);
    
    // Calculate stat bonuses
    const statBonuses = this.calculateStatBonuses(taskCategory, finalXP);
    
    return {
      baseXP,
      streakMultiplier,
      finalXP,
      totalXPAfter,
      levelBefore,
      levelAfter,
      leveledUp,
      xpForNextLevel,
      statBonuses,
    };
  }

  /**
   * Get base XP for task difficulty
   */
  static getBaseXP(difficulty: TaskDifficulty): number {
    return BASE_XP_VALUES[difficulty];
  }

  /**
   * Calculate streak multiplier based on streak count
   * 1.1x per 5-day streak, max 2x
   */
  static calculateStreakMultiplier(streakCount: number): number {
    if (streakCount < RPG_CONSTANTS.STREAK_MULTIPLIER_INTERVAL) {
      return 1.0;
    }
    
    const streakIntervals = Math.floor(streakCount / RPG_CONSTANTS.STREAK_MULTIPLIER_INTERVAL);
    const multiplier = Math.pow(RPG_CONSTANTS.STREAK_MULTIPLIER_RATE, streakIntervals);
    
    return Math.min(multiplier, RPG_CONSTANTS.MAX_STREAK_MULTIPLIER);
  }

  /**
   * Calculate level from total XP using exponential curve
   * Formula: level = floor(sqrt(xp / 100))
   */
  static calculateLevel(totalXP: number): number {
    if (totalXP < 0) return 1;
    return Math.floor(Math.sqrt(totalXP / RPG_CONSTANTS.LEVEL_XP_BASE)) + 1;
  }

  /**
   * Calculate XP needed for next level
   */
  static calculateXPForNextLevel(currentTotalXP: number): number {
    const currentLevel = this.calculateLevel(currentTotalXP);
    const nextLevel = currentLevel + 1;
    
    // Calculate XP required for next level: (level - 1)^2 * 100
    const xpRequiredForNextLevel = Math.pow(nextLevel - 1, 2) * RPG_CONSTANTS.LEVEL_XP_BASE;
    
    return xpRequiredForNextLevel - currentTotalXP;
  }

  /**
   * Calculate XP required for a specific level
   */
  static calculateXPRequiredForLevel(level: number): number {
    if (level <= 1) return 0;
    return Math.pow(level - 1, 2) * RPG_CONSTANTS.LEVEL_XP_BASE;
  }

  /**
   * Calculate stat bonuses based on task category
   */
  static calculateStatBonuses(taskCategory: string, xpGained: number): StatBonuses {
    const category = taskCategory.toLowerCase();
    const statType = TASK_CATEGORY_STATS[category as keyof typeof TASK_CATEGORY_STATS];
    
    if (!statType) {
      return {};
    }
    
    // Calculate stat bonus based on XP gained (1 point per 25 XP)
    const bonusPoints = Math.floor(xpGained / 25);
    
    if (bonusPoints <= 0) {
      return {};
    }
    
    return {
      [statType]: bonusPoints,
    } as StatBonuses;
  }

  /**
   * Apply stat bonuses to user stats
   */
  static applyStatBonuses(currentStats: UserStats, bonuses: StatBonuses): UserStats {
    return {
      strength: currentStats.strength + (bonuses.strength || 0),
      wisdom: currentStats.wisdom + (bonuses.wisdom || 0),
      agility: currentStats.agility + (bonuses.agility || 0),
      endurance: currentStats.endurance + (bonuses.endurance || 0),
      luck: currentStats.luck + (bonuses.luck || 0),
    };
  }

  /**
   * Get level progression info
   */
  static getLevelProgressionInfo(totalXP: number): {
    currentLevel: number;
    xpInCurrentLevel: number;
    xpRequiredForCurrentLevel: number;
    xpRequiredForNextLevel: number;
    progressToNextLevel: number;
  } {
    const currentLevel = this.calculateLevel(totalXP);
    const xpRequiredForCurrentLevel = this.calculateXPRequiredForLevel(currentLevel);
    const xpRequiredForNextLevel = this.calculateXPRequiredForLevel(currentLevel + 1);
    const xpInCurrentLevel = totalXP - xpRequiredForCurrentLevel;
    const xpNeededForNextLevel = xpRequiredForNextLevel - xpRequiredForCurrentLevel;
    const progressToNextLevel = xpNeededForNextLevel > 0 ? (xpInCurrentLevel / xpNeededForNextLevel) * 100 : 100;

    return {
      currentLevel,
      xpInCurrentLevel,
      xpRequiredForCurrentLevel,
      xpRequiredForNextLevel,
      progressToNextLevel: Math.min(progressToNextLevel, 100),
    };
  }

  /**
   * Simulate XP gain for planning purposes
   */
  static simulateXPGain(
    difficulty: TaskDifficulty,
    streakCount: number,
    currentTotalXP: number,
    taskCategory: string,
    completionsCount: number = 1
  ): XPCalculationResult[] {
    const results: XPCalculationResult[] = [];
    let runningXP = currentTotalXP;
    let runningStreak = streakCount;

    for (let i = 0; i < completionsCount; i++) {
      const result = this.calculateTaskXP(difficulty, runningStreak, runningXP, taskCategory);
      results.push(result);
      
      runningXP = result.totalXPAfter;
      runningStreak += 1;
    }

    return results;
  }

  /**
   * Get streak milestone info
   */
  static getStreakMilestones(currentStreak: number): {
    currentMultiplier: number;
    nextMilestone: number;
    streaksToNextMilestone: number;
    nextMultiplier: number;
    isAtMaxMultiplier: boolean;
  } {
    const currentMultiplier = this.calculateStreakMultiplier(currentStreak);
    const isAtMaxMultiplier = currentMultiplier >= RPG_CONSTANTS.MAX_STREAK_MULTIPLIER;
    
    if (isAtMaxMultiplier) {
      return {
        currentMultiplier,
        nextMilestone: currentStreak,
        streaksToNextMilestone: 0,
        nextMultiplier: currentMultiplier,
        isAtMaxMultiplier: true,
      };
    }

    const nextMilestone = Math.ceil(currentStreak / RPG_CONSTANTS.STREAK_MULTIPLIER_INTERVAL) * RPG_CONSTANTS.STREAK_MULTIPLIER_INTERVAL;
    const streaksToNextMilestone = nextMilestone - currentStreak;
    const nextMultiplier = this.calculateStreakMultiplier(nextMilestone);

    return {
      currentMultiplier,
      nextMilestone,
      streaksToNextMilestone,
      nextMultiplier: Math.min(nextMultiplier, RPG_CONSTANTS.MAX_STREAK_MULTIPLIER),
      isAtMaxMultiplier: false,
    };
  }

  /**
   * Calculate total stats from task category completions
   */
  static calculateStatsFromCategories(categoryCompletions: Record<string, number>): UserStats {
    const baseStats: UserStats = {
      strength: 5,
      wisdom: 5,
      agility: 5,
      endurance: 5,
      luck: 5,
    };

    Object.entries(categoryCompletions).forEach(([category, completions]) => {
      const statType = TASK_CATEGORY_STATS[category.toLowerCase() as keyof typeof TASK_CATEGORY_STATS];
      if (statType && completions > 0) {
        const bonusPoints = Math.floor(completions / 5); // 1 stat point per 5 completions
        (baseStats as any)[statType] += bonusPoints;
      }
    });

    return baseStats;
  }
}