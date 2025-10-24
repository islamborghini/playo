# 🚀 playo Quick Start Guide

Get your AI-powered habit tracking RPG running in **5 minutes**!

## Prerequisites

- Node.js 18+ installed
- Google Gemini API key ([Get one free](https://makersuite.google.com/app/apikey))

## Installation Steps

### 1. Clone & Install

```bash
git clone https://github.com/islamborghini/playo.git
cd playo
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:
```env
GEMINI_API_KEY=your_api_key_here
```

### 3. Setup Database

```bash
npx prisma migrate dev
npx tsx prisma/seed.ts
```

### 4. Start Server

```bash
npm run dev
```

Server runs at: **http://localhost:3000**

---

## 🎮 Your First Adventure (Step-by-Step)

### Step 1: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "Demo@123456"
  }'
```

**Save the `access_token` from the response!**

### Step 2: Create Your Story Arc

```bash
curl -X POST http://localhost:3000/api/ai/story/arc/create \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "characterName": "Aria",
    "characterLevel": 1,
    "characterClass": "Warrior",
    "theme": "Epic Fantasy Adventure"
  }'
```

**You receive:**
- ✨ 10-chapter story outline
- 📋 Main quests tied to real habits
- ⚔️ Combat challenges with requirements
- 🌍 Dynamic world state

**Save this response!** You'll need it for the next steps.

### Step 3: Read Your First Chapter

Look for `chapters[0]` in the response:

```json
{
  "chapterNumber": 1,
  "title": "The Call to Adventure",
  "content": "In the village of Brighthollow, Aria awakens to the sound of warning bells...",
  "choices": [
    {
      "id": "choice-1-a",
      "text": "Rush to the village square",
      "consequences": "You'll discover the threat quickly"
    },
    {
      "id": "choice-1-b",
      "text": "Gather your equipment first",
      "consequences": "You'll be better prepared"
    }
  ]
}
```

### Step 4: Create & Complete Real Tasks

```bash
# Create a task
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Morning Workout",
    "description": "30 min exercise",
    "type": "HABIT",
    "difficulty": "MEDIUM",
    "category": "Fitness"
  }'

# Mark it complete
curl -X POST http://localhost:3000/api/tasks/TASK_ID/complete \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Your character gains:**
- +50 XP
- +1 Strength
- +1 Endurance

### Step 5: Generate Next Chapter

```bash
curl -X POST http://localhost:3000/api/ai/story/chapter/next \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mainStoryArc": {
      "id": "YOUR_ARC_ID",
      "title": "YOUR_STORY_TITLE",
      "currentChapter": 1,
      "worldState": { "location": "Brighthollow" }
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

**The AI mentions your workout:**
> "Aria's dedication to morning training has paid off. Her muscles are toned, reflexes sharp..."

### Step 6: Check Challenge Readiness

```bash
curl -X POST http://localhost:3000/api/ai/challenge/check \
  -H "Authorization: Bearer YOUR_TOKEN" \
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
      "stats": { "strength": 5 }
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

### Step 7: Attempt Your First Combat!

```bash
curl -X POST http://localhost:3000/api/ai/challenge/attempt \
  -H "Authorization: Bearer YOUR_TOKEN" \
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

**You receive:**
- 🎲 Combat results (victory/defeat)
- 📖 Exciting AI narrative
- 🏆 Rewards: XP, gold, items
- 📈 Story progression

---

## 🎉 Success! You've Completed the Full Loop

1. ✅ Created story arc
2. ✅ Read chapter
3. ✅ Completed real task
4. ✅ Generated dynamic chapter
5. ✅ Checked challenge
6. ✅ Won combat!

---

## 🔥 Pro Tips

### 1. Build Streaks for Better Stories
Complete tasks consistently. The AI generates better stories when it sees your dedication!

```json
{
  "title": "Morning Workout",
  "streakCount": 14  // Two weeks!
}
```

### 2. Balance Your Stats
Different tasks boost different stats:
- **Fitness** → Strength, Endurance
- **Learning** → Wisdom
- **Social** → Charisma
- **Hobbies** → Agility, Luck

### 3. Save Your Story Arc
Store the response from `story/arc/create` in a file:
```bash
curl ... > my_story.json
```

### 4. Use Postman for Easier Testing
Import: `postman/hybrid-story-system.postman_collection.json`

### 5. Check Rate Limits
```bash
curl http://localhost:3000/api/ai/rate-limit \
  -H "Authorization: Bearer YOUR_TOKEN"
```

You get **15 requests/minute** and **1500/day**.

---

## 🎨 Customization Options

### Story Themes
Try different themes:
- "Epic Fantasy Adventure"
- "Sci-Fi Space Opera"
- "Mystery Detective Story"
- "Post-Apocalyptic Survival"
- "Cyberpunk Thriller"
- "Historical Epic"

### Plot Focus
- `action` - More combat & challenges
- `mystery` - Investigation & puzzles
- `exploration` - Discovery & travel
- `character` - Relationships & growth

### Character Classes
- Warrior (STR focus)
- Mage (WIS focus)
- Rogue (AGI focus)
- Cleric (WIS + END)
- Ranger (AGI + STR)
- Paladin (STR + END)

---

## 📚 Next Steps

### Learn More
- **[Hybrid Story System Guide](HYBRID_STORY_SYSTEM.md)** - Complete feature documentation
- **[API Reference](API_REFERENCE.md)** - All endpoints with examples
- **[Gemini AI Service](GEMINI_AI_SERVICE.md)** - How story generation works

### Build Your Character
1. Complete more tasks → Gain stats
2. Level up → Unlock harder challenges
3. Collect loot → Get better equipment
4. Make choices → Shape your story

### Explore Features
- Try different story themes
- Create multiple character classes
- Experiment with different tasks
- Test various difficulty challenges

---

## 🆘 Troubleshooting

### "Missing required fields"
Make sure you include `characterName`, `characterLevel`, and `characterClass`.

### "Rate limit exceeded"
Wait 60 seconds or check your limit:
```bash
curl http://localhost:3000/api/ai/rate-limit -H "Authorization: Bearer TOKEN"
```

### "Requirements not met"
Your character isn't strong enough. Complete more tasks to level up!

### "Token expired"
Login again to get a fresh token:
```bash
curl -X POST http://localhost:3000/api/auth/login ...
```

### Database issues
Reset everything:
```bash
npx prisma migrate reset --force
npx tsx prisma/seed.ts
```

---

## 🎮 Ready to Play!

**You now know how to:**
- ✅ Create epic story arcs
- ✅ Complete real tasks for character growth
- ✅ Generate dynamic story chapters
- ✅ Attempt combat challenges
- ✅ Win rewards and progress

**Your habits shape your story. Start your adventure now!** 🗡️✨

---

<div align="center">

**[Full Documentation](README.md)** • **[API Reference](API_REFERENCE.md)** • **[Advanced Guide](HYBRID_STORY_SYSTEM.md)**

</div>
