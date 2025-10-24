# 📡 playo API Reference

Complete API documentation for all endpoints.

**Base URL:** `http://localhost:3000`

**Authentication:** Bearer token in `Authorization` header

---

## 🔐 Authentication

### Register New User

**POST** `/api/auth/register`

Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "username": "warrior_hero",
  "characterName": "Aria"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "username": "warrior_hero",
      "characterName": "Aria"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

---

### Login

**POST** `/api/auth/login`

Authenticate and get JWT tokens.

**Request:**
```json
{
  "email": "demo@example.com",
  "password": "Demo@123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "demo@example.com",
      "level": 1,
      "xp": 0
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

**Tokens:**
- `accessToken`: Valid for 7 days
- `refreshToken`: Valid for 30 days

---

### Refresh Token

**POST** `/api/auth/refresh`

Get new access token using refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

---

## 🎮 Hybrid Story System

### Create Story Arc

**POST** `/api/ai/story/arc/create`

Generate a complete 10-chapter story arc with quests and challenges.

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

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

**Parameters:**
| Field | Type | Required | Options |
|-------|------|----------|---------|
| characterName | string | ✅ | Any name |
| characterLevel | number | ✅ | 1-100 |
| characterClass | string | ✅ | Warrior, Mage, Rogue, etc. |
| theme | string | ❌ | Fantasy, Sci-Fi, Mystery, etc. |
| setting | string | ❌ | Any setting description |
| plotFocus | string | ❌ | action, mystery, exploration, character |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "arc": {
      "id": "arc-unique-id",
      "title": "The Curse of Shadowmoor",
      "description": "An ancient evil awakens in the kingdom...",
      "currentChapter": 1,
      "totalChapters": 10,
      "worldState": {
        "location": "Village of Brighthollow",
        "timeOfDay": "morning",
        "weatherCondition": "clear",
        "npcsAvailable": [
          {
            "name": "Elder Theron",
            "role": "village elder",
            "personality": "wise and concerned",
            "relationship": "ally"
          }
        ],
        "environmentalFactors": ["peaceful", "sunrise"]
      },
      "chapters": [
        {
          "chapterNumber": 1,
          "title": "The Call to Adventure",
          "content": "In the peaceful village of Brighthollow, Aria awakens to the sound of warning bells...",
          "choices": [
            {
              "id": "choice-1-a",
              "text": "Rush to the village square",
              "consequences": "Quick response, unprepared",
              "leadsToChapter": 2
            },
            {
              "id": "choice-1-b",
              "text": "Gather equipment first",
              "consequences": "Better prepared, slower",
              "leadsToChapter": 2
            }
          ]
        }
      ],
      "mainQuests": [
        {
          "id": "quest-1",
          "title": "Train with the Master",
          "description": "Master Korin offers to train you in combat",
          "type": "main",
          "requirements": {
            "minLevel": 1
          },
          "rewards": {
            "xp": 100,
            "gold": 50,
            "items": ["Training Sword"],
            "statBoosts": {
              "strength": 2
            },
            "storyProgression": true
          },
          "tasksTiedTo": [
            "Complete 3 daily habits",
            "Achieve 7-day streak"
          ]
        }
      ],
      "challenges": [
        {
          "id": "challenge-1",
          "title": "Defeat the Shadow Wolf",
          "description": "A corrupted wolf blocks your path",
          "type": "combat",
          "difficulty": "MEDIUM",
          "requirements": {
            "minLevel": 3,
            "minStrength": 5
          },
          "enemy": {
            "name": "Shadow Wolf",
            "level": 3,
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
          },
          "unlocked": false
        }
      ],
      "metadata": {
        "tokensUsed": 2845,
        "modelUsed": "gemini-1.5-flash",
        "generatedAt": "2025-10-24T10:30:00Z"
      }
    }
  }
}
```

**Rate Limits:** 15/min, 1500/day

---

### Generate Next Chapter

**POST** `/api/ai/story/chapter/next`

Continue story based on player progress and choices.

**Request:**
```json
{
  "mainStoryArc": {
    "id": "arc-unique-id",
    "title": "The Curse of Shadowmoor",
    "currentChapter": 2,
    "totalChapters": 10,
    "worldState": {
      "location": "Forest Path",
      "timeOfDay": "afternoon"
    }
  },
  "characterState": {
    "characterName": "Aria",
    "level": 3,
    "stats": {
      "strength": 7,
      "wisdom": 5,
      "agility": 6,
      "endurance": 7,
      "luck": 4
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
  ],
  "pendingChallenges": []
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "chapter": {
      "chapterNumber": 3,
      "title": "The Forest Trial",
      "content": "Your dedication to training has paid off. Aria's muscles are toned from weeks of morning workouts, her mind clear from daily meditation...",
      "worldState": {
        "location": "Deep Forest",
        "timeOfDay": "dusk",
        "weatherCondition": "foggy",
        "environmentalFactors": ["mysterious", "dangerous"]
      },
      "choices": [
        {
          "id": "choice-3-a",
          "text": "Take the direct path",
          "requirements": {
            "minStrength": 7
          },
          "consequences": "Faster but more dangerous",
          "leadsToChapter": 4
        }
      ],
      "newQuestsUnlocked": [
        {
          "id": "quest-3",
          "title": "Gather Forest Herbs",
          "description": "Collect rare herbs for the healer",
          "requirements": {
            "minLevel": 3
          },
          "tasksTiedTo": ["Complete 5 learning tasks"]
        }
      ],
      "challengesUnlocked": [
        {
          "id": "challenge-2",
          "title": "Face the Forest Guardian"
        }
      ],
      "metadata": {
        "tokensUsed": 1234,
        "modelUsed": "gemini-1.5-flash",
        "generatedAt": "2025-10-24T11:00:00Z"
      }
    }
  }
}
```

---

### Check Challenge Readiness

**POST** `/api/ai/challenge/check`

Check if character meets requirements for a challenge.

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
    "level": 3,
    "stats": {
      "strength": 7,
      "agility": 6
    }
  }
}
```

**Response (200) - Ready:**
```json
{
  "success": true,
  "data": {
    "canAttempt": true
  }
}
```

**Response (200) - Not Ready:**
```json
{
  "success": true,
  "data": {
    "canAttempt": false,
    "reason": "Requires 5 strength (you have 3)"
  }
}
```

---

### Attempt Challenge

**POST** `/api/ai/challenge/attempt`

Attempt a combat or puzzle challenge.

**Request:**
```json
{
  "characterName": "Aria",
  "characterState": {
    "level": 3,
    "stats": {
      "strength": 7,
      "wisdom": 5,
      "agility": 6,
      "endurance": 7,
      "luck": 4
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
      "level": 3,
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

**Response (200) - Victory:**
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
    "narrative": "The Shadow Wolf lunged from the darkness, eyes gleaming with malice. Aria stood her ground, training evident in every movement. With a swift dodge, she evaded the Shadow Strike and countered with a powerful blow. The battle raged for eight intense rounds, but Aria's dedication to her morning workouts paid off. With one final strike, the wolf fell, dissolving into shadow...",
    "rewards": {
      "xp": 200,
      "gold": 100,
      "items": ["Shadow Fang Dagger"]
    }
  }
}
```

**Response (403) - Requirements Not Met:**
```json
{
  "error": "Character does not meet challenge requirements",
  "reason": "Requires level 3 (you are level 2)"
}
```

---

### Get Current Story

**GET** `/api/ai/story/current`

Get the active story arc for the user.

**Response (200):**
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

---

## ✅ Task Management

### Get All Tasks

**GET** `/api/tasks`

Get all tasks for authenticated user.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "task_id",
        "title": "Morning Workout",
        "description": "30 minutes of exercise",
        "type": "HABIT",
        "difficulty": "MEDIUM",
        "category": "Fitness",
        "streakCount": 7,
        "lastCompleted": "2025-10-24T08:00:00Z",
        "isActive": true
      }
    ]
  }
}
```

---

### Create Task

**POST** `/api/tasks`

Create a new task.

**Request:**
```json
{
  "title": "Morning Workout",
  "description": "30 minutes cardio + strength training",
  "type": "HABIT",
  "difficulty": "MEDIUM",
  "category": "Fitness",
  "recurrenceRule": "DAILY"
}
```

**Parameters:**
| Field | Type | Required | Options |
|-------|------|----------|---------|
| title | string | ✅ | Any title |
| description | string | ❌ | Task details |
| type | enum | ✅ | DAILY, HABIT, TODO |
| difficulty | enum | ✅ | EASY, MEDIUM, HARD |
| category | string | ✅ | Fitness, Learning, etc. |
| recurrenceRule | string | ❌ | DAILY, WEEKLY, etc. |

**Response (201):**
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "task_id",
      "title": "Morning Workout",
      "type": "HABIT",
      "difficulty": "MEDIUM",
      "category": "Fitness",
      "streakCount": 0,
      "isActive": true,
      "createdAt": "2025-10-24T10:00:00Z"
    }
  }
}
```

---

### Complete Task

**POST** `/api/tasks/:id/complete`

Mark a task as completed and gain XP/stats.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "completion": {
      "taskId": "task_id",
      "completedAt": "2025-10-24T10:30:00Z",
      "xpGained": 50,
      "storyUnlocked": false
    },
    "rewards": {
      "xp": 50,
      "statBoosts": {
        "strength": 1,
        "endurance": 1
      }
    },
    "character": {
      "level": 2,
      "xp": 150,
      "stats": {
        "strength": 6,
        "endurance": 6
      }
    }
  }
}
```

---

### Update Task

**PUT** `/api/tasks/:id`

Update task details.

**Request:**
```json
{
  "title": "Updated Title",
  "difficulty": "HARD",
  "isActive": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "task_id",
      "title": "Updated Title",
      "difficulty": "HARD",
      "updatedAt": "2025-10-24T10:45:00Z"
    }
  }
}
```

---

### Delete Task

**DELETE** `/api/tasks/:id`

Delete a task.

**Response (200):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

## 🎒 Inventory

### Get Inventory

**GET** `/api/inventory`

Get character's inventory.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "inventory": [
      {
        "id": "inv_id",
        "itemId": "item_123",
        "itemName": "Shadow Fang Dagger",
        "itemType": "WEAPON",
        "equipped": true,
        "quantity": 1,
        "metadata": {
          "attack": 15,
          "rarity": "rare"
        }
      }
    ]
  }
}
```

---

### Equip Item

**POST** `/api/inventory/equip/:itemId`

Equip an item from inventory.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "item": {
      "itemId": "item_123",
      "itemName": "Shadow Fang Dagger",
      "equipped": true
    },
    "statBoosts": {
      "attack": 15
    }
  }
}
```

---

### Unequip Item

**POST** `/api/inventory/unequip/:itemId`

Unequip an equipped item.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "item": {
      "itemId": "item_123",
      "equipped": false
    }
  }
}
```

---

## 🔍 Utility

### AI Health Check

**GET** `/api/ai/health`

Check Gemini AI service status.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "details": {
      "model": "gemini-1.5-flash",
      "apiKeyConfigured": true,
      "responseReceived": true,
      "rateLimits": {
        "requestsThisMinute": 5,
        "requestsToday": 247,
        "resetAtMinute": "2025-10-24T10:31:00Z",
        "resetAtDay": "2025-10-25T00:00:00Z"
      }
    }
  }
}
```

---

### Rate Limit Status

**GET** `/api/ai/rate-limit`

Check current API rate limit usage.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "requestsThisMinute": 5,
    "requestsToday": 247,
    "resetAtMinute": "2025-10-24T10:31:00Z",
    "resetAtDay": "2025-10-25T00:00:00Z",
    "limits": {
      "maxPerMinute": 15,
      "maxPerDay": 1500
    }
  }
}
```

---

## ❌ Error Responses

### 400 - Bad Request
```json
{
  "error": "Missing required fields: characterName, characterLevel, characterClass"
}
```

### 401 - Unauthorized
```json
{
  "error": "Invalid or expired token"
}
```

### 403 - Forbidden
```json
{
  "error": "Character does not meet challenge requirements",
  "reason": "Requires level 5 (you are level 3)"
}
```

### 429 - Rate Limit Exceeded
```json
{
  "error": "Rate limit exceeded. Maximum 15 requests per minute.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 45
}
```

### 500 - Server Error
```json
{
  "error": "Failed to generate story",
  "message": "Internal server error"
}
```

---

## 📊 Rate Limits

| Endpoint | Limit | Reset |
|----------|-------|-------|
| All AI endpoints | 15/min | Every minute |
| All AI endpoints | 1500/day | Midnight UTC |
| Other endpoints | Unlimited | - |

---

## 🔒 Authentication

All endpoints (except `/api/auth/*` and `/api/ai/health`) require authentication.

**Header:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Token Expiry:**
- Access Token: 7 days
- Refresh Token: 30 days

**Refresh Flow:**
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "YOUR_REFRESH_TOKEN"}'
```

---

## 📚 Additional Resources

- **[Quick Start Guide](QUICK_START.md)** - Get started in 5 minutes
- **[Hybrid Story System](HYBRID_STORY_SYSTEM.md)** - Complete feature guide
- **[Postman Collection](../postman/)** - Import ready-to-use requests
- **[Main README](../README.md)** - Project overview

---

<div align="center">

**playo API** - Transform habits into adventures! 🗡️✨

</div>
