# playo Database Schema

This document describes the database schema for the playo AI-powered habit tracking RPG.

## Overview

The database is built using **Prisma ORM** with **PostgreSQL** as the primary database. The schema includes 6 main models that support the core functionality of the gamified habit tracking system.

## Models

### 1. User
Core user information and character data.

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  password      String
  username      String   @unique
  characterName String
  level         Int      @default(1)
  xp            Int      @default(0)
  stats         Json     @default("{}")
  preferences   Json     @default("{}")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

**Key Features:**
- Unique email and username constraints
- JSON fields for flexible stats and preferences storage
- Character progression tracking (level, XP)
- Timestamps for audit trails

### 2. Task
User tasks, habits, and todos with gamification features.

```prisma
model Task {
  id             String         @id @default(cuid())
  userId         String
  title          String
  description    String?
  type           TaskType       // DAILY, HABIT, TODO
  difficulty     TaskDifficulty // EASY, MEDIUM, HARD
  category       String
  recurrenceRule String?
  streakCount    Int            @default(0)
  lastCompleted  DateTime?
  isActive       Boolean        @default(true)
}
```

**Key Features:**
- Three task types for different use cases
- Difficulty-based rewards system
- Streak tracking for consistency rewards
- Flexible recurrence rules
- Soft delete with isActive flag

### 3. StoryProgression
Tracks user progress through AI-generated storylines.

```prisma
model StoryProgression {
  id             String   @id @default(cuid())
  userId         String
  storyId        String
  currentChapter Int      @default(1)
  chapterData    Json     @default("{}")
  branchesTaken  Json     @default("[]")
  lastUpdated    DateTime @updatedAt
}
```

**Key Features:**
- Multiple story support per user
- Chapter-based progression tracking
- Choice history with branchesTaken
- Flexible chapter data storage

### 4. CompletedTask
Task completion history with rewards tracking.

```prisma
model CompletedTask {
  id            String   @id @default(cuid())
  userId        String
  taskId        String
  completedAt   DateTime @default(now())
  xpGained      Int      @default(0)
  storyUnlocked Boolean  @default(false)
}
```

**Key Features:**
- Complete task completion audit trail
- XP reward tracking
- Story unlock notifications
- Time-based analytics support

### 5. CharacterInventory
Character equipment and items system.

```prisma
model CharacterInventory {
  id       String   @id @default(cuid())
  userId   String
  itemId   String
  itemName String
  itemType ItemType // WEAPON, ARMOR, ACCESSORY, etc.
  equipped Boolean  @default(false)
  quantity Int      @default(1)
  metadata Json     @default("{}")
}
```

**Key Features:**
- Equipment system with equipped status
- Stackable items with quantity
- Flexible metadata for item properties
- Multiple item types support

### 6. AIGenerationLog
AI API usage tracking and cost management.

```prisma
model AIGenerationLog {
  id             String   @id @default(cuid())
  userId         String
  prompt         String
  response       String
  modelUsed      String
  tokensUsed     Int      @default(0)
  cost           Float    @default(0.0)
  generationTime Int      @default(0)
  purpose        String?
  success        Boolean  @default(true)
  errorMessage   String?
}
```

**Key Features:**
- Complete AI generation audit trail
- Cost tracking and optimization
- Error handling and debugging
- Performance monitoring

## Enums

### TaskType
- `DAILY` - Daily recurring tasks
- `HABIT` - Habit tracking
- `TODO` - One-time tasks

### TaskDifficulty
- `EASY` - Simple tasks (lower XP rewards)
- `MEDIUM` - Moderate tasks (standard XP)
- `HARD` - Challenging tasks (higher XP rewards)

### ItemType
- `WEAPON` - Combat items
- `ARMOR` - Defensive items
- `ACCESSORY` - Bonus items
- `CONSUMABLE` - Single-use items
- `QUEST_ITEM` - Story-specific items
- `COSMETIC` - Appearance items

## Relations

```
User (1) ←→ (N) Task
User (1) ←→ (N) StoryProgression
User (1) ←→ (N) CompletedTask
User (1) ←→ (N) CharacterInventory
User (1) ←→ (N) AIGenerationLog
Task (1) ←→ (N) CompletedTask
```

## Indexes

Performance-optimized indexes are included for:

### User Model
- `email` (unique constraint + index)
- `username` (unique constraint + index)
- `level` (for leaderboards)
- `createdAt` (for user registration analytics)

### Task Model
- `userId` (foreign key optimization)
- `type`, `difficulty`, `category` (filtering)
- `isActive` (active task queries)
- `lastCompleted` (streak calculations)
- `createdAt` (task creation analytics)

### Other Models
- Foreign key indexes on all `userId` fields
- Timestamp indexes for analytics
- Status/type indexes for filtering

## Database Commands

### Setup
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Create and run migrations (production)
npm run db:migrate

# Reset database (development only)
npm run db:reset

# Seed database with sample data
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

### Migration Workflow
```bash
# 1. Modify schema.prisma
# 2. Create migration
npm run db:migrate

# 3. Deploy to production
npm run db:deploy
```

## Sample Data

The seed file (`prisma/seed.ts`) includes:
- Demo user with character progression
- Sample tasks of different types and difficulties
- Character inventory with equipped items
- Story progression example
- AI generation logs

Run seeding with:
```bash
npm run db:seed
```

## Environment Variables

Required environment variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/playo_dev"
```

## Best Practices

1. **Always use transactions** for operations that modify multiple related records
2. **Include proper error handling** for database operations
3. **Use select statements** to limit data transfer for large queries
4. **Leverage indexes** for frequently queried fields
5. **Monitor AI generation costs** through the AIGenerationLog model
6. **Regular backups** of user progress and story data

## Performance Considerations

- JSON fields are indexed using GIN indexes in PostgreSQL
- Pagination should be implemented for large data sets
- Consider connection pooling for high-traffic scenarios
- Monitor query performance with Prisma query logs

## Security Notes

- Passwords are hashed using bcrypt with 12 rounds
- User data includes soft delete patterns where appropriate
- Foreign key constraints ensure data integrity
- Input validation should be implemented at the service layer