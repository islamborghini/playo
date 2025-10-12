import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@/types';

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('❌ Error:', error);

  const errorResponse: ApiResponse = {
    success: false,
    message: error.message || 'Internal server error',
    timestamp: new Date().toISOString(),
  };

  // Handle different error types
  if (error.name === 'ValidationError') {
    res.status(400).json({
      ...errorResponse,
      message: 'Validation error',
      error: error.message,
    });
    return;
  }

  if (error.name === 'UnauthorizedError') {
    res.status(401).json({
      ...errorResponse,
      message: 'Unauthorized',
    });
    return;
  }

  if (error.name === 'ForbiddenError') {
    res.status(403).json({
      ...errorResponse,
      message: 'Forbidden',
    });
    return;
  }

  if (error.name === 'NotFoundError') {
    res.status(404).json({
      ...errorResponse,
      message: 'Resource not found',
    });
    return;
  }

  // Default to 500 server error
  res.status(500).json(errorResponse);
};