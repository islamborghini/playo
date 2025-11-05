/**
 * Validation Utility Functions
 */

/**
 * Email validation
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password strength validation
 */
export const isStrongPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Get password strength score (0-4)
 */
export const getPasswordStrength = (password: string): number => {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[@$!%*?&]/.test(password)) strength++;
  
  return Math.min(strength, 4);
};

/**
 * Get password strength label
 */
export const getPasswordStrengthLabel = (strength: number): string => {
  const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  return labels[strength] || 'Weak';
};

/**
 * Username validation (3-20 alphanumeric characters, underscores allowed)
 */
export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

/**
 * Character name validation (2-30 characters, letters and spaces)
 */
export const isValidCharacterName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s]{2,30}$/;
  return nameRegex.test(name);
};

/**
 * Sanitize text input (remove HTML tags)
 */
export const sanitizeText = (text: string): string => {
  return text.replace(/<[^>]*>/g, '');
};

/**
 * Validate task title (1-100 characters)
 */
export const isValidTaskTitle = (title: string): boolean => {
  return title.trim().length >= 1 && title.length <= 100;
};

/**
 * Validate task description (optional, max 500 characters)
 */
export const isValidTaskDescription = (description: string | undefined): boolean => {
  if (!description) return true;
  return description.length <= 500;
};

/**
 * Check if value is empty
 */
export const isEmpty = (value: string | undefined | null): boolean => {
  return !value || value.trim().length === 0;
};

/**
 * Check if string contains only numbers
 */
export const isNumeric = (value: string): boolean => {
  return /^\d+$/.test(value);
};

/**
 * Validate URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
