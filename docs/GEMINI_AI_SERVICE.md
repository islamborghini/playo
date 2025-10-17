# Google Gemini AI Service Documentation

## Overview

The Gemini AI Service provides AI-powered story generation, NPC dialogue, and content moderation for the playo RPG game using Google's Gemini 1.5 Flash model.

## Features

### Core Capabilities
- ✅ **Story Generation**: Create personalized RPG narratives based on character progression and completed tasks
- ✅ **Chapter Continuation**: Generate story chapters that build on previous narrative
- ✅ **NPC Dialogue**: Create contextual dialogue for non-player characters
- ✅ **Content Moderation**: Filter inappropriate content using AI safety features

### Advanced Features
- ✅ **Exponential Backoff Retry**: Automatically retries failed requests up to 3 times
- ✅ **Rate Limiting**: Enforces 15 requests/minute and 1500 requests/day limits
- ✅ **Safety Settings**: Block medium and above harmful content categories
- ✅ **JSON Extraction**: Parse JSON from markdown code blocks in responses
- ✅ **Token Usage Logging**: Track API token consumption for cost management

## Setup

### 1. Install Dependencies

```bash
npm install @google/generative-ai
```

### 2. Configure API Key

Add your Gemini API key to `.env`:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from: https://ai.google.dev/

### 3. Environment Variables

The service uses the following configuration:

```typescript
GEMINI_API_KEY: string | undefined  // Required for production
```

## API Endpoints

All endpoints require authentication via JWT token in the `Authorization` header.

### 1. Generate Story

**POST** `/api/ai/story/generate`

Generate a personalized RPG story based on character state and completed tasks.

**Request Body:**
```json
{
  "characterName": "Aragorn",
  "characterLevel": 10,
  "characterClass": "Warrior",
  "recentTasks": [
    {
      "title": "Complete morning workout",
      "description": "Did 50 pushups",
      "category": "fitness",
      "difficulty": 7
    }
  ],
  "tone": "epic",        // optional: epic | humorous | dark | inspirational | casual
  "length": "medium"     // optional: short | medium | long
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "story": "You stand before the ancient temple...",
    "metadata": {
      "tokensUsed": 245,
      "modelUsed": "gemini-1.5-flash",
      "generatedAt": "2025-10-15T10:30:00.000Z",
      "safetyRatings": [
        {
          "category": "HARM_CATEGORY_HARASSMENT",
          "probability": "NEGLIGIBLE"
        }
      ]
    }
  }
}
```

### 2. Generate Chapter Continuation

**POST** `/api/ai/story/chapter`

Generate the next chapter of an ongoing story.

**Request Body:**
```json
{
  "previousChapter": "You defeated the dragon and claimed its treasure...",
  "characterState": {
    "name": "Aragorn",
    "level": 10,
    "class": "Warrior",
    "health": 85,
    "mana": 50
  },
  "recentActions": [
    "Equipped legendary sword",
    "Learned fireball spell"
  ],
  "plotDirection": "Discover a hidden elven city"  // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "chapter": "As you journey through the enchanted forest...",
    "metadata": {
      "tokensUsed": 312,
      "modelUsed": "gemini-1.5-flash",
      "generatedAt": "2025-10-15T10:31:00.000Z"
    }
  }
}
```

### 3. Generate NPC Dialogue

**POST** `/api/ai/npc/dialogue`

Generate contextual dialogue for non-player characters.

**Request Body:**
```json
{
  "npcName": "Gandalf",
  "npcRole": "Wise Wizard",
  "context": "The hero seeks guidance for the final battle",
  "characterName": "Frodo",
  "characterLevel": 15,
  "mood": "mysterious"  // optional: friendly | hostile | neutral | mysterious | urgent
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "dialogue": "\"The path ahead is treacherous, young hobbit...\"",
    "metadata": {
      "tokensUsed": 89,
      "modelUsed": "gemini-1.5-flash",
      "generatedAt": "2025-10-15T10:32:00.000Z"
    }
  }
}
```

### 4. Moderate Content

**POST** `/api/ai/moderate`

Check if content is appropriate for the game.

**Request Body:**
```json
{
  "content": "You embark on a heroic quest to save the kingdom!",
  "context": "Story introduction"  // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isAppropriate": true,
    "reason": null,
    "safetyRatings": [
      {
        "category": "HARM_CATEGORY_HARASSMENT",
        "probability": "NEGLIGIBLE"
      }
    ],
    "metadata": {
      "tokensUsed": 45,
      "modelUsed": "gemini-1.5-flash",
      "checkedAt": "2025-10-15T10:33:00.000Z"
    }
  }
}
```

### 5. Get Rate Limit Status

**GET** `/api/ai/rate-limit`

Check current rate limit usage.

**Response:**
```json
{
  "success": true,
  "data": {
    "requestsThisMinute": 3,
    "requestsToday": 47,
    "resetAtMinute": "2025-10-15T10:35:00.000Z",
    "resetAtDay": "2025-10-16T00:00:00.000Z"
  }
}
```

### 6. Health Check

**GET** `/api/ai/health`

Check if the Gemini service is operational.

**Response:**
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
        "requestsThisMinute": 1,
        "requestsToday": 48,
        "resetAtMinute": "2025-10-15T10:35:00.000Z",
        "resetAtDay": "2025-10-16T00:00:00.000Z"
      }
    }
  }
}
```

## Rate Limits

The service enforces the following rate limits:

- **Per Minute**: 15 requests
- **Per Day**: 1500 requests

When rate limits are exceeded, the API returns a `429 Too Many Requests` error:

```json
{
  "error": "Rate limit exceeded: 15 requests per minute. Reset in 23 seconds.",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

## Error Handling

### Retry Logic

The service automatically retries failed requests with exponential backoff:

- **Attempt 1**: Immediate
- **Attempt 2**: 1 second delay
- **Attempt 3**: 2 seconds delay

Retryable errors:
- `429` - Rate limit exceeded
- `500` - Internal server error
- `503` - Service unavailable
- Network timeouts (`ETIMEDOUT`, `ECONNRESET`)

### Error Responses

All errors follow this format:

```json
{
  "error": "Failed to generate story",
  "message": "Detailed error message",
  "code": "ERROR_CODE"  // optional
}
```

## Safety Settings

The service uses Google Gemini's built-in safety features to block harmful content:

- **Harassment**: BLOCK_MEDIUM_AND_ABOVE
- **Hate Speech**: BLOCK_MEDIUM_AND_ABOVE
- **Sexually Explicit**: BLOCK_MEDIUM_AND_ABOVE
- **Dangerous Content**: BLOCK_MEDIUM_AND_ABOVE

Content that triggers these filters will be automatically rejected.

## Cost Optimization

### Model Selection

We use **gemini-1.5-flash** for cost efficiency:
- Faster response times
- Lower cost per token
- Suitable for creative writing tasks

### Token Usage Tracking

Every response includes token usage in the metadata:

```json
{
  "metadata": {
    "tokensUsed": 245,
    "modelUsed": "gemini-1.5-flash",
    "generatedAt": "2025-10-15T10:30:00.000Z"
  }
}
```

Monitor your usage to optimize costs.

## TypeScript Types

All types are defined in `/src/types/gemini.ts`:

```typescript
interface GenerateStoryOptions {
  userId: number;
  characterName: string;
  characterLevel: number;
  characterClass: string;
  recentTasks: Array<{
    title: string;
    description: string;
    category: string;
    difficulty: number;
    completedAt?: Date;
  }>;
  tone?: 'epic' | 'humorous' | 'dark' | 'inspirational' | 'casual';
  length?: 'short' | 'medium' | 'long';
}
```

## Testing

Run the test suite:

```bash
npm test -- geminiService.test.ts
```

**Test Coverage:**
- ✅ Story generation with different tones and lengths
- ✅ Chapter continuation with character state
- ✅ NPC dialogue with various moods
- ✅ Content moderation
- ✅ Rate limiting
- ✅ Health checks
- ✅ Token usage logging

All 10 tests passing! 🎉

## Examples

### Example 1: Generate Epic Story

```typescript
const response = await fetch('/api/ai/story/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    characterName: 'Aragorn',
    characterLevel: 10,
    characterClass: 'Warrior',
    recentTasks: [
      {
        title: 'Complete morning workout',
        description: 'Did 50 pushups',
        category: 'fitness',
        difficulty: 7
      }
    ],
    tone: 'epic',
    length: 'medium'
  })
});

const data = await response.json();
console.log(data.data.story);
```

### Example 2: Generate NPC Dialogue

```typescript
const response = await fetch('/api/ai/npc/dialogue', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    npcName: 'Village Elder',
    npcRole: 'Quest Giver',
    context: 'Player returns victorious from defeating the dragon',
    characterName: 'Hero',
    characterLevel: 12,
    mood: 'friendly'
  })
});

const data = await response.json();
console.log(data.data.dialogue);
```

## Best Practices

### 1. Cache Results
Store generated stories in your database to avoid regenerating the same content.

### 2. Monitor Rate Limits
Check `/api/ai/rate-limit` before making bulk requests.

### 3. Handle Errors Gracefully
Always implement fallback content when AI generation fails.

### 4. Moderate User Input
Use `/api/ai/moderate` before generating stories from user-provided content.

### 5. Optimize Prompt Length
Shorter prompts = fewer tokens = lower costs.

## Troubleshooting

### Error: "GEMINI_API_KEY is not configured"

**Solution:** Add your API key to `.env`:
```bash
GEMINI_API_KEY=your_actual_api_key_here
```

### Error: "Rate limit exceeded"

**Solution:** Wait for the rate limit to reset or implement request queuing.

### Error: "Content blocked by safety filters"

**Solution:** Review and modify the content to remove potentially harmful elements.

## Support

For issues or questions:
- Check the test suite for usage examples
- Review the TypeScript types for detailed interfaces
- Monitor console logs for detailed error information

## Version History

- **v1.0.0** - Initial release with full story generation capabilities
  - Story generation
  - Chapter continuation
  - NPC dialogue
  - Content moderation
  - Rate limiting
  - Comprehensive tests
