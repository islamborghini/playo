import { XPCalculator, RPG_CONSTANTS, TASK_CATEGORY_STATS } from '../utils/xpCalculator';
import { TaskDifficulty } from '../generated/prisma';

describe('XPCalculator', () => {
  describe('getBaseXP', () => {
    it('should return correct base XP for each difficulty', () => {
      expect(XPCalculator.getBaseXP(TaskDifficulty.EASY)).toBe(10);
      expect(XPCalculator.getBaseXP(TaskDifficulty.MEDIUM)).toBe(25);
      expect(XPCalculator.getBaseXP(TaskDifficulty.HARD)).toBe(50);
    });
  });

  describe('calculateStreakMultiplier', () => {
    it('should return 1.0 for streaks less than 5 days', () => {
      expect(XPCalculator.calculateStreakMultiplier(0)).toBe(1.0);
      expect(XPCalculator.calculateStreakMultiplier(4)).toBe(1.0);
    });

    it('should apply 1.1x multiplier for each 5-day interval', () => {
      expect(XPCalculator.calculateStreakMultiplier(5)).toBeCloseTo(1.1);
      expect(XPCalculator.calculateStreakMultiplier(10)).toBeCloseTo(1.21); // 1.1^2
      expect(XPCalculator.calculateStreakMultiplier(15)).toBeCloseTo(1.331); // 1.1^3
    });

    it('should cap multiplier at 2.0x', () => {
      expect(XPCalculator.calculateStreakMultiplier(50)).toBe(2.0);
      expect(XPCalculator.calculateStreakMultiplier(100)).toBe(2.0);
    });

    it('should handle partial intervals correctly', () => {
      expect(XPCalculator.calculateStreakMultiplier(7)).toBeCloseTo(1.1); // Still in first interval
      expect(XPCalculator.calculateStreakMultiplier(12)).toBeCloseTo(1.21); // Still in second interval
    });
  });

  describe('calculateLevel', () => {
    it('should calculate level using exponential curve', () => {
      expect(XPCalculator.calculateLevel(0)).toBe(1);
      expect(XPCalculator.calculateLevel(50)).toBe(1); // sqrt(50/100) = 0.7 -> floor = 0 + 1 = 1
      expect(XPCalculator.calculateLevel(100)).toBe(2); // sqrt(100/100) = 1 -> floor = 1 + 1 = 2
      expect(XPCalculator.calculateLevel(400)).toBe(3); // sqrt(400/100) = 2 -> floor = 2 + 1 = 3
      expect(XPCalculator.calculateLevel(900)).toBe(4); // sqrt(900/100) = 3 -> floor = 3 + 1 = 4
    });

    it('should handle negative XP', () => {
      expect(XPCalculator.calculateLevel(-100)).toBe(1);
    });
  });

  describe('calculateXPForNextLevel', () => {
    it('should calculate XP needed for next level correctly', () => {
      // At 100 XP (level 2), need 300 more for level 3 (400 total)
      expect(XPCalculator.calculateXPForNextLevel(100)).toBe(300);
      
      // At 400 XP (level 3), need 500 more for level 4 (900 total)
      expect(XPCalculator.calculateXPForNextLevel(400)).toBe(500);
      
      // At 0 XP (level 1), need 100 more for level 2
      expect(XPCalculator.calculateXPForNextLevel(0)).toBe(100);
    });
  });

  describe('calculateStatBonuses', () => {
    it('should apply correct stat bonuses for each category', () => {
      expect(XPCalculator.calculateStatBonuses('fitness', 50)).toEqual({ strength: 2 });
      expect(XPCalculator.calculateStatBonuses('learning', 50)).toEqual({ wisdom: 2 });
      expect(XPCalculator.calculateStatBonuses('social', 50)).toEqual({ agility: 2 });
      expect(XPCalculator.calculateStatBonuses('productivity', 50)).toEqual({ endurance: 2 });
    });

    it('should handle unknown categories', () => {
      expect(XPCalculator.calculateStatBonuses('unknown', 50)).toEqual({});
    });

    it('should calculate bonuses based on XP amount (1 point per 25 XP)', () => {
      expect(XPCalculator.calculateStatBonuses('fitness', 24)).toEqual({});
      expect(XPCalculator.calculateStatBonuses('fitness', 25)).toEqual({ strength: 1 });
      expect(XPCalculator.calculateStatBonuses('fitness', 74)).toEqual({ strength: 2 });
      expect(XPCalculator.calculateStatBonuses('fitness', 75)).toEqual({ strength: 3 });
    });
  });

  describe('calculateTaskXP', () => {
    it('should calculate complete XP result for task completion', () => {
      const result = XPCalculator.calculateTaskXP(
        TaskDifficulty.MEDIUM,
        10, // 10-day streak -> 1.21x multiplier
        200, // Current XP (level 2)
        'fitness'
      );

      expect(result.baseXP).toBe(25);
      expect(result.streakMultiplier).toBeCloseTo(1.21);
      expect(result.finalXP).toBe(30); // floor(25 * 1.21) = 30
      expect(result.totalXPAfter).toBe(230);
      expect(result.levelBefore).toBe(2);
      expect(result.levelAfter).toBe(2); // Still level 2
      expect(result.leveledUp).toBe(false);
      expect(result.statBonuses).toEqual({ strength: 1 }); // 30 XP -> 1 strength point
    });

    it('should detect level up when crossing threshold', () => {
      const result = XPCalculator.calculateTaskXP(
        TaskDifficulty.HARD,
        15, // 15-day streak -> 1.331x multiplier
        350, // Close to level 3 threshold (400)
        'learning'
      );

      expect(result.baseXP).toBe(50);
      expect(result.streakMultiplier).toBeCloseTo(1.331);
      expect(result.finalXP).toBe(66); // floor(50 * 1.331)
      expect(result.totalXPAfter).toBe(416);
      expect(result.levelBefore).toBe(2);
      expect(result.levelAfter).toBe(3);
      expect(result.leveledUp).toBe(true);
      expect(result.statBonuses).toEqual({ wisdom: 2 }); // 66 XP -> 2 wisdom points
    });
  });

  describe('applyStatBonuses', () => {
    it('should correctly apply stat bonuses to user stats', () => {
      const currentStats = {
        strength: 10,
        wisdom: 15,
        agility: 8,
        endurance: 12,
        luck: 5,
      };

      const bonuses = {
        strength: 2,
        wisdom: 1,
      };

      const result = XPCalculator.applyStatBonuses(currentStats, bonuses);

      expect(result).toEqual({
        strength: 12,
        wisdom: 16,
        agility: 8,
        endurance: 12,
        luck: 5,
      });
    });
  });

  describe('getLevelProgressionInfo', () => {
    it('should provide detailed level progression information', () => {
      const info = XPCalculator.getLevelProgressionInfo(250);

      expect(info.currentLevel).toBe(2);
      expect(info.xpRequiredForCurrentLevel).toBe(100); // Level 2 starts at 100 XP
      expect(info.xpRequiredForNextLevel).toBe(400); // Level 3 starts at 400 XP
      expect(info.xpInCurrentLevel).toBe(150); // 250 - 100 = 150
      expect(info.progressToNextLevel).toBe(50); // 150/300 * 100 = 50%
    });
  });

  describe('simulateXPGain', () => {
    it('should simulate multiple completions with increasing streak', () => {
      const results = XPCalculator.simulateXPGain(
        TaskDifficulty.EASY,
        3, // Starting streak
        0, // Starting XP
        'fitness',
        3 // Complete 3 times
      );

      expect(results).toHaveLength(3);
      
      // First completion: streak 3 -> no multiplier
      expect(results[0]?.streakMultiplier).toBe(1.0);
      expect(results[0]?.finalXP).toBe(10);
      
      // Second completion: streak 4 -> no multiplier
      expect(results[1]?.streakMultiplier).toBe(1.0);
      expect(results[1]?.finalXP).toBe(10);
      
      // Third completion: streak 5 -> 1.1x multiplier
      expect(results[2]?.streakMultiplier).toBeCloseTo(1.1);
      expect(results[2]?.finalXP).toBe(11);
    });
  });

  describe('getStreakMilestones', () => {
    it('should provide streak milestone information', () => {
      const milestone = XPCalculator.getStreakMilestones(7);

      expect(milestone.currentMultiplier).toBeCloseTo(1.1);
      expect(milestone.nextMilestone).toBe(10);
      expect(milestone.streaksToNextMilestone).toBe(3);
      expect(milestone.nextMultiplier).toBeCloseTo(1.21);
      expect(milestone.isAtMaxMultiplier).toBe(false);
    });

    it('should handle max multiplier correctly', () => {
      const milestone = XPCalculator.getStreakMilestones(50);

      expect(milestone.currentMultiplier).toBe(2.0);
      expect(milestone.isAtMaxMultiplier).toBe(true);
      expect(milestone.streaksToNextMilestone).toBe(0);
    });
  });

  describe('calculateStatsFromCategories', () => {
    it('should calculate stats from category completions', () => {
      const categoryCompletions = {
        fitness: 15, // 3 strength points (15/5)
        learning: 10, // 2 wisdom points (10/5)
        social: 7, // 1 agility point (7/5)
        productivity: 3, // 0 endurance points (3/5)
      };

      const stats = XPCalculator.calculateStatsFromCategories(categoryCompletions);

      expect(stats).toEqual({
        strength: 8, // 5 base + 3 bonus
        wisdom: 7, // 5 base + 2 bonus
        agility: 6, // 5 base + 1 bonus
        endurance: 5, // 5 base + 0 bonus
        luck: 5, // 5 base + 0 bonus
      });
    });

    it('should handle empty category completions', () => {
      const stats = XPCalculator.calculateStatsFromCategories({});

      expect(stats).toEqual({
        strength: 5,
        wisdom: 5,
        agility: 5,
        endurance: 5,
        luck: 5,
      });
    });
  });

  describe('Constants validation', () => {
    it('should have correct base XP values', () => {
      expect(XPCalculator.getBaseXP(TaskDifficulty.EASY)).toBe(10);
      expect(XPCalculator.getBaseXP(TaskDifficulty.MEDIUM)).toBe(25);
      expect(XPCalculator.getBaseXP(TaskDifficulty.HARD)).toBe(50);
    });

    it('should have correct RPG constants', () => {
      expect(RPG_CONSTANTS.STREAK_MULTIPLIER_INTERVAL).toBe(5);
      expect(RPG_CONSTANTS.STREAK_MULTIPLIER_RATE).toBe(1.1);
      expect(RPG_CONSTANTS.MAX_STREAK_MULTIPLIER).toBe(2.0);
      expect(RPG_CONSTANTS.LEVEL_XP_BASE).toBe(100);
    });

    it('should have correct task category mappings', () => {
      expect(TASK_CATEGORY_STATS.fitness).toBe('strength');
      expect(TASK_CATEGORY_STATS.learning).toBe('wisdom');
      expect(TASK_CATEGORY_STATS.social).toBe('agility');
      expect(TASK_CATEGORY_STATS.productivity).toBe('endurance');
    });
  });
});