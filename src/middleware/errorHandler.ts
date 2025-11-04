import { Request, Response, NextFunction } from 'express';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientInitializationError,
  PrismaClientRustPanicError,
} from '@prisma/client/runtime/library';

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    statusCode: number,
    message: string,
    code?: string,
    isOperational = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || 'INTERNAL_ERROR';
    this.isOperational = isOperational;
    this.details = details;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(400, message, 'VALIDATION_ERROR', true, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Authentication error (401)
 */
export class AuthError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(401, message, 'AUTH_ERROR', true);
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

/**
 * Forbidden error (403)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(403, message, 'FORBIDDEN_ERROR', true);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(404, `${resource} not found`, 'NOT_FOUND', true);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * AI generation error (500)
 */
export class AIGenerationError extends AppError {
  constructor(message: string = 'AI generation failed', details?: any) {
    super(500, message, 'AI_GENERATION_ERROR', true, details);
    Object.setPrototypeOf(this, AIGenerationError.prototype);
  }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(429, message, 'RATE_LIMIT_EXCEEDED', true);
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Database error (500)
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', details?: any) {
    super(500, message, 'DATABASE_ERROR', true, details);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

/**
 * Handle Prisma-specific errors
 */
function handlePrismaError(error: any): AppError {
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        const target = error.meta?.target as string[] | undefined;
        const field = target ? target[0] : 'field';
        return new ValidationError(
          `A record with this ${field} already exists`,
          { field: target }
        );

      case 'P2025':
        return new NotFoundError('Record');

      case 'P2003':
        return new ValidationError('Related record not found', {
          field: error.meta?.field_name,
        });

      case 'P2014':
        return new ValidationError(
          'Cannot delete record because it has related records',
          { relation: error.meta?.relation_name }
        );

      case 'P2000':
        return new ValidationError('Input value is too long for the field', {
          field: error.meta?.column_name,
        });

      case 'P2001':
        return new NotFoundError('Record');

      default:
        return new DatabaseError(`Database error: ${error.code}`, {
          code: error.code,
          meta: error.meta,
        });
    }
  }

  if (error instanceof PrismaClientValidationError) {
    return new ValidationError('Invalid data provided to database', {
      details: error.message,
    });
  }

  if (error instanceof PrismaClientInitializationError) {
    return new DatabaseError('Database connection failed', {
      errorCode: error.errorCode,
    });
  }

  if (error instanceof PrismaClientRustPanicError) {
    return new DatabaseError('Database engine crashed', {
      details: error.message,
    });
  }

  return new DatabaseError('An unexpected database error occurred');
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error: AppError;

  // Handle custom AppError
  if (err instanceof AppError) {
    error = err;
  }
  // Handle Prisma errors
  else if (
    err instanceof PrismaClientKnownRequestError ||
    err instanceof PrismaClientValidationError ||
    err instanceof PrismaClientInitializationError ||
    err instanceof PrismaClientRustPanicError
  ) {
    error = handlePrismaError(err);
  }
  // Handle generic errors
  else {
    error = new AppError(
      500,
      err.message || 'Internal server error',
      'INTERNAL_ERROR',
      false
    );
  }

  // Log error
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    statusCode: error.statusCode,
    code: error.code,
    message: error.message,
    userId: (req as any).user?.id,
    ...(error.details && { details: error.details }),
  };

  if (process.env.NODE_ENV === 'development') {
    console.error('\n🔴 Error occurred:', {
      ...logData,
      stack: err.stack,
    });
  } else {
    if (!error.isOperational) {
      console.error('❌ Programming Error:', {
        ...logData,
        stack: err.stack,
      });
    } else {
      console.error('⚠️ Operational Error:', logData);
    }
  }

  // Send response
  const response: any = {
    success: false,
    error: error.message,
    code: error.code,
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  if (error.details) {
    response.details = error.details;
  }

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(error.statusCode).json(response);
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    code: 'ROUTE_NOT_FOUND',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};