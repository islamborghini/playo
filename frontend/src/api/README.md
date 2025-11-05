# API Client Documentation

Complete API client setup for communicating with the Playo backend.

## 📡 Configuration

### Environment Variables

Located in `/frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

### Client Setup

The Axios client is configured in `/frontend/src/api/client.ts` with:

- **Base URL**: From `VITE_API_URL` env variable
- **Timeout**: 10 seconds
- **Headers**: `Content-Type: application/json`
- **Interceptors**: Request & Response

## 🔐 Authentication

### Automatic Token Attachment

The request interceptor automatically attaches JWT tokens to all API calls:

```typescript
// Token is automatically read from localStorage
// and added to Authorization header
headers.Authorization = `Bearer ${token}`
```

### Auto-Logout on 401

The response interceptor handles unauthorized requests:

```typescript
case 401:
  // Clear tokens and redirect to login
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
```

## 📦 Available API Modules

### 1. Authentication (`/api/auth.ts`)

```typescript
import * as authAPI from './api/auth';

// Login
const response = await authAPI.login({
  email: 'user@example.com',
  password: 'password123'
});

// Register
await authAPI.register({
  email: 'new@example.com',
  password: 'SecurePass123!',
  username: 'newuser',
  characterName: 'Hero Name'
});

// Get current user
const user = await authAPI.getCurrentUser();

// Logout
await authAPI.logout();
```

### 2. Tasks (`/api/tasks.ts`)

```typescript
import * as tasksAPI from './api/tasks';

// Get all tasks
const tasks = await tasksAPI.getTasks();

// Filter tasks
const dailyTasks = await tasksAPI.getTasks({ type: 'DAILY' });

// Create task
const newTask = await tasksAPI.createTask({
  title: 'Morning Workout',
  type: 'DAILY',
  difficulty: 'MEDIUM',
  category: 'Fitness'
});

// Complete task (gain XP!)
const result = await tasksAPI.completeTask(taskId);
console.log('XP gained:', result.data.xpGained);

// Get stats
const stats = await tasksAPI.getTaskStats();
```

### 3. Stories (`/api/story.ts`)

```typescript
import * as storyAPI from './api/story';

// Create new story arc
const story = await storyAPI.createStoryArc({
  characterName: 'Aria',
  characterLevel: 1,
  characterClass: 'Warrior'
});

// Continue story
const chapter = await storyAPI.continueStory(storyId, choiceId);

// Get all stories
const stories = await storyAPI.getStories();

// Get active story
const activeStory = await storyAPI.getActiveStory();
```

### 4. Character (`/api/character.ts`)

```typescript
import * as characterAPI from './api/character';

// Get character profile
const profile = await characterAPI.getCharacterProfile();

// Get stats
const stats = await characterAPI.getCharacterStats();

// Get inventory
const items = await characterAPI.getInventory();

// Equip item
await characterAPI.equipItem(itemId);
```

## 🔧 Error Handling

All API calls handle errors automatically:

```typescript
try {
  const user = await authAPI.login(credentials);
} catch (error) {
  // Error is already logged by interceptor
  // error contains: { success: false, message: '...', statusCode: 401 }
  console.error(error.message);
}
```

### Error Codes Handled

| Code | Action |
|------|--------|
| 401 | Auto-logout and redirect to /login |
| 403 | Log forbidden error |
| 404 | Log not found error |
| 429 | Log rate limit error |
| 500 | Log server error |
| Network Error | Return friendly message |

## 🧪 Testing the API

### Option 1: Browser Console

```javascript
// The test utilities are available in the browser console
window.apiTest.runAll()           // Run all tests
window.apiTest.testHealth()       // Test health check
window.apiTest.testAuth()         // Test auth flow
window.apiTest.testTasks()        // Test task endpoints
```

### Option 2: Test Page

Navigate to `/api-test` in your browser for a visual test interface.

### Option 3: Manual Test

```typescript
import { testHealth } from './api/test';

// In your component
const checkAPI = async () => {
  const isHealthy = await testHealth();
  console.log('API is', isHealthy ? 'healthy' : 'down');
};
```

## 📊 Response Format

All API responses follow this structure:

```typescript
{
  success: boolean;
  data?: T;           // Response data
  message: string;    // Human-readable message
  timestamp: string;  // ISO timestamp
}
```

## 🚀 Usage Examples

### Complete User Flow

```typescript
// 1. Register
const { data } = await authAPI.register({
  email: 'hero@example.com',
  password: 'SecurePass123!',
  username: 'hero123',
  characterName: 'Aria the Brave'
});

// Token is automatically stored!
console.log('User:', data.user);

// 2. Create a task
const task = await tasksAPI.createTask({
  title: 'Complete morning routine',
  type: 'DAILY',
  difficulty: 'EASY',
  category: 'Wellness'
});

// 3. Complete the task
const result = await tasksAPI.completeTask(task.id);
console.log('Gained', result.data.xpGained, 'XP');

if (result.data.leveledUp) {
  console.log('🎉 LEVEL UP! Now level', result.data.newLevel);
}

// 4. Start your story
const story = await storyAPI.createStoryArc({
  characterName: data.user.characterName,
  characterLevel: data.user.level,
  characterClass: 'Warrior'
});

console.log('Story:', story.title);
```

## 🛡️ Security Features

1. **JWT Token Storage**: Stored in localStorage (auto-managed)
2. **Auto Token Refresh**: Coming soon
3. **HTTPS Required**: In production
4. **CORS Protection**: Configured on backend
5. **Rate Limiting**: Handled by backend (429 errors)

## 🔄 Token Management

```typescript
import { setAuthToken, clearAuthToken, getAuthToken, isAuthenticated } from './api/client';

// Set token manually (usually not needed - login does this)
setAuthToken('your-jwt-token');

// Check if authenticated
if (isAuthenticated()) {
  console.log('User is logged in');
}

// Get current token
const token = getAuthToken();

// Clear all auth data
clearAuthToken();
```

## 📝 TypeScript Support

All API methods are fully typed:

```typescript
import type { User, Task, Story, CharacterProfile } from './types';

// Autocomplete works!
const user: User = await authAPI.getCurrentUser();
const tasks: Task[] = await tasksAPI.getTasks();
const profile: CharacterProfile = await characterAPI.getCharacterProfile();
```

## 🎯 Next Steps

- [ ] Integrate with React Query for caching
- [ ] Add optimistic updates
- [ ] Implement retry logic
- [ ] Add request cancellation
- [ ] WebSocket support for real-time updates

## 📚 API Endpoints Reference

See [Backend API Documentation](../../backend/docs/TECHNICAL_DOCUMENTATION_COMPLETE.md) for complete endpoint details.
