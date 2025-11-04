/**
 * Zod Validation Schemas
 */

import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .refine(
    (password) => {
      const commonPasswords = [
        'password', 'password123', '12345678', 'qwerty', 'abc123',
        'letmein', 'welcome', 'monkey', '1234567890', 'password1'
      ];
      return !commonPasswords.includes(password.toLowerCase());
    },
    { message: 'Password is too common. Please choose a more secure password' }
  );

export const emailSchema = z
  .string()
  .trim()
  .email('Please provide a valid email address')
  .min(5, 'Email must be at least 5 characters')
  .max(255, 'Email must not exceed 255 characters')
  .toLowerCase();

export const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must not exceed 20 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens');

export const registerSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

export const taskDifficultySchema = z.enum(['EASY', 'MEDIUM', 'HARD']);

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(3, 'Task title must be at least 3 characters')
    .max(100, 'Task title must not exceed 100 characters')
    .trim(),
  description: z
    .string()
    .min(10, 'Task description must be at least 10 characters')
    .max(500, 'Task description must not exceed 500 characters')
    .trim()
    .optional(),
  difficulty: taskDifficultySchema,
  category: z
    .string()
    .min(2, 'Category must be at least 2 characters')
    .max(50, 'Category must not exceed 50 characters')
    .trim()
    .optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(3).max(100).trim().optional(),
  description: z.string().min(10).max(500).trim().optional(),
  difficulty: taskDifficultySchema.optional(),
  category: z.string().min(2).max(50).trim().optional(),
  completed: z.boolean().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

export const storyPreferencesSchema = z.object({
  genre: z.string().min(2).max(50).optional(),
  tone: z.string().min(2).max(50).optional(),
  themes: z.array(z.string().min(2).max(50)).max(5).optional(),
  characterName: z.string().min(2).max(50).optional(),
  setting: z.string().min(5).max(200).optional(),
});

export const generateStorySchema = z.object({
  taskId: z.string().uuid('Task ID must be a valid UUID').optional(),
  preferences: storyPreferencesSchema.optional(),
  context: z.string().max(1000).optional(),
});

export const grantItemSchema = z.object({
  itemId: z
    .string()
    .min(1, 'Item ID is required')
    .regex(/^[a-z_0-9]+$/, 'Item ID must contain only lowercase letters, numbers, and underscores'),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .max(999, 'Quantity must not exceed 999')
    .default(1),
  reason: z.string().max(200).optional(),
});

export const schemas = {
  register: registerSchema,
  login: loginSchema,
  changePassword: changePasswordSchema,
  createTask: createTaskSchema,
  updateTask: updateTaskSchema,
  storyPreferences: storyPreferencesSchema,
  generateStory: generateStorySchema,
  grantItem: grantItemSchema,
};

export default schemas;
