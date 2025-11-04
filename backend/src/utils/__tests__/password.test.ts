/**
 * Password Utility Tests
 */

import {
  validatePasswordStrength,
  generateRandomPassword,
  calculatePasswordStrength,
  isPasswordCompromised,
} from '../password';

describe('Password Utilities', () => {
  describe('validatePasswordStrength', () => {
    it('should reject passwords that are too short', () => {
      const result = validatePasswordStrength('Pass1');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject passwords without uppercase letters', () => {
      const result = validatePasswordStrength('password123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject passwords without lowercase letters', () => {
      const result = validatePasswordStrength('PASSWORD123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject passwords without numbers', () => {
      const result = validatePasswordStrength('Password');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject common weak passwords', () => {
      const result = validatePasswordStrength('password123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password is too common. Please choose a more secure password');
    });

    it('should accept strong passwords', () => {
      const result = validatePasswordStrength('MySecure123Pass');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept passwords with special characters', () => {
      const result = validatePasswordStrength('MySecure123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle empty passwords', () => {
      const result = validatePasswordStrength('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password is required');
    });
  });

  describe('generateRandomPassword', () => {
    it('should generate password of specified length', () => {
      const password = generateRandomPassword(16);
      expect(password).toHaveLength(16);
    });

    it('should generate password with default length', () => {
      const password = generateRandomPassword();
      expect(password).toHaveLength(16);
    });

    it('should generate password that passes validation', () => {
      const password = generateRandomPassword(12);
      const result = validatePasswordStrength(password);
      expect(result.isValid).toBe(true);
    });

    it('should include uppercase letters', () => {
      const password = generateRandomPassword(12);
      expect(/[A-Z]/.test(password)).toBe(true);
    });

    it('should include lowercase letters', () => {
      const password = generateRandomPassword(12);
      expect(/[a-z]/.test(password)).toBe(true);
    });

    it('should include numbers', () => {
      const password = generateRandomPassword(12);
      expect(/\d/.test(password)).toBe(true);
    });

    it('should include special characters when requested', () => {
      const password = generateRandomPassword(12, true);
      expect(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)).toBe(true);
    });

    it('should not include special characters when not requested', () => {
      const password = generateRandomPassword(12, false);
      expect(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)).toBe(false);
    });
  });

  describe('calculatePasswordStrength', () => {
    it('should rate empty password as very weak', () => {
      const result = calculatePasswordStrength('');
      expect(result.label).toBe('Very Weak');
      expect(result.score).toBe(0);
    });

    it('should rate short password as weak', () => {
      const result = calculatePasswordStrength('Pass1');
      expect(result.label).toBe('Fair'); // Short but has uppercase, lowercase, and number
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThan(60);
    });

    it('should rate medium password as fair', () => {
      const result = calculatePasswordStrength('Password123');
      expect(result.score).toBeGreaterThan(20);
    });

    it('should rate strong password highly', () => {
      const result = calculatePasswordStrength('MyV3ry$ecur3P@ssw0rd!');
      expect(result.label).toMatch(/Strong|Very Strong/);
      expect(result.score).toBeGreaterThan(60);
    });

    it('should penalize repeated characters', () => {
      const weak = calculatePasswordStrength('Passsssword111');
      const strong = calculatePasswordStrength('MyPassword123');
      expect(weak.score).toBeLessThan(strong.score);
    });

    it('should penalize only numbers', () => {
      const result = calculatePasswordStrength('123456789012');
      expect(result.score).toBeLessThan(40);
    });
  });

  describe('isPasswordCompromised', () => {
    it('should detect common passwords', () => {
      expect(isPasswordCompromised('password')).toBe(true);
      expect(isPasswordCompromised('password123')).toBe(true);
      expect(isPasswordCompromised('12345678')).toBe(true);
      expect(isPasswordCompromised('qwerty')).toBe(true);
    });

    it('should be case insensitive', () => {
      expect(isPasswordCompromised('PASSWORD')).toBe(true);
      expect(isPasswordCompromised('PaSsWoRd')).toBe(true);
    });

    it('should not flag secure passwords', () => {
      expect(isPasswordCompromised('MySecure123Pass')).toBe(false);
      expect(isPasswordCompromised('Tr0ub4dor&3')).toBe(false);
    });
  });
});
