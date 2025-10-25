/**
 * Password Utility Usage Examples
 * 
 * This file demonstrates how to use the password utilities.
 * Copy these examples into your code as needed.
 */

import {
  validatePasswordStrength,
  hashPassword,
  comparePassword,
  generateRandomPassword,
  calculatePasswordStrength,
  isPasswordCompromised,
} from './password';

// ============================================================================
// Example 1: Validate Password During Registration
// ============================================================================

async function registerUserExample(email: string, password: string, username: string) {
  // Validate password strength
  const validation = validatePasswordStrength(password);
  
  if (!validation.isValid) {
    throw new Error(`Password validation failed: ${validation.errors.join(', ')}`);
  }
  
  // Hash the password
  const hashedPassword = await hashPassword(password);
  
  // Save user to database with hashedPassword
  console.log('User registered successfully');
  return { email, username, hashedPassword };
}

// ============================================================================
// Example 2: Validate Password During Login
// ============================================================================

async function loginUserExample(email: string, password: string) {
  // Fetch user from database (mock)
  const userFromDb = {
    email: email, // Use the provided email
    hashedPassword: '$2b$12$KIXxKj8...',
  };
  
  // Compare provided password with stored hash
  const isValid = await comparePassword(password, userFromDb.hashedPassword);
  
  if (!isValid) {
    throw new Error('Invalid credentials');
  }
  
  console.log('Login successful');
  return { email: userFromDb.email };
}

// ============================================================================
// Example 3: Generate Temporary Password for User
// ============================================================================

function generateTemporaryPasswordExample() {
  // Generate a secure random password
  const tempPassword = generateRandomPassword(12, true);
  
  console.log('Temporary password:', tempPassword);
  console.log('Send this to user via email (securely)');
  
  return tempPassword;
}

// ============================================================================
// Example 4: Password Strength Indicator for UI
// ============================================================================

function getPasswordStrengthForUIExample(password: string) {
  const strength = calculatePasswordStrength(password);
  
  // Return data for frontend to display
  return {
    score: strength.score,
    label: strength.label,
    color: getColorForStrength(strength.label),
    percentage: strength.score,
  };
}

function getColorForStrength(label: string): string {
  switch (label) {
    case 'Very Weak': return '#ff0000'; // Red
    case 'Weak': return '#ff6600'; // Orange
    case 'Fair': return '#ffcc00'; // Yellow
    case 'Strong': return '#66cc00'; // Light Green
    case 'Very Strong': return '#00cc00'; // Green
    default: return '#cccccc'; // Gray
  }
}

// ============================================================================
// Example 5: Check Password Before Allowing Change
// ============================================================================

async function changePasswordExample(userId: string, currentPassword: string, newPassword: string) {
  // Fetch user from database (mock)
  const user = {
    id: userId,
    hashedPassword: '$2b$12$KIXxKj8...',
  };
  
  // Verify current password
  const isCurrentValid = await comparePassword(currentPassword, user.hashedPassword);
  if (!isCurrentValid) {
    throw new Error('Current password is incorrect');
  }
  
  // Validate new password strength
  const validation = validatePasswordStrength(newPassword);
  if (!validation.isValid) {
    throw new Error(`New password is weak: ${validation.errors.join(', ')}`);
  }
  
  // Check if new password is compromised
  if (isPasswordCompromised(newPassword)) {
    throw new Error('This password is too common. Please choose a different one.');
  }
  
  // Hash and save new password
  const newHashedPassword = await hashPassword(newPassword);
  console.log('Password changed successfully');
  
  // Update user in database with newHashedPassword
  return { success: true, hashedPassword: newHashedPassword };
}

// ============================================================================
// Example 6: Custom Password Requirements
// ============================================================================

function validateWithCustomRequirementsExample(password: string) {
  const customRequirements = {
    minLength: 12, // Longer minimum
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true, // Require special characters
  };
  
  const validation = validatePasswordStrength(password, customRequirements);
  
  if (!validation.isValid) {
    console.log('Password does not meet custom requirements:');
    validation.errors.forEach(error => console.log(`- ${error}`));
  }
  
  return validation;
}

// ============================================================================
// Example 7: Real-time Password Validation for Forms
// ============================================================================

function validatePasswordRealTimeExample(password: string) {
  const validation = validatePasswordStrength(password);
  const strength = calculatePasswordStrength(password);
  const compromised = isPasswordCompromised(password);
  
  return {
    isValid: validation.isValid,
    errors: validation.errors,
    strength: {
      score: strength.score,
      label: strength.label,
    },
    warnings: compromised ? ['This password appears in common password lists'] : [],
  };
}

// ============================================================================
// Example 8: Bulk Password Generation for Testing
// ============================================================================

function generateTestPasswordsExample(count: number = 10) {
  const passwords = [];
  
  for (let i = 0; i < count; i++) {
    const password = generateRandomPassword(12, true);
    const strength = calculatePasswordStrength(password);
    
    passwords.push({
      password,
      strength: strength.label,
      score: strength.score,
    });
  }
  
  return passwords;
}

// ============================================================================
// Example 9: Password Reset Flow
// ============================================================================

async function passwordResetFlowExample(email: string) {
  // Generate secure temporary password
  const tempPassword = generateRandomPassword(16, true);
  
  // Hash it for storage
  const hashedTempPassword = await hashPassword(tempPassword);
  
  // Save to database with expiration time
  console.log('Temporary password generated and saved');
  
  // Send to user via email (implement email service)
  console.log(`Send this password to ${email}: ${tempPassword}`);
  console.log('Expires in 24 hours');
  
  return {
    tempPassword, // Only for email, never log in production
    hashedTempPassword,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
}

// ============================================================================
// Example 10: Admin Password Generation
// ============================================================================

function generateAdminPasswordExample() {
  // Generate extra-strong password for admin accounts
  const adminPassword = generateRandomPassword(20, true);
  
  // Verify it's strong enough
  const strength = calculatePasswordStrength(adminPassword);
  
  if (strength.score < 80) {
    // Regenerate if not strong enough (unlikely but possible)
    return generateAdminPasswordExample();
  }
  
  console.log('Admin password:', adminPassword);
  console.log('Strength:', strength.label, `(${strength.score}/100)`);
  
  return adminPassword;
}

// ============================================================================
// Export examples for testing
// ============================================================================

export {
  registerUserExample,
  loginUserExample,
  generateTemporaryPasswordExample,
  getPasswordStrengthForUIExample,
  changePasswordExample,
  validateWithCustomRequirementsExample,
  validatePasswordRealTimeExample,
  generateTestPasswordsExample,
  passwordResetFlowExample,
  generateAdminPasswordExample,
};
