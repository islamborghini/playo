/**
 * Validation Middleware Tests
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate, validateBody, validateQuery, validateParams } from '../validate';

const mockRequest = (data: any, target: 'body' | 'query' | 'params' = 'body'): Partial<Request> => ({
  [target]: data,
});

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext: NextFunction = jest.fn();

describe('Validate Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Body Validation', () => {
    const testSchema = z.object({
      name: z.string().min(3),
      age: z.number().min(18),
    });

    it('should pass validation with valid data', () => {
      const req = mockRequest({ name: 'John', age: 25 });
      const res = mockResponse();

      validate(testSchema)(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should fail validation with invalid data', () => {
      const req = mockRequest({ name: 'Jo', age: 15 });
      const res = mockResponse();

      validate(testSchema)(req as Request, res as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Validation failed',
        })
      );
    });

    it('should return detailed error messages', () => {
      const req = mockRequest({ name: 'Jo', age: 15 });
      const res = mockResponse();

      validate(testSchema)(req as Request, res as Response, mockNext);

      const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.data.errors).toBeInstanceOf(Array);
      expect(jsonCall.data.errors.length).toBeGreaterThan(0);
    });

    it('should transform data when schema has transformations', () => {
      const transformSchema = z.object({
        email: z.string().email().toLowerCase(),
      });

      const req = mockRequest({ email: 'TEST@EXAMPLE.COM' });
      const res = mockResponse();

      validate(transformSchema)(req as Request, res as Response, mockNext);

      expect(req.body.email).toBe('test@example.com');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Query Validation', () => {
    const querySchema = z.object({
      page: z.string().regex(/^\d+$/).transform(Number),
      limit: z.string().regex(/^\d+$/).transform(Number),
    });

    it('should validate query parameters', () => {
      const req = mockRequest({ page: '1', limit: '10' }, 'query');
      const res = mockResponse();

      validate(querySchema, 'query')(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(req.query).toEqual({ page: 1, limit: 10 });
    });

    it('should fail with invalid query parameters', () => {
      const req = mockRequest({ page: 'invalid', limit: '10' }, 'query');
      const res = mockResponse();

      validate(querySchema, 'query')(req as Request, res as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Params Validation', () => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    it('should validate route parameters', () => {
      const req = mockRequest(
        { id: '123e4567-e89b-12d3-a456-426614174000' },
        'params'
      );
      const res = mockResponse();

      validate(paramsSchema, 'params')(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail with invalid UUID', () => {
      const req = mockRequest({ id: 'not-a-uuid' }, 'params');
      const res = mockResponse();

      validate(paramsSchema, 'params')(req as Request, res as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Shorthand Functions', () => {
    const testSchema = z.object({ test: z.string() });

    it('validateBody should validate body', () => {
      const req = mockRequest({ test: 'value' });
      const res = mockResponse();

      validateBody(testSchema)(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('validateQuery should validate query', () => {
      const req = mockRequest({ test: 'value' }, 'query');
      const res = mockResponse();

      validateQuery(testSchema)(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('validateParams should validate params', () => {
      const req = mockRequest({ test: 'value' }, 'params');
      const res = mockResponse();

      validateParams(testSchema)(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
