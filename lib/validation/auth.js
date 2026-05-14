import { z } from 'zod';

/**
 * MD Mandate: Every form MUST use zod schema.
 * Canonical schemas for Registration & OTP flows.
 */

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
  targetYear: z.enum(['2027', '2028', '2029']),
});

export const otpSchema = z.object({
  otp: z.string().min(4, 'Please enter the verification code from your email.').max(8),
});

export const recoverySchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});
