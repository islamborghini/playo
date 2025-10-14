import { TaskService } from '../src/services/taskService';
import { RPGProgressionService } from '../src/utils/rpgProgressionService';
import { XPCalculator } from '../src/utils/xpCalculator';
import { TaskDifficulty, TaskType } from '../src/generated/prisma';

console.log('🎮 QuestForge RPG Integration Demo\n');

// Example usage with a mock user ID
const DEMO_USER_ID = 'demo-user-123';

async function demonstrateRPGIntegration() {
  try {
    console.log('📋 Creating sample tasks...');
    
    // Sample tasks creation (would normally be done through API)
    const taskData = [
      {
        title: 'Morning Jog',
        description: 'Run for 30 minutes in the park',
        type: TaskType.DAILY,
        difficulty: TaskDifficulty.MEDIUM,
        category: 'fitness',
        userId: DEMO_USER_ID,
      },
      {
        title: 'Read Programming Book',
        description: 'Study algorithms for 1 hour',
        type: TaskType.DAILY,
        difficulty: TaskDifficulty.HARD,
        category: 'learning',
        userId: DEMO_USER_ID,
      },
      {
        title: 'Meditation',
        description: '15 minutes of mindfulness',
        type: TaskType.DAILY,
        difficulty: TaskDifficulty.EASY,
        category: 'mindfulness',
        userId: DEMO_USER_ID,
      },
    ];

    // Initialize user stats if needed
    console.log('🏃 Initializing user RPG stats...');
    await RPGProgressionService.initializeUserStats(DEMO_USER_ID);

    console.log('\n📊 Initial User Stats:');
    let userStats = await RPGProgressionService.getUserProgressionStats(DEMO_USER_ID);
    console.log(`Level: ${userStats.level}`);
    console.log(`XP: ${userStats.totalXP}`);
    console.log(`Streak: ${userStats.currentStreak} days`);
    console.log(`Stats: STR:${userStats.stats.strength} WIS:${userStats.stats.wisdom} AGI:${userStats.stats.agility} END:${userStats.stats.endurance} LCK:${userStats.stats.luck}`);

    console.log('\n🎯 Task Completion Simulation:');
    
    // Simulate completing tasks over several days
    for (let day = 1; day <= 3; day++) {
      console.log(`\n📅 Day ${day}:`);
      
      for (const task of taskData) {
        // This would normally be triggered by the task completion endpoint
        const result = await RPGProgressionService.completeTaskWithProgression(
          DEMO_USER_ID,
          `task-${task.title.toLowerCase().replace(/\s+/g, '-')}`,
          task.difficulty,
          task.category
        );

        console.log(`  ✅ ${task.title} (${task.difficulty})`);
        console.log(`     XP Gained: ${result.xpGained} (${result.streakMultiplier.toFixed(2)}x multiplier)`);
        
        if (Object.keys(result.statBonuses).length > 0) {
          console.log(`     Stat Bonuses: ${JSON.stringify(result.statBonuses)}`);
        }
        
        if (result.leveledUp) {
          console.log(`     🎉 LEVEL UP! ${result.levelBefore} → ${result.levelAfter}`);
        }
      }
      
      // Show updated stats
      userStats = await RPGProgressionService.getUserProgressionStats(DEMO_USER_ID);
      console.log(`  📈 Progress: Level ${userStats.level} (${userStats.progression.progressToNextLevel.toFixed(1)}% to next)`);
      console.log(`  🔥 Streak: ${userStats.currentStreak} days (${userStats.streak.multiplier.toFixed(2)}x)`);
    }

    console.log('\n🔮 Simulating Future Progress:');
    const simulation = await RPGProgressionService.simulateTaskCompletion(
      DEMO_USER_ID,
      TaskDifficulty.HARD,
      'fitness',
      10
    );

    if (simulation.length > 0) {
      const lastResult = simulation[simulation.length - 1];
      if (lastResult) {
        console.log(`After 10 more HARD fitness tasks:`);
        console.log(`- Total XP: ${lastResult.totalXPAfter}`);
        console.log(`- Level: ${lastResult.levelAfter}`);
        console.log(`- Total XP gained: ${lastResult.totalXPAfter - userStats.totalXP}`);
      }
    }

    console.log('\n🏆 Achievement Check:');
    const achievements = RPGProgressionService.checkAchievements(
      userStats.level,
      userStats.totalXP,
      userStats.currentStreak,
      userStats.stats
    );
    
    if (achievements.length > 0) {
      console.log(`Unlocked achievements: ${achievements.join(', ')}`);
    } else {
      console.log('No achievements unlocked yet - keep going!');
    }

    console.log('\n🎮 XP Calculator Features Used:');
    console.log('✅ Difficulty-based XP calculation');
    console.log('✅ Streak multipliers');
    console.log('✅ Level progression tracking');
    console.log('✅ Category-based stat bonuses');
    console.log('✅ Achievement system');
    console.log('✅ Progress simulation');

  } catch (error) {
    console.error('Demo error:', error);
    
    // Show standalone XP calculator examples instead
    console.log('\n🧮 Standalone XP Calculator Examples:');
    
    // Example calculations
    const examples = [
      { difficulty: TaskDifficulty.EASY, streak: 0, category: 'fitness' },
      { difficulty: TaskDifficulty.MEDIUM, streak: 5, category: 'learning' },
      { difficulty: TaskDifficulty.HARD, streak: 15, category: 'productivity' },
    ];

    examples.forEach((example, index) => {
      const result = XPCalculator.calculateTaskXP(
        example.difficulty,
        example.streak,
        index * 200, // Different starting XP
        example.category
      );

      console.log(`\n${index + 1}. ${example.difficulty} ${example.category} task (${example.streak}-day streak):`);
      console.log(`   Base XP: ${result.baseXP}`);
      console.log(`   Multiplier: ${result.streakMultiplier.toFixed(2)}x`);
      console.log(`   Final XP: ${result.finalXP}`);
      console.log(`   Level: ${result.levelBefore} → ${result.levelAfter}${result.leveledUp ? ' (LEVEL UP!)' : ''}`);
      
      if (Object.keys(result.statBonuses).length > 0) {
        console.log(`   Stat Bonuses: ${JSON.stringify(result.statBonuses)}`);
      }
    });
  }
}

// Run the demonstration
demonstrateRPGIntegration().then(() => {
  console.log('\n✨ Demo completed!');
  process.exit(0);
}).catch(error => {
  console.error('Demo failed:', error);
  process.exit(1);
});