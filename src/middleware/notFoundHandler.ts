import { Request, Response } from 'express';
import { ApiResponse } from '@/types';

export const notFoundHandler = (req: Request, res: Response): void => {
  const notFoundResponse: ApiResponse = {
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  };

  res.status(404).json(notFoundResponse);
};