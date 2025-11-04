# 🎮 Playo Backend

Node.js + TypeScript backend for the AI-powered habit tracking RPG.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Setup database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

Server runs on `http://localhost:3000`

## 📋 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## 🔧 Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- `GEMINI_API_KEY` - Google Gemini API key
- `PORT` - Server port (default: 3000)

## 📖 Documentation

- [API Reference](./docs/API_REFERENCE.md)
- [Quick Start Guide](./docs/QUICK_START.md)
- [Database Schema](./PRISMA_SCHEMA.md)

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Express middleware
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Helper functions
│   ├── types/          # TypeScript types
│   └── server.ts       # Entry point
├── prisma/
│   └── schema.prisma   # Database schema
├── tests/              # Test files
└── docs/               # Documentation
```

## 🛠️ Tech Stack

- **Runtime:** Node.js 20+
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL + Prisma ORM
- **AI:** Google Gemini 2.5 Flash
- **Authentication:** JWT
- **Validation:** Zod

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/complete` - Complete task

### AI Story
- `POST /api/ai/story/arc/create` - Generate story arc
- `GET /api/ai/story/current` - Get current story
- `POST /api/ai/story/chapter/next` - Generate next chapter
- `POST /api/ai/challenge/check` - Check challenge readiness
- `POST /api/ai/challenge/attempt` - Attempt challenge

### Character
- `GET /api/character` - Get character info
- `GET /api/character/inventory` - Get inventory

See [API Reference](./docs/API_REFERENCE.md) for complete documentation.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📝 License

MIT
