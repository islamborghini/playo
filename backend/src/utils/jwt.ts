import jwt from 'jsonwebtoken';
import { config } from '@/utils/config';

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  level: number;
  characterName: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface DecodedToken extends JWTPayload {
  iat: number;
  exp: number;
}

/**
 * Generate access and refresh token pair
 */
export const generateTokens = (payload: JWTPayload): TokenPair => {
  if (!config.JWT_SECRET || !config.JWT_REFRESH_SECRET) {
    throw new Error('JWT secrets are not configured');
  }

  console.log('🔑 Generating tokens for user:', payload.userId);

  // Type assertion workaround for JWT library compatibility
  const accessToken = (jwt as any).sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });

  const refreshToken = (jwt as any).sign(
    { userId: payload.userId }, 
    config.JWT_REFRESH_SECRET, 
    {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN,
    }
  );

  console.log('✅ Tokens generated successfully');
  return { accessToken, refreshToken };
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): DecodedToken => {
  console.log('🔍 JWT verification - token length:', token.length);
  console.log('🔍 JWT secret configured:', !!config.JWT_SECRET);
  
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as DecodedToken;
    console.log('✅ JWT decoded successfully:', decoded.userId);
    return decoded;
  } catch (error) {
    console.log('❌ JWT verification error:', error);
    
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('ACCESS_TOKEN_EXPIRED');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('INVALID_ACCESS_TOKEN');
    }
    throw new Error('TOKEN_VERIFICATION_FAILED');
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): { userId: string; iat: number; exp: number } => {
  try {
    const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET) as { userId: string; iat: number; exp: number };
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('REFRESH_TOKEN_EXPIRED');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }
    throw new Error('REFRESH_TOKEN_VERIFICATION_FAILED');
  }
};

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1] || null;
};

/**
 * Check if token is about to expire (within 5 minutes)
 */
export const isTokenExpiringSoon = (token: DecodedToken): boolean => {
  const now = Math.floor(Date.now() / 1000);
  const fiveMinutes = 5 * 60;
  
  return (token.exp - now) < fiveMinutes;
};

/**
 * Decode token without verification (for debugging)
 */
export const decodeTokenUnsafe = (token: string): DecodedToken | null => {
  try {
    return jwt.decode(token) as DecodedToken;
  } catch {
    return null;
  }
};