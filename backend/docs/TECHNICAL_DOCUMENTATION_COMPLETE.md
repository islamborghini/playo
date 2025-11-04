# Playo - Technical Documentation

**Version:** 1.0.0  
**Last Updated:** November 4, 2025  
**For:** Developers, Contributors, Technical Team

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Getting Started](#getting-started)
5. [Project Structure](#project-structure)
6. [Core Systems](#core-systems)
7. [API Reference](#api-reference)
8. [Database Schema](#database-schema)
9. [Authentication & Security](#authentication--security)
10. [Testing](#testing)
11. [Deployment](#deployment)
12. [Contributing](#contributing)

---

## Overview

**Playo** is an AI-powered habit tracking RPG that gamifies personal productivity. Users complete real-life tasks to progress their character, unlock items, and experience AI-generated narrative content.

### Key Features

- **Task Management**: Daily, weekly, and one-time tasks with difficulty levels
- **Character Progression**: XP-based leveling system with stats
- **AI Story Generation**: Dynamic narratives using Google Gemini AI
- **Inventory System**: Collectible items with rarity tiers
- **Streak Tracking**: Maintain daily/weekly task streaks
- **Gamification**: RPG mechanics applied to habit formation

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│                  (React/Mobile App - Future)                 │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API
┌────────────────────────▼────────────────────────────────────┐
│                     API Layer (Express)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Routes     │  │  Middleware  │  │ Controllers  │     │
│  │ - Auth       │  │ - Auth       │  │ - User       │     │
│  │ - Tasks      │  │ - Validation │  │ - Task       │     │
│  │ - Stories    │  │ - Rate Limit │  │ - Story      │     │
│  │ - Character  │  │ - Error      │  │ - Character  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    Service Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Gemini AI  │  │  Inventory   │  │   Streak     │     │
│  │   Service    │  │   Service    │  │   Service    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ XP Calculator│  │  Character   │  │   Item       │     │
│  │              │  │   Service    │  │   Catalog    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    Data Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │    Redis     │  │    Prisma    │     │
│  │  (Database)  │  │ (Rate Limit) │  │     ORM      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns

- **MVC Pattern**: Routes → Controllers → Services → Models
- **Middleware Chain**: Request processing pipeline
- **Service Layer**: Business logic separation
- **Repository Pattern**: Data access abstraction via Prisma
- **Factory Pattern**: Rate limiter creation
- **Singleton Pattern**: Database connections

---

## Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **Express** | 4.x | Web framework |
| **Prisma** | 5.x | ORM and database toolkit |
| **PostgreSQL** | 14+ | Primary database |
| **Redis** | 7+ | Rate limiting & caching |

### AI & External Services

| Service | Purpose |
|---------|---------|
| **Google Gemini AI** | Story generation, NPC dialogue |
| **Gemini 2.0 Flash** | Fast, efficient text generation |

### Security & Validation

| Package | Purpose |
|---------|---------|
| **bcrypt** | Password hashing |
| **jsonwebtoken** | JWT authentication |
| **Zod** | Schema validation |
| **express-rate-limit** | Rate limiting |
| **helmet** | Security headers |

### Development Tools

| Tool | Purpose |
|------|---------|
| **Jest** | Testing framework |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **ts-node** | TypeScript execution |
| **nodemon** | Development server |

---

## Getting Started

### Prerequisites

```bash
- Node.js 18+
- PostgreSQL 14+
- Redis 7+ (optional, for rate limiting)
- npm or yarn
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/islamborghini/playo.git
cd playo
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up the database**
```bash
# Create PostgreSQL database
createdb playo_dev

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

5. **Start development server**
```bash
npm run dev
```

The server will start at `http://localhost:3000`

### Environment Variables

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/playo_dev

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_ENABLED=true

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

# AI
GEMINI_API_KEY=your_gemini_api_key_here

# Security
BCRYPT_ROUNDS=12
ADMIN_WHITELIST_IPS=127.0.0.1,::1
```

---

## Project Structure

```
playo/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.ts               # Database seeding
├── src/
│   ├── config/               # Configuration files
│   │   └── redis.ts         # Redis client setup
│   ├── controllers/          # Request handlers
│   │   ├── authController.ts
│   │   ├── taskController.ts
│   │   └── ...
│   ├── middleware/           # Express middleware
│   │   ├── auth.ts          # Authentication
│   │   ├── validate.ts      # Zod validation
│   │   ├── rateLimiter.ts   # Rate limiting
│   │   └── errorHandler.ts  # Error handling
│   ├── routes/              # API routes
│   │   ├── auth.ts
│   │   ├── tasks.ts
│   │   ├── stories.ts
│   │   └── ...
│   ├── services/            # Business logic
│   │   ├── geminiService.ts
│   │   ├── inventoryService.ts
│   │   ├── streakService.ts
│   │   ├── characterService.ts
│   │   └── ...
│   ├── schemas/             # Validation schemas
│   │   └── validation.schemas.ts
│   ├── utils/               # Utility functions
│   │   ├── xpCalculator.ts
│   │   ├── password.ts
│   │   └── ...
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── data/                # Static data
│   │   └── items.json       # Item catalog
│   ├── __tests__/           # Integration tests
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
├── .env.example             # Environment template
├── tsconfig.json            # TypeScript config
├── jest.config.js           # Jest config
└── package.json             # Dependencies
```

---

## Core Systems

### 1. Authentication System

**Location:** `src/middleware/auth.ts`, `src/controllers/authController.ts`

**Features:**
- JWT-based authentication
- Bcrypt password hashing (12 rounds)
- Token refresh mechanism
- Password strength validation

**Flow:**
```
Register → Hash Password → Create User → Generate JWT
Login → Verify Password → Generate JWT → Return Token
Protected Route → Verify JWT → Attach User → Continue
```

**Example:**
```typescript
// Register
POST /api/auth/register
{
  "email": "user@example.com",
  "username": "player123",
  "password": "SecurePass123"
}

// Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123"
}

// Response
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { ... }
  }
}
```

### 2. Task Management System

**Location:** `src/controllers/taskController.ts`

**Task Types:**
- **DAILY**: Resets every day
- **WEEKLY**: Resets every week
- **ONE_TIME**: Completes once

**Difficulty Levels:**
- **EASY**: 50 XP base
- **MEDIUM**: 100 XP base
- **HARD**: 200 XP base

**Features:**
- Streak tracking
- Recurrence rules
- XP calculation
- Completion history

**Example:**
```typescript
// Create task
POST /api/tasks
{
  "title": "Morning Exercise",
  "description": "30 minutes of cardio",
  "difficulty": "MEDIUM",
  "type": "DAILY"
}

// Complete task
POST /api/tasks/:id/complete
// Returns XP earned and streak info
```

### 3. XP & Leveling System

**Location:** `src/utils/xpCalculator.ts`

**Formula:**
```typescript
XP Required = 100 * (level ^ 1.5)
Level 1 → 2: 100 XP
Level 2 → 3: 283 XP
Level 10 → 11: 3,162 XP
```

**XP Calculation:**
```typescript
Base XP (by difficulty)
+ Streak Bonus (10% per streak day, max 100%)
+ First Completion Bonus (50%)
= Total XP Earned
```

**Example:**
```typescript
// HARD task (200 base XP)
// 5-day streak (50% bonus)
// First time (50% bonus)
Total = 200 * 1.5 * 1.5 = 450 XP
```

### 4. AI Story Generation

**Location:** `src/services/geminiService.ts`

**Model:** Google Gemini 2.0 Flash

**Features:**
- Dynamic story generation based on tasks
- NPC dialogue generation
- Chapter continuation
- Content moderation
- Token usage tracking

**Story Generation Flow:**
```
Task Completed → Gather Context → Generate Prompt
→ Call Gemini API → Parse Response → Store Story
→ Return to User
```

**Example:**
```typescript
// Generate story
POST /api/stories/generate
{
  "taskId": "uuid",
  "preferences": {
    "genre": "Fantasy",
    "tone": "Epic"
  }
}

// Response
{
  "story": "Your hero ventures forth...",
  "metadata": {
    "tokensUsed": 150,
    "modelUsed": "gemini-2.0-flash"
  }
}
```

### 5. Inventory System

**Location:** `src/services/inventoryService.ts`

**Item Rarity:**
- **COMMON**: 60% drop rate
- **UNCOMMON**: 25% drop rate
- **RARE**: 10% drop rate
- **EPIC**: 4% drop rate
- **LEGENDARY**: 1% drop rate

**Features:**
- Item granting on task completion
- Rarity-based drop rates
- Inventory management
- Item catalog with 50+ items

**Example:**
```typescript
// Get inventory
GET /api/inventory

// Grant item (admin)
POST /api/catalog/grant
{
  "itemId": "weapon_001",
  "quantity": 1,
  "reason": "Quest reward"
}
```

### 6. Streak System

**Location:** `src/services/streakService.ts`

**Features:**
- Daily/weekly streak tracking
- Timezone-aware calculations
- Streak recovery grace period
- Streak bonus XP

**Streak Rules:**
- Miss 1 day: Streak broken
- Complete on time: Streak continues
- Streak bonus: +10% XP per day (max 100%)

### 7. Rate Limiting

**Location:** `src/middleware/rateLimiter.ts`

**Configuration:**

| Endpoint | Limit | Window | Key |
|----------|-------|--------|-----|
| `/api/auth/*` | 5 requests | 15 min | IP |
| `/api/ai/*` | 10 requests | 1 hour | User ID |
| `/api/stories/*` | 10 requests | 1 hour | User ID |
| `/api/*` (general) | 100 requests | 15 min | IP |

**Features:**
- Redis-backed (distributed)
- Memory fallback
- Admin IP whitelist
- 429 responses with retry-after

### 8. Validation System

**Location:** `src/middleware/validate.ts`, `src/schemas/validation.schemas.ts`

**Technology:** Zod

**Features:**
- Request body validation
- Query parameter validation
- Route parameter validation
- Type-safe schemas
- Detailed error messages

**Example:**
```typescript
// Password validation
- Min 8 characters
- 1 uppercase letter
- 1 lowercase letter
- 1 number
- Not a common password

// Email validation
- Valid email format
- Lowercase conversion
- Whitespace trimming
```

---

## API Reference

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "player123",
  "password": "SecurePass123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass456"
}
```

### Task Endpoints

#### Create Task
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Morning Exercise",
  "description": "30 minutes of cardio",
  "difficulty": "MEDIUM",
  "type": "DAILY"
}
```

#### Get All Tasks
```http
GET /api/tasks
Authorization: Bearer <token>
```

#### Complete Task
```http
POST /api/tasks/:id/complete
Authorization: Bearer <token>
```

#### Update Task
```http
PUT /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated title",
  "completed": true
}
```

#### Delete Task
```http
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

### Character Endpoints

#### Get Character
```http
GET /api/character
Authorization: Bearer <token>
```

#### Get Character Stats
```http
GET /api/character/stats
Authorization: Bearer <token>
```

### Story Endpoints

#### Generate Story
```http
POST /api/stories/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "taskId": "uuid",
  "preferences": {
    "genre": "Fantasy",
    "tone": "Epic"
  }
}
```

### Inventory Endpoints

#### Get Inventory
```http
GET /api/inventory
Authorization: Bearer <token>
```

#### Get Item Catalog
```http
GET /api/catalog
Authorization: Bearer <token>
```

### Response Format

All API responses follow this structure:

```typescript
{
  "success": boolean,
  "message": string,
  "data"?: any,
  "error"?: string,
  "timestamp": string (ISO 8601)
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "task": { ... }
  },
  "timestamp": "2025-11-04T17:00:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "VALIDATION_ERROR",
  "data": {
    "errors": ["Field is required"]
  },
  "timestamp": "2025-11-04T17:00:00.000Z"
}
```

---

## Database Schema

### User
```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  username      String    @unique
  password      String
  level         Int       @default(1)
  xp            Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  tasks         Task[]
  character     Character?
  inventory     InventoryItem[]
  stories       Story[]
}
```

### Task
```prisma
model Task {
  id              String        @id @default(uuid())
  userId          String
  title           String
  description     String?
  type            TaskType
  difficulty      TaskDifficulty
  streakCount     Int           @default(0)
  lastCompleted   DateTime?
  isActive        Boolean       @default(true)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  user            User          @relation(fields: [userId], references: [id])
}

enum TaskType {
  DAILY
  WEEKLY
  ONE_TIME
}

enum TaskDifficulty {
  EASY
  MEDIUM
  HARD
}
```

### Character
```prisma
model Character {
  id          String   @id @default(uuid())
  userId      String   @unique
  name        String
  class       String?
  strength    Int      @default(10)
  intelligence Int     @default(10)
  agility     Int      @default(10)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation(fields: [userId], references: [id])
}
```

### InventoryItem
```prisma
model InventoryItem {
  id          String   @id @default(uuid())
  userId      String
  itemId      String
  quantity    Int      @default(1)
  acquiredAt  DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id])
}
```

---

## Authentication & Security

### Password Security

**Hashing:** bcrypt with 12 rounds
```typescript
const hashedPassword = await bcrypt.hash(password, 12);
```

**Validation Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- Not in common password list

### JWT Authentication

**Token Structure:**
```typescript
{
  userId: string,
  email: string,
  iat: number,
  exp: number
}
```

**Token Lifetime:**
- Access Token: 7 days
- Refresh Token: 30 days

### Security Headers (Helmet)

- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security
- X-XSS-Protection

### Rate Limiting

**Protection Against:**
- Brute force attacks (auth endpoints)
- API abuse (general endpoints)
- AI generation spam (AI endpoints)

### Input Validation

**Zod Schemas:**
- Type validation
- Format validation
- Range validation
- Custom validation rules

---

## Testing

### Test Structure

```
src/
├── __tests__/              # Integration tests
│   ├── geminiService.test.ts
│   ├── inventoryService.test.ts
│   ├── streakService.test.ts
│   └── ...
├── middleware/__tests__/   # Middleware tests
│   └── validate.test.ts
├── schemas/__tests__/      # Schema tests
│   └── validation.schemas.test.ts
└── utils/__tests__/        # Utility tests
    └── password.test.ts
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test geminiService

# Watch mode
npm test -- --watch
```

### Test Coverage

```
Test Suites: 8 passed
Tests: 179 passed
Coverage: ~85%
```

### Writing Tests

**Example Test:**
```typescript
describe('XP Calculator', () => {
  it('should calculate correct XP for level up', () => {
    const xp = calculateXPForLevel(5);
    expect(xp).toBe(1118);
  });
  
  it('should apply streak bonus correctly', () => {
    const xp = calculateTaskXP({
      difficulty: 'MEDIUM',
      streakCount: 5,
      isFirstCompletion: false
    });
    expect(xp).toBe(150); // 100 * 1.5
  });
});
```

---

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure production database
- [ ] Set up Redis for rate limiting
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up monitoring/logging
- [ ] Run database migrations
- [ ] Set up backup strategy

### Build for Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Environment Variables (Production)

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
REDIS_HOST=redis.production.com
JWT_SECRET=<strong-secret>
GEMINI_API_KEY=<your-key>
CORS_ORIGIN=https://yourdomain.com
```

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Write/update tests**
5. **Run tests**
   ```bash
   npm test
   ```
6. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
7. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open a Pull Request**

### Code Style

- **TypeScript**: Strict mode enabled
- **Linting**: ESLint configuration
- **Formatting**: Prettier
- **Naming**: camelCase for variables, PascalCase for types

### Commit Messages

Follow conventional commits:
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
test: Add tests
refactor: Refactor code
chore: Update dependencies
```

### Pull Request Guidelines

- Clear description of changes
- Link to related issues
- All tests passing
- Code reviewed by maintainer
- No merge conflicts

---

## Troubleshooting

### Common Issues

**Database Connection Error:**
```bash
# Check PostgreSQL is running
pg_isready

# Verify DATABASE_URL in .env
# Run migrations
npx prisma migrate dev
```

**Redis Connection Error:**
```bash
# Check Redis is running
redis-cli ping

# Rate limiter will fallback to memory store
```

**JWT Token Invalid:**
```bash
# Check JWT_SECRET matches
# Token may be expired (7 days default)
# Re-login to get new token
```

**Build Errors:**
```bash
# Clear build cache
rm -rf dist node_modules
npm install
npm run build
```

---

## Performance Optimization

### Database

- Indexed fields: `email`, `username`, `userId`
- Connection pooling via Prisma
- Efficient queries with `select` and `include`

### Caching

- Redis for rate limiting
- Future: Cache frequently accessed data

### API

- Compression middleware
- Response pagination
- Efficient JSON serialization

---

## Monitoring & Logging

### Logging

**Morgan** for HTTP request logging:
- Development: `dev` format
- Production: `combined` format

### Health Check

```http
GET /health

Response:
{
  "success": true,
  "data": {
    "status": "ok",
    "version": "1.0.0",
    "environment": "production"
  }
}
```

---

## License

MIT License - See LICENSE file for details

---

## Support

- **Issues**: GitHub Issues
- **Email**: islamassanov66@gmail.com
- **Documentation**: This file

---

**Last Updated:** November 4, 2025  
**Maintained By:** Playo Development Team
