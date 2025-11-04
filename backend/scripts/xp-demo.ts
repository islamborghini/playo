#!/usr/bin/env ts-node
import { XPCalculator } from '../src/utils/xpCalculator';
import { TaskDifficulty } from '../src/generated/prisma';

console.log('🎮 playo XP Calculator Demo\n');

// Demo user starting stats
let totalXP = 0;
let streakCount = 0;
const userStats = {
  strength: 5,
  wisdom: 5,
  agility: 5,
  endurance: 5,
  luck: 5,
};

console.log('📊 Starting Character Stats:');
console.log(`Level: ${XPCalculator.calculateLevel(totalXP)}`);
console.log(`Total XP: ${totalXP}`);
console.log(`Streak: ${streakCount} days`);
console.log(`Stats: STR:${userStats.strength} WIS:${userStats.wisdom} AGI:${userStats.agility} END:${userStats.endurance} LCK:${userStats.luck}\n`);

// Simulate task completions
const tasks = [
  { difficulty: TaskDifficulty.EASY, category: 'fitness', name: 'Morning walk' },
  { difficulty: TaskDifficulty.MEDIUM, category: 'learning', name: 'Read programming book' },
  { difficulty: TaskDifficulty.HARD, category: 'fitness', name: 'Gym workout' },
  { difficulty: TaskDifficulty.MEDIUM, category: 'productivity', name: 'Complete project task' },
  { difficulty: TaskDifficulty.EASY, category: 'mindfulness', name: 'Meditation' },
];

// Complete tasks for multiple days to show streak progression
for (let day = 1; day <= 7; day++) {
  console.log(`🌅 Day ${day}:`);
  
  for (const task of tasks) {
    streakCount++;
    
    const result = XPCalculator.calculateTaskXP(
      task.difficulty,
      streakCount,
      totalXP,
      task.category
    );
    
    // Update totals
    totalXP = result.totalXPAfter;
    const newStats = XPCalculator.applyStatBonuses(userStats, result.statBonuses);
    Object.assign(userStats, newStats);
    
    console.log(`  ✅ ${task.name} (${task.difficulty})`);
    console.log(`     Base XP: ${result.baseXP}, Multiplier: ${result.streakMultiplier.toFixed(2)}x`);
    console.log(`     Gained: ${result.finalXP} XP ${Object.keys(result.statBonuses).length > 0 ? `+ ${JSON.stringify(result.statBonuses)}` : ''}`);
    
    if (result.leveledUp) {
      console.log(`     🎉 LEVEL UP! ${result.levelBefore} → ${result.levelAfter}`);
    }
  }
  
  // Show progression info
  const progression = XPCalculator.getLevelProgressionInfo(totalXP);
  const streakInfo = XPCalculator.getStreakMilestones(streakCount);
  
  console.log(`  📈 Level ${progression.currentLevel} (${progression.xpInCurrentLevel}/${progression.xpRequiredForNextLevel - progression.xpRequiredForCurrentLevel} XP)`);
  console.log(`  🔥 Streak: ${streakCount} days (${streakInfo.currentMultiplier.toFixed(2)}x multiplier)`);
  console.log(`  💪 Stats: STR:${userStats.strength} WIS:${userStats.wisdom} AGI:${userStats.agility} END:${userStats.endurance} LCK:${userStats.luck}`);
  
  if (!streakInfo.isAtMaxMultiplier) {
    console.log(`  🎯 Next milestone: ${streakInfo.nextMilestone} days (${streakInfo.nextMultiplier.toFixed(2)}x)`);
  }
  
  console.log('');
}

// Demonstrate simulation feature
console.log('🔮 Simulation: What if we complete 10 HARD fitness tasks?');
const simulationResults = XPCalculator.simulateXPGain(
  TaskDifficulty.HARD,
  streakCount,
  totalXP,
  'fitness',
  10
);

const lastResult = simulationResults[simulationResults.length - 1];
if (lastResult) {
  console.log(`Final result: ${lastResult.totalXPAfter} total XP, Level ${lastResult.levelAfter}`);
  console.log(`Total XP gained: ${lastResult.totalXPAfter - totalXP}`);
  console.log(`Level progression: ${XPCalculator.calculateLevel(totalXP)} → ${lastResult.levelAfter}`);
}

console.log('\n🎯 XP Calculator Features Demonstrated:');
console.log('✅ Difficulty-based base XP calculation');
console.log('✅ Streak multipliers (1.1x per 5-day interval, max 2x)');
console.log('✅ Exponential level progression');
console.log('✅ Category-based stat bonuses');
console.log('✅ Level-up detection');
console.log('✅ Progress tracking and milestones');
console.log('✅ Simulation capabilities');