# QuestForge Streak Tracking Service

The QuestForge Streak Tracking Service provides comprehensive streak management for habit tracking with timezone support, grace periods, milestone rewards, and flexible recurrence patterns.

## Core Features

### 1. Streak Status Tracking
- **Real-time Status**: Check if streaks are active, broken, or in grace period
- **Eligibility Checking**: Determine if tasks can be completed based on recurrence rules
- **Grace Period Support**: 6-hour buffer for missed completions to maintain streaks
- **Timezone Awareness**: Accurate calculations across different time zones

### 2. Recurrence Pattern Support
- **Built-in Patterns**: DAILY, WEEKLY, MONTHLY, ONCE
- **Custom Intervals**: "EVERY 2 DAYS", "EVERY 3 WEEKS"
- **Day-specific Rules**: WEEKDAYS, WEEKENDS
- **Flexible Parsing**: Natural language pattern recognition

### 3. Milestone Reward System
- **Tiered Rewards**: Bronze (3d) → Silver (7d) → Gold (14d) → Platinum (30d) → Diamond (50d) → Master (100d) → Grandmaster (200d) → Legendary (365d) → Mythic (500d) → Immortal (1000d)
- **XP Bonuses**: Exponential scaling based on streak length and tier
- **Virtual Items**: Badges, potions, stat boosts, titles, and special effects
- **Achievements**: Automatic achievement unlocking for milestones

### 4. Timezone Handling
- **Global Support**: Works with any timezone using dayjs
- **Accurate Calculations**: Proper day boundaries and due date calculations
- **User Preferences**: Per-user timezone settings
- **DST Aware**: Handles daylight saving time transitions

## API Reference

### StreakService Class

#### `updateStreak(taskId, userTimezone?, completedAt?)`
Updates a task's streak based on completion timing.

**Parameters:**
- `taskId`: String ID of the task to update
- `userTimezone`: User's timezone (default: 'UTC')
- `completedAt`: Optional completion timestamp (default: now)

**Returns:** `StreakUpdateResult`
```typescript
interface StreakUpdateResult {
  previousStreak: number;
  newStreak: number;
  streakIncremented: boolean;
  streakReset: boolean;
  reward?: StreakReward;
  statusChanged: boolean;
  gracePeriodUsed: boolean;
}
```

#### `checkStreakStatus(task, userTimezone?)`
Analyzes current streak status for a task.

**Parameters:**
- `task`: Task object with streak data
- `userTimezone`: User's timezone (default: 'UTC')

**Returns:** `StreakStatus`
```typescript
interface StreakStatus {
  isActive: boolean;
  currentStreak: number;
  daysSinceLastCompletion: number;
  isEligibleForUpdate: boolean;
  nextDueDate?: Date;
  streakBroken: boolean;
  gracePeriodRemaining: number;
}
```

#### `getStreakRewards(streakCount)`
Gets milestone rewards for specific streak lengths.

**Parameters:**
- `streakCount`: Number of consecutive days

**Returns:** `StreakReward | undefined`
```typescript
interface StreakReward {
  milestone: number;
  bonusXP: number;
  bonusItems: string[];
  multiplier: number;
  achievements: string[];
  title: string;
  description: string;
}
```

#### `calculateRecurrence(recurrenceRule, lastCompleted, userTimezone?)`
Calculates task recurrence and due dates.

**Parameters:**
- `recurrenceRule`: String pattern (e.g., "DAILY", "EVERY 2 DAYS")
- `lastCompleted`: Last completion date or null
- `userTimezone`: User's timezone (default: 'UTC')

**Returns:** `RecurrenceCheck`
```typescript
interface RecurrenceCheck {
  isDue: boolean;
  nextDueDate: Date;
  daysSinceLastCompletion: number;
  missedCompletions: number;
  isOverdue: boolean;
  gracePeriodActive: boolean;
}
```

## Usage Examples

### Basic Streak Checking
```typescript
import { StreakService } from '@/services/streakService';

const streakService = new StreakService();

// Check if a daily task streak is active
const status = streakService.checkStreakStatus(task, 'America/New_York');

console.log(`Streak active: ${status.isActive}`);
console.log(`Current streak: ${status.currentStreak} days`);
console.log(`Grace period: ${status.gracePeriodRemaining.toFixed(1)} hours`);

if (status.isEligibleForUpdate) {
  console.log('Task can be completed now!');
}
```

### Updating Streaks
```typescript
// Complete a task and update streak
const result = await streakService.updateStreak(
  'task-123',
  'Europe/London'
);

if (result.streakIncremented) {
  console.log(`Streak increased: ${result.previousStreak} → ${result.newStreak}`);
  
  if (result.reward) {
    console.log(`🏆 Milestone reached: ${result.reward.title}`);
    console.log(`Bonus XP: ${result.reward.bonusXP}`);
    console.log(`Items: ${result.reward.bonusItems.join(', ')}`);
  }
}

if (result.gracePeriodUsed) {
  console.log('⏰ Completed within grace period!');
}
```

### Recurrence Patterns
```typescript
// Check various recurrence patterns
const patterns = [
  'DAILY',           // Every day
  'EVERY 2 DAYS',    // Every other day
  'WEEKDAYS',        // Monday through Friday
  'WEEKENDS',        // Saturday and Sunday
  'WEEKLY',          // Once per week
  'MONTHLY',         // Once per month
];

patterns.forEach(pattern => {
  const recurrence = streakService.calculateRecurrence(
    pattern,
    new Date(),
    'Asia/Tokyo'
  );
  
  console.log(`${pattern}: Next due ${recurrence.nextDueDate}`);
});
```

### Milestone Rewards
```typescript
// Check for milestone rewards
const milestones = [7, 30, 100, 365];

milestones.forEach(days => {
  const reward = streakService.getStreakRewards(days);
  
  if (reward) {
    console.log(`${days}-day milestone: ${reward.title}`);
    console.log(`  XP Bonus: ${reward.bonusXP}`);
    console.log(`  Multiplier: ${reward.multiplier}x`);
    console.log(`  Achievements: ${reward.achievements.join(', ')}`);
  }
});
```

### User Analytics
```typescript
// Get comprehensive streak statistics
const stats = await streakService.getUserStreakStats(
  'user-123',
  'America/Los_Angeles'
);

console.log(`Active streaks: ${stats.totalActiveStreaks}`);
console.log(`Longest streak: ${stats.longestStreak} days`);
console.log(`Average streak: ${stats.averageStreak} days`);

// Show upcoming due tasks
stats.upcomingDueTasks.forEach(task => {
  console.log(`${task.title} due in ${task.hoursUntilDue} hours`);
});
```

## Recurrence Pattern Reference

### Basic Patterns
- **DAILY**: Every day
- **WEEKLY**: Every 7 days
- **MONTHLY**: Every month (same date)
- **ONCE**: One-time task (no recurrence)

### Custom Intervals
- **EVERY X DAYS**: `"EVERY 2 DAYS"`, `"EVERY 5 DAYS"`
- **EVERY X WEEKS**: `"EVERY 2 WEEKS"`, `"EVERY 3 WEEKS"`
- **EVERY X MONTHS**: `"EVERY 2 MONTHS"`

### Day-Specific Patterns
- **WEEKDAYS**: Monday through Friday only
- **WEEKENDS**: Saturday and Sunday only

### Advanced Examples
```typescript
// Workout every other day
streakService.calculateRecurrence('EVERY 2 DAYS', lastCompleted, timezone);

// Weekly review on Sundays
streakService.calculateRecurrence('WEEKLY', lastCompleted, timezone);

// Monthly goal setting
streakService.calculateRecurrence('MONTHLY', lastCompleted, timezone);

// Work tasks on weekdays only
streakService.calculateRecurrence('WEEKDAYS', lastCompleted, timezone);
```

## Milestone Reward Tiers

### Tier System
```typescript
const rewardTiers = {
  bronze: { days: 3, xpMultiplier: 1.0 },
  silver: { days: 7, xpMultiplier: 1.5 },
  gold: { days: 14, xpMultiplier: 2.0 },
  platinum: { days: 30, xpMultiplier: 3.0 },
  diamond: { days: 50, xpMultiplier: 4.0 },
  master: { days: 100, xpMultiplier: 6.0 },
  grandmaster: { days: 200, xpMultiplier: 8.0 },
  legendary: { days: 365, xpMultiplier: 12.0 },
  mythic: { days: 500, xpMultiplier: 16.0 },
  immortal: { days: 1000, xpMultiplier: 25.0 },
};
```

### Reward Components
- **Bonus XP**: Calculated as `base × log₁₀(streakCount + 1)`
- **Items**: Tier-specific badges, potions, stat boosts, titles
- **Achievements**: Automatic unlock for milestones
- **Multipliers**: From XP calculator integration

## Grace Period System

### How It Works
1. **Standard Due Time**: Tasks are due at start of day in user's timezone
2. **Grace Period**: 6-hour buffer after due time
3. **Streak Preservation**: Completions within grace period maintain streak
4. **Visual Indicators**: UI shows remaining grace period time
5. **Streak Reset**: After grace period expires, streak resets to 0

### Grace Period Examples
```typescript
// Task due: Today at 00:00
// Grace period: Today at 00:00 - 06:00
// Current time: Today at 04:30
// Grace remaining: 1.5 hours
// Status: Can still complete and maintain streak

const status = streakService.checkStreakStatus(task, timezone);
console.log(`Grace period: ${status.gracePeriodRemaining} hours remaining`);
```

## Performance Optimizations

### Bulk Operations
```typescript
// Check multiple tasks efficiently
const taskIds = ['task-1', 'task-2', 'task-3'];
const statuses = await streakService.getMultipleStreakStatuses(
  taskIds,
  'UTC'
);

statuses.forEach((status, taskId) => {
  console.log(`${taskId}: ${status.isActive ? 'Active' : 'Inactive'}`);
});
```

### Caching Strategies
- Streak calculations are stateless and cacheable
- User timezone preferences can be cached
- Recurrence patterns can be pre-computed

### Database Integration
```typescript
// Efficient streak maintenance
const resetTaskIds = await streakService.resetExpiredStreaks(
  'user-123',
  'America/New_York'
);

console.log(`Reset ${resetTaskIds.length} expired streaks`);
```

## Testing

### Test Coverage
- ✅ 24 comprehensive tests
- ✅ Timezone handling edge cases
- ✅ Grace period calculations
- ✅ Recurrence pattern parsing
- ✅ Milestone reward generation
- ✅ Performance benchmarks

### Running Tests
```bash
npm test -- streakService.test.ts
```

### Demo Script
```bash
npx ts-node -r tsconfig-paths/register scripts/streak-demo.ts
```

## Integration with QuestForge

### Task Service Integration
```typescript
// In TaskService.completeTask()
const streakResult = await streakService.updateStreak(
  taskId,
  userTimezone
);

if (streakResult.reward) {
  // Grant milestone rewards
  await rewardService.grantReward(userId, streakResult.reward);
}
```

### XP Calculator Integration
```typescript
// Streak multipliers enhance XP calculations
const xpResult = XPCalculator.calculateTaskXP(
  difficulty,
  task.streakCount, // From streak service
  currentXP,
  category
);
```

### Achievement System Integration
```typescript
// Automatic achievement unlocking
if (streakResult.reward?.achievements) {
  await achievementService.unlockAchievements(
    userId,
    streakResult.reward.achievements
  );
}
```

## Production Considerations

### Error Handling
- Graceful fallbacks for invalid recurrence patterns
- Timezone error recovery
- Database connection resilience

### Monitoring
- Track streak completion rates
- Monitor grace period usage
- Alert on streak reset spikes

### Scalability
- Stateless design for horizontal scaling
- Efficient bulk operations
- Minimal database impact

The Streak Tracking Service provides a robust foundation for habit formation through gamification, encouraging consistent user engagement while handling the complexities of timezone management and flexible scheduling patterns.