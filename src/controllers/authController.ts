import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { UserService } from '@/services/userService';
import { generateTokens, verifyRefreshToken } from '@/utils/jwt';
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
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export class AuthController {
  /**
   * User registration with validation and password hashing
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, username }: RegisterRequest = req.body;

      // Validate input
      if (!email || !password || !username) {
        const response: ApiResponse = {
          success: false,
          message: 'Email, password, and username are required',
          error: 'MISSING_FIELDS',
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        const response: ApiResponse = {
          success: false,
          message: 'Please provide a valid email address',
          error: 'INVALID_EMAIL',
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      // Validate password strength
      if (password.length < 8) {
        const response: ApiResponse = {
          success: false,
          message: 'Password must be at least 8 characters long',
          error: 'WEAK_PASSWORD',
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      // Validate username
      if (username.length < 3 || username.length > 20) {
        const response: ApiResponse = {
          success: false,
          message: 'Username must be between 3 and 20 characters',
          error: 'INVALID_USERNAME',
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

      // Create user (UserService will handle password hashing)
      const newUser = await userService.createUser({
        email,
        password, // Pass plain password - UserService will hash it
        username,
        characterName: username, // Default character name to username
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
        message: 'Internal server error during registration',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(response);
    }
  }

  /**
   * User login with credential validation
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

      // Verify password using bcrypt
      const isValidPassword = await bcrypt.compare(password, user.password);
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
            stats: user.stats,
            preferences: user.preferences,
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
        message: 'Internal server error during login',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(response);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken }: RefreshTokenRequest = req.body;

      // Validate input
      if (!refreshToken) {
        const response: ApiResponse = {
          success: false,
          message: 'Refresh token is required',
          error: 'MISSING_REFRESH_TOKEN',
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      // Verify refresh token
      let decoded;
      try {
        decoded = verifyRefreshToken(refreshToken);
      } catch (error: any) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid or expired refresh token',
          error: error.message || 'INVALID_REFRESH_TOKEN',
          timestamp: new Date().toISOString(),
        };
        res.status(401).json(response);
        return;
      }

      // Get user data for new tokens
      const user = await userService.getUserById(decoded.userId);
      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND',
          timestamp: new Date().toISOString(),
        };
        res.status(404).json(response);
        return;
      }

      // Generate new token pair
      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        username: user.username,
        level: user.level,
        characterName: user.characterName,
      });

      const response: ApiResponse = {
        success: true,
        message: 'Tokens refreshed successfully',
        data: {
          tokens,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Refresh token error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error during token refresh',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get current authenticated user profile
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
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
        message: 'User profile retrieved successfully',
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
      console.error('Get current user error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error while retrieving user profile',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(response);
    }
  }

  /**
   * Change user password
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const { user } = req as AuthenticatedRequest;
      const { currentPassword, newPassword }: ChangePasswordRequest = req.body;

      // Validate input
      if (!currentPassword || !newPassword) {
        const response: ApiResponse = {
          success: false,
          message: 'Current password and new password are required',
          error: 'MISSING_PASSWORDS',
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      // Validate new password strength
      if (newPassword.length < 8) {
        const response: ApiResponse = {
          success: false,
          message: 'New password must be at least 8 characters long',
          error: 'WEAK_PASSWORD',
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }

      // Get current user data
      const currentUser = await userService.getUserById(user.id);
      if (!currentUser) {
        const response: ApiResponse = {
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND',
          timestamp: new Date().toISOString(),
        };
        res.status(404).json(response);
        return;
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, currentUser.password);
      if (!isValidPassword) {
        const response: ApiResponse = {
          success: false,
          message: 'Current password is incorrect',
          error: 'INVALID_CURRENT_PASSWORD',
          timestamp: new Date().toISOString(),
        };
        res.status(401).json(response);
        return;
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password using userService
      await userService.updateUser(user.id, { password: hashedNewPassword });

      const response: ApiResponse = {
        success: true,
        message: 'Password changed successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Change password error:', error);
      
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error while changing password',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      };
      res.status(500).json(response);
    }
  }

  /**
   * Logout (client-side token invalidation)
   */
  async logout(_req: Request, res: Response): Promise<void> {
    const response: ApiResponse = {
      success: true,
      message: 'Logout successful. Please remove tokens from client storage.',
      data: {
        instructions: 'Clear accessToken and refreshToken from your client storage',
      },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  }

  // Legacy method alias for backward compatibility
  async getProfile(req: Request, res: Response): Promise<void> {
    return this.getCurrentUser(req, res);
  }
}