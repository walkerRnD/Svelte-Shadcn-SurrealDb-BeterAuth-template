import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

// Strong password validation
const strongPasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');

export const createAccountSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: strongPasswordSchema,
  confirmPassword: z.string(),
  agree: z
    .boolean()
    .refine((v) => v === true, {
      message: 'You must accept the Privacy Policy and Terms of Service',
    }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
export type CreateAccountData = z.infer<typeof createAccountSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().email()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: strongPasswordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const deleteAccountSchema = z.object({
  confirm: z.literal(true)
});

