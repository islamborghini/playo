# QuestForge XP Calculator System

The QuestForge XP Calculator is a comprehensive RPG progression system that gamifies task completion through experience points, level progression, stat bonuses, and streak multipliers.

## Core Features

### 1. Difficulty-Based XP Calculation
Tasks award base XP based on their difficulty level:
- **EASY**: 10 XP
- **MEDIUM**: 25 XP  
- **HARD**: 50 XP

### 2. Streak Multipliers
Consecutive daily task completion builds streaks that multiply XP gains:
- Multiplier applies every 5 days of streak
- 1.1x multiplier per 5-day interval
- Maximum multiplier: 2.0x
- Examples:
  - 5-day streak: 1.1x multiplier
  - 10-day streak: 1.21x multiplier
  - 25+ days: 2.0x multiplier (capped)

### 3. Exponential Level Progression
Character levels are calculated using an exponential curve:
- Formula: `level = floor(sqrt(totalXP / 100)) + 1`
- Level progression requirements:
  - Level 1: 0 XP
  - Level 2: 100 XP
  - Level 3: 400 XP
  - Level 4: 900 XP
  - Level 5: 1600 XP

### 4. Category-Based Stat Bonuses
Task categories award specific stat bonuses (1 point per 25 XP gained):
- **fitness** → **strength**
- **learning** → **wisdom**
- **creative** → **wisdom**
- **social** → **agility**
- **productivity** → **endurance**
- **mindfulness** → **wisdom**
- **health** → **endurance**
- **skills** → **wisdom**
- **work** → **endurance**
- **hobby** → **agility**

## API Reference

### XPCalculator Class

#### `calculateTaskXP(difficulty, streakCount, currentTotalXP, taskCategory)`
Calculates complete XP result for a task completion.

**Parameters:**
- `difficulty`: TaskDifficulty enum (EASY, MEDIUM, HARD)
- `streakCount`: Current consecutive day streak
- `currentTotalXP`: User's current total experience points
- `taskCategory`: String category of the task

**Returns:** `XPCalculationResult`
```typescript
interface XPCalculationResult {
  baseXP: number;                // Base XP for difficulty
  streakMultiplier: number;       // Applied streak multiplier
  finalXP: number;               // Final XP after multiplier
  totalXPAfter: number;          // User's XP after gaining this XP
  levelBefore: number;           // User's level before completion
  levelAfter: number;            // User's level after completion
  leveledUp: boolean;            // Whether user leveled up
  xpForNextLevel: number;        // XP needed for next level
  statBonuses: StatBonuses;      // Stat points awarded
}
```

#### `calculateLevel(totalXP)`
Calculates character level from total XP using exponential curve.

#### `calculateStreakMultiplier(streakCount)`
Calculates XP multiplier based on streak length.

#### `getLevelProgressionInfo(totalXP)`
Returns detailed level progression information including progress to next level.

#### `simulateXPGain(difficulty, streakCount, currentTotalXP, taskCategory, completionsCount)`
Simulates multiple task completions for planning purposes.

### RPGProgressionService Class

#### `completeTaskWithProgression(userId, taskId, difficulty, category)`
Completes a task and updates user progression in the database.

#### `getUserProgressionStats(userId)`
Retrieves comprehensive user progression statistics.

#### `simulateTaskCompletion(userId, difficulty, category, completions)`
Simulates task completions for a specific user.

#### `getLeaderboard(limit)`
Returns top users by level and XP with RPG stats.

#### `checkAchievements(level, totalXP, streak, stats)`
Checks for unlocked achievements based on progression.

## Usage Examples

### Basic XP Calculation
```typescript
import { XPCalculator } from '@/utils/xpCalculator';
import { TaskDifficulty } from '@/generated/prisma';

// Calculate XP for a medium fitness task with 10-day streak
const result = XPCalculator.calculateTaskXP(
  TaskDifficulty.MEDIUM,  // 25 base XP
  10,                     // 10-day streak (1.21x multiplier)
  500,                    // Current total XP
  'fitness'               // Strength stat bonuses
);

console.log(result);
// {
//   baseXP: 25,
//   streakMultiplier: 1.21,
//   finalXP: 30,
//   totalXPAfter: 530,
//   levelBefore: 3,
//   levelAfter: 3,
//   leveledUp: false,
//   xpForNextLevel: 370,
//   statBonuses: { strength: 1 }
// }
```

### Level Progression Info
```typescript
const progression = XPCalculator.getLevelProgressionInfo(750);
console.log(progression);
// {
//   currentLevel: 3,
//   xpInCurrentLevel: 350,
//   xpRequiredForCurrentLevel: 400,
//   xpRequiredForNextLevel: 900,
//   progressToNextLevel: 70.0
// }
```

### Streak Milestones
```typescript
const streakInfo = XPCalculator.getStreakMilestones(17);
console.log(streakInfo);
// {
//   currentMultiplier: 1.33,
//   nextMilestone: 20,
//   streaksToNextMilestone: 3,
//   nextMultiplier: 1.46,
//   isAtMaxMultiplier: false
// }
```

### Database Integration
```typescript
import { RPGProgressionService } from '@/utils/rpgProgressionService';

// Complete a task with full RPG integration
const result = await RPGProgressionService.completeTaskWithProgression(
  userId,
  taskId,
  TaskDifficulty.HARD,
  'learning'
);

if (result.leveledUp) {
  console.log(`Level up! ${result.levelBefore} → ${result.levelAfter}`);
}
```

### User Stats Overview
```typescript
const userStats = await RPGProgressionService.getUserProgressionStats(userId);
console.log(`${userStats.characterName} - Level ${userStats.level}`);
console.log(`XP: ${userStats.totalXP} (${userStats.progression.progressToNextLevel.toFixed(1)}% to next level)`);
console.log(`Streak: ${userStats.currentStreak} days (${userStats.streak.multiplier}x multiplier)`);
console.log(`Stats: STR:${userStats.stats.strength} WIS:${userStats.stats.wisdom} AGI:${userStats.stats.agility} END:${userStats.stats.endurance} LCK:${userStats.stats.luck}`);
```

## Achievement System

The system includes various achievements that unlock based on progression:

### Level Achievements
- **LEVEL_10**: Reach level 10
- **LEVEL_25**: Reach level 25  
- **LEVEL_50**: Reach level 50

### XP Achievements
- **XP_1000**: Earn 1,000 total XP
- **XP_10000**: Earn 10,000 total XP

### Streak Achievements
- **WEEK_STREAK**: Maintain 7-day streak
- **MONTH_STREAK**: Maintain 30-day streak
- **CENTURY_STREAK**: Maintain 100-day streak

### Stat Achievements
- **STRONG_WARRIOR**: Reach 20 Strength
- **WISE_SCHOLAR**: Reach 20 Wisdom
- **SWIFT_ROGUE**: Reach 20 Agility
- **HARDY_GUARDIAN**: Reach 20 Endurance
- **BALANCED_HERO**: Reach 15 in all stats

## Database Schema Integration

The system integrates with the existing Prisma schema:

### User Model Extensions
User stats are stored as JSON in the `stats` field:
```typescript
interface UserStats {
  strength: number;      // Physical power stat
  wisdom: number;        // Knowledge/learning stat  
  agility: number;       // Speed/social stat
  endurance: number;     // Stamina/productivity stat
  luck: number;          // Bonus stat
  currentStreak?: number; // Current daily streak
  lastActiveDate?: Date; // Last activity timestamp
}
```

### CompletedTask Records
Each task completion creates a record with XP gained:
```typescript
{
  userId: string;
  taskId: string;
  xpGained: number;
  completedAt: Date;
}
```

## Performance Considerations

1. **Efficient Calculations**: All XP calculations use mathematical formulas rather than database lookups
2. **Caching**: User stats are stored as JSON to minimize database queries
3. **Batch Operations**: Multiple task completions can be processed efficiently
4. **Simulation Mode**: Planning features don't require database writes

## Testing

Comprehensive test suite covers:
- Base XP calculations for all difficulty levels
- Streak multiplier calculations and edge cases
- Level progression formulas and thresholds
- Stat bonus calculations and category mappings
- Integration scenarios and error handling

Run tests with:
```bash
npm test -- xpCalculator.test.ts
```

## Demo Scripts

Two demonstration scripts are available:

1. **XP Calculator Demo**: `scripts/xp-demo.ts`
   - Shows standalone calculator features
   - Demonstrates progression over multiple days
   - Includes simulation examples

2. **RPG Integration Demo**: `scripts/rpg-integration-demo.ts`
   - Shows database integration
   - Demonstrates task completion flow
   - Includes achievement checking

Run demos with:
```bash
npx ts-node -r tsconfig-paths/register scripts/xp-demo.ts
npx ts-node -r tsconfig-paths/register scripts/rpg-integration-demo.ts
```