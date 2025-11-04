/**
 * Generic Zod Validation Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiResponse } from '@/types';

export type ValidationTarget = 'body' | 'query' | 'params';

function formatZodErrors(error: ZodError): string[] {
  return error.issues.map((err: any) => {
    const path = err.path.join('.');
    return path ? `${path}: ${err.message}` : err.message;
  });
}

export function validate(
  schema: ZodSchema,
  target: ValidationTarget = 'body'
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const dataToValidate = req[target];
      const validatedData = schema.parse(dataToValidate);
      req[target] = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = formatZodErrors(error);
        
        const response: ApiResponse = {
          success: false,
          message: 'Validation failed',
          error: 'VALIDATION_ERROR',
          data: {
            errors,
            fields: error.issues.map((err: any) => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code,
            })),
          },
          timestamp: new Date().toISOString(),
        };

        res.status(400).json(response);
        return;
      }

      const response: ApiResponse = {
        success: false,
        message: 'Validation error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };

      res.status(400).json(response);
    }
  };
}

export const validateBody = (schema: ZodSchema) => validate(schema, 'body');
export const validateQuery = (schema: ZodSchema) => validate(schema, 'query');
export const validateParams = (schema: ZodSchema) => validate(schema, 'params');

export default validate;
