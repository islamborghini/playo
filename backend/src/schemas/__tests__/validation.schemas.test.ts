/**
 * Validation Schemas Tests
 * 
 * Unit tests for all Zod validation schemas
 */

import {
  passwordSchema,
  emailSchema,
  usernameSchema,
  registerSchema,
  loginSchema,
  changePasswordSchema,
  taskDifficultySchema,
  createTaskSchema,
  updateTaskSchema,
  storyPreferencesSchema,
  generateStorySchema,
  grantItemSchema,
} from '../validation.schemas';

describe('Password Schema', () => {
  it('should accept valid strong passwords', () => {
    expect(() => passwordSchema.parse('SecurePass123')).not.toThrow();
    expect(() => passwordSchema.parse('MyP@ssw0rd')).not.toThrow();
    expect(() => passwordSchema.parse('Test1234')).not.toThrow();
  });

  it('should reject passwords that are too short', () => {
    expect(() => passwordSchema.parse('Short1')).toThrow();
  });

  it('should reject passwords without uppercase letters', () => {
    expect(() => passwordSchema.parse('password123')).toThrow();
  });

  it('should reject passwords without lowercase letters', () => {
    expect(() => passwordSchema.parse('PASSWORD123')).toThrow();
  });

  it('should reject passwords without numbers', () => {
    expect(() => passwordSchema.parse('Password')).toThrow();
  });

  it('should reject common passwords', () => {
    // These will fail the common password check (case-insensitive)
    expect(() => passwordSchema.parse('password123')).toThrow(); 
    expect(() => passwordSchema.parse('qwerty')).toThrow();
  });
});

describe('Email Schema', () => {
  it('should accept valid email addresses', () => {
    expect(() => emailSchema.parse('test@example.com')).not.toThrow();
    expect(() => emailSchema.parse('user.name+tag@domain.co.uk')).not.toThrow();
  });

  it('should reject invalid email formats', () => {
    expect(() => emailSchema.parse('notanemail')).toThrow();
    expect(() => emailSchema.parse('@nodomain.com')).toThrow();
  });

  it('should convert email to lowercase', () => {
    const result = emailSchema.parse('TEST@EXAMPLE.COM');
    expect(result).toBe('test@example.com');
  });

  it('should trim whitespace', () => {
    const result = emailSchema.parse('  test@example.com  ');
    expect(result).toBe('test@example.com');
  });

  it('should reject emails that are too short', () => {
    expect(() => emailSchema.parse('a@b')).toThrow();
  });
});

describe('Username Schema', () => {
  it('should accept valid usernames', () => {
    expect(() => usernameSchema.parse('user123')).not.toThrow();
    expect(() => usernameSchema.parse('test_user')).not.toThrow();
    expect(() => usernameSchema.parse('user-name')).not.toThrow();
  });

  it('should reject usernames that are too short', () => {
    expect(() => usernameSchema.parse('ab')).toThrow();
  });

  it('should reject usernames that are too long', () => {
    expect(() => usernameSchema.parse('a'.repeat(21))).toThrow();
  });

  it('should reject usernames with invalid characters', () => {
    expect(() => usernameSchema.parse('user@name')).toThrow();
    expect(() => usernameSchema.parse('user name')).toThrow();
    expect(() => usernameSchema.parse('user#123')).toThrow();
  });

  it('should trim whitespace', () => {
    const result = usernameSchema.parse('  username  ');
    expect(result).toBe('username');
  });
});

describe('Register Schema', () => {
  it('should accept valid registration data', () => {
    const validData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'SecurePass123',
    };
    expect(() => registerSchema.parse(validData)).not.toThrow();
  });

  it('should reject missing required fields', () => {
    expect(() => registerSchema.parse({ email: 'test@example.com' })).toThrow();
    expect(() => registerSchema.parse({ username: 'testuser' })).toThrow();
    expect(() => registerSchema.parse({ password: 'SecurePass123' })).toThrow();
  });

  it('should validate all fields together', () => {
    const invalidData = {
      email: 'notanemail',
      username: 'ab',
      password: 'weak',
    };
    expect(() => registerSchema.parse(invalidData)).toThrow();
  });
});

describe('Login Schema', () => {
  it('should accept valid login data', () => {
    const validData = {
      email: 'test@example.com',
      password: 'anypassword',
    };
    expect(() => loginSchema.parse(validData)).not.toThrow();
  });

  it('should reject invalid email', () => {
    const invalidData = {
      email: 'notanemail',
      password: 'anypassword',
    };
    expect(() => loginSchema.parse(invalidData)).toThrow();
  });

  it('should reject empty password', () => {
    const invalidData = {
      email: 'test@example.com',
      password: '',
    };
    expect(() => loginSchema.parse(invalidData)).toThrow();
  });
});

describe('Change Password Schema', () => {
  it('should accept valid password change data', () => {
    const validData = {
      currentPassword: 'OldPass123',
      newPassword: 'NewPass456',
    };
    expect(() => changePasswordSchema.parse(validData)).not.toThrow();
  });

  it('should validate new password strength', () => {
    const invalidData = {
      currentPassword: 'OldPass123',
      newPassword: 'weak',
    };
    expect(() => changePasswordSchema.parse(invalidData)).toThrow();
  });
});

describe('Task Difficulty Schema', () => {
  it('should accept valid difficulty values', () => {
    expect(() => taskDifficultySchema.parse('EASY')).not.toThrow();
    expect(() => taskDifficultySchema.parse('MEDIUM')).not.toThrow();
    expect(() => taskDifficultySchema.parse('HARD')).not.toThrow();
  });

  it('should reject invalid difficulty values', () => {
    expect(() => taskDifficultySchema.parse('INVALID')).toThrow();
    expect(() => taskDifficultySchema.parse('easy')).toThrow();
  });
});

describe('Create Task Schema', () => {
  it('should accept valid task data', () => {
    const validData = {
      title: 'Complete project',
      description: 'Finish the coding project by end of week',
      difficulty: 'MEDIUM',
      category: 'Work',
    };
    expect(() => createTaskSchema.parse(validData)).not.toThrow();
  });

  it('should accept task without optional fields', () => {
    const validData = {
      title: 'Simple task',
      difficulty: 'EASY',
    };
    expect(() => createTaskSchema.parse(validData)).not.toThrow();
  });

  it('should reject title that is too short', () => {
    const invalidData = {
      title: 'ab',
      difficulty: 'EASY',
    };
    expect(() => createTaskSchema.parse(invalidData)).toThrow();
  });

  it('should reject title that is too long', () => {
    const invalidData = {
      title: 'a'.repeat(101),
      difficulty: 'EASY',
    };
    expect(() => createTaskSchema.parse(invalidData)).toThrow();
  });

  it('should reject description that is too short', () => {
    const invalidData = {
      title: 'Valid title',
      description: 'short',
      difficulty: 'EASY',
    };
    expect(() => createTaskSchema.parse(invalidData)).toThrow();
  });

  it('should trim title and description', () => {
    const data = {
      title: '  Task title  ',
      description: '  Task description here  ',
      difficulty: 'EASY',
    };
    const result = createTaskSchema.parse(data);
    expect(result.title).toBe('Task title');
    expect(result.description).toBe('Task description here');
  });
});

describe('Update Task Schema', () => {
  it('should accept partial updates', () => {
    expect(() => updateTaskSchema.parse({ title: 'New title' })).not.toThrow();
    expect(() => updateTaskSchema.parse({ difficulty: 'HARD' })).not.toThrow();
    expect(() => updateTaskSchema.parse({ completed: true })).not.toThrow();
  });

  it('should reject empty update object', () => {
    expect(() => updateTaskSchema.parse({})).toThrow();
  });

  it('should validate fields when provided', () => {
    expect(() => updateTaskSchema.parse({ title: 'ab' })).toThrow();
  });
});

describe('Story Preferences Schema', () => {
  it('should accept valid preferences', () => {
    const validData = {
      genre: 'Fantasy',
      tone: 'Epic',
      themes: ['Adventure', 'Magic'],
      characterName: 'Hero',
      setting: 'Medieval kingdom',
    };
    expect(() => storyPreferencesSchema.parse(validData)).not.toThrow();
  });

  it('should accept empty preferences', () => {
    expect(() => storyPreferencesSchema.parse({})).not.toThrow();
  });

  it('should reject too many themes', () => {
    const invalidData = {
      themes: ['Theme1', 'Theme2', 'Theme3', 'Theme4', 'Theme5', 'Theme6'],
    };
    expect(() => storyPreferencesSchema.parse(invalidData)).toThrow();
  });
});

describe('Generate Story Schema', () => {
  it('should accept valid story generation request', () => {
    const validData = {
      taskId: '123e4567-e89b-12d3-a456-426614174000',
      preferences: {
        genre: 'Fantasy',
        tone: 'Epic',
      },
      context: 'User completed a difficult task',
    };
    expect(() => generateStorySchema.parse(validData)).not.toThrow();
  });

  it('should accept minimal data', () => {
    expect(() => generateStorySchema.parse({})).not.toThrow();
  });

  it('should reject invalid UUID', () => {
    const invalidData = {
      taskId: 'not-a-uuid',
    };
    expect(() => generateStorySchema.parse(invalidData)).toThrow();
  });
});

describe('Grant Item Schema', () => {
  it('should accept valid item grant request', () => {
    const validData = {
      itemId: 'weapon_001',
      quantity: 5,
      reason: 'Quest reward',
    };
    expect(() => grantItemSchema.parse(validData)).not.toThrow();
  });

  it('should use default quantity of 1', () => {
    const data = {
      itemId: 'weapon_001',
    };
    const result = grantItemSchema.parse(data);
    expect(result.quantity).toBe(1);
  });

  it('should reject invalid item ID format', () => {
    const invalidData = {
      itemId: 'WEAPON_001', // uppercase not allowed
      quantity: 1,
    };
    expect(() => grantItemSchema.parse(invalidData)).toThrow();
  });

  it('should reject quantity out of range', () => {
    expect(() => grantItemSchema.parse({ itemId: 'weapon_001', quantity: 0 })).toThrow();
    expect(() => grantItemSchema.parse({ itemId: 'weapon_001', quantity: 1000 })).toThrow();
  });

  it('should reject non-integer quantity', () => {
    const invalidData = {
      itemId: 'weapon_001',
      quantity: 1.5,
    };
    expect(() => grantItemSchema.parse(invalidData)).toThrow();
  });
});
