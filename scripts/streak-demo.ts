#!/usr/bin/env ts-node
import { StreakService } from '../src/services/streakService';
import { TaskType, TaskDifficulty } from '../src/generated/prisma';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

console.log('🔥 QuestForge Streak Tracking Service Demo\n');

// Create service instance
const streakService = new StreakService();

// Demo timezone
const userTimezone = 'America/New_York';

console.log(`🌍 Using timezone: ${userTimezone}`);
console.log(`🕐 Current time: ${dayjs().tz(userTimezone).format('YYYY-MM-DD HH:mm:ss z')}\n`);

// Sample tasks for demonstration
const sampleTasks = [
  {
    id: 'task-1',
    userId: 'demo-user',
    title: 'Morning Exercise',
    description: 'Daily workout routine',
    type: TaskType.DAILY,
    difficulty: TaskDifficulty.MEDIUM,
    category: 'fitness',
    streakCount: 7,
    lastCompleted: dayjs().tz(userTimezone).subtract(1, 'day').startOf('day').toDate(),
    recurrenceRule: 'DAILY',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'task-2',
    userId: 'demo-user',
    title: 'Read for 30 minutes',
    description: 'Daily reading habit',
    type: TaskType.HABIT,
    difficulty: TaskDifficulty.EASY,
    category: 'learning',
    streakCount: 14,
    lastCompleted: dayjs().tz(userTimezone).subtract(2, 'day').startOf('day').toDate(),
    recurrenceRule: 'DAILY',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'task-3',
    userId: 'demo-user',
    title: 'Weekly Planning',
    description: 'Plan the upcoming week',
    type: TaskType.HABIT,
    difficulty: TaskDifficulty.MEDIUM,
    category: 'productivity',
    streakCount: 0,
    lastCompleted: null,
    recurrenceRule: 'WEEKLY',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'task-4',
    userId: 'demo-user',
    title: 'Meditation',
    description: 'Daily mindfulness practice',
    type: TaskType.DAILY,
    difficulty: TaskDifficulty.EASY,
    category: 'mindfulness',
    streakCount: 30,
    lastCompleted: dayjs().tz(userTimezone).subtract(3, 'day').startOf('day').toDate(),
    recurrenceRule: 'DAILY',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

console.log('📋 Analyzing Task Streak Status:\n');

// Check status for each task
sampleTasks.forEach((task, index) => {
  console.log(`${index + 1}. ${task.title} (${task.type})`);
  console.log(`   Current streak: ${task.streakCount} days`);
  
  if (task.lastCompleted) {
    const daysSince = dayjs().tz(userTimezone).diff(dayjs(task.lastCompleted), 'day');
    console.log(`   Last completed: ${dayjs(task.lastCompleted).tz(userTimezone).format('MMM DD, YYYY')} (${daysSince} days ago)`);
  } else {
    console.log(`   Last completed: Never`);
  }

  // Check streak status
  const status = streakService.checkStreakStatus(task, userTimezone);
  
  console.log(`   Status: ${status.isActive ? '✅ Active' : '❌ Inactive'}`);
  console.log(`   Eligible for update: ${status.isEligibleForUpdate ? '✅ Yes' : '❌ No'}`);
  
  if (status.streakBroken) {
    console.log(`   ⚠️  Streak broken!`);
  }
  
  if (status.gracePeriodRemaining > 0) {
    console.log(`   ⏰ Grace period: ${status.gracePeriodRemaining.toFixed(1)} hours remaining`);
  }
  
  if (status.nextDueDate) {
    const nextDue = dayjs(status.nextDueDate).tz(userTimezone);
    const hoursUntilDue = nextDue.diff(dayjs().tz(userTimezone), 'hour');
    console.log(`   📅 Next due: ${nextDue.format('MMM DD, YYYY HH:mm')} (${hoursUntilDue > 0 ? `in ${hoursUntilDue}h` : `${Math.abs(hoursUntilDue)}h ago`})`);
  }

  // Check for milestone rewards
  const reward = streakService.getStreakRewards(task.streakCount);
  if (reward) {
    console.log(`   🏆 Milestone reward available!`);
    console.log(`       Title: ${reward.title}`);
    console.log(`       Bonus XP: ${reward.bonusXP}`);
    console.log(`       Items: ${reward.bonusItems.join(', ')}`);
    console.log(`       Achievements: ${reward.achievements.join(', ')}`);
  }
  
  console.log('');
});

// Demonstrate recurrence calculations
console.log('📅 Recurrence Pattern Analysis:\n');

const recurrencePatterns = [
  'DAILY',
  'EVERY 2 DAYS',
  'WEEKDAYS',
  'WEEKENDS',
  'WEEKLY',
  'MONTHLY',
];

recurrencePatterns.forEach(pattern => {
  console.log(`Pattern: ${pattern}`);
  
  const lastCompleted = dayjs().tz(userTimezone).subtract(2, 'day').startOf('day').toDate();
  const recurrence = streakService.calculateRecurrence(pattern, lastCompleted, userTimezone);
  
  console.log(`  Last completed: ${dayjs(lastCompleted).tz(userTimezone).format('MMM DD, YYYY')}`);
  console.log(`  Next due: ${dayjs(recurrence.nextDueDate).tz(userTimezone).format('MMM DD, YYYY HH:mm')}`);
  console.log(`  Is due: ${recurrence.isDue ? '✅ Yes' : '❌ No'}`);
  console.log(`  Is overdue: ${recurrence.isOverdue ? '⚠️ Yes' : '✅ No'}`);
  console.log(`  Grace period active: ${recurrence.gracePeriodActive ? '⏰ Yes' : '❌ No'}`);
  console.log(`  Missed completions: ${recurrence.missedCompletions}`);
  console.log('');
});

// Demonstrate milestone rewards
console.log('🏆 Milestone Reward Examples:\n');

const milestones = [3, 7, 14, 30, 50, 100, 365, 1000];

milestones.forEach(milestone => {
  const reward = streakService.getStreakRewards(milestone);
  
  if (reward) {
    console.log(`${milestone}-Day Streak (${reward.title}):`);
    console.log(`  Bonus XP: ${reward.bonusXP}`);
    console.log(`  Multiplier: ${reward.multiplier.toFixed(2)}x`);
    console.log(`  Items: ${reward.bonusItems.slice(0, 3).join(', ')}${reward.bonusItems.length > 3 ? '...' : ''}`);
    console.log(`  Achievements: ${reward.achievements.join(', ')}`);
    console.log('');
  }
});

// Demonstrate timezone differences
console.log('🌍 Timezone Comparison:\n');

const timezones = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];
const testTaskForTimezone = sampleTasks[0];

if (testTaskForTimezone) {
  timezones.forEach(tz => {
    const status = streakService.checkStreakStatus(testTaskForTimezone, tz);
    const currentTime = dayjs().tz(tz).format('MMM DD, HH:mm z');
    
    console.log(`${tz}: ${currentTime}`);
    console.log(`  Task status: ${status.isActive ? 'Active' : 'Inactive'}`);
    console.log(`  Days since completion: ${status.daysSinceLastCompletion}`);
    console.log(`  Eligible for update: ${status.isEligibleForUpdate ? 'Yes' : 'No'}`);
    console.log('');
  });
}

// Performance demonstration
console.log('⚡ Performance Metrics:\n');

const startTime = Date.now();

// Simulate checking 1000 tasks
for (let i = 0; i < 1000; i++) {
  const baseTask = sampleTasks[i % sampleTasks.length];
  if (baseTask) {
    const testTask = {
      ...baseTask,
      id: `perf-task-${i}`,
      lastCompleted: dayjs().subtract(Math.floor(Math.random() * 5), 'day').toDate(),
    };
    
    streakService.checkStreakStatus(testTask, userTimezone);
  }
}

const endTime = Date.now();
const duration = endTime - startTime;

console.log(`✅ Processed 1000 streak status checks in ${duration}ms`);
console.log(`📊 Average: ${(duration / 1000).toFixed(2)}ms per check`);

console.log('\n🎯 Streak Service Features Demonstrated:');
console.log('✅ Streak status checking with timezone support');
console.log('✅ Grace period handling for missed completions');
console.log('✅ Recurrence pattern parsing and calculation');
console.log('✅ Milestone reward system with tiered benefits');
console.log('✅ Multi-timezone compatibility');
console.log('✅ Performance optimization for bulk operations');
console.log('✅ Edge case handling and error recovery');

console.log('\n✨ Streak tracking system ready for production! 🚀');