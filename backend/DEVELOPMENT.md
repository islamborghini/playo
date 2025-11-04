# playo Development

## Quick Start

1. Install dependencies: `npm install`
2. Copy environment file: `cp .env.example .env`
3. Configure your environment variables in `.env`
4. Start development server: `npm run dev`

## Environment Setup

Make sure you have the following installed:
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

## Available Commands

- `npm run dev` - Development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Check code quality
- `npm run format` - Format code

## API Testing

Once the server is running, you can test the API endpoints:

- Health check: GET http://localhost:3000/health
- API info: GET http://localhost:3000/api
- Auth endpoints: GET http://localhost:3000/api/auth
- User endpoints: GET http://localhost:3000/api/users
- Task endpoints: GET http://localhost:3000/api/tasks
- Story endpoints: GET http://localhost:3000/api/stories

## Next Steps

1. Install dependencies with `npm install`
2. Set up your database connection in `.env`
3. Configure AI API keys in `.env`
4. Start implementing authentication controllers
5. Add database models and migrations