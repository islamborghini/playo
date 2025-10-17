# Gemini AI Service - Quick Reference

## 🚀 Quick Start

### 1. Get API Key
Visit https://ai.google.dev/ and create a Gemini API key

### 2. Configure Environment
Add to `.env`:
```bash
GEMINI_API_KEY=your_api_key_here
```

### 3. Test the Service
```bash
# Run tests
npm test -- geminiService.test.ts

# Start server
npm run dev
```

### 4. Health Check
```bash
curl http://localhost:3000/api/ai/health
```

## 📡 Quick API Reference

### Generate Story
```bash
POST /api/ai/story/generate
Authorization: Bearer <token>

{
  "characterName": "Hero",
  "characterLevel": 10,
  "characterClass": "Warrior",
  "recentTasks": [...],
  "tone": "epic",        # epic|humorous|dark|inspirational|casual
  "length": "medium"     # short|medium|long
}
```

### Continue Chapter
```bash
POST /api/ai/story/chapter
Authorization: Bearer <token>

{
  "previousChapter": "Your story so far...",
  "characterState": {
    "name": "Hero",
    "level": 10,
    "class": "Warrior",
    "health": 100,
    "mana": 50
  },
  "recentActions": ["action1", "action2"]
}
```

### NPC Dialogue
```bash
POST /api/ai/npc/dialogue
Authorization: Bearer <token>

{
  "npcName": "Gandalf",
  "npcRole": "Wizard",
  "context": "Seeking wisdom",
  "characterName": "Frodo",
  "characterLevel": 15,
  "mood": "mysterious"   # friendly|hostile|neutral|mysterious|urgent
}
```

### Moderate Content
```bash
POST /api/ai/moderate
Authorization: Bearer <token>

{
  "content": "Content to check...",
  "context": "Optional context"
}
```

### Check Rate Limits
```bash
GET /api/ai/rate-limit
Authorization: Bearer <token>
```

### Health Check
```bash
GET /api/ai/health
```

## 📊 Rate Limits

| Limit | Value |
|-------|-------|
| Per Minute | 15 requests |
| Per Day | 1500 requests |

## 🎨 Story Tones

- **epic** - Heroic, grand adventures
- **humorous** - Funny, light-hearted
- **dark** - Grim, serious themes
- **inspirational** - Uplifting, motivational
- **casual** - Relaxed, everyday adventures

## 📏 Story Lengths

- **short** - 100-150 words
- **medium** - 200-300 words
- **long** - 400-500 words

## 😊 NPC Moods

- **friendly** - Welcoming, helpful
- **hostile** - Aggressive, unfriendly
- **neutral** - Impartial, business-like
- **mysterious** - Cryptic, enigmatic
- **urgent** - Rushed, demanding immediate action

## ⚡ Common Use Cases

### Use Case 1: Daily Story Generation
Generate a story when user completes their daily tasks:
```javascript
const tasks = await getCompletedTasksToday(userId);
const character = await getCharacterSheet(userId);

const story = await fetch('/api/ai/story/generate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    characterName: character.name,
    characterLevel: character.level,
    characterClass: character.class,
    recentTasks: tasks,
    tone: 'epic',
    length: 'medium'
  })
});
```

### Use Case 2: Quest NPC Interaction
Generate dialogue when player talks to quest giver:
```javascript
const dialogue = await fetch('/api/ai/npc/dialogue', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    npcName: 'Village Elder',
    npcRole: 'Quest Giver',
    context: 'Player seeks new quest after leveling up',
    characterName: player.name,
    characterLevel: player.level,
    mood: 'friendly'
  })
});
```

### Use Case 3: User Content Moderation
Check user-submitted content before saving:
```javascript
const moderation = await fetch('/api/ai/moderate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: userSubmittedStory,
    context: 'User custom quest submission'
  })
});

if (moderation.data.isAppropriate) {
  await saveUserContent(userSubmittedStory);
} else {
  showError('Content not appropriate: ' + moderation.data.reason);
}
```

## 🐛 Troubleshooting

### Error: "GEMINI_API_KEY is not configured"
**Fix:** Add API key to `.env` file

### Error: "Rate limit exceeded"
**Fix:** Wait for rate limit reset or implement request queuing

### Error: "Content blocked by safety filters"
**Fix:** Review content and remove potentially harmful elements

### Response is slow
**Normal:** AI generation takes 1-3 seconds on average

## 📦 Postman Testing

Import the collection:
```
postman/ai-story-generation.postman_collection.json
```

Set environment variables:
- `baseUrl`: http://localhost:3000
- `accessToken`: Your JWT token from login

## 🧪 Testing

Run all tests:
```bash
npm test -- geminiService.test.ts
```

Expected: **10/10 tests passing** ✅

## 📚 Full Documentation

For complete documentation, see:
- `/docs/GEMINI_AI_SERVICE.md` - Complete API docs
- `/docs/GEMINI_IMPLEMENTATION_SUMMARY.md` - Implementation details
- `/src/types/gemini.ts` - TypeScript types

## 💡 Tips

1. **Cache stories** - Store generated content to reduce API calls
2. **Monitor rate limits** - Check `/api/ai/rate-limit` regularly
3. **Handle errors** - Always have fallback content
4. **Moderate first** - Check user input before generation
5. **Track costs** - Monitor `tokensUsed` in responses

## 🎯 Model Info

- **Model**: gemini-1.5-flash
- **Provider**: Google AI
- **Best For**: Creative writing, dialogue, content moderation
- **Cost**: Lower cost per token vs GPT-4
- **Speed**: Fast response times (1-3s)

## ✅ Status

- ✅ Service implemented
- ✅ Tests passing (10/10)
- ✅ Documentation complete
- ✅ Routes registered
- ✅ Build successful
- ✅ Ready for production

---

**Need help?** Check the full documentation in `/docs/GEMINI_AI_SERVICE.md`
