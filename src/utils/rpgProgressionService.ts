import { XPCalculator, StatBonuses } from './xpCalculator';
import { TaskDifficulty } from '@/generated/prisma';
import prisma from './prisma';

export interface TaskCompletionResult {
  xpGained: number;
  levelBefore: number;
  levelAfter: number;
  leveledUp: boolean;
  statBonuses: StatBonuses;
  streakMultiplier: number;
  newStreak: number;
}

interface UserStats {
  strength: number;
  wisdom: number;
  agility: number;
  endurance: number;
  luck: number;
  currentStreak?: number;
  lastActiveDate?: Date;
}

export class RPGProgressionService {
  /**
   * Complete a task and update user progression
   */
  static async completeTaskWithProgression(
    userId: string,
    taskId: string,
    difficulty: TaskDifficulty,
    category: string
  ): Promise<TaskCompletionResult> {
    // Get current user stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        xp: true,
        level: true,
        stats: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Parse user stats from JSON
    const userStats: UserStats = user.stats ? JSON.parse(user.stats) : {
      strength: 5,
      wisdom: 5,
      agility: 5,
      endurance: 5,
      luck: 5,
      currentStreak: 0,
    };

    // Calculate XP and progression
    const result = XPCalculator.calculateTaskXP(
      difficulty,
      userStats.currentStreak || 0,
      user.xp || 0,
      category
    );

    // Update user stats with bonuses
    const newStats = XPCalculator.applyStatBonuses(
      {
        strength: userStats.strength || 5,
        wisdom: userStats.wisdom || 5,
        agility: userStats.agility || 5,
        endurance: userStats.endurance || 5,
        luck: userStats.luck || 5,
      },
      result.statBonuses
    );

    // Update stats object
    const updatedStats: UserStats = {
      ...newStats,
      currentStreak: (userStats.currentStreak || 0) + 1,
      lastActiveDate: new Date(),
    };

    // Update user in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: result.totalXPAfter,
        level: result.levelAfter,
        stats: JSON.stringify(updatedStats),
        updatedAt: new Date(),
      },
    });

    // Create completed task record
    await prisma.completedTask.create({
      data: {
        userId,
        taskId,
        xpGained: result.finalXP,
        completedAt: new Date(),
      },
    });

    return {
      xpGained: result.finalXP,
      levelBefore: result.levelBefore,
      levelAfter: result.levelAfter,
      leveledUp: result.leveledUp,
      statBonuses: result.statBonuses,
      streakMultiplier: result.streakMultiplier,
      newStreak: (userStats.currentStreak || 0) + 1,
    };
  }

  /**
   * Get detailed user progression stats
   */
  static async getUserProgressionStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        xp: true,
        level: true,
        stats: true,
        username: true,
        characterName: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Parse user stats from JSON
    const userStats: UserStats = user.stats ? JSON.parse(user.stats) : {
      strength: 5,
      wisdom: 5,
      agility: 5,
      endurance: 5,
      luck: 5,
      currentStreak: 0,
    };

    const progression = XPCalculator.getLevelProgressionInfo(user.xp || 0);
    const streakInfo = XPCalculator.getStreakMilestones(userStats.currentStreak || 0);

    // Get task completion stats by category
    const categoryStats = await prisma.completedTask.groupBy({
      by: ['taskId'],
      where: { userId },
      _count: { taskId: true },
    });

    // Get tasks to determine categories
    const taskIds = categoryStats.map(stat => stat.taskId);
    const tasks = await prisma.task.findMany({
      where: { id: { in: taskIds } },
      select: { id: true, category: true },
    });

    const categoryCompletions: Record<string, number> = {};
    categoryStats.forEach(stat => {
      const task = tasks.find(t => t.id === stat.taskId);
      if (task) {
        categoryCompletions[task.category] = (categoryCompletions[task.category] || 0) + stat._count.taskId;
      }
    });

    return {
      username: user.username,
      characterName: user.characterName,
      level: user.level || 1,
      totalXP: user.xp || 0,
      currentStreak: userStats.currentStreak || 0,
      stats: {
        strength: userStats.strength || 5,
        wisdom: userStats.wisdom || 5,
        agility: userStats.agility || 5,
        endurance: userStats.endurance || 5,
        luck: userStats.luck || 5,
      },
      progression: {
        currentLevel: progression.currentLevel,
        xpInCurrentLevel: progression.xpInCurrentLevel,
        xpRequiredForNextLevel: progression.xpRequiredForNextLevel,
        progressToNextLevel: progression.progressToNextLevel,
      },
      streak: {
        current: userStats.currentStreak || 0,
        multiplier: streakInfo.currentMultiplier,
        nextMilestone: streakInfo.nextMilestone,
        streaksToNextMilestone: streakInfo.streaksToNextMilestone,
        nextMultiplier: streakInfo.nextMultiplier,
        isAtMaxMultiplier: streakInfo.isAtMaxMultiplier,
      },
      categoryCompletions,
    };
  }

  /**
   * Simulate task completion for planning
   */
  static async simulateTaskCompletion(
    userId: string,
    difficulty: TaskDifficulty,
    category: string,
    completions: number = 1
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        xp: true,
        stats: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const userStats: UserStats = user.stats ? JSON.parse(user.stats) : {
      strength: 5,
      wisdom: 5,
      agility: 5,
      endurance: 5,
      luck: 5,
      currentStreak: 0,
    };

    return XPCalculator.simulateXPGain(
      difficulty,
      userStats.currentStreak || 0,
      user.xp || 0,
      category,
      completions
    );
  }

  /**
   * Calculate XP bonus for special events or achievements
   */
  static calculateEventBonus(baseXP: number, eventMultiplier: number = 1.5): number {
    return Math.floor(baseXP * eventMultiplier);
  }

  /**
   * Get leaderboard data with RPG stats
   */
  static async getLeaderboard(limit: number = 10) {
    const topUsers = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        characterName: true,
        level: true,
        xp: true,
        stats: true,
      },
      orderBy: [
        { level: 'desc' },
        { xp: 'desc' },
      ],
      take: limit,
    });

    return topUsers.map(user => {
      const userStats: UserStats = user.stats ? JSON.parse(user.stats) : {
        strength: 5,
        wisdom: 5,
        agility: 5,
        endurance: 5,
        luck: 5,
        currentStreak: 0,
      };

      return {
        id: user.id,
        username: user.username,
        characterName: user.characterName,
        level: user.level,
        totalXP: user.xp,
        currentStreak: userStats.currentStreak || 0,
        stats: {
          strength: userStats.strength || 5,
          wisdom: userStats.wisdom || 5,
          agility: userStats.agility || 5,
          endurance: userStats.endurance || 5,
          luck: userStats.luck || 5,
        },
        progression: XPCalculator.getLevelProgressionInfo(user.xp || 0),
        streakInfo: XPCalculator.getStreakMilestones(userStats.currentStreak || 0),
      };
    });
  }

  /**
   * Check for achievements based on stats and progression
   */
  static checkAchievements(
    level: number,
    totalXP: number,
    streak: number,
    stats: { strength: number; wisdom: number; agility: number; endurance: number; luck: number }
  ): string[] {
    const achievements: string[] = [];

    // Level achievements
    if (level >= 10) achievements.push('LEVEL_10');
    if (level >= 25) achievements.push('LEVEL_25');
    if (level >= 50) achievements.push('LEVEL_50');

    // XP achievements
    if (totalXP >= 1000) achievements.push('XP_1000');
    if (totalXP >= 10000) achievements.push('XP_10000');

    // Streak achievements
    if (streak >= 7) achievements.push('WEEK_STREAK');
    if (streak >= 30) achievements.push('MONTH_STREAK');
    if (streak >= 100) achievements.push('CENTURY_STREAK');

    // Stat achievements
    if (stats.strength >= 20) achievements.push('STRONG_WARRIOR');
    if (stats.wisdom >= 20) achievements.push('WISE_SCHOLAR');
    if (stats.agility >= 20) achievements.push('SWIFT_ROGUE');
    if (stats.endurance >= 20) achievements.push('HARDY_GUARDIAN');

    // Balanced stats achievement
    const minStat = Math.min(stats.strength, stats.wisdom, stats.agility, stats.endurance);
    if (minStat >= 15) achievements.push('BALANCED_HERO');

    return achievements;
  }

  /**
   * Reset daily streak if user missed a day
   */
  static async checkAndResetStreak(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        stats: true,
      },
    });

    if (!user) {
      return;
    }

    const userStats: UserStats = user.stats ? JSON.parse(user.stats) : {
      strength: 5,
      wisdom: 5,
      agility: 5,
      endurance: 5,
      luck: 5,
      currentStreak: 0,
    };

    if (!userStats.lastActiveDate) {
      return;
    }

    const daysSinceActive = Math.floor(
      (Date.now() - new Date(userStats.lastActiveDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceActive > 1) {
      // Reset streak if more than 1 day inactive
      const updatedStats = {
        ...userStats,
        currentStreak: 0,
      };

      await prisma.user.update({
        where: { id: userId },
        data: {
          stats: JSON.stringify(updatedStats),
        },
      });
    }
  }

  /**
   * Initialize or update user stats structure
   */
  static async initializeUserStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stats: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    let userStats: Partial<UserStats>;
    try {
      userStats = user.stats ? JSON.parse(user.stats) : {};
    } catch {
      userStats = {};
    }

    // Ensure all required stats exist
    const defaultStats: UserStats = {
      strength: 5,
      wisdom: 5,
      agility: 5,
      endurance: 5,
      luck: 5,
      currentStreak: 0,
      lastActiveDate: new Date(),
    };

    const updatedStats = { ...defaultStats, ...userStats };

    await prisma.user.update({
      where: { id: userId },
      data: {
        stats: JSON.stringify(updatedStats),
      },
    });

    return updatedStats;
  }
}