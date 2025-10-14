import { Task, TaskType } from '@/generated/prisma';
import prisma from '@/utils/prisma';
import { XPCalculator } from '@/utils/xpCalculator';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import duration from 'dayjs/plugin/duration';

// Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(duration);

export interface StreakStatus {
  isActive: boolean;
  currentStreak: number;
  daysSinceLastCompletion: number;
  isEligibleForUpdate: boolean;
  nextDueDate?: Date;
  streakBroken: boolean;
  gracePeriodRemaining: number; // Hours remaining in grace period
}

export interface StreakReward {
  milestone: number;
  bonusXP: number;
  bonusItems: string[];
  multiplier: number;
  achievements: string[];
  title: string;
  description: string;
}

export interface RecurrenceCheck {
  isDue: boolean;
  nextDueDate: Date;
  daysSinceLastCompletion: number;
  missedCompletions: number;
  isOverdue: boolean;
  gracePeriodActive: boolean;
}

export interface StreakUpdateResult {
  previousStreak: number;
  newStreak: number;
  streakIncremented: boolean;
  streakReset: boolean;
  reward?: StreakReward | undefined;
  statusChanged: boolean;
  gracePeriodUsed: boolean;
}

interface RecurrencePattern {
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  interval: number;
  daysOfWeek?: number[]; // 0=Sunday, 1=Monday, etc.
  dayOfMonth?: number;
  customPattern?: string;
}

export class StreakService {
  private defaultTimezone = 'UTC';
  private gracePeriodHours = 6; // 6-hour grace period for missed completions

  /**
   * Update streak for a task based on completion timing
   */
  async updateStreak(
    taskId: string, 
    userTimezone: string = this.defaultTimezone,
    completedAt?: Date
  ): Promise<StreakUpdateResult> {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        throw new Error('Task not found');
      }

      const previousStreak = task.streakCount;
      const currentStatus = this.checkStreakStatus(task, userTimezone);
      const completionTime = completedAt || new Date();
      
      let newStreak = previousStreak;
      let streakIncremented = false;
      let streakReset = false;
      let gracePeriodUsed = false;
      let reward: StreakReward | undefined;

      // Determine new streak value based on completion timing
      if (currentStatus.isEligibleForUpdate) {
        if (currentStatus.isActive || currentStatus.gracePeriodRemaining > 0) {
          // Increment streak (either on time or within grace period)
          newStreak = previousStreak + 1;
          streakIncremented = true;
          gracePeriodUsed = currentStatus.gracePeriodRemaining > 0 && currentStatus.gracePeriodRemaining < this.gracePeriodHours;
          
          // Check for milestone rewards
          reward = this.getStreakRewards(newStreak);
        } else if (currentStatus.streakBroken) {
          // Reset streak due to missed completion
          newStreak = 1; // Start new streak with this completion
          streakReset = true;
        }
      } else {
        // Multiple completions in same period - no streak change
        console.log(`⚠️ Task ${taskId} already completed for this period`);
      }

      // Update task in database
      await prisma.task.update({
        where: { id: taskId },
        data: {
          streakCount: newStreak,
          lastCompleted: completionTime,
        },
      });

      console.log(`✅ Streak updated for task ${taskId}: ${previousStreak} → ${newStreak}${gracePeriodUsed ? ' (grace period)' : ''}`);

      return {
        previousStreak,
        newStreak,
        streakIncremented,
        streakReset,
        reward,
        statusChanged: newStreak !== previousStreak,
        gracePeriodUsed,
      };
    } catch (error) {
      console.error('❌ Failed to update streak:', error);
      throw new Error(`Failed to update streak: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check current streak status for a task
   */
  checkStreakStatus(
    task: Task, 
    userTimezone: string = this.defaultTimezone
  ): StreakStatus {
    const now = dayjs().tz(userTimezone);
    const lastCompleted = task.lastCompleted 
      ? dayjs(task.lastCompleted).tz(userTimezone)
      : null;

    if (!lastCompleted) {
      return {
        isActive: false,
        currentStreak: 0,
        daysSinceLastCompletion: 0,
        isEligibleForUpdate: true,
        streakBroken: false,
        gracePeriodRemaining: 0,
      };
    }

    // Check recurrence and due dates
    const recurrenceCheck = this.calculateRecurrence(
      task.recurrenceRule || this.getDefaultRecurrence(task.type),
      task.lastCompleted,
      userTimezone
    );

    const daysSinceLastCompletion = now.diff(lastCompleted, 'day');
    const hoursSinceLastCompletion = now.diff(lastCompleted, 'hour');

    // Determine streak status based on task type and timing
    const isActive = this.determineStreakActive(
      task.type,
      daysSinceLastCompletion,
      recurrenceCheck
    );

    const streakBroken = this.determineStreakBroken(
      task.type,
      daysSinceLastCompletion,
      recurrenceCheck,
      hoursSinceLastCompletion
    );

    const isEligibleForUpdate = this.determineEligibleForUpdate(
      task.type,
      lastCompleted,
      now,
      recurrenceCheck
    );

    // Calculate grace period remaining
    const gracePeriodRemaining = this.calculateGracePeriodRemaining(
      recurrenceCheck.nextDueDate,
      now.toDate()
    );

    return {
      isActive,
      currentStreak: task.streakCount,
      daysSinceLastCompletion: Math.max(0, daysSinceLastCompletion),
      isEligibleForUpdate,
      nextDueDate: recurrenceCheck.nextDueDate,
      streakBroken,
      gracePeriodRemaining,
    };
  }

  /**
   * Get streak rewards for milestone achievements
   */
  getStreakRewards(streakCount: number): StreakReward | undefined {
    const milestones = [
      { days: 3, tier: 'bronze' },
      { days: 7, tier: 'silver' },
      { days: 14, tier: 'gold' },
      { days: 30, tier: 'platinum' },
      { days: 50, tier: 'diamond' },
      { days: 100, tier: 'master' },
      { days: 200, tier: 'grandmaster' },
      { days: 365, tier: 'legendary' },
      { days: 500, tier: 'mythic' },
      { days: 1000, tier: 'immortal' },
    ];
    
    const milestone = milestones.find(m => m.days === streakCount);
    if (!milestone) {
      return undefined;
    }

    const streakInfo = XPCalculator.getStreakMilestones(streakCount);
    
    // Calculate milestone rewards based on tier
    const bonusXP = this.calculateMilestoneBonusXP(streakCount, milestone.tier);
    const bonusItems = this.getMilestoneItems(streakCount, milestone.tier);
    const achievements = this.getMilestoneAchievements(streakCount, milestone.tier);

    return {
      milestone: streakCount,
      bonusXP,
      bonusItems,
      multiplier: streakInfo.currentMultiplier,
      achievements,
      title: this.getMilestoneTitle(streakCount, milestone.tier),
      description: this.getMilestoneDescription(streakCount, milestone.tier),
    };
  }

  /**
   * Calculate task recurrence and due dates
   */
  calculateRecurrence(
    recurrenceRule: string,
    lastCompleted: Date | null,
    userTimezone: string = this.defaultTimezone
  ): RecurrenceCheck {
    const now = dayjs().tz(userTimezone);
    const lastCompletedDate = lastCompleted 
      ? dayjs(lastCompleted).tz(userTimezone)
      : null;

    try {
      const recurrence = this.parseRecurrenceRule(recurrenceRule);
      
      if (!lastCompletedDate) {
        return {
          isDue: true,
          nextDueDate: now.toDate(),
          daysSinceLastCompletion: 0,
          missedCompletions: 0,
          isOverdue: false,
          gracePeriodActive: false,
        };
      }

      const nextDueDate = this.calculateNextDueDate(
        lastCompletedDate,
        recurrence,
        userTimezone
      );

      const daysSinceLastCompletion = now.diff(lastCompletedDate, 'day');
      const isDue = now.isAfter(nextDueDate) || now.isSame(nextDueDate, 'day');
      
      const gracePeriodEnd = nextDueDate.add(this.gracePeriodHours, 'hour');
      const isOverdue = now.isAfter(gracePeriodEnd);
      const gracePeriodActive = now.isAfter(nextDueDate) && now.isBefore(gracePeriodEnd);
      
      const missedCompletions = this.calculateMissedCompletions(
        lastCompletedDate,
        now,
        recurrence
      );

      return {
        isDue,
        nextDueDate: nextDueDate.toDate(),
        daysSinceLastCompletion: Math.max(0, daysSinceLastCompletion),
        missedCompletions,
        isOverdue,
        gracePeriodActive,
      };
    } catch (error) {
      console.error('❌ Failed to parse recurrence rule:', error);
      
      // Fallback to daily recurrence
      return this.calculateRecurrence(
        'DAILY',
        lastCompleted,
        userTimezone
      );
    }
  }

  /**
   * Get user's overall streak statistics
   */
  async getUserStreakStats(
    userId: string,
    userTimezone: string = this.defaultTimezone
  ): Promise<{
    totalActiveStreaks: number;
    longestStreak: number;
    totalStreakDays: number;
    averageStreak: number;
    streakDistribution: Record<string, number>;
    upcomingDueTasks: Array<{
      taskId: string;
      title: string;
      nextDueDate: Date;
      hoursUntilDue: number;
    }>;
  }> {
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        type: true,
        streakCount: true,
        lastCompleted: true,
        recurrenceRule: true,
      },
    });

    const activeStreaks = tasks.filter(task => {
      const status = this.checkStreakStatus(task as Task, userTimezone);
      return status.isActive;
    });

    const streakCounts = tasks.map(task => task.streakCount);
    const longestStreak = Math.max(0, ...streakCounts);
    const totalStreakDays = streakCounts.reduce((sum, streak) => sum + streak, 0);
    const averageStreak = tasks.length > 0 ? totalStreakDays / tasks.length : 0;

    const streakDistribution = this.calculateStreakDistribution(streakCounts);

    // Get upcoming due tasks
    const upcomingDueTasks = tasks
      .map(task => {
        const recurrenceCheck = this.calculateRecurrence(
          task.recurrenceRule || this.getDefaultRecurrence(task.type),
          task.lastCompleted,
          userTimezone
        );
        const hoursUntilDue = dayjs(recurrenceCheck.nextDueDate).diff(dayjs().tz(userTimezone), 'hour');
        
        return {
          taskId: task.id,
          title: task.title,
          nextDueDate: recurrenceCheck.nextDueDate,
          hoursUntilDue,
        };
      })
      .filter(task => task.hoursUntilDue >= 0 && task.hoursUntilDue <= 48) // Next 48 hours
      .sort((a, b) => a.hoursUntilDue - b.hoursUntilDue);

    return {
      totalActiveStreaks: activeStreaks.length,
      longestStreak,
      totalStreakDays,
      averageStreak: Math.round(averageStreak * 100) / 100,
      streakDistribution,
      upcomingDueTasks,
    };
  }

  /**
   * Get multiple tasks' streak statuses efficiently
   */
  async getMultipleStreakStatuses(
    taskIds: string[],
    userTimezone: string = this.defaultTimezone
  ): Promise<Map<string, StreakStatus>> {
    const tasks = await prisma.task.findMany({
      where: {
        id: { in: taskIds },
      },
    });

    const statusMap = new Map<string, StreakStatus>();

    tasks.forEach(task => {
      const status = this.checkStreakStatus(task, userTimezone);
      statusMap.set(task.id, status);
    });

    return statusMap;
  }

  /**
   * Reset streaks for tasks that have been missed beyond grace period
   */
  async resetExpiredStreaks(
    userId: string,
    userTimezone: string = this.defaultTimezone
  ): Promise<string[]> {
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        isActive: true,
        streakCount: { gt: 0 },
      },
    });

    const resetTaskIds: string[] = [];

    for (const task of tasks) {
      const status = this.checkStreakStatus(task, userTimezone);
      
      if (status.streakBroken && status.gracePeriodRemaining === 0) {
        await prisma.task.update({
          where: { id: task.id },
          data: { streakCount: 0 },
        });
        
        resetTaskIds.push(task.id);
        console.log(`🔄 Reset streak for task ${task.id} (${task.title})`);
      }
    }

    return resetTaskIds;
  }

  // Private helper methods

  private getDefaultRecurrence(taskType: TaskType): string {
    switch (taskType) {
      case TaskType.DAILY:
        return 'DAILY';
      case TaskType.HABIT:
        return 'DAILY';
      case TaskType.TODO:
        return 'ONCE';
      default:
        return 'DAILY';
    }
  }

  private parseRecurrenceRule(rule: string): RecurrencePattern {
    const upperRule = rule.toUpperCase().trim();
    
    if (upperRule === 'DAILY') {
      return { type: 'DAILY', interval: 1 };
    }
    
    if (upperRule === 'WEEKLY') {
      return { type: 'WEEKLY', interval: 1 };
    }
    
    if (upperRule === 'MONTHLY') {
      return { type: 'MONTHLY', interval: 1 };
    }
    
    if (upperRule === 'ONCE') {
      return { type: 'CUSTOM', interval: 0 };
    }

    // Parse custom patterns like "EVERY 2 DAYS" or "WEEKDAYS"
    if (upperRule.includes('EVERY')) {
      const match = upperRule.match(/EVERY (\d+) (DAY|WEEK|MONTH)S?/);
      if (match && match[1]) {
        const interval = parseInt(match[1]);
        const unit = match[2];
        
        switch (unit) {
          case 'DAY':
            return { type: 'DAILY', interval };
          case 'WEEK':
            return { type: 'WEEKLY', interval };
          case 'MONTH':
            return { type: 'MONTHLY', interval };
        }
      }
    }

    if (upperRule === 'WEEKDAYS') {
      return { type: 'WEEKLY', interval: 1, daysOfWeek: [1, 2, 3, 4, 5] }; // Mon-Fri
    }

    if (upperRule === 'WEEKENDS') {
      return { type: 'WEEKLY', interval: 1, daysOfWeek: [0, 6] }; // Sat-Sun
    }

    // Default fallback
    return { type: 'DAILY', interval: 1 };
  }

  private calculateNextDueDate(
    lastCompleted: dayjs.Dayjs,
    recurrence: RecurrencePattern,
    userTimezone: string
  ): dayjs.Dayjs {
    const base = lastCompleted.tz(userTimezone);
    
    switch (recurrence.type) {
      case 'DAILY':
        return base.add(recurrence.interval, 'day').startOf('day');
        
      case 'WEEKLY':
        if (recurrence.daysOfWeek) {
          // Find next occurrence of allowed days
          let nextDate = base.add(1, 'day');
          while (!recurrence.daysOfWeek.includes(nextDate.day())) {
            nextDate = nextDate.add(1, 'day');
          }
          return nextDate.startOf('day');
        }
        return base.add(recurrence.interval, 'week').startOf('day');
        
      case 'MONTHLY':
        return base.add(recurrence.interval, 'month').startOf('day');
        
      case 'CUSTOM':
        if (recurrence.interval === 0) {
          // One-time task, never due again
          return base.add(100, 'year');
        }
        return base.add(recurrence.interval, 'day').startOf('day');
        
      default:
        return base.add(1, 'day').startOf('day');
    }
  }

  private calculateMissedCompletions(
    lastCompleted: dayjs.Dayjs,
    now: dayjs.Dayjs,
    recurrence: RecurrencePattern
  ): number {
    if (recurrence.type === 'CUSTOM' && recurrence.interval === 0) {
      return 0; // One-time tasks can't be missed
    }

    const daysDiff = now.diff(lastCompleted, 'day');
    
    switch (recurrence.type) {
      case 'DAILY':
        return Math.max(0, Math.floor(daysDiff / recurrence.interval) - 1);
      case 'WEEKLY':
        return Math.max(0, Math.floor(daysDiff / (recurrence.interval * 7)) - 1);
      case 'MONTHLY':
        return Math.max(0, now.diff(lastCompleted, 'month') - 1);
      default:
        return 0;
    }
  }

  private determineStreakActive(
    taskType: TaskType,
    daysSinceLastCompletion: number,
    recurrenceCheck: RecurrenceCheck
  ): boolean {
    switch (taskType) {
      case TaskType.DAILY:
      case TaskType.HABIT:
        return daysSinceLastCompletion <= 1 && !recurrenceCheck.isOverdue;
      case TaskType.TODO:
        return false; // TODOs don't maintain streaks
      default:
        return !recurrenceCheck.isOverdue;
    }
  }

  private determineStreakBroken(
    taskType: TaskType,
    daysSinceLastCompletion: number,
    recurrenceCheck: RecurrenceCheck,
    _hoursSinceLastCompletion: number
  ): boolean {
    // Grace period consideration
    if (recurrenceCheck.gracePeriodActive) {
      return false;
    }

    switch (taskType) {
      case TaskType.DAILY:
      case TaskType.HABIT:
        return recurrenceCheck.isOverdue || daysSinceLastCompletion > 1;
      case TaskType.TODO:
        return false; // TODOs can't break streaks
      default:
        return recurrenceCheck.isOverdue;
    }
  }

  private determineEligibleForUpdate(
    taskType: TaskType,
    lastCompleted: dayjs.Dayjs | null,
    now: dayjs.Dayjs,
    recurrenceCheck: RecurrenceCheck
  ): boolean {
    if (!lastCompleted) {
      return true; // First completion
    }

    switch (taskType) {
      case TaskType.DAILY:
      case TaskType.HABIT:
        // Can complete once per day
        return !now.isSame(lastCompleted, 'day') || recurrenceCheck.isDue;
      case TaskType.TODO:
        // TODOs can only be completed once
        return false;
      default:
        return recurrenceCheck.isDue;
    }
  }

  private calculateGracePeriodRemaining(nextDueDate: Date, currentTime: Date): number {
    const gracePeriodEnd = dayjs(nextDueDate).add(this.gracePeriodHours, 'hour');
    const now = dayjs(currentTime);
    
    if (now.isBefore(nextDueDate)) {
      return 0; // Not yet due
    }
    
    if (now.isAfter(gracePeriodEnd)) {
      return 0; // Grace period expired
    }
    
    return gracePeriodEnd.diff(now, 'hour', true);
  }

  private calculateMilestoneBonusXP(streakCount: number, tier: string): number {
    const baseBonuses = {
      bronze: 50,
      silver: 100,
      gold: 200,
      platinum: 500,
      diamond: 1000,
      master: 2000,
      grandmaster: 5000,
      legendary: 10000,
      mythic: 20000,
      immortal: 50000,
    };
    
    const base = baseBonuses[tier as keyof typeof baseBonuses] || 50;
    return Math.floor(base * Math.log10(streakCount + 1));
  }

  private getMilestoneItems(_streakCount: number, tier: string): string[] {
    const itemsByTier = {
      bronze: ['streak_badge_bronze', 'xp_potion_minor'],
      silver: ['streak_badge_silver', 'xp_potion_minor', 'stat_boost_minor'],
      gold: ['streak_badge_gold', 'xp_potion_major', 'stat_boost_minor'],
      platinum: ['streak_badge_platinum', 'xp_potion_major', 'stat_boost_major'],
      diamond: ['streak_badge_diamond', 'xp_potion_epic', 'stat_boost_major', 'title_dedicated'],
      master: ['streak_badge_master', 'xp_potion_epic', 'stat_boost_epic', 'title_master'],
      grandmaster: ['streak_badge_grandmaster', 'xp_potion_legendary', 'stat_boost_epic', 'title_grandmaster'],
      legendary: ['streak_badge_legendary', 'xp_potion_legendary', 'stat_boost_legendary', 'title_legend'],
      mythic: ['streak_badge_mythic', 'xp_potion_mythic', 'stat_boost_legendary', 'title_mythic', 'special_aura'],
      immortal: ['streak_badge_immortal', 'xp_potion_immortal', 'stat_boost_immortal', 'title_immortal', 'legendary_aura'],
    };
    
    return itemsByTier[tier as keyof typeof itemsByTier] || [];
  }

  private getMilestoneAchievements(streakCount: number, tier: string): string[] {
    const achievements = [`STREAK_${streakCount}_DAYS`];
    
    if (tier === 'legendary') achievements.push('YEAR_STREAK_LEGEND');
    if (tier === 'immortal') achievements.push('ULTIMATE_DEDICATION');
    if (streakCount >= 100) achievements.push('CENTURY_STREAK');
    
    return achievements;
  }

  private getMilestoneTitle(_streakCount: number, tier: string): string {
    const titles = {
      bronze: 'Getting Started',
      silver: 'Building Momentum',
      gold: 'Streak Warrior',
      platinum: 'Dedicated Champion',
      diamond: 'Elite Performer',
      master: 'Streak Master',
      grandmaster: 'Grandmaster of Habits',
      legendary: 'Legendary Dedication',
      mythic: 'Mythic Consistency',
      immortal: 'Immortal Legend',
    };
    
    return titles[tier as keyof typeof titles] || 'Milestone Achieved';
  }

  private getMilestoneDescription(streakCount: number, tier: string): string {
    return `Congratulations! You've maintained a ${streakCount}-day streak, reaching ${tier} tier. Your dedication is truly remarkable!`;
  }

  private calculateStreakDistribution(streakCounts: number[]): Record<string, number> {
    const distribution = {
      '0': 0,
      '1-7': 0,
      '8-30': 0,
      '31-100': 0,
      '100+': 0,
    };

    streakCounts.forEach(count => {
      if (count === 0) distribution['0']++;
      else if (count <= 7) distribution['1-7']++;
      else if (count <= 30) distribution['8-30']++;
      else if (count <= 100) distribution['31-100']++;
      else distribution['100+']++;
    });

    return distribution;
  }
}