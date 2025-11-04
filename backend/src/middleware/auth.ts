import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractTokenFromHeader } from '@/utils/jwt';
import { UserService } from '@/services/userService';
import { AuthenticatedRequest, OptionalAuthRequest, ApiResponse } from '@/types';

const userService = new UserService();

/**
 * Authentication errors
 */
export class AuthenticationError extends Error {
  public status: number;
  public code: string;

  constructor(message: string, status: number = 401, code: string = 'AUTHENTICATION_ERROR') {
    super(message);
    this.name = 'AuthenticationError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Required authentication middleware
 * Requires valid JWT token and attaches user to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('🔐 Auth middleware - Authorization header:', req.headers.authorization);
    
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);
    console.log('🔐 Extracted token:', token ? `${token.substring(0, 20)}...` : 'null');
    
    if (!token) {
      console.log('❌ No token found');
      const errorResponse: ApiResponse = {
        success: false,
        message: 'Access token is required',
        error: 'MISSING_TOKEN',
        timestamp: new Date().toISOString(),
      };
      res.status(401).json(errorResponse);
      return;
    }

    // Verify the token
    let decodedToken;
    try {
      console.log('🔐 Verifying token...');
      decodedToken = verifyAccessToken(token);
      console.log('✅ Token verified, user ID:', decodedToken.userId);
    } catch (error) {
      console.log('❌ Token verification failed:', error);
      
      let errorMessage = 'Invalid access token';
      let errorCode = 'INVALID_TOKEN';

      if (error instanceof Error) {
        console.log('Error message:', error.message);
        switch (error.message) {
          case 'ACCESS_TOKEN_EXPIRED':
            errorMessage = 'Access token has expired';
            errorCode = 'TOKEN_EXPIRED';
            break;
          case 'INVALID_ACCESS_TOKEN':
            errorMessage = 'Invalid access token format';
            errorCode = 'INVALID_TOKEN_FORMAT';
            break;
          case 'jwt expired':
            errorMessage = 'Access token has expired';
            errorCode = 'TOKEN_EXPIRED';
            break;
          case 'invalid token':
          case 'jwt malformed':
          case 'invalid signature':
            errorMessage = 'Invalid access token format';
            errorCode = 'INVALID_TOKEN_FORMAT';
            break;
          default:
            errorMessage = 'Token verification failed';
            errorCode = 'TOKEN_VERIFICATION_FAILED';
        }
      }

      const errorResponse: ApiResponse = {
        success: false,
        message: errorMessage,
        error: errorCode,
        timestamp: new Date().toISOString(),
      };
      res.status(401).json(errorResponse);
      return;
    }

    // Get user data from database
    const user = await userService.getUserById(decodedToken.userId);
    
    if (!user) {
      const errorResponse: ApiResponse = {
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND',
        timestamp: new Date().toISOString(),
      };
      res.status(401).json(errorResponse);
      return;
    }

    // Attach user data to request
    (req as AuthenticatedRequest).user = {
      id: user.id,
      email: user.email,
      username: user.username,
      level: user.level,
      characterName: user.characterName,
    };

    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    
    const errorResponse: ApiResponse = {
      success: false,
      message: 'Internal authentication error',
      error: 'INTERNAL_AUTH_ERROR',
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(errorResponse);
  }
};

/**
 * Optional authentication middleware
 * Attaches user to request if valid token is provided, but doesn't require it
 */
export const optionalAuthenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      // No token provided, continue without authentication
      next();
      return;
    }

    // Verify the token
    let decodedToken;
    try {
      decodedToken = verifyAccessToken(token);
    } catch (error) {
      // Invalid token, continue without authentication
      next();
      return;
    }

    // Get user data from database
    const user = await userService.getUserById(decodedToken.userId);
    
    if (user) {
      // Attach user data to request
      (req as OptionalAuthRequest).user = {
        id: user.id,
        email: user.email,
        username: user.username,
        level: user.level,
        characterName: user.characterName,
      };
    }

    next();
  } catch (error) {
    console.error('Optional authentication middleware error:', error);
    // Continue without authentication on any error
    next();
  }
};

/**
 * Admin authentication middleware
 * Requires authentication and admin privileges
 */
export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // First run normal authentication
  await authenticate(req, res, (error?: unknown) => {
    if (error || res.headersSent) {
      return;
    }

    try {
      const user = (req as AuthenticatedRequest).user;
      
      // Check if user has admin privileges (level 100+ for admin)
      if (user.level < 100) {
        const errorResponse: ApiResponse = {
          success: false,
          message: 'Admin privileges required',
          error: 'INSUFFICIENT_PRIVILEGES',
          timestamp: new Date().toISOString(),
        };
        res.status(403).json(errorResponse);
        return;
      }

      next();
    } catch (authError) {
      console.error('Admin authentication error:', authError);
      
      const errorResponse: ApiResponse = {
        success: false,
        message: 'Admin authentication failed',
        error: 'ADMIN_AUTH_ERROR',
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(errorResponse);
    }
  });
};

/**
 * Rate limiting by user ID
 * Requires authentication and implements per-user rate limiting
 */
export const authenticateWithRateLimit = (maxRequests: number, windowMs: number) => {
  const userRequestCounts = new Map<string, { count: number; resetTime: number }>();

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // First run normal authentication
    await authenticate(req, res, (error?: unknown) => {
      if (error || res.headersSent) {
        return;
      }

      try {
        const user = (req as AuthenticatedRequest).user;
        const now = Date.now();
        const userLimit = userRequestCounts.get(user.id);

        if (!userLimit || now > userLimit.resetTime) {
          // Reset or initialize counter
          userRequestCounts.set(user.id, {
            count: 1,
            resetTime: now + windowMs,
          });
          next();
          return;
        }

        if (userLimit.count >= maxRequests) {
          const errorResponse: ApiResponse = {
            success: false,
            message: `Too many requests. Limit: ${maxRequests} per ${windowMs / 1000} seconds`,
            error: 'USER_RATE_LIMIT_EXCEEDED',
            timestamp: new Date().toISOString(),
          };
          res.status(429).json(errorResponse);
          return;
        }

        // Increment counter
        userLimit.count++;
        next();
      } catch (rateLimitError) {
        console.error('Rate limit authentication error:', rateLimitError);
        
        const errorResponse: ApiResponse = {
          success: false,
          message: 'Rate limit authentication failed',
          error: 'RATE_LIMIT_AUTH_ERROR',
          timestamp: new Date().toISOString(),
        };
        res.status(500).json(errorResponse);
      }
    });
  };
};