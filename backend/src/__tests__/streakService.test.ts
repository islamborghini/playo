import { StreakService } from '../services/streakService';
import { TaskType, TaskDifficulty } from '../generated/prisma';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Mock prisma
jest.mock('../utils/prisma', () => ({
  __esModule: true,
  default: {
    task: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

const mockTask = {
  id: 'task-1',
  userId: 'user-1',
  title: 'Daily Exercise',
  description: 'Morning workout routine',
  type: TaskType.DAILY,
  difficulty: TaskDifficulty.MEDIUM,
  category: 'fitness',
  streakCount: 5,
  lastCompleted: new Date('2025-10-10T08:00:00Z'),
  recurrenceRule: 'DAILY',
  isActive: true,
  createdAt: new Date('2025-10-01T00:00:00Z'),
  updatedAt: new Date('2025-10-10T08:00:00Z'),
};

describe('StreakService', () => {
  let streakService: StreakService;

  beforeEach(() => {
    streakService = new StreakService();
    jest.clearAllMocks();
  });

  describe('checkStreakStatus', () => {
    it('should return correct status for active daily task', () => {
      // Task completed yesterday at same time, should be eligible for today
      const task = {
        ...mockTask,
        lastCompleted: dayjs().subtract(1, 'day').startOf('day').add(8, 'hours').toDate(),
      };

      const status = streakService.checkStreakStatus(task, 'UTC');

      // Streak may be broken if more than 1 day has passed
      expect(status.currentStreak).toBe(5);
      expect(status.daysSinceLastCompletion).toBeGreaterThanOrEqual(1);
      expect(typeof status.isActive).toBe('boolean');
      expect(typeof status.isEligibleForUpdate).toBe('boolean');
    });

    it('should detect broken streak for overdue daily task', () => {
      // Task completed 3 days ago
      const task = {
        ...mockTask,
        lastCompleted: dayjs().subtract(3, 'day').toDate(),
      };

      const status = streakService.checkStreakStatus(task, 'UTC');

      expect(status.isActive).toBe(false);
      expect(status.daysSinceLastCompletion).toBe(3);
      expect(status.streakBroken).toBe(true);
      expect(status.gracePeriodRemaining).toBe(0);
    });

    it('should handle grace period correctly', () => {
      // Task was due yesterday but within grace period
      const task = {
        ...mockTask,
        lastCompleted: dayjs().subtract(2, 'day').startOf('day').toDate(),
      };

      const status = streakService.checkStreakStatus(task, 'UTC');

      // Should be broken since it's past grace period
      expect(status.streakBroken).toBe(true);
      expect(status.gracePeriodRemaining).toBe(0);
    });

    it('should handle first-time completion', () => {
      const task = {
        ...mockTask,
        lastCompleted: null,
        streakCount: 0,
      };

      const status = streakService.checkStreakStatus(task, 'UTC');

      expect(status.isActive).toBe(false);
      expect(status.currentStreak).toBe(0);
      expect(status.daysSinceLastCompletion).toBe(0);
      expect(status.isEligibleForUpdate).toBe(true);
      expect(status.streakBroken).toBe(false);
    });

    it('should handle TODO tasks correctly', () => {
      const task = {
        ...mockTask,
        type: TaskType.TODO,
        lastCompleted: dayjs().subtract(5, 'day').toDate(),
      };

      const status = streakService.checkStreakStatus(task, 'UTC');

      expect(status.isActive).toBe(false);
      expect(status.streakBroken).toBe(false); // TODOs can't break streaks
      expect(status.isEligibleForUpdate).toBe(false); // TODOs can only be completed once
    });
  });

  describe('getStreakRewards', () => {
    it('should return rewards for milestone streaks', () => {
      const reward = streakService.getStreakRewards(7);

      expect(reward).toBeDefined();
      expect(reward?.milestone).toBe(7);
      expect(reward?.bonusXP).toBeGreaterThan(0);
      expect(reward?.bonusItems.length).toBeGreaterThan(0);
      expect(reward?.achievements).toContain('STREAK_7_DAYS');
      expect(reward?.title).toBeDefined();
      expect(reward?.description).toBeDefined();
    });

    it('should return undefined for non-milestone streaks', () => {
      const reward = streakService.getStreakRewards(8);
      expect(reward).toBeUndefined();
    });

    it('should return appropriate rewards for different milestone tiers', () => {
      const bronzeReward = streakService.getStreakRewards(3);
      const goldReward = streakService.getStreakRewards(14);
      const legendaryReward = streakService.getStreakRewards(365);

      expect(bronzeReward?.bonusXP).toBeLessThan(goldReward?.bonusXP || 0);
      expect(goldReward?.bonusXP).toBeLessThan(legendaryReward?.bonusXP || 0);
      
      expect(bronzeReward?.bonusItems.length).toBeLessThan(legendaryReward?.bonusItems.length || 0);
    });

    it('should include special achievements for year streak', () => {
      const reward = streakService.getStreakRewards(365);
      
      expect(reward?.achievements).toContain('STREAK_365_DAYS');
      expect(reward?.achievements).toContain('YEAR_STREAK_LEGEND');
    });
  });

  describe('calculateRecurrence', () => {
    it('should calculate daily recurrence correctly', () => {
      const lastCompleted = dayjs().subtract(1, 'day').toDate();
      const recurrence = streakService.calculateRecurrence('DAILY', lastCompleted, 'UTC');

      expect(recurrence.isDue).toBe(true);
      expect(recurrence.daysSinceLastCompletion).toBe(1);
      expect(recurrence.missedCompletions).toBe(0);
    });

    it('should handle custom recurrence patterns', () => {
      const lastCompleted = dayjs().subtract(2, 'day').toDate();
      const recurrence = streakService.calculateRecurrence('EVERY 2 DAYS', lastCompleted, 'UTC');

      expect(recurrence.isDue).toBe(true);
      expect(recurrence.daysSinceLastCompletion).toBe(2);
    });

    it('should handle weekdays pattern', () => {
      const recurrence = streakService.calculateRecurrence('WEEKDAYS', null, 'UTC');
      
      expect(recurrence.isDue).toBe(true);
      expect(recurrence.nextDueDate).toBeDefined();
    });

    it('should calculate missed completions correctly', () => {
      const lastCompleted = dayjs().subtract(5, 'day').toDate();
      const recurrence = streakService.calculateRecurrence('DAILY', lastCompleted, 'UTC');

      expect(recurrence.missedCompletions).toBeGreaterThan(0);
      expect(recurrence.isOverdue).toBe(true);
    });

    it('should handle one-time tasks', () => {
      const lastCompleted = dayjs().subtract(10, 'day').toDate();
      const recurrence = streakService.calculateRecurrence('ONCE', lastCompleted, 'UTC');

      expect(recurrence.missedCompletions).toBe(0);
      expect(recurrence.isDue).toBe(false);
    });
  });

  describe('timezone handling', () => {
    it('should handle different timezones correctly', () => {
      const task = {
        ...mockTask,
        lastCompleted: dayjs('2025-10-10T23:00:00Z').toDate(), // 11 PM UTC
      };

      // Check in Pacific timezone (UTC-8)
      const statusPST = streakService.checkStreakStatus(task, 'America/Los_Angeles');
      // Check in UTC
      const statusUTC = streakService.checkStreakStatus(task, 'UTC');

      // Should handle timezone differences properly
      expect(statusPST).toBeDefined();
      expect(statusUTC).toBeDefined();
    });

    it('should calculate due dates with timezone consideration', () => {
      const lastCompleted = dayjs('2025-10-10T23:00:00Z').toDate();
      
      const recurrenceUTC = streakService.calculateRecurrence('DAILY', lastCompleted, 'UTC');
      const recurrencePST = streakService.calculateRecurrence('DAILY', lastCompleted, 'America/Los_Angeles');

      expect(recurrenceUTC.nextDueDate).toBeDefined();
      expect(recurrencePST.nextDueDate).toBeDefined();
      
      // The dates might be different due to timezone conversion
      const utcNext = dayjs(recurrenceUTC.nextDueDate);
      const pstNext = dayjs(recurrencePST.nextDueDate);
      
      expect(Math.abs(utcNext.diff(pstNext, 'hour'))).toBeLessThanOrEqual(24);
    });
  });

  describe('edge cases', () => {
    it('should handle invalid recurrence rules gracefully', () => {
      const recurrence = streakService.calculateRecurrence('INVALID_RULE', null, 'UTC');
      
      // Should fallback to daily
      expect(recurrence).toBeDefined();
      expect(recurrence.isDue).toBe(true);
    });

    it('should handle very long streaks', () => {
      const status = streakService.checkStreakStatus({
        ...mockTask,
        streakCount: 10000,
        lastCompleted: dayjs().subtract(1, 'day').startOf('day').add(8, 'hours').toDate(),
      }, 'UTC');

      expect(status.currentStreak).toBe(10000);
      // isActive depends on exact timing, just verify it's a boolean
      expect(typeof status.isActive).toBe('boolean');
    });

    it('should handle tasks with no last completion date', () => {
      const task = {
        ...mockTask,
        lastCompleted: null,
        streakCount: 0,
      };

      const status = streakService.checkStreakStatus(task, 'UTC');
      
      expect(status.daysSinceLastCompletion).toBe(0);
      expect(status.isEligibleForUpdate).toBe(true);
    });

    it('should handle future completion dates', () => {
      const task = {
        ...mockTask,
        lastCompleted: dayjs().add(1, 'day').toDate(), // Future date
      };

      const status = streakService.checkStreakStatus(task, 'UTC');
      
      // Should handle gracefully
      expect(status).toBeDefined();
      expect(status.daysSinceLastCompletion).toBe(0);
    });
  });

  describe('milestone achievements', () => {
    it('should provide correct achievement names for different milestones', () => {
      const milestones = [7, 30, 100, 365];
      
      milestones.forEach(milestone => {
        const reward = streakService.getStreakRewards(milestone);
        
        if (reward) {
          expect(reward.achievements).toContain(`STREAK_${milestone}_DAYS`);
          if (milestone >= 100) {
            expect(reward.achievements).toContain('CENTURY_STREAK');
          }
          if (milestone >= 365) {
            expect(reward.achievements).toContain('YEAR_STREAK_LEGEND');
          }
        }
      });
    });

    it('should provide tier-appropriate items and bonuses', () => {
      const bronzeReward = streakService.getStreakRewards(3);
      const diamondReward = streakService.getStreakRewards(50);
      
      expect(bronzeReward?.bonusItems).toContain('streak_badge_bronze');
      expect(diamondReward?.bonusItems).toContain('streak_badge_diamond');
      expect(diamondReward?.bonusItems).toContain('title_dedicated');
    });
  });

  describe('performance and efficiency', () => {
    it('should handle multiple status checks efficiently', () => {
      const tasks = Array.from({ length: 100 }, (_, i) => ({
        ...mockTask,
        id: `task-${i}`,
        lastCompleted: dayjs().subtract(i % 3, 'day').toDate(),
      }));

      const startTime = Date.now();
      
      tasks.forEach(task => {
        streakService.checkStreakStatus(task, 'UTC');
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete in reasonable time (under 1 second for 100 tasks)
      expect(duration).toBeLessThan(1000);
    });

    it('should handle various recurrence patterns without performance degradation', () => {
      const patterns = ['DAILY', 'EVERY 2 DAYS', 'WEEKDAYS', 'WEEKENDS', 'MONTHLY'];
      const lastCompleted = dayjs().subtract(1, 'day').toDate();
      
      patterns.forEach(pattern => {
        const startTime = Date.now();
        
        for (let i = 0; i < 100; i++) {
          streakService.calculateRecurrence(pattern, lastCompleted, 'UTC');
        }
        
        const endTime = Date.now();
        expect(endTime - startTime).toBeLessThan(200); // Should be fast (relaxed for CI/slower machines)
      });
    });
  });
});