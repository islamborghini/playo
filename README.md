<div align="center"><div align="center"># 🎮 Playo - AI-Powered Habit Tracking RPG# 🎮 playo - AI-Powered Habit Tracking RPG



# 🎮 Playo



**Transform your daily habits into an epic RPG adventure**# 🎮 Playo



[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)

[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)**Turn your daily habits into an epic RPG adventure!**Turn your daily habits into epic adventures! Playo combines habit tracking with AI-generated stories and RPG mechanics.> Transform your daily habits into an epic adventure! Complete real-life tasks to level up your character, unlock challenges, and shape an AI-generated story that reflects YOUR progress.

[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

</div>

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)

## 🌟 What is Playo?

[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com/)## 📁 Project Structure[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

Playo is a habit tracking app that turns your real-life progress into a personalized RPG adventure. Complete tasks, level up your character, and experience an AI-generated story that adapts to your achievements.

[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748.svg)](https://www.prisma.io/)

**The magic:** Your morning workout doesn't just give you XP—it appears in the story as your character's training paying off in battle.

[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

## ✨ Features

[![Google Gemini](https://img.shields.io/badge/AI-Google_Gemini-orange.svg)](https://ai.google.dev/)

- 🤖 **AI-Generated Story Arcs** - 10-chapter narratives powered by Google Gemini

- 📈 **Character Progression** - Level up and gain stats from real habits[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)```[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

- ✅ **Task Management** - Daily habits and todos with streak tracking

- ⚔️ **Combat Challenges** - AI-narrated battles with stat-based outcomes

- 🎒 **Equipment System** - Unlock and equip items as rewards

- 🔄 **Dynamic Storytelling** - Story reflects YOUR actual accomplishments[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [API Reference](./backend/docs/API_REFERENCE.md)playo/



## 🚀 Quick Start



### Prerequisites</div>├── backend/          # Node.js + Express + Prisma API## � What is playo?



- Node.js 18+

- npm 8+

- Google Gemini API Key ([get one here](https://makersuite.google.com/app/apikey))---│   ├── src/         # TypeScript source code



### Installation



```bash## 🌟 What is Playo?│   ├── prisma/      # Database schema and migrations**playo** is a revolutionary habit tracking RPG that combines:

# Clone the repository

git clone https://github.com/islamborghini/playo.git

cd playo/backend

**Playo** is a habit tracking app that transforms your real-life progress into a personalized RPG adventure. Complete tasks, level up your character, and watch an AI-generated story adapt to your achievements.│   └── docs/        # Backend documentation- 📚 **Epic Story Arcs** - 10-chapter narratives with branching paths

# Install dependencies

npm install



# Set up environment### The Magic Formula├── frontend/         # React + TypeScript + Vite UI (coming soon)- ✅ **Real Habit Tracking** - Your completed tasks power character growth

cp .env.example .env

# Add your GEMINI_API_KEY to .env



# Set up database```│   ├── src/         # React components and pages- ⚔️ **Combat Challenges** - Fight enemies when your stats are high enough

npx prisma migrate dev

npx tsx prisma/seed.tsYour Real Habits + AI Storytelling = Personalized RPG Experience



# Start server```│   └── public/      # Static assets- 🎲 **Dynamic Storytelling** - AI generates chapters reflecting YOUR actual progress

npm run dev

```



Server runs on `http://localhost:3000`**Example:**  └── README.md        # This file- 🏆 **Quest System** - Quests tied to real-life habit completion



### Test the APIYou complete "Morning Workout" for 7 days straight → Your character gains +2 Strength → New story chapter reflects your training → Combat challenge unlocks → Epic AI-narrated battle!



```bash```

# Login with demo account

curl -X POST http://localhost:3000/api/auth/login \### Key Differentiators

  -H "Content-Type: application/json" \

  -d '{"email": "demo@example.com", "password": "Demo@123456"}'**The Innovation:** Your morning workout doesn't just give you XP—it appears in the story as your character's training paying off in battle!



# Create a story arc (replace YOUR_TOKEN with the token from login)- **Real Habits = Real Progress**: No grinding, no fake tasks. Your actual life improvements drive the game.

curl -X POST http://localhost:3000/api/ai/story/arc/create \

  -H "Authorization: Bearer YOUR_TOKEN" \- **AI-Adaptive Storytelling**: Google Gemini generates unique stories that reference YOUR specific accomplishments.## 🚀 Quick Start

  -H "Content-Type: application/json" \

  -d '{- **Hybrid System**: Structured RPG mechanics (stats, levels, combat) meet dynamic AI narratives.

    "characterName": "Aria",

    "characterLevel": 1,## ✨ Core Features

    "characterClass": "Warrior"

  }'---

```

### Backend Setup

📖 Full tutorial: [Quick Start Guide](./backend/docs/QUICK_START.md)

## ✨ Features

## 🎯 How It Works

### 🤖 Hybrid Story System

```

1. Complete Real Tasks### 🤖 Hybrid Story System

   Morning workout, reading, meditation...

   ↓- **10-Chapter Story Arcs** - Complete narratives generated by Google Gemini AI```bash- **Main Story Arcs**: Complete 10-chapter adventures generated by Google Gemini AI

2. Gain Stats & XP

   Fitness → Strength | Learning → Wisdom- **Dynamic Chapters** - Story continues based on tasks you've completed

   ↓

3. Story Adapts- **Branching Narratives** - Your choices shape the plotcd backend- **Dynamic Chapters**: Story continues based on tasks you've completed

   AI generates chapter reflecting YOUR progress

   ↓- **Quest Integration** - Story quests tied to real-life habits

4. Unlock Challenges

   Meet stat requirements → Combat unlocksnpm install- **Branching Narratives**: Your choices matter and shape the plot

   ↓

5. Win Rewards### 📈 Character Progression

   XP, gold, equipment, story progression

```- **Level Up** - Gain XP from completing taskscp .env.example .env  # Configure your environment variables- **Quest Integration**: In-game quests tied to real habits (e.g., "Complete 3 workouts")



**Example:** Complete "Morning Workout" for 7 days → Gain +2 Strength → Level up → Story mentions your training → Forest Trial challenge unlocks- **Six Core Stats** - Strength, Agility, Endurance, Intelligence, Wisdom, Charisma



## 🏗️ Project Structure- **Stat-Task Mapping** - Workout → Strength, Reading → Wisdom, etc.npx prisma generate- **Challenge System**: Combat/puzzle encounters unlocked by stat requirements



```- **Equipment System** - Unlock and equip items as rewards

playo/

├── backend/           # Node.js + Express + Prisma APInpx prisma db push

│   ├── src/

│   │   ├── controllers/### ✅ Task Management

│   │   ├── services/

│   │   ├── routes/- **Daily Habits** - Recurring tasks with streak trackingnpm run dev### 📊 Habit Management

│   │   ├── middleware/

│   │   └── types/- **One-Time Todos** - Single completion tasks

│   ├── prisma/

│   └── docs/- **Streak Bonuses** - Extra rewards for consistency (7, 14, 30, 60, 100+ days)```- **Daily Tasks**: Track recurring habits with streak counting

├── frontend/          # React + Vite (coming soon)

└── README.md- **Task Categories** - Fitness, learning, creativity, social, productivity

```

- **Habits**: Build consistency with intelligent reminders

## 🛠️ Tech Stack

### ⚔️ Combat Challenges

### Backend

- **Runtime:** Node.js 18 + TypeScript 5- **Stat Requirements** - Unlock when you meet level/stat thresholdsBackend runs on `http://localhost:3000`- **To-Dos**: One-time tasks with priorities

- **Framework:** Express.js

- **Database:** SQLite (dev) / PostgreSQL (prod) via Prisma- **AI Battle Narratives** - Combat outcomes described by Gemini AI

- **Auth:** JWT with bcrypt

- **AI:** Google Gemini 2.5 Flash- **Win Rewards** - XP, gold, items, story progression- **Difficulty Levels**: EASY, MEDIUM, HARD tasks for varied XP



### Frontend (Coming Soon)- **Boss Battles** - Major milestones with epic rewards

- **Framework:** React 18 + TypeScript

- **Build:** Vite### Frontend Setup (Coming Soon)- **Categories**: Fitness, Learning, Wellness, Productivity, etc.

- **Styling:** Tailwind CSS

- **State:** React Query + Context API---



## 📡 API Endpoints



### Authentication## 🏗️ Project Structure

- `POST /api/auth/register` - Create account

- `POST /api/auth/login` - Login & get JWT```bash### 🏆 Character Progression

- `POST /api/auth/refresh` - Refresh token

```

### Story System

- `POST /api/ai/story/arc/create` - Generate 10-chapter storyplayo/cd frontend- **Level System**: Gain XP from completed tasks

- `GET /api/ai/story/current` - Get active story

- `POST /api/ai/story/chapter/next` - Continue story├── backend/              # Node.js + Express + Prisma API

- `POST /api/ai/challenge/check` - Check challenge eligibility

- `POST /api/ai/challenge/attempt` - Attempt combat│   ├── src/npm install- **6 Core Stats**: Strength, Wisdom, Agility, Endurance, Luck, Charisma



### Tasks│   │   ├── controllers/  # Route handlers

- `GET /api/tasks` - Get all tasks

- `POST /api/tasks` - Create task│   │   ├── services/     # Business logic (AI, XP, inventory, streaks)npm run dev- **Stat Growth**: Different tasks boost different stats

- `PUT /api/tasks/:id` - Update task

- `DELETE /api/tasks/:id` - Delete task│   │   ├── routes/       # API endpoints (auth, tasks, story, inventory)

- `POST /api/tasks/:id/complete` - Complete task

│   │   ├── middleware/   # Auth, rate limiting, error handling```- **Equipment**: Unlock items through story progression

### Inventory

- `GET /api/inventory` - Get inventory│   │   ├── types/        # TypeScript definitions

- `POST /api/inventory/equip/:itemId` - Equip item

- `POST /api/inventory/unequip/:itemId` - Unequip item│   │   └── utils/        # Helper functions- **Inventory System**: Collect loot from challenges



📚 Full API docs: [API Reference](./backend/docs/API_REFERENCE.md)  │   ├── prisma/           # Database schema and migrations

🧪 Postman collection: [Import here](./backend/postman/hybrid-story-system.postman_collection.json)

│   ├── docs/             # Backend documentationFrontend will run on `http://localhost:5173`

## 📚 Documentation

│   └── package.json

- [Quick Start Guide](./backend/docs/QUICK_START.md) - Get running in 5 minutes

- [API Reference](./backend/docs/API_REFERENCE.md) - All endpoints with examples│### ⚔️ Combat & Challenges

- [Hybrid Story System](./backend/docs/HYBRID_STORY_SYSTEM.md) - Feature deep dive

- [Gemini AI Service](./backend/docs/GEMINI_AI_SERVICE.md) - Story generation details├── frontend/             # React + TypeScript + Vite (coming soon)

- [XP Calculator](./backend/docs/XP_CALCULATOR.md) - Leveling mechanics

│   ├── src/## 🛠️ Tech Stack- **Stat-Based Combat**: STR/AGI/END/LUCK determine battle outcomes

## ⚙️ Configuration

│   └── package.json

Create `.env` in the `backend/` folder:

│- **AI Narratives**: Exciting battle descriptions for every encounter

```env

# Server└── README.md             # This file

NODE_ENV=development

PORT=3000```### Backend- **Enemy Variety**: Different enemies with unique abilities



# Database

DATABASE_URL="file:./dev.db"

---- **Runtime:** Node.js + TypeScript- **Difficulty Tiers**: EASY → MEDIUM → HARD → EPIC challenges

# JWT

JWT_SECRET=your_secret_key

JWT_REFRESH_SECRET=your_refresh_secret

JWT_EXPIRES_IN=7d## 🚀 Quick Start- **Framework:** Express.js- **Rewards**: XP, gold, equipment, and story progression

JWT_REFRESH_EXPIRES_IN=30d



# Google Gemini AI

GEMINI_API_KEY=your_api_key_here### Prerequisites- **Database:** PostgreSQL with Prisma ORM

```



Get your Gemini API key at [Google AI Studio](https://makersuite.google.com/app/apikey)

- **Node.js** 18+ LTS- **AI:** Google Gemini 2.5 Flash## 🛠 Technology Stack

## 🧪 Development

- **npm** 8+

```bash

# Backend- **Google Gemini API Key** - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)- **Auth:** JWT

cd backend

npm run dev          # Dev server with hot reload

npm run build        # Build for production

npm start            # Start production server### Backend Setup (5 minutes)### Backend



# Database

npx prisma migrate dev       # Create migration

npx prisma studio            # Database GUI```bash### Frontend- **Runtime**: Node.js 18+ with TypeScript 5.0

npx tsx prisma/seed.ts       # Seed demo data

# 1. Clone the repository

# Code quality

npm run lint         # Run ESLintgit clone https://github.com/islamborghini/playo.git- **Framework:** React 18 + TypeScript- **Framework**: Express.js with async/await

npm run format       # Format with Prettier

npm test             # Run testscd playo/backend

```

- **Build Tool:** Vite- **Database**: SQLite (dev) / PostgreSQL (prod) via Prisma ORM

## 🔒 Security

# 2. Install dependencies

- **Rate Limiting:** 100 req/15min (general), 5 req/15min (auth), 10 req/hour (AI)

- **Authentication:** JWT with 7-day access tokens, 30-day refresh tokensnpm install- **Styling:** Tailwind CSS- **Authentication**: JWT with bcrypt password hashing

- **Password Hashing:** bcrypt with 12 rounds

- **Error Handling:** Custom error classes with Prisma error mapping



## 🐛 Troubleshooting# 3. Set up environment variables- **State:** React Query + Context API- **AI Service**: Google Gemini 1.5 Flash for story generation



**"GEMINI_API_KEY is not configured"**  cp .env.example .env

Add your API key to `backend/.env`

# Add your GEMINI_API_KEY to .env- **Routing:** React Router v6

**"Rate limit exceeded"**  

Check usage: `curl http://localhost:3000/api/ai/rate-limit -H "Authorization: Bearer YOUR_TOKEN"`



**Database connection error**  # 4. Set up database### Architecture

Reset database: `cd backend && npx prisma migrate reset --force && npx tsx prisma/seed.ts`

npx prisma migrate dev

## 🤝 Contributing

## 📖 Documentation- RESTful API design

1. Fork the repository

2. Create a feature branch (`git checkout -b feature/amazing-feature`)# 5. Seed demo data

3. Commit your changes (`git commit -m 'Add amazing feature'`)

4. Push to branch (`git push origin feature/amazing-feature`)npx tsx prisma/seed.ts- Service layer pattern for business logic

5. Open a Pull Request



### Code Standards

- TypeScript with strict mode# 6. Start server- [Backend API Documentation](./backend/docs/API_REFERENCE.md)- Prisma for type-safe database access

- ESLint + Prettier formatting

- Comprehensive error handlingnpm run dev

- Clear commit messages

```- [Quick Start Guide](./backend/docs/QUICK_START.md)- Rate limiting & retry logic for AI API

## 📄 License



MIT License - see [LICENSE](LICENSE) for details

**Server runs on:** `http://localhost:3000`- Frontend documentation coming soon- Comprehensive error handling

## 🙏 Acknowledgments



- Google Gemini AI - Story generation

- Prisma - Type-safe ORM### First API Test

- Express.js - Web framework



---

```bash## 🎯 Features## 🚀 Quick Start

<div align="center">

# 1. Login with demo account

**[Documentation](./backend/docs/) • [API Reference](./backend/docs/API_REFERENCE.md) • [Quick Start](./backend/docs/QUICK_START.md)**

curl -X POST http://localhost:3000/api/auth/login \

Made with ❤️ for habit formation and gaming

  -H "Content-Type: application/json" \

</div>

  -d '{"email": "demo@example.com", "password": "Demo@123456"}'- ✅ **AI-Generated Stories** - Personalized adventures based on your progress### Prerequisites



# 2. Create your story arc (use token from step 1)- ✅ **Habit Tracking** - Daily tasks, habits, and todos with streaks

curl -X POST http://localhost:3000/api/ai/story/arc/create \

  -H "Authorization: Bearer YOUR_TOKEN" \- ✅ **RPG Progression** - Level up, gain stats, unlock abilities- **Node.js** 18+ LTS

  -H "Content-Type: application/json" \

  -d '{- ✅ **Combat Challenges** - Test your character in AI-narrated battles- **npm** 8+

    "characterName": "Aria",

    "characterLevel": 1,- ✅ **Dynamic Choices** - Story branches based on your decisions- **Google Gemini API Key** (get from [Google AI Studio](https://makersuite.google.com/app/apikey))

    "characterClass": "Warrior"

  }'

```

## 🤝 Contributing### Installation (5 minutes)

**Read your epic opening chapter!** 🎉



📖 **Full Tutorial**: See [Quick Start Guide](./backend/docs/QUICK_START.md)

This is an MVP project. For major changes, please open an issue first.```bash

---

# 1. Clone the repository

## 🎯 How It Works

## 📝 Licensegit clone https://github.com/islamborghini/playo.git

### The Gameplay Loop

cd playo

```

1. 📖 Create Story ArcMIT

   Generate 10 chapters with quests & challenges

   ↓# 2. Install dependencies

2. ✅ Complete Real Tasks

   Morning workout, reading, meditation, etc.## 🙏 Acknowledgmentsnpm install

   ↓

3. 📈 Gain Stats & XP

   Fitness tasks → Strength | Learning → Wisdom

   ↓- Google Gemini for AI story generation# 3. Set up environment variables

4. 📚 Generate Next Chapter

   Story reflects YOUR actual accomplishments- Built with ❤️ for habit formation and gamingcp .env.example .env

   ↓

5. ⚔️ Unlock Challenges# Add your GEMINI_API_KEY to .env

   When stats meet requirements

   ↓# 4. Set up database

6. 🎲 Attempt Combatnpx prisma migrate dev

   Stat-based battle with AI narrative

   ↓# 5. Seed demo data

7. 🏆 Win Rewardsnpx tsx prisma/seed.ts

   XP, gold, equipment, story progression

   ↓# 6. Start server

8. 🔄 Repeat!npm run dev

``````



### Real Example**Server runs on:** `http://localhost:3000`



**You complete:** "Morning Workout" (7-day streak)### First Steps



**In the game:**```bash

- Character gains +2 Strength, +1 Endurance# 1. Login with demo account

- Levels up: 1 → 2curl -X POST http://localhost:3000/api/auth/login \

- Unlocks: "Forest Trial" challenge  -H "Content-Type: application/json" \

  -d '{"email": "demo@example.com", "password": "Demo@123456"}'

**Next chapter reads:**

> "Your dedication to morning training has paid off. Aria's muscles are toned, her reflexes sharp. The forest path ahead seems less daunting now..."# 2. Create your story arc

curl -X POST http://localhost:3000/api/ai/story/arc/create \

**Your real habits literally shape the story!** ✨  -H "Authorization: Bearer YOUR_TOKEN" \

  -H "Content-Type: application/json" \

---  -d '{

    "characterName": "Aria",

## 🛠️ Tech Stack    "characterLevel": 1,

    "characterClass": "Warrior"

### Backend  }'

- **Runtime**: Node.js 18+ with TypeScript 5.0```

- **Framework**: Express.js with async/await

- **Database**: SQLite (dev) / PostgreSQL (prod) via Prisma ORM**Read your epic opening chapter!** 🎉

- **Authentication**: JWT with bcrypt password hashing

- **AI Service**: Google Gemini 2.5 Flash for story generation📖 **Full Tutorial**: See [Quick Start Guide](docs/QUICK_START.md)

- **Architecture**: RESTful API with service layer pattern

## 📁 Project Structure

### Frontend (Coming Soon)

- **Framework**: React 18 + TypeScript```

- **Build Tool**: Vitesrc/

- **Styling**: Tailwind CSS├── controllers/     # Express route controllers

- **State**: React Query + Context API├── services/        # Business logic services

- **Routing**: React Router v6├── models/          # Data models and schemas

├── routes/          # API route definitions

---├── middleware/      # Express middleware

├── utils/           # Utility functions

## 📡 API Endpoints└── types/           # TypeScript type definitions

```

### 🔐 Authentication

| Method | Endpoint | Description |## 🔧 Available Scripts

|--------|----------|-------------|

| POST | `/api/auth/register` | Create new account |- `npm run dev` - Start development server with hot reload

| POST | `/api/auth/login` | Login & get JWT |- `npm run build` - Build for production

| POST | `/api/auth/refresh` | Refresh access token |- `npm start` - Start production server

- `npm run lint` - Run ESLint

### 🎮 Hybrid Story System- `npm run lint:fix` - Fix ESLint issues

| Method | Endpoint | Description |- `npm run format` - Format code with Prettier

|--------|----------|-------------|- `npm run format:check` - Check code formatting

| POST | `/api/ai/story/arc/create` | Generate 10-chapter story |- `npm test` - Run tests

| GET | `/api/ai/story/current` | Get active story arc |- `npm run test:watch` - Run tests in watch mode

| POST | `/api/ai/story/chapter/next` | Continue story with progress |- `npm run test:coverage` - Generate test coverage report

| POST | `/api/ai/challenge/check` | Check if ready for challenge |

| POST | `/api/ai/challenge/attempt` | Attempt combat & get narrative |## 🎯 How It Works



### ✅ Task Management### The Gameplay Loop

| Method | Endpoint | Description |

|--------|----------|-------------|```

| GET | `/api/tasks` | Get all user tasks |1. 📖 Create Story Arc

| POST | `/api/tasks` | Create new task |   Generate 10 chapters with quests & challenges

| PUT | `/api/tasks/:id` | Update task |   ↓

| DELETE | `/api/tasks/:id` | Delete task |2. ✅ Complete Real Tasks

| POST | `/api/tasks/:id/complete` | Mark task complete |   Morning workout, reading, meditation, etc.

   ↓

### 🎒 Inventory & Items3. 📈 Gain Stats & XP

| Method | Endpoint | Description |   Fitness tasks → Strength | Learning → Wisdom

|--------|----------|-------------|   ↓

| GET | `/api/inventory` | Get character inventory |4. 📚 Generate Next Chapter

| POST | `/api/inventory/equip/:itemId` | Equip item |   Story reflects YOUR actual accomplishments

| POST | `/api/inventory/unequip/:itemId` | Unequip item |   ↓

5. ⚔️ Unlock Challenges

### 🔍 Utility   When stats meet requirements

| Method | Endpoint | Description |   ↓

|--------|----------|-------------|6. 🎲 Attempt Combat

| GET | `/api/ai/health` | Check Gemini AI status |   Stat-based battle with AI narrative

| GET | `/api/ai/rate-limit` | Check API rate limits |   ↓

7. 🏆 Win Rewards

📚 **Full API Documentation**: [API Reference](./backend/docs/API_REFERENCE.md)     XP, gold, equipment, story progression

🧪 **Postman Testing**: Import [Postman Collection](./backend/postman/hybrid-story-system.postman_collection.json)   ↓

8. 🔄 Repeat!

---```



## 📚 Documentation### Real Example



### Core Guides**You complete:** "Morning Workout" (7-day streak)

- **[Quick Start Guide](./backend/docs/QUICK_START.md)** - Get running in 5 minutes

- **[API Reference](./backend/docs/API_REFERENCE.md)** - All endpoints with examples**In the game:**

- **[Hybrid Story System](./backend/docs/HYBRID_STORY_SYSTEM.md)** - Complete feature guide- Character gains +2 Strength, +1 Endurance

- Levels up: 1 → 2

### Service Documentation- Unlocks: "Forest Trial" challenge

- **[Gemini AI Service](./backend/docs/GEMINI_AI_SERVICE.md)** - Story generation details

- **[Inventory System](./backend/docs/INVENTORY_SERVICE.md)** - Item management**Next chapter reads:**

- **[XP Calculator](./backend/docs/XP_CALCULATOR.md)** - Leveling mechanics> "Your dedication to morning training has paid off. Aria's muscles are toned, her reflexes sharp. The forest path ahead seems less daunting now..."

- **[Streak Service](./backend/docs/STREAK_SERVICE.md)** - Consistency tracking

**Your real habits literally shape the story!** ✨

### Development

- **[Implementation Summary](./backend/docs/IMPLEMENTATION_SUMMARY.md)** - Technical overview## 📡 API Endpoints

- **[Postman Testing Guide](./backend/postman/)** - Ready-to-use API requests

### 🔐 Authentication

---| Method | Endpoint | Description |

|--------|----------|-------------|

## ⚙️ Configuration| POST | `/api/auth/register` | Create new account |

| POST | `/api/auth/login` | Login & get JWT |

### Environment Variables| POST | `/api/auth/refresh` | Refresh access token |



Copy `.env.example` to `.env` in the backend folder:### 🎮 Hybrid Story System

| Method | Endpoint | Description |

```bash|--------|----------|-------------|

# Server| POST | `/api/ai/story/arc/create` | Generate 10-chapter story |

NODE_ENV=development| POST | `/api/ai/story/chapter/next` | Continue story with progress |

PORT=3000| POST | `/api/ai/challenge/check` | Check if ready for challenge |

| POST | `/api/ai/challenge/attempt` | Attempt combat & get narrative |

# Database (SQLite for dev, PostgreSQL for prod)| GET | `/api/ai/story/current` | Get active story arc |

DATABASE_URL="file:./dev.db"

### ✅ Task Management

# JWT Authentication (Generate secure keys!)| Method | Endpoint | Description |

JWT_SECRET=your_super_secret_jwt_key_change_this|--------|----------|-------------|

JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this| GET | `/api/tasks` | Get all user tasks |

JWT_EXPIRES_IN=7d| POST | `/api/tasks` | Create new task |

JWT_REFRESH_EXPIRES_IN=30d| PUT | `/api/tasks/:id` | Update task |

| DELETE | `/api/tasks/:id` | Delete task |

# Google Gemini AI| POST | `/api/tasks/:id/complete` | Mark task complete |

GEMINI_API_KEY=your_gemini_api_key_here

### 🎒 Inventory & Items

# Rate Limits (optional, defaults shown)| Method | Endpoint | Description |

RATE_LIMIT_MAX_REQUESTS_PER_MINUTE=15|--------|----------|-------------|

RATE_LIMIT_MAX_REQUESTS_PER_DAY=1500| GET | `/api/inventory` | Get character inventory |

```| POST | `/api/inventory/equip/:itemId` | Equip item |

| POST | `/api/inventory/unequip/:itemId` | Unequip item |

### Get Your Gemini API Key

### 🔍 Utility

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)| Method | Endpoint | Description |

2. Click "Create API Key"|--------|----------|-------------|

3. Copy and paste into `.env`| GET | `/api/ai/health` | Check Gemini AI status |

4. Free tier includes: 15 requests/minute, 1500/day| GET | `/api/ai/rate-limit` | Check API rate limits |



---📚 **Full API Docs**: Import [Postman Collection](postman/hybrid-story-system.postman_collection.json)



## 🧪 Development## 📁 Project Structure



### Available Scripts```

playo/

```bash├── src/

# Backend│   ├── controllers/        # Route handlers

cd backend│   ├── services/           # Business logic

npm run dev          # Start dev server with hot reload│   │   ├── geminiService.ts      # AI story generation

npm run build        # Build for production│   │   ├── inventoryService.ts   # Item management

npm start            # Start production server│   │   ├── streakService.ts      # Streak tracking

│   │   └── xpCalculator.ts       # XP & level logic

# Database│   ├── routes/             # API endpoints

npx prisma migrate dev       # Create & apply migration│   │   ├── ai.ts                 # Story & challenge routes

npx prisma studio            # Open database GUI│   │   ├── auth.ts               # Authentication

npx tsx prisma/seed.ts       # Seed demo data│   │   ├── tasks.ts              # Task management

│   │   └── inventory.ts          # Inventory routes

# Code Quality│   ├── middleware/         # Auth, validation, error handling

npm run lint         # Run ESLint│   ├── types/              # TypeScript definitions

npm run lint:fix     # Fix ESLint issues│   │   └── gemini.ts             # Story system types

npm run format       # Format with Prettier│   └── utils/              # Helper functions

npm test             # Run tests├── prisma/

```│   ├── schema.prisma       # Database schema

│   ├── migrations/         # Database versions

---│   └── seed.ts             # Demo data

├── docs/                   # Documentation

## 🔒 Security & Best Practices└── postman/                # API collections

```

### Rate Limiting

- **100 requests/15 minutes** - General endpoints## 🧪 Available Scripts

- **5 requests/15 minutes** - Auth endpoints

- **10 requests/hour** - AI endpoints```bash

- Automatic backoff & retry on errors# Development

npm run dev          # Start dev server with hot reload

### Authenticationnpm run build        # Build for production

- JWT with 7-day access tokensnpm start            # Start production server

- 30-day refresh tokens

- bcrypt password hashing (12 rounds)# Database

- Secure HTTP headersnpx prisma migrate dev       # Create & apply migration

npx prisma studio            # Open database GUI

### Error Handlingnpx tsx prisma/seed.ts       # Seed demo data

- Custom error classes for all scenarios

- Prisma error mapping# Code Quality

- Development/production loggingnpm run lint         # Run ESLint

- Consistent JSON error responsesnpm run lint:fix     # Fix ESLint issues

npm run format       # Format with Prettier

---npm test             # Run tests

npm run test:coverage # Generate coverage report

## 🐛 Troubleshooting

# Utilities

### Common Issuesnpm run clean        # Remove build artifacts

```

**"GEMINI_API_KEY is not configured"**

```bash## 🌟 Feature Status

# Add to backend/.env file:

GEMINI_API_KEY=your_actual_api_key### ✅ Completed (v1.0)

```- [x] JWT Authentication with refresh tokens

- [x] Task Management (CRUD + completion)

**"Rate limit exceeded"**- [x] Character Progression (XP, levels, stats)

```bash- [x] Inventory System (equipment, items)

# Check your usage:- [x] Streak Tracking with bonuses

curl http://localhost:3000/api/ai/rate-limit \- [x] Google Gemini AI Integration

  -H "Authorization: Bearer YOUR_TOKEN"- [x] Hybrid Story System (10-chapter arcs)

```- [x] Quest System tied to real tasks

- [x] Combat Challenges with stat requirements

**"Requirements not met" for challenge**- [x] Dynamic Chapter Generation

```bash- [x] AI Battle Narratives

# Complete more tasks to level up!- [x] Rate Limiting & Retry Logic

# Check your stats and challenge requirements- [x] Comprehensive Documentation

```- [x] Postman Collections



**Database connection error**### 🚧 In Progress

```bash- [ ] Persistent story state in database

cd backend- [ ] Real-time task → stat sync

npx prisma migrate reset --force- [ ] Web frontend (React)

npx tsx prisma/seed.ts- [ ] Mobile app (React Native)

```

### 🔮 Planned (v2.0)

---- [ ] Multiplayer story arcs

- [ ] Achievement system

## 🤝 Contributing- [ ] Daily/weekly challenges

- [ ] Leaderboards

We welcome contributions! Here's how:- [ ] Guild/party system

- [ ] Voice narration

1. **Fork** the repository- [ ] AI-generated story illustrations

2. **Create** a feature branch- [ ] Social features (friends, sharing)

   ```bash

   git checkout -b feature/amazing-feature## ⚙️ Configuration

   ```

3. **Commit** your changes### Environment Variables

   ```bash

   git commit -m 'Add amazing feature'Copy `.env.example` to `.env`:

   ```

4. **Push** to branch```bash

   ```bash# Server

   git push origin feature/amazing-featureNODE_ENV=development

   ```PORT=3000

5. **Open** a Pull Request

# Database (SQLite for dev, PostgreSQL for prod)

### Code StandardsDATABASE_URL="file:./dev.db"

- ✅ TypeScript with strict mode

- ✅ ESLint + Prettier formatting# JWT Authentication (Generate secure keys!)

- ✅ Comprehensive error handlingJWT_SECRET=your_super_secret_jwt_key_change_this

- ✅ Clear commit messagesJWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this

- ✅ Documentation updatesJWT_EXPIRES_IN=7d

JWT_REFRESH_EXPIRES_IN=30d

---

# Google Gemini AI

## 📄 LicenseGEMINI_API_KEY=your_gemini_api_key_here



This project is licensed under the **MIT License** - see [LICENSE](LICENSE) for details.# Rate Limits (optional, defaults shown)

RATE_LIMIT_MAX_REQUESTS_PER_MINUTE=15

---RATE_LIMIT_MAX_REQUESTS_PER_DAY=1500

```

## 🙏 Acknowledgments

### Get Your Gemini API Key

- **Google Gemini AI** - Powering story generation

- **Prisma** - Type-safe database ORM1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)

- **Express.js** - Web framework2. Click "Create API Key"

- **TypeScript** - Type safety3. Copy and paste into `.env`

4. Free tier includes: 15 requests/minute, 1500/day

---

### Database Setup

<div align="center">

**Development (SQLite - no setup needed):**

### **playo** - Where habits become adventures! 🗡️✨```bash

npx prisma migrate dev

**[Get Started](./backend/docs/QUICK_START.md)** • **[Documentation](./backend/docs/)** • **[API Reference](./backend/docs/API_REFERENCE.md)**```



Made with ❤️ for habit formation and gaming**Production (PostgreSQL):**

```bash

</div># Update .env with PostgreSQL connection string

DATABASE_URL="postgresql://user:password@localhost:5432/playo"
npx prisma migrate deploy
```

## 📚 Documentation

### Core Guides
- **[Quick Start](docs/QUICK_START.md)** - Get running in 5 minutes
- **[Hybrid Story System](docs/HYBRID_STORY_SYSTEM.md)** - Complete feature guide
- **[API Reference](docs/API_REFERENCE.md)** - All endpoints with examples

### Service Documentation
- **[Gemini AI Service](docs/GEMINI_AI_SERVICE.md)** - Story generation details
- **[Inventory System](docs/INVENTORY_SERVICE.md)** - Item management
- **[XP Calculator](docs/XP_CALCULATOR.md)** - Leveling mechanics
- **[Streak Service](docs/STREAK_SERVICE.md)** - Consistency tracking

### Development
- **[Implementation Summary](docs/IMPLEMENTATION_SUMMARY.md)** - Technical overview
- **[Postman Collection](postman/)** - Ready-to-use API requests
- **[Database Schema](prisma/schema.prisma)** - Full data model

## 🎨 Example Usage

### Create Epic Story Arc

```typescript
// POST /api/ai/story/arc/create
{
  "characterName": "Kaiden",
  "characterLevel": 1,
  "characterClass": "Mage",
  "theme": "Mystical Adventure",
  "setting": "Ancient Ruins",
  "plotFocus": "mystery"
}

// Response: 10 chapters + quests + challenges
// Read chapter 1's epic opening!
```

### Complete Real Tasks

```typescript
// Your actual habits:
✅ Morning workout (7-day streak)
✅ Read 30 minutes (14-day streak)
✅ Meditate 10 minutes

// Character gains:
+2 Strength, +1 Endurance, +2 Wisdom
Level up: 1 → 2
XP: 150
```

### Generate Next Chapter

```typescript
// POST /api/ai/story/chapter/next
{
  "characterState": {
    "characterName": "Kaiden",
    "level": 2,
    "stats": {"strength": 5, "wisdom": 8}
  },
  "recentProgress": [
    {"title": "Morning Workout", "streakCount": 7},
    {"title": "Reading", "streakCount": 14}
  ]
}

// Response: AI-generated chapter mentioning your training!
// "Kaiden's weeks of disciplined study and physical training
// have transformed him. The ancient texts now make sense..."
```

### Attempt Challenge

```typescript
// POST /api/ai/challenge/attempt
{
  "characterName": "Kaiden",
  "characterState": {
    "level": 2,
    "stats": {"strength": 5, "wisdom": 8, "agility": 6}
  },
  "challenge": {
    "enemy": {
      "name": "Ancient Guardian",
      "level": 2,
      "stats": {"health": 80, "attack": 12}
    }
  }
}

// Response: Combat simulation + AI narrative
// "Victory! The Guardian falls. Kaiden's wisdom allowed
// him to exploit the creature's weakness..."
// Rewards: +200 XP, Ancient Tome, Guardian's Key
```

## 🔒 Security & Best Practices

### Rate Limiting
- **15 requests/minute** per user
- **1500 requests/day** per user
- Automatic backoff & retry on errors

### Authentication
- JWT with 7-day access tokens
- 30-day refresh tokens
- bcrypt password hashing (12 rounds)
- Secure HTTP headers

### Data Validation
- Request body validation
- Type checking with TypeScript
- SQL injection prevention (Prisma)
- XSS protection

## 🐛 Troubleshooting

### Common Issues

**"GEMINI_API_KEY is not configured"**
```bash
# Add to .env file:
GEMINI_API_KEY=your_actual_api_key
```

**"Rate limit exceeded"**
```bash
# Check your usage:
curl http://localhost:3000/api/ai/rate-limit \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**"Requirements not met" for challenge**
```bash
# Complete more tasks to level up!
# Check your stats and challenge requirements
```

**Database connection error**
```bash
# Reset database:
npx prisma migrate reset --force
npx tsx prisma/seed.ts
```

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push** to branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request

### Code Standards
- ✅ TypeScript with strict mode
- ✅ ESLint + Prettier formatting
- ✅ Comprehensive error handling
- ✅ Unit tests for new features
- ✅ Clear commit messages
- ✅ Documentation updates

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- **Google Gemini AI** - Powering story generation
- **Prisma** - Type-safe database ORM
- **Express.js** - Web framework
- **TypeScript** - Type safety

## 💬 Support & Community

- 🐛 **Bug Reports**: [Open an issue](https://github.com/islamborghini/playo/issues)
- 💡 **Feature Requests**: [Discussions](https://github.com/islamborghini/playo/discussions)
- 📧 **Contact**: islam@example.com
- 🌟 **Star this repo** if you find it useful!

## 🚀 Deployment

### Quick Deploy to Production

```bash
# 1. Build
npm run build

# 2. Set production env
export NODE_ENV=production
export DATABASE_URL="postgresql://..."

# 3. Run migrations
npx prisma migrate deploy

# 4. Start server
npm start
```

### Docker (Coming Soon)
```bash
docker build -t playo .
docker run -p 3000:3000 playo
```

---

<div align="center">

### **playo** - Where habits become adventures! 🗡️✨

**[Get Started](docs/QUICK_START.md)** • **[Documentation](docs/)** • **[API Reference](docs/API_REFERENCE.md)**

Made with ❤️ by [Islam Borghini](https://github.com/islamborghini)

</div>