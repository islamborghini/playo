import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

interface EnvironmentConfig {
  // Server
  NODE_ENV: string;
  PORT: number;
  HOST: string;

  // Database
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DATABASE_URL: string;

  // Redis
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string | undefined;

  // JWT
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;

  // AI APIs
  OPENAI_API_KEY: string | undefined;
  ANTHROPIC_API_KEY: string | undefined;
  AI_MODEL: string;
  AI_MAX_TOKENS: number;

  // Security
  BCRYPT_ROUNDS: number;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;

  // CORS
  CORS_ORIGIN: string;
  CORS_CREDENTIALS: boolean;

  // File Upload
  MAX_FILE_SIZE: number;
  UPLOAD_PATH: string;

  // Logging
  LOG_LEVEL: string;
  LOG_FILE: string;

  // Session
  SESSION_SECRET: string;

  // Application
  APP_NAME: string;
  APP_VERSION: string;
  APP_URL: string;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value || defaultValue || '';
};

const getEnvVarAsNumber = (key: string, defaultValue?: number): number => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  const numValue = value ? parseInt(value, 10) : defaultValue;
  if (numValue === undefined || isNaN(numValue)) {
    throw new Error(`Environment variable ${key} must be a valid number`);
  }
  return numValue;
};

const getEnvVarAsBoolean = (key: string, defaultValue?: boolean): boolean => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  if (!value) {
    return defaultValue || false;
  }
  return value.toLowerCase() === 'true';
};

export const config: EnvironmentConfig = {
  // Server
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PORT: getEnvVarAsNumber('PORT', 3000),
  HOST: getEnvVar('HOST', 'localhost'),

  // Database (optional for SQLite)
  DB_HOST: getEnvVar('DB_HOST', 'localhost'),
  DB_PORT: getEnvVarAsNumber('DB_PORT', 5432),
  DB_NAME: getEnvVar('DB_NAME', 'questforge_dev'),
  DB_USER: getEnvVar('DB_USER', ''),
  DB_PASSWORD: getEnvVar('DB_PASSWORD', ''),
  DATABASE_URL: getEnvVar('DATABASE_URL', 'file:./dev.db'),

  // Redis
  REDIS_HOST: getEnvVar('REDIS_HOST', 'localhost'),
  REDIS_PORT: getEnvVarAsNumber('REDIS_PORT', 6379),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,

  // JWT
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '7d'),
  JWT_REFRESH_SECRET: getEnvVar('JWT_REFRESH_SECRET'),
  JWT_REFRESH_EXPIRES_IN: getEnvVar('JWT_REFRESH_EXPIRES_IN', '30d'),

  // AI APIs
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  AI_MODEL: getEnvVar('AI_MODEL', 'gpt-4'),
  AI_MAX_TOKENS: getEnvVarAsNumber('AI_MAX_TOKENS', 1000),

  // Security
  BCRYPT_ROUNDS: getEnvVarAsNumber('BCRYPT_ROUNDS', 12),
  RATE_LIMIT_WINDOW_MS: getEnvVarAsNumber('RATE_LIMIT_WINDOW_MS', 900000),
  RATE_LIMIT_MAX_REQUESTS: getEnvVarAsNumber('RATE_LIMIT_MAX_REQUESTS', 100),

  // CORS
  CORS_ORIGIN: getEnvVar('CORS_ORIGIN', 'http://localhost:3000'),
  CORS_CREDENTIALS: getEnvVarAsBoolean('CORS_CREDENTIALS', true),

  // File Upload
  MAX_FILE_SIZE: getEnvVarAsNumber('MAX_FILE_SIZE', 5242880), // 5MB
  UPLOAD_PATH: getEnvVar('UPLOAD_PATH', 'uploads/'),

  // Logging
  LOG_LEVEL: getEnvVar('LOG_LEVEL', 'info'),
  LOG_FILE: getEnvVar('LOG_FILE', 'logs/app.log'),

  // Session
  SESSION_SECRET: getEnvVar('SESSION_SECRET'),

  // Application
  APP_NAME: getEnvVar('APP_NAME', 'QuestForge'),
  APP_VERSION: getEnvVar('APP_VERSION', '1.0.0'),
  APP_URL: getEnvVar('APP_URL', 'http://localhost:3000'),
};

export const isDevelopment = (): boolean => config.NODE_ENV === 'development';
export const isProduction = (): boolean => config.NODE_ENV === 'production';
export const isTest = (): boolean => config.NODE_ENV === 'test';

export default config;