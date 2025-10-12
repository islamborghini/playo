# QuestForge - AI-Powered Habit Tracking RPG

This is a Node.js TypeScript project for an AI-powered habit tracking RPG game.

## Project Structure
- Backend: Node.js with TypeScript and Express.js
- Database: PostgreSQL with Redis for caching
- AI Integration: OpenAI/Claude APIs for story generation
- Architecture: RESTful API with real-time WebSocket support

## Development Setup
- Run `npm install` to install dependencies
- Run `npm run dev` to start development server
- Run `npm run build` to build for production
- Run `npm start` to start production server

## Folder Structure
- `src/controllers/` - Express route controllers
- `src/services/` - Business logic services
- `src/models/` - Data models and schemas
- `src/routes/` - API route definitions
- `src/middleware/` - Express middleware
- `src/utils/` - Utility functions
- `src/types/` - TypeScript type definitions

## Code Standards
- TypeScript with strict mode enabled
- ESLint and Prettier for code formatting
- Environment variables managed with dotenv