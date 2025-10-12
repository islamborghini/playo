# QuestForge - AI-Powered Habit Tracking RPG

> Transform your daily habits into an epic adventure with AI-generated stories that adapt to your progress.

## 🎮 What is QuestForge?

QuestForge is a revolutionary habit tracking application that gamifies your daily routines through AI-powered storytelling. As you complete tasks and build habits, a personalized narrative unfolds, creating a unique RPG experience where your real-world progress drives an engaging fantasy adventure.

## ✨ Features

- 🤖 **AI-Generated Stories**: Personalized narratives that adapt to your task completion patterns
- 📊 **Smart Task Management**: Daily tasks, habits, and to-dos with intelligent categorization
- 🏆 **Character Progression**: Level up and gain stats based on your real-world achievements
- 🎯 **Streak Tracking**: Build consistency with streak rewards and bonus content
- 📈 **Progress Analytics**: Detailed insights into your habit formation journey
- 🎨 **Character Customization**: Unlock appearance options and equipment through consistency

## 🛠 Technology Stack

- **Backend**: Node.js with TypeScript and Express.js
- **Database**: PostgreSQL with Redis for caching
- **AI Integration**: OpenAI/Claude APIs for story generation
- **Architecture**: RESTful API with real-time WebSocket support

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ LTS
- npm 8+
- PostgreSQL 14+
- Redis 6+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd questforge
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

4. **Start development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

## 📁 Project Structure

```
src/
├── controllers/     # Express route controllers
├── services/        # Business logic services
├── models/          # Data models and schemas
├── routes/          # API route definitions
├── middleware/      # Express middleware
├── utils/           # Utility functions
└── types/           # TypeScript type definitions
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/character` - Get character data
- `PUT /api/users/character` - Update character

### Tasks
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get specific task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/complete` - Mark task as complete

### Stories
- `GET /api/stories/current` - Get current story
- `POST /api/stories/generate` - Generate new story content
- `GET /api/stories/progress` - Get story progression
- `GET /api/stories/chapters` - Get story chapters

## 🌟 Key Features in Development

### Phase 1 - MVP
- [x] Basic project setup
- [ ] User authentication system
- [ ] Task management CRUD operations
- [ ] Character progression system
- [ ] AI story generation integration
- [ ] Basic web interface

### Phase 2 - Enhancement
- [ ] Advanced task types (habits, recurring tasks)
- [ ] Story branching based on user choices
- [ ] Achievement and badge system
- [ ] Equipment and inventory system
- [ ] Mobile-responsive design
- [ ] Push notifications

### Phase 3 - Social Features
- [ ] Friends and party system
- [ ] Shared quests and challenges
- [ ] Leaderboards
- [ ] Community features

## 🧪 Environment Variables

Copy `.env.example` to `.env` and configure the following:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/questforge_dev

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Secrets
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# AI API Keys
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Code Standards

- TypeScript with strict mode enabled
- ESLint for code linting
- Prettier for code formatting
- Comprehensive error handling
- Unit and integration tests
- Clear documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Support

For support, please open an issue on GitHub or contact the development team.

---

**QuestForge** - Where habits become adventures! 🗡️✨