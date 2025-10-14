import { characterService } from '../src/services/characterService';
import { XPCalculator } from '../src/utils/xpCalculator';
import prisma from '../src/utils/prisma';
import { ItemType } from '../src/generated/prisma';

async function demonstrateCharacterProgression() {
  console.log('🎮 playo Character Progression Service Demo\n');

  try {
    // Create a demo user for testing
    let user = await prisma.user.findUnique({
      where: { email: 'demo@playo.com' }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'demo@playo.com',
          password: 'hashedpassword',
          username: 'DemoHero',
          characterName: 'Brave Adventurer',
          stats: JSON.stringify({
            strength: 5,
            wisdom: 5,
            agility: 5,
            endurance: 5,
            luck: 5,
          }),
        },
      });
      console.log('✅ Created demo user');
    }

    console.log(`👤 Character: ${user.characterName} (${user.username})`);
    console.log(`📊 Starting Level: ${user.level}, XP: ${user.xp}\n`);

    // Demonstrate character sheet
    console.log('📋 === CHARACTER SHEET ===');
    let characterSheet = await characterService.getCharacterSheet(user.id);
    console.log(`Character: ${characterSheet.user.characterName}`);
    console.log(`Level: ${characterSheet.user.level} (XP: ${characterSheet.user.xp})`);
    console.log(`XP to Next Level: ${characterSheet.xpForNextLevel}`);
    console.log(`Available Stat Points: ${characterSheet.availableStatPoints}`);
    console.log('Stats:', characterSheet.stats);
    console.log('');

    // Demonstrate experience gain scenarios
    console.log('⚔️ === EXPERIENCE GAIN SCENARIOS ===');
    
    const scenarios = [
      { xp: 25, source: 'Completed Medium Task', statBonuses: { strength: 1 } },
      { xp: 50, source: 'Completed Hard Task', statBonuses: { wisdom: 2, agility: 1 } },
      { xp: 75, source: 'Weekly Streak Bonus', statBonuses: { endurance: 1, luck: 1 } },
      { xp: 100, source: 'Achievement Unlock', statBonuses: { strength: 2, wisdom: 1 } },
    ];

    for (const scenario of scenarios) {
      console.log(`\n💥 Adding ${scenario.xp} XP: ${scenario.source}`);
      const result = await characterService.addExperience(
        user.id,
        scenario.xp,
        scenario.source,
        scenario.statBonuses
      );

      console.log(`   XP Gained: ${result.xpGained}`);
      console.log(`   Total XP: ${result.totalXP}`);
      console.log(`   Stat Bonuses: ${JSON.stringify(result.statBonuses)}`);
      
      if (result.levelUpResult) {
        console.log(`   🎉 LEVEL UP! ${result.levelUpResult.oldLevel} → ${result.levelUpResult.newLevel}`);
        console.log(`   📈 Stat Points Gained: ${result.levelUpResult.statPointsGained}`);
        if (result.levelUpResult.newFeaturesUnlocked.length > 0) {
          console.log(`   🔓 Features Unlocked: ${result.levelUpResult.newFeaturesUnlocked.join(', ')}`);
        }
      }
    }

    // Update character sheet after XP gains
    characterSheet = await characterService.getCharacterSheet(user.id);
    console.log(`\n📊 Updated Character Status:`);
    console.log(`Level: ${characterSheet.user.level} (XP: ${characterSheet.user.xp})`);
    console.log(`Available Stat Points: ${characterSheet.availableStatPoints}`);
    console.log('Stats:', characterSheet.stats);

    // Demonstrate stat allocation
    console.log('\n🎯 === STAT ALLOCATION ===');
    if (characterSheet.availableStatPoints > 0) {
      const statUpdates = {
        strength: Math.min(3, characterSheet.availableStatPoints),
        wisdom: Math.min(2, Math.max(0, characterSheet.availableStatPoints - 3)),
      };

      console.log(`Allocating stat points: ${JSON.stringify(statUpdates)}`);
      const newStats = await characterService.updateStats(user.id, statUpdates);
      console.log('Updated stats:', newStats);
    } else {
      console.log('No stat points available to allocate');
    }

    // Demonstrate inventory and equipment
    console.log('\n🎒 === INVENTORY & EQUIPMENT ===');
    
    // Add some items to inventory
    console.log('Adding items to inventory...');
    await characterService.addItemToInventory(
      user.id,
      'Iron Sword',
      ItemType.WEAPON,
      { stats: { strength: 3, agility: 1 }, description: 'A sturdy iron sword' }
    );

    await characterService.addItemToInventory(
      user.id,
      'Leather Armor',
      ItemType.ARMOR,
      { stats: { endurance: 2, agility: -1 }, description: 'Basic leather protection' }
    );

    await characterService.addItemToInventory(
      user.id,
      'Health Potion',
      ItemType.CONSUMABLE,
      { effect: 'restore_health', value: 50 },
      3
    );

    // Equip items
    console.log('Equipping items...');
    await characterService.equipItem(user.id, 'weapon_iron_sword');
    await characterService.equipItem(user.id, 'armor_leather_armor');

    // Show updated character sheet with equipment
    characterSheet = await characterService.getCharacterSheet(user.id);
    console.log('\n📋 Final Character Sheet:');
    console.log(`Character: ${characterSheet.user.characterName}`);
    console.log(`Level: ${characterSheet.user.level} (XP: ${characterSheet.user.xp})`);
    console.log('Base Stats:', characterSheet.stats);
    console.log('Effective Stats (with equipment):', characterSheet.effectiveStats);
    console.log('Equipment:');
    if (characterSheet.equipment.weapon) {
      console.log(`  🗡️ Weapon: ${characterSheet.equipment.weapon.itemName}`);
    }
    if (characterSheet.equipment.armor) {
      console.log(`  🛡️ Armor: ${characterSheet.equipment.armor.itemName}`);
    }
    console.log(`Inventory Items: ${characterSheet.inventory.length}`);

    // Demonstrate level progression math
    console.log('\n📈 === LEVEL PROGRESSION ANALYSIS ===');
    const currentXP = characterSheet.user.xp;
    const nextLevelXP = characterSheet.xpForNextLevel;
    const currentLevel = characterSheet.user.level;
    
    console.log(`Current: Level ${currentLevel} with ${currentXP} XP`);
    console.log(`Next Level: ${nextLevelXP} XP needed`);
    
    // Calculate XP for next few levels
    for (let level = currentLevel + 1; level <= currentLevel + 3; level++) {
      const xpForLevel = XPCalculator.calculateXPForNextLevel((level - 1) * 100); // Rough estimate
      console.log(`Level ${level}: ~${xpForLevel} XP needed from level ${level - 1}`);
    }

    // Stat point analysis
    console.log('\n🎲 === STAT POINT ANALYSIS ===');
    const totalStatPointsFromLevels = (currentLevel - 1) * 2;
    const baseStatPoints = 25; // 5 stats × 5 base points each
    const currentStatTotal = (Object.values(characterSheet.stats) as number[]).reduce((sum, stat) => sum + stat, 0);
    const usedStatPoints = currentStatTotal - baseStatPoints;
    
    console.log(`Total Stat Points Earned: ${totalStatPointsFromLevels} (from ${currentLevel - 1} level-ups)`);
    console.log(`Used Stat Points: ${usedStatPoints}`);
    console.log(`Available Stat Points: ${characterSheet.availableStatPoints}`);

    // Equipment bonus breakdown
    console.log('\n⚔️ === EQUIPMENT BONUS BREAKDOWN ===');
    Object.keys(characterSheet.stats).forEach(stat => {
      const baseStat = characterSheet.stats[stat as keyof typeof characterSheet.stats];
      const effectiveStat = characterSheet.effectiveStats[stat as keyof typeof characterSheet.effectiveStats];
      const bonus = effectiveStat - baseStat;
      console.log(`${stat}: ${baseStat} + ${bonus} = ${effectiveStat}`);
    });

    console.log('\n✅ Character progression demonstration completed!');
    
  } catch (error) {
    console.error('❌ Error during demonstration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the demonstration
demonstrateCharacterProgression().catch(console.error);