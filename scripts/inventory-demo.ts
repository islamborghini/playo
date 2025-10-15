/**
 * Inventory Service Demo
 * Demonstrates all inventory management features
 */

import prisma from '../src/utils/prisma';
import { inventoryService } from '../src/services/inventoryService';
import { ItemType } from '../src/generated/prisma';

async function main() {
  console.log('🎒 === Inventory Service Demo ===\n');

  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'inventory-test@example.com' },
    update: {},
    create: {
      email: 'inventory-test@example.com',
      username: 'inventory-tester',
      password: 'hashed_password',
      characterName: 'Inventory Hero',
      level: 5,
      xp: 1000,
    },
  });

  console.log(`👤 Testing with user: ${user.characterName} (Level ${user.level})\n`);

  // Clean up existing inventory
  await prisma.characterInventory.deleteMany({ where: { userId: user.id } });

  // === 1. Add Items ===
  console.log('📦 Step 1: Adding items to inventory...\n');

  const ironSword = await inventoryService.addItem(user.id, {
    itemName: 'Iron Sword',
    itemType: ItemType.WEAPON,
    metadata: {
      stats: { strength: 5, agility: 2 },
      rarity: 'Common',
      description: 'A basic iron sword'
    }
  });
  console.log(`✅ Added: ${ironSword.itemName} (+5 STR, +2 AGI)`);

  const leatherArmor = await inventoryService.addItem(user.id, {
    itemName: 'Leather Armor',
    itemType: ItemType.ARMOR,
    metadata: {
      stats: { endurance: 3, agility: 1 },
      rarity: 'Common',
      description: 'Light leather armor'
    }
  });
  console.log(`✅ Added: ${leatherArmor.itemName} (+3 END, +1 AGI)`);

  const luckyCharm = await inventoryService.addItem(user.id, {
    itemName: 'Lucky Charm',
    itemType: ItemType.ACCESSORY,
    metadata: {
      stats: { luck: 5 },
      rarity: 'Uncommon',
      description: 'Increases drop rates'
    }
  });
  console.log(`✅ Added: ${luckyCharm.itemName} (+5 LUCK)`);

  // Add stackable consumables
  const healthPotion = await inventoryService.addItem(user.id, {
    itemName: 'Health Potion',
    itemType: ItemType.CONSUMABLE,
    metadata: {
      effect: { heal: 50 },
      rarity: 'Common',
      description: 'Restores 50 HP'
    },
    quantity: 5
  });
  console.log(`✅ Added: ${healthPotion.itemName} x${healthPotion.quantity}`);

  const questKey = await inventoryService.addItem(user.id, {
    itemName: 'Ancient Key',
    itemType: ItemType.QUEST_ITEM,
    metadata: {
      questId: 'dungeon-quest-1',
      description: 'Unlocks the ancient temple'
    }
  });
  console.log(`✅ Added: ${questKey.itemName} (Quest Item)\n`);

  // === 2. Stack Consumables ===
  console.log('📦 Step 2: Testing item stacking...\n');

  const moreHealthPotions = await inventoryService.addItem(user.id, {
    itemName: 'Health Potion',
    itemType: ItemType.CONSUMABLE,
    quantity: 3
  });
  console.log(`✅ Added 3 more Health Potions. Total: ${moreHealthPotions.quantity}\n`);

  // === 3. View Inventory ===
  console.log('👜 Step 3: Viewing complete inventory...\n');

  const inventory = await inventoryService.getInventory(user.id);
  console.log(`Total items: ${inventory.totalItems}`);
  console.log(`Equipped items: ${inventory.totalEquipped}\n`);

  console.log('Items:');
  inventory.items.forEach(item => {
    const equipped = item.equipped ? '⚡ EQUIPPED' : '';
    const quantity = item.quantity > 1 ? `x${item.quantity}` : '';
    console.log(`  - ${item.itemName} ${quantity} [${item.itemType}] ${equipped}`);
  });
  console.log();

  // === 4. Equip Items ===
  console.log('⚔️ Step 4: Equipping items...\n');

  await inventoryService.equipItem(user.id, 'weapon_iron_sword');
  console.log('✅ Equipped: Iron Sword');

  await inventoryService.equipItem(user.id, 'armor_leather_armor');
  console.log('✅ Equipped: Leather Armor');

  await inventoryService.equipItem(user.id, 'accessory_lucky_charm');
  console.log('✅ Equipped: Lucky Charm\n');

  // === 5. Calculate Equipment Bonuses ===
  console.log('📊 Step 5: Calculating equipment bonuses...\n');

  const bonuses = await inventoryService.calculateEquipmentBonuses(user.id);
  console.log('Equipment Bonuses:');
  console.log(`  STR: +${bonuses.strength}`);
  console.log(`  WIS: +${bonuses.wisdom}`);
  console.log(`  AGI: +${bonuses.agility}`);
  console.log(`  END: +${bonuses.endurance}`);
  console.log(`  LUCK: +${bonuses.luck}\n`);

  // === 6. Get Equipped Items ===
  console.log('⚡ Step 6: Viewing equipped items...\n');

  const equipped = await inventoryService.getEquippedItems(user.id);
  equipped.forEach(item => {
    const metadata = JSON.parse(item.metadata);
    const stats = metadata.stats || {};
    const statsStr = Object.entries(stats)
      .map(([key, value]) => `+${value} ${key.toUpperCase().slice(0, 3)}`)
      .join(', ');
    console.log(`  ⚡ ${item.itemName} [${item.itemType}] - ${statsStr}`);
  });
  console.log();

  // === 7. Use Consumable ===
  console.log('🧪 Step 7: Using consumable items...\n');

  const useResult = await inventoryService.useItem(user.id, 'consumable_health_potion');
  console.log(`✅ Used Health Potion`);
  console.log(`   Effect: Heal ${useResult.effect.heal} HP`);
  console.log(`   Remaining: ${useResult.item?.quantity || 0}\n`);

  // === 8. Get Items by Type ===
  console.log('🗂️ Step 8: Filtering items by type...\n');

  const weapons = await inventoryService.getItemsByType(user.id, ItemType.WEAPON);
  console.log(`Weapons (${weapons.length}):`);
  weapons.forEach(item => console.log(`  ⚔️ ${item.itemName}`));

  const consumables = await inventoryService.getItemsByType(user.id, ItemType.CONSUMABLE);
  console.log(`\nConsumables (${consumables.length}):`);
  consumables.forEach(item => console.log(`  🧪 ${item.itemName} x${item.quantity}`));
  console.log();

  // === 9. Inventory Stats ===
  console.log('📈 Step 9: Inventory statistics...\n');

  const stats = await inventoryService.getInventoryStats(user.id);
  console.log(`Total Items: ${stats.totalItems}`);
  console.log(`Total Quantity: ${stats.totalQuantity}`);
  console.log(`\nBy Type:`);
  console.log(`  Weapons: ${stats.byType.weapons}`);
  console.log(`  Armor: ${stats.byType.armor}`);
  console.log(`  Accessories: ${stats.byType.accessories}`);
  console.log(`  Consumables: ${stats.byType.consumables}`);
  console.log(`  Quest Items: ${stats.byType.questItems}`);
  console.log(`\nBy Rarity:`);
  Object.entries(stats.byRarity).forEach(([rarity, count]) => {
    if (count > 0) console.log(`  ${rarity}: ${count}`);
  });
  console.log();

  // === 10. Unequip and Remove ===
  console.log('🔓 Step 10: Unequipping and removing items...\n');

  await inventoryService.unequipItem(user.id, 'accessory_lucky_charm');
  console.log('✅ Unequipped: Lucky Charm');

  await inventoryService.removeItem(user.id, 'accessory_lucky_charm');
  console.log('✅ Removed: Lucky Charm');

  // Try to remove equipped item (should fail)
  try {
    await inventoryService.removeItem(user.id, 'weapon_iron_sword');
  } catch (error) {
    console.log(`❌ Error: ${(error as Error).message}`);
  }
  console.log();

  // === 11. Add Better Weapon ===
  console.log('⚔️ Step 11: Upgrading equipment...\n');

  const steelSword = await inventoryService.addItem(user.id, {
    itemName: 'Steel Sword',
    itemType: ItemType.WEAPON,
    metadata: {
      stats: { strength: 10, agility: 3 },
      rarity: 'Uncommon',
      description: 'A well-crafted steel blade'
    }
  });
  console.log(`✅ Added: ${steelSword.itemName} (+10 STR, +3 AGI)`);

  await inventoryService.equipItem(user.id, 'weapon_steel_sword');
  console.log('✅ Equipped: Steel Sword (auto-unequipped Iron Sword)\n');

  // === 12. Final Inventory State ===
  console.log('📋 Step 12: Final inventory state...\n');

  const finalInventory = await inventoryService.getInventory(user.id);
  const finalBonuses = await inventoryService.calculateEquipmentBonuses(user.id);

  console.log('Final Equipment:');
  if (finalInventory.equipped.weapon) {
    console.log(`  Weapon: ${finalInventory.equipped.weapon.itemName}`);
  }
  if (finalInventory.equipped.armor) {
    console.log(`  Armor: ${finalInventory.equipped.armor.itemName}`);
  }
  if (finalInventory.equipped.accessory) {
    console.log(`  Accessory: ${finalInventory.equipped.accessory.itemName}`);
  }

  console.log('\nFinal Bonuses:');
  console.log(`  STR: +${finalBonuses.strength}`);
  console.log(`  WIS: +${finalBonuses.wisdom}`);
  console.log(`  AGI: +${finalBonuses.agility}`);
  console.log(`  END: +${finalBonuses.endurance}`);
  console.log(`  LUCK: +${finalBonuses.luck}\n`);

  console.log('✅ Inventory Service Demo Complete! 🎒\n');
}

main()
  .catch((error) => {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
