/**
 * Rate Limiter Middleware
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { ApiResponse } from '@/types';

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
 * General API Rate Limiter
 * 100 requests per 15 minutes per IP
 * Using in-memory store for MVP (can add Redis later)
 */
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipWhitelistedIPs,
  handler: rateLimitHandler,
});

/**
 * Auth Rate Limiter
 * 5 requests per 15 minutes per IP
 * Using in-memory store for MVP
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipWhitelistedIPs,
  handler: rateLimitHandler,
});

/**
 * AI Generation Rate Limiter
 * 10 requests per hour per IP/user
 * Using in-memory store for MVP
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many AI generation requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipWhitelistedIPs,
  handler: rateLimitHandler,
  // Use user ID if authenticated, otherwise IP
  keyGenerator: (req: Request): string => {
    const authReq = req as any; // Simple type assertion for user property
    return authReq.user?.id || req.ip || 'unknown';
  },
});
