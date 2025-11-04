import { PrismaClient, TaskType, TaskDifficulty, ItemType } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Seeding database...');

  // Create a demo user
  const hashedPassword = await bcrypt.hash('demo123', 12);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@playo.com' },
    update: {},
    create: {
      email: 'demo@playo.com',
      password: hashedPassword,
      username: 'demo_hero',
      characterName: 'Aria the Brave',
      level: 3,
      xp: 250,
      stats: JSON.stringify({
        strength: 12,
        wisdom: 8,
        agility: 10,
        endurance: 9,
        luck: 7,
      }),
      preferences: JSON.stringify({
        storyGenre: 'fantasy',
        difficulty: 'medium',
        notifications: true,
        theme: 'dark',
      }),
    },
  });

  console.log('✅ Created demo user:', demoUser.username);

  // Create sample tasks
  const tasks = await prisma.task.createMany({
    data: [
      {
        userId: demoUser.id,
        title: 'Morning Exercise',
        description: 'Complete a 30-minute workout',
        type: TaskType.DAILY,
        difficulty: TaskDifficulty.MEDIUM,
        category: 'fitness',
        recurrenceRule: 'FREQ=DAILY',
        streakCount: 5,
      },
      {
        userId: demoUser.id,
        title: 'Read for 20 minutes',
        description: 'Read a book or article for personal development',
        type: TaskType.HABIT,
        difficulty: TaskDifficulty.EASY,
        category: 'learning',
        streakCount: 12,
      },
      {
        userId: demoUser.id,
        title: 'Complete project documentation',
        description: 'Finish writing the project README',
        type: TaskType.TODO,
        difficulty: TaskDifficulty.HARD,
        category: 'work',
        streakCount: 0,
      },
    ],
  });

  console.log('✅ Created sample tasks:', tasks.count);

  // Create character inventory
  await prisma.characterInventory.createMany({
    data: [
      {
        userId: demoUser.id,
        itemId: 'sword_001',
        itemName: 'Iron Sword',
        itemType: ItemType.WEAPON,
        equipped: true,
        metadata: JSON.stringify({
          attack: 15,
          durability: 100,
          rarity: 'common',
        }),
      },
      {
        userId: demoUser.id,
        itemId: 'armor_001',
        itemName: 'Leather Armor',
        itemType: ItemType.ARMOR,
        equipped: true,
        metadata: JSON.stringify({
          defense: 8,
          durability: 80,
          rarity: 'common',
        }),
      },
      {
        userId: demoUser.id,
        itemId: 'potion_001',
        itemName: 'Health Potion',
        itemType: ItemType.CONSUMABLE,
        quantity: 3,
        metadata: JSON.stringify({
          effect: 'heal',
          amount: 50,
        }),
      },
    ],
  });

  console.log('✅ Created character inventory');

  // Create story progression
  await prisma.storyProgression.create({
    data: {
      userId: demoUser.id,
      storyId: 'main_quest_001',
      currentChapter: 3,
      chapterData: JSON.stringify({
        title: 'The Ancient Library',
        description: 'You have discovered the entrance to an ancient library...',
        choices: ['enter_library', 'search_surroundings', 'return_to_village'],
      }),
      branchesTaken: JSON.stringify(['helped_villager', 'chose_wisdom_path']),
    },
  });

  console.log('✅ Created story progression');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });