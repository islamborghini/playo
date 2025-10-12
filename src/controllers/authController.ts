import { Request, Response } from 'express';
import { UserService } from '@/services/userService';
import { generateTokens } from '@/utils/jwt';
import { ApiResponse, AuthenticatedRequest } from '@/types';

const userService = new UserService();

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  characterName: string;
}

export class AuthController {
  /**
   * User login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginRequest = req.body;

      // Validate input
      if (!email || !password) {
        const response: ApiResponse = {
          success: false,
          message: 'Email and password are required',
          error: 'MISSING_CREDENTIALS',
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      // Find user by email
      const user = await userService.getUserByEmail(email);
      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid email or password',
          error: 'INVALID_CREDENTIALS',
          timestamp: new Date().toISOString(),
        };
        res.status(401).json(response);
        return;
      }

      // Verify password
      const isValidPassword = await userService.verifyPassword(password, user.password);
      if (!isValidPassword) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid email or password',
          error: 'INVALID_CREDENTIALS',
          timestamp: new Date().toISOString(),
        };
        res.status(401).json(response);
        return;
      }

      // Generate tokens
      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        username: user.username,
        level: user.level,
        characterName: user.characterName,
      });

      const response: ApiResponse = {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            characterName: user.characterName,
            level: user.level,
            xp: user.xp,
          },
          tokens,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Login error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(response);
    }
  }

  /**
   * User registration
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, username, characterName }: RegisterRequest = req.body;

      // Validate input
      if (!email || !password || !username || !characterName) {
        const response: ApiResponse = {
          success: false,
          message: 'All fields are required',
          error: 'MISSING_FIELDS',
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      // Check if user already exists
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        const response: ApiResponse = {
          success: false,
          message: 'User with this email already exists',
          error: 'EMAIL_EXISTS',
          timestamp: new Date().toISOString(),
        };
        res.status(409).json(response);
        return;
      }

      // Check if username is taken
      const existingUsername = await userService.getUserByUsername(username);
      if (existingUsername) {
        const response: ApiResponse = {
          success: false,
          message: 'Username is already taken',
          error: 'USERNAME_EXISTS',
          timestamp: new Date().toISOString(),
        };
        res.status(409).json(response);
        return;
      }

      // Create user
      const newUser = await userService.createUser({
        email,
        password,
        username,
        characterName,
      });

      // Generate tokens
      const tokens = generateTokens({
        userId: newUser.id,
        email: newUser.email,
        username: newUser.username,
        level: newUser.level,
        characterName: newUser.characterName,
      });

      const response: ApiResponse = {
        success: true,
        message: 'Registration successful',
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            username: newUser.username,
            characterName: newUser.characterName,
            level: newUser.level,
            xp: newUser.xp,
          },
          tokens,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Registration error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get current user profile (protected route)
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;

      // Get full user data
      const fullUser = await userService.getUserById(user.id);
      if (!fullUser) {
        const response: ApiResponse = {
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND',
          timestamp: new Date().toISOString(),
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          user: {
            id: fullUser.id,
            email: fullUser.email,
            username: fullUser.username,
            characterName: fullUser.characterName,
            level: fullUser.level,
            xp: fullUser.xp,
            stats: fullUser.stats,
            preferences: fullUser.preferences,
            createdAt: fullUser.createdAt,
            updatedAt: fullUser.updatedAt,
          },
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get profile error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(response);
    }
  }

  /**
   * Logout (invalidate token - client-side handling)
   */
  async logout(_req: Request, res: Response): Promise<void> {
    const response: ApiResponse = {
      success: true,
      message: 'Logout successful. Please remove tokens from client storage.',
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  }
}