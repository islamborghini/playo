/**
 * Password Utility Functions
 * 
 * Provides password hashing, validation, and generation utilities
 */

import bcrypt from 'bcrypt';

/**
 * Password validation result
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Password strength requirements
 */
export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecialChar: boolean;
}

/**
 * Default password requirements
 */
const DEFAULT_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: false, // Optional for better UX
};

/**
 * Validate password strength
 * 
 * @param password - Password to validate
 * @param requirements - Custom requirements (optional)
 * @returns Validation result with errors if any
 */
export function validatePasswordStrength(
  password: string,
  requirements: PasswordRequirements = DEFAULT_REQUIREMENTS
): PasswordValidationResult {
  const errors: string[] = [];

  if (!password) {
    return {
      isValid: false,
      errors: ['Password is required'],
    };
  }

  // Check minimum length
  if (password.length < requirements.minLength) {
    errors.push(`Password must be at least ${requirements.minLength} characters long`);
  }

  // Check for uppercase letter
  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase letter
  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for number
  if (requirements.requireNumber && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check for special character
  if (requirements.requireSpecialChar && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password', 'password123', '12345678', 'qwerty', 'abc123',
    'letmein', 'welcome', 'monkey', '1234567890', 'password1'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a more secure password');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Hash a password using bcrypt
 * 
 * @param password - Plain text password
 * @param saltRounds - Number of salt rounds (default: 12)
 * @returns Hashed password
 */
export async function hashPassword(password: string, saltRounds: number = 12): Promise<string> {
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare a plain text password with a hashed password
 * 
 * @param password - Plain text password
 * @param hashedPassword - Hashed password to compare against
 * @returns True if passwords match
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a random secure password
 * 
 * @param length - Length of password (default: 16)
 * @param includeSpecialChars - Include special characters (default: true)
 * @returns Random password meeting all requirements
 */
export function generateRandomPassword(length: number = 16, includeSpecialChars: boolean = true): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  let chars = uppercase + lowercase + numbers;
  if (includeSpecialChars) {
    chars += specialChars;
  }

  // Ensure at least one of each required type
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  
  if (includeSpecialChars) {
    password += specialChars[Math.floor(Math.random() * specialChars.length)];
  }

  // Fill remaining length with random characters
  const remainingLength = length - password.length;
  for (let i = 0; i < remainingLength; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  // Shuffle the password to randomize position of required characters
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

/**
 * Calculate password strength score (0-100)
 * 
 * @param password - Password to evaluate
 * @returns Strength score and label
 */
export function calculatePasswordStrength(password: string): {
  score: number;
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
} {
  let score = 0;

  if (!password) {
    return { score: 0, label: 'Very Weak' };
  }

  // Length score (up to 30 points)
  score += Math.min(password.length * 2, 30);

  // Character variety (up to 40 points)
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/\d/.test(password)) score += 10;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 10;

  // Complexity bonus (up to 30 points)
  const uniqueChars = new Set(password.split('')).size;
  score += Math.min(uniqueChars * 2, 20);

  // Penalize common patterns
  if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
  if (/^[0-9]+$/.test(password)) score -= 20; // Only numbers
  if (/^[a-zA-Z]+$/.test(password)) score -= 10; // Only letters
  if (/^(123|abc|qwerty)/i.test(password)) score -= 20; // Common sequences

  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // Determine label
  let label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  if (score < 20) label = 'Very Weak';
  else if (score < 40) label = 'Weak';
  else if (score < 60) label = 'Fair';
  else if (score < 80) label = 'Strong';
  else label = 'Very Strong';

  return { score, label };
}

/**
 * Check if password has been compromised (basic check against common passwords)
 * For production, consider integrating with Have I Been Pwned API
 * 
 * @param password - Password to check
 * @returns True if password appears compromised
 */
export function isPasswordCompromised(password: string): boolean {
  const commonPasswords = [
    'password', 'password123', '12345678', 'qwerty', 'abc123',
    'letmein', 'welcome', 'monkey', '1234567890', 'password1',
    'iloveyou', 'princess', 'admin', 'login', 'passw0rd',
    'sunshine', 'master', 'hello', 'freedom', 'whatever',
    'qazwsx', 'trustno1', 'dragon', 'baseball', 'football',
  ];

  return commonPasswords.includes(password.toLowerCase());
}
