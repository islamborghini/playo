# 🎮 Hybrid Story System - Quick Start Guide

Get your RPG adventure running in 5 minutes!

## Prerequisites

- ✅ Server running (`npm run dev`)
- ✅ Valid JWT token (login first)
- ✅ Gemini API key configured

## Step 1: Login & Get Token

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "Demo@123456"
  }'

# Save the access_token from response
```

## Step 2: Create Your Story Arc

```bash
curl -X POST http://localhost:3000/api/ai/story/arc/create \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "characterName": "Aria",
    "characterLevel": 1,
    "characterClass": "Warrior",
    "theme": "Epic Fantasy Adventure"
  }'
```

**You'll receive:**
- ✨ Complete 10-chapter story outline
- 📋 Main quests tied to real-life tasks
- ⚔️ Combat challenges with stat requirements
- 🌍 Dynamic world state
- 💬 NPCs with personalities

**Save the response!** You'll need the `arc` object for next steps.

## Step 3: Read Your First Chapter

Look for `chapters[0]` in the response:

```json
{
  "chapterNumber": 1,
  "title": "The Call to Adventure",
  "content": "Your epic story begins here...",
  "choices": [
    {
      "id": "choice-1-a",
      "text": "Accept the quest",
      "consequences": "Begin your journey"
    },
    {
      "id": "choice-1-b",
      "text": "Ask for more information",
      "consequences": "Learn more about the danger"
    }
  ]
}
```

## Step 4: Complete Real-Life Tasks

Do your actual habits:
- ✅ Morning workout → +1 Strength
- ✅ Read 30 minutes → +1 Wisdom
- ✅ Meditate 10 minutes → +1 Endurance

**Track your progress!** These will be reflected in the story.

## Step 5: Generate Next Chapter

```bash
curl -X POST http://localhost:3000/api/ai/story/chapter/next \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "mainStoryArc": {
      "id": "YOUR_ARC_ID",
      "title": "YOUR_STORY_TITLE",
      "currentChapter": 1,
      "worldState": {...}
    },
    "characterState": {
      "characterName": "Aria",
      "level": 2,
      "stats": {
        "strength": 5,
        "wisdom": 4,
        "agility": 5,
        "endurance": 5,
        "luck": 3
      }
    },
    "recentProgress": [
      {
        "title": "Morning Workout",
        "category": "Fitness",
        "difficulty": "MEDIUM",
        "streakCount": 3
      }
    ]
  }'
```

**The new chapter will mention your workout streak!** 💪

## Step 6: Check Challenge Readiness

```bash
curl -X POST http://localhost:3000/api/ai/challenge/check \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "challenge": {
      "requirements": {
        "minLevel": 2,
        "minStrength": 5
      }
    },
    "characterState": {
      "level": 2,
      "stats": {
        "strength": 5
      }
    }
  }'
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

## Step 7: Attempt Your First Challenge!

```bash
curl -X POST http://localhost:3000/api/ai/challenge/attempt \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "characterName": "Aria",
    "characterState": {
      "level": 2,
      "stats": {
        "strength": 5,
        "wisdom": 4,
        "agility": 5,
        "endurance": 5,
        "luck": 3
      }
    },
    "challenge": {
      "id": "challenge-1",
      "title": "Defeat the Forest Bandit",
      "type": "combat",
      "difficulty": "EASY",
      "requirements": {
        "minLevel": 2,
        "minStrength": 4
      },
      "enemy": {
        "name": "Forest Bandit",
        "level": 2,
        "stats": {
          "health": 60,
          "attack": 10,
          "defense": 6,
          "speed": 8
        },
        "weaknesses": ["surprise"],
        "abilities": ["Quick Strike"],
        "loot": ["Bandit Coin", "Rusty Dagger"]
      },
      "rewards": {
        "xp": 100,
        "gold": 50,
        "items": ["Forest Bandit Badge"]
      }
    }
  }'
```

**You'll get:**
- 🎲 Combat simulation results
- 📖 Exciting narrative description
- 🏆 Rewards (if you win!)
- 💰 XP and loot

## 🎉 Success!

You've completed the full gameplay loop:

1. ✅ Created story arc
2. ✅ Read chapter
3. ✅ Completed real tasks
4. ✅ Generated next chapter
5. ✅ Checked challenge
6. ✅ Won combat!

## Next Steps

### Build Your Character
- Complete more tasks → Gain stats
- Level up → Unlock harder challenges
- Try different challenge types

### Explore the Story
- Make different choices
- Complete side quests
- Interact with NPCs
- Discover branching paths

### Master Combat
- Focus on key stats for your class
- Learn enemy weaknesses
- Time your challenges right
- Collect powerful loot

## 📚 Full Documentation

- [Complete Hybrid System Guide](./HYBRID_STORY_SYSTEM.md)
- [API Reference](./GEMINI_AI_SERVICE.md)
- [Postman Collection](../postman/hybrid-story-system.postman_collection.json)

## 🆘 Quick Troubleshooting

**"Missing required fields"**
→ Check you included characterName, characterLevel, characterClass

**"Requirements not met"**
→ Complete more tasks to level up first

**"Rate limit exceeded"**
→ Wait 60 seconds or check `/api/ai/rate-limit`

**"Combat always losing"**
→ Your stats are too low - complete more habits to build strength!

## 💡 Pro Tips

1. **Save your story arc response** - You'll need it for next chapter generation
2. **Track your character stats** - They determine challenge success
3. **Complete tasks consistently** - Build streaks for better story integration
4. **Start with easy challenges** - Build confidence and collect loot
5. **Read the narrative** - AI generates unique stories based on YOUR progress!

---

**Ready to shape your destiny through habits? Start your adventure now! 🗡️✨**
