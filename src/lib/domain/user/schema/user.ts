import { z } from 'zod';

// Schema for updating user settings
export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
});

export type UpdateUserData = z.infer<typeof updateUserSchema>;

// Re-export changePasswordSchema from auth domain for convenience
export { changePasswordSchema } from '$lib/domain/auth/schema/auth';

