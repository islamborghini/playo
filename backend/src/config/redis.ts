/**
 * Redis Client Configuration
 */

import { createClient } from 'redis';

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
  database: parseInt(process.env.REDIS_DB || '0'),
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected');
});

// Connect to Redis
if (process.env.REDIS_ENABLED !== 'false') {
  redisClient.connect().catch((err) => {
    console.warn('⚠️  Redis connection failed, using memory store:', err.message);
  });
}

export default redisClient;
