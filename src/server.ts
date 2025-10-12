import { config } from '@/utils/config';
import App from '@/app';

const app = new App();
const server = app.getApp();

const startServer = (): void => {
  try {
    server.listen(config.PORT, config.HOST, () => {
      console.log(
        `🚀 ${config.APP_NAME} server is running on http://${config.HOST}:${config.PORT}`
      );
      console.log(`📝 Environment: ${config.NODE_ENV}`);
      console.log(`🔧 API Documentation: http://${config.HOST}:${config.PORT}/api`);
      console.log(`❤️ Health Check: http://${config.HOST}:${config.PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

process.on('uncaughtException', (error: Error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();