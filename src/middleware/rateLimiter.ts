/**
 * Rate Limiter Middleware
 */

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisClient from '@/config/redis';
import { Request, Response } from 'express';
import { ApiResponse, AuthenticatedRequest } from '@/types';

// Admin IP whitelist
const ADMIN_IPS = (process.env.ADMIN_WHITELIST_IPS || '127.0.0.1,::1').split(',');

/**
 * Skip rate limiting for whitelisted IPs
 */
const skipWhitelistedIPs = (req: Request): boolean => {
  const clientIP = req.ip || req.socket.remoteAddress || '';
  return ADMIN_IPS.includes(clientIP);
};

/**
 * Standardized rate limit exceeded handler
 */
const rateLimitHandler = (_req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    message: 'Too many requests, please try again later',
    error: 'RATE_LIMIT_EXCEEDED',
    data: {
      retryAfter: 900, // 15 minutes default
      limit: 100,
      remaining: 0,
    },
    timestamp: new Date().toISOString(),
  };

  res.status(429).json(response);
};

/**
 * Create Redis store or fallback to memory store
 */
const getStoreConfig = () => {
  if (redisClient.isOpen) {
    return {
      store: new RedisStore({
        // @ts-expect-error - RedisStore types are not fully compatible
        client: redisClient,
        prefix: 'rl:',
      }),
    };
  }
  console.warn('⚠️  Using memory store for rate limiting (Redis not available)');
  return {}; // Use default memory store
};

/**
 * General API Rate Limiter
 * 100 requests per 15 minutes per IP
 */
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipWhitelistedIPs,
  handler: rateLimitHandler,
  ...getStoreConfig(),
});

/**
 * Auth Rate Limiter
 * 5 requests per 15 minutes per IP
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipWhitelistedIPs,
  handler: rateLimitHandler,
  ...getStoreConfig(),
});

/**
 * AI Generation Rate Limiter
 * 10 requests per hour per user
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many AI generation requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipWhitelistedIPs,
  handler: rateLimitHandler,
  ...getStoreConfig(),
  // Use user ID instead of IP for authenticated requests
  keyGenerator: (req: Request): string => {
    const authReq = req as AuthenticatedRequest;
    return authReq.user?.id || req.ip || 'unknown';
  },
});
