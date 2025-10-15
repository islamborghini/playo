import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from '@/utils/config';
import { ApiResponse } from '@/types';

// Import middleware
import { errorHandler } from '@/middleware/errorHandler';
import { notFoundHandler } from '@/middleware/notFoundHandler';

// Import routes
import authRoutes from '@/routes/auth';
import userRoutes from '@/routes/users';
import taskRoutes from '@/routes/tasks';
import storyRoutes from '@/routes/stories';
import characterRoutes from '@/routes/character';
import inventoryRoutes from '@/routes/inventory';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(
      cors({
        origin: config.CORS_ORIGIN,
        credentials: config.CORS_CREDENTIALS,
        optionsSuccessStatus: 200,
      })
    );

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.RATE_LIMIT_WINDOW_MS,
      max: config.RATE_LIMIT_MAX_REQUESTS,
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        timestamp: new Date().toISOString(),
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    // Compression
    this.app.use(compression());

    // Logging
    if (config.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Health check endpoint
    this.app.get('/health', (_req: Request, res: Response) => {
      const healthData: ApiResponse = {
        success: true,
        message: 'Server is healthy',
        data: {
          status: 'ok',
          timestamp: new Date().toISOString(),
          version: config.APP_VERSION,
          environment: config.NODE_ENV,
        },
        timestamp: new Date().toISOString(),
      };
      res.status(200).json(healthData);
    });

    // API info endpoint
    this.app.get('/api', (_req: Request, res: Response) => {
      const apiInfo: ApiResponse = {
        success: true,
        message: 'playo API',
        data: {
          name: config.APP_NAME,
          version: config.APP_VERSION,
          description: 'AI-powered habit tracking RPG game API',
          endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            tasks: '/api/tasks',
            stories: '/api/stories',
            character: '/api/character',
            inventory: '/api/inventory',
          },
        },
        timestamp: new Date().toISOString(),
      };
      res.status(200).json(apiInfo);
    });
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/tasks', taskRoutes);
    this.app.use('/api/stories', storyRoutes);
    this.app.use('/api/character', characterRoutes);
    this.app.use('/api/inventory', inventoryRoutes);

    // Catch all unmatched routes
    this.app.use('*', notFoundHandler);
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public getApp(): Application {
    return this.app;
  }
}

export default App;