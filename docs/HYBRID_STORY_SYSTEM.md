# Hybrid Story System - Complete Guide

## Overview

The Hybrid Story System combines **narrative entertainment** with **real-life habit tracking** to create an immersive RPG experience where your actual progress drives the story forward.

## 🎮 Core Gameplay Loop

```
1. Create Story Arc (10 chapters with branching paths)
   ↓
2. Read Current Chapter
   ↓
3. Make Story Choice
   ↓
4. Complete Real-Life Tasks/Habits
   ↓
5. Gain XP & Stats
   ↓
6. Unlock Challenges (when requirements met)
   ↓
7. Attempt Combat/Puzzle Challenges
   ↓
8. Win Rewards & Story Progression
   ↓
9. Generate Next Chapter (reflects your progress)
   ↓
10. Continue from step 2
```

## 🏗️ System Architecture

### 1. Main Story Arc

A complete narrative with:
- **10 chapters** of engaging content (300-500 words each)
- **Branching paths** based on player choices
- **Dynamic world state** that evolves with your progress
- **NPCs** with personalities and relationships
- **Main quests** tied to real-life habit completion
- **Challenges** unlocked by stat requirements

### 2. Quest System

**Quest Types:**
- `main` - Advances the main story
- `side` - Optional content with rewards
- `daily` - Recurring daily objectives
- `challenge` - Combat or puzzle encounters

**Quest Requirements:**
- Minimum character level
- Minimum stat values (strength, wisdom, agility, etc.)
- Completion of prerequisite quests

**Real-Life Integration:**
```typescript
{
  "id": "quest-1",
  "title": "Train with the Master",
  "description": "Master your skills through dedication",
  "tasksTiedTo": [
    "Complete 3 daily habits",
    "Achieve 7-day streak",
    "Finish workout routine"
  ],
  "rewards": {
    "xp": 100,
    "gold": 50,
    "statBoosts": {
      "strength": 2,
      "endurance": 1
    }
  }
}
```

### 3. Challenge System

**Challenge Types:**
- `combat` - Fight enemies using stats
- `puzzle` - Logic or strategy challenges
- `social` - NPC interaction challenges
- `exploration` - Discovery and navigation

**Difficulty Levels:**
- `EASY` - Low stat requirements
- `MEDIUM` - Moderate challenge
- `HARD` - Significant challenge
- `EPIC` - Endgame content

**Combat Mechanics:**
```typescript
// Player stats vs Enemy stats
Combat considers:
- Strength → Attack power
- Agility → Speed & dodge
- Endurance → Defense & HP
- Luck → Critical hit chance
```

### 4. Dynamic Story Generation

Each chapter reflects:
- ✅ **Your real-life accomplishments** (completed tasks)
- 📊 **Character progression** (level, stats)
- 🎭 **Previous choices** (story branches taken)
- 🌍 **World state changes** (location, NPCs, events)
- ⚔️ **Challenge outcomes** (victories, defeats)

## 📡 API Endpoints

### 1. Create Story Arc

**POST** `/api/ai/story/arc/create`

Generate a complete 10-chapter story arc.

**Request:**
```json
{
  "characterName": "Aria",
  "characterLevel": 1,
  "characterClass": "Warrior",
  "theme": "Epic Fantasy Adventure",
  "setting": "Medieval Kingdom",
  "plotFocus": "action"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "arc": {
      "id": "arc-unique-id",
      "title": "The Curse of Shadowmoor",
      "description": "An ancient evil awakens...",
      "currentChapter": 1,
      "totalChapters": 10,
      "worldState": {
        "location": "Village of Brighthollow",
        "timeOfDay": "morning",
        "weatherCondition": "clear",
        "npcsAvailable": [...]
      },
      "chapters": [...],
      "mainQuests": [...],
      "challenges": [...]
    }
  }
}
```

### 2. Generate Next Chapter

**POST** `/api/ai/story/chapter/next`

Continue the story based on your progress.

**Request:**
```json
{
  "mainStoryArc": {
    "id": "arc-unique-id",
    "title": "The Curse of Shadowmoor",
    "currentChapter": 3,
    "worldState": {...}
  },
  "characterState": {
    "characterName": "Aria",
    "level": 5,
    "stats": {
      "strength": 8,
      "wisdom": 6,
      "agility": 7,
      "endurance": 8,
      "luck": 5
    }
  },
  "recentProgress": [
    {
      "title": "Morning Workout",
      "category": "Fitness",
      "difficulty": "MEDIUM",
      "streakCount": 7
    },
    {
      "title": "Meditation",
      "category": "Wellness",
      "difficulty": "EASY",
      "streakCount": 14
    }
  ],
  "previousChoices": [
    {
      "chapterId": 2,
      "event": "Chose to help the merchant",
      "outcome": "Gained merchant's trust and discount"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "chapter": {
      "chapterNumber": 4,
      "title": "The Forest Trial",
      "content": "Your dedication to morning training has paid off. Aria's muscles are toned, her reflexes sharp. The forest path ahead seems less daunting now...",
      "worldState": {...},
      "choices": [...],
      "newQuestsUnlocked": [...],
      "challengesUnlocked": [...]
    }
  }
}
```

### 3. Check Challenge Readiness

**POST** `/api/ai/challenge/check`

Check if your character meets challenge requirements.

**Request:**
```json
{
  "challenge": {
    "id": "challenge-1",
    "title": "Defeat the Shadow Wolf",
    "requirements": {
      "minLevel": 3,
      "minStrength": 5,
      "minAgility": 4
    }
  },
  "characterState": {
    "level": 5,
    "stats": {
      "strength": 8,
      "agility": 7
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "canAttempt": true
  }
}
```

Or if requirements not met:
```json
{
  "success": true,
  "data": {
    "canAttempt": false,
    "reason": "Requires 5 strength (you have 3)"
  }
}
```

### 4. Attempt Challenge

**POST** `/api/ai/challenge/attempt`

Attempt a combat or puzzle challenge.

**Request:**
```json
{
  "characterName": "Aria",
  "characterState": {
    "level": 5,
    "stats": {
      "strength": 8,
      "wisdom": 6,
      "agility": 7,
      "endurance": 8,
      "luck": 5
    }
  },
  "challenge": {
    "id": "challenge-1",
    "title": "Defeat the Shadow Wolf",
    "type": "combat",
    "difficulty": "MEDIUM",
    "requirements": {
      "minLevel": 3,
      "minStrength": 5
    },
    "enemy": {
      "name": "Shadow Wolf",
      "level": 4,
      "stats": {
        "health": 100,
        "attack": 15,
        "defense": 10,
        "speed": 12
      },
      "weaknesses": ["fire", "light"],
      "abilities": ["Shadow Strike", "Howl"],
      "loot": ["Wolf Pelt", "Shadow Essence"]
    },
    "rewards": {
      "xp": 200,
      "gold": 100,
      "items": ["Shadow Fang Dagger"]
    }
  }
}
```

**Response (Victory):**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "combatResult": {
      "victory": true,
      "playerHealth": 73,
      "enemyHealth": 0,
      "damageDealt": 147,
      "damageTaken": 27,
      "rounds": 8,
      "xpGained": 200,
      "lootObtained": ["Wolf Pelt", "Shadow Essence"],
      "storyConsequence": "You have defeated Shadow Wolf! Your victory will be remembered."
    },
    "narrative": "The Shadow Wolf lunged from the darkness, its eyes gleaming with malice. Aria stood her ground, her training evident in every calculated movement. With a swift dodge, she evaded the wolf's Shadow Strike and countered with a powerful blow...",
    "rewards": {
      "xp": 200,
      "gold": 100,
      "items": ["Shadow Fang Dagger"]
    }
  }
}
```

### 5. Get Current Story

**GET** `/api/ai/story/current`

Retrieve your active story arc (work in progress).

**Response:**
```json
{
  "success": true,
  "message": "Story retrieval will be implemented after database schema update",
  "data": {
    "userId": 1,
    "note": "Use POST /api/ai/story/arc/create to generate a new story arc"
  }
}
```

## 🎯 Example Workflow

### Step 1: Create Your Story Arc

```bash
curl -X POST http://localhost:3000/api/ai/story/arc/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "characterName": "Kaiden",
    "characterLevel": 1,
    "characterClass": "Mage",
    "theme": "Mystical Adventure",
    "setting": "Ancient Ruins",
    "plotFocus": "mystery"
  }'
```

### Step 2: Complete Real-Life Tasks

Do your actual habits:
- ✅ Morning workout
- ✅ Read for 30 minutes
- ✅ Meditate

Your character gains:
- XP → Level up
- Stats → Strength +1, Wisdom +2

### Step 3: Progress the Story

```bash
curl -X POST http://localhost:3000/api/ai/story/chapter/next \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mainStoryArc": {...},
    "characterState": {
      "characterName": "Kaiden",
      "level": 2,
      "stats": {"strength": 4, "wisdom": 8, "agility": 5}
    },
    "recentProgress": [
      {"title": "Morning Workout", "category": "Fitness", "streakCount": 3},
      {"title": "Reading", "category": "Learning", "streakCount": 5}
    ]
  }'
```

The new chapter will reference your real accomplishments!

### Step 4: Check Challenge

```bash
curl -X POST http://localhost:3000/api/ai/challenge/check \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "challenge": {
      "requirements": {"minLevel": 2, "minWisdom": 6}
    },
    "characterState": {
      "level": 2,
      "stats": {"wisdom": 8}
    }
  }'
```

### Step 5: Attempt Challenge

```bash
curl -X POST http://localhost:3000/api/ai/challenge/attempt \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "characterName": "Kaiden",
    "characterState": {
      "level": 2,
      "stats": {"strength": 4, "wisdom": 8, "agility": 5}
    },
    "challenge": {
      "enemy": {
        "name": "Ancient Guardian",
        "level": 2,
        "stats": {"health": 80, "attack": 12, "defense": 8}
      }
    }
  }'
```

## 💡 Best Practices

### 1. Regular Story Updates

Generate a new chapter after completing 3-5 tasks to keep the narrative fresh and relevant.

### 2. Balance Challenge Difficulty

- Start with EASY challenges at low levels
- Progress to MEDIUM around level 5
- Attempt HARD challenges at level 10+
- Save EPIC challenges for max level

### 3. Quest Completion Strategy

Complete quests in order:
1. Daily quests (build streaks)
2. Main quests (advance story)
3. Side quests (extra rewards)
4. Challenge quests (test your skills)

### 4. Stat Building

Focus on stats relevant to your class:
- **Warriors** → Strength + Endurance
- **Mages** → Wisdom + Luck
- **Rogues** → Agility + Luck
- **Clerics** → Wisdom + Endurance

## 🔒 Rate Limits

- **15 requests per minute**
- **1500 requests per day**

Use `GET /api/ai/rate-limit` to check your current usage.

## 🎨 Customization Options

### Story Themes
- Epic Fantasy Adventure
- Sci-Fi Exploration
- Mystery Investigation
- Urban Fantasy
- Post-Apocalyptic Survival
- Cyberpunk
- Historical Adventure

### Plot Focus
- `action` - Combat and challenges
- `mystery` - Investigation and puzzles
- `exploration` - Discovery and travel
- `character` - Relationships and growth

### Tone Options
- `epic` - Heroic and grand
- `humorous` - Light and funny
- `dark` - Serious and grim
- `inspirational` - Uplifting and motivational
- `casual` - Relaxed and friendly

## 🐛 Troubleshooting

### "Requirements not met"
Complete more tasks to level up and gain stats.

### "Rate limit exceeded"
Wait a minute or check `/api/ai/rate-limit` for reset time.

### "Story arc not found"
Create a new story arc using `/api/ai/story/arc/create`.

### Combat always losing
Focus on building stats through real-life habit completion before attempting harder challenges.

## 📊 Database Schema

```prisma
model Story {
  id                 String   @id @default(cuid())
  userId             String
  title              String
  description        String?
  content            String   // Full story arc JSON
  currentChapter     Int      @default(1)
  totalChapters      Int      @default(10)
  chapterData        String   @default("{}") // Current chapter state
  branchesTaken      String   @default("[]") // Choices made
  activeQuests       String   @default("[]") // Active quests JSON
  unlockedChallenges String   @default("[]") // Unlocked challenges JSON
  worldState         String   @default("{}") // Current world state JSON
  isActive           Boolean  @default(true)
  completedAt        DateTime?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}
```

## 🚀 Future Enhancements

- [ ] Persistent story state in database
- [ ] Multiplayer story arcs
- [ ] Seasonal events and limited-time challenges
- [ ] Story branches based on personality preferences
- [ ] Voice narration support
- [ ] Visual story illustrations
- [ ] Achievement system
- [ ] Leaderboards for challenge speedruns

## 📚 Related Documentation

- [Gemini AI Service](./GEMINI_AI_SERVICE.md)
- [Gemini Quick Reference](./GEMINI_QUICK_REFERENCE.md)
- [API Documentation](./API.md)

---

**Happy questing! May your habits shape your destiny! 🗡️✨**
