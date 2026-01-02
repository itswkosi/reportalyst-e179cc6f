import { z } from 'zod';

// Strong password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be less than 72 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .max(255, 'Email must be less than 255 characters');

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const result = passwordSchema.safeParse(password);
  
  if (result.success) {
    return { isValid: true, errors: [] };
  }
  
  return {
    isValid: false,
    errors: result.error.errors.map(e => e.message)
  };
}

export function validateEmail(email: string): PasswordValidationResult {
  const result = emailSchema.safeParse(email);
  
  if (result.success) {
    return { isValid: true, errors: [] };
  }
  
  return {
    isValid: false,
    errors: result.error.errors.map(e => e.message)
  };
}

// Helper to get user-friendly error message from Supabase auth errors
export function getAuthErrorMessage(error: { message: string; code?: string }): string {
  const message = error.message.toLowerCase();
  
  // Leaked password detection (when enabled in Supabase)
  if (message.includes('password') && (message.includes('leaked') || message.includes('breach') || message.includes('compromised'))) {
    return 'This password has been found in a data breach. Please choose a different, more secure password.';
  }
  
  // Weak password
  if (message.includes('password') && message.includes('weak')) {
    return 'Password is too weak. Please use a stronger password with a mix of letters, numbers, and symbols.';
  }
  
  // User already exists
  if (message.includes('user already registered') || message.includes('already exists')) {
    return 'An account with this email already exists. Please sign in instead.';
  }
  
  // Invalid credentials
  if (message.includes('invalid login credentials') || message.includes('invalid email or password')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  
  // Email not confirmed
  if (message.includes('email not confirmed')) {
    return 'Please confirm your email address before signing in.';
  }
  
  // Rate limiting
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Too many attempts. Please wait a moment before trying again.';
  }
  
  // Generic fallback
  return error.message;
}
