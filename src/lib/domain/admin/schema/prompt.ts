import { z } from 'zod';

// 📌 Schema for creating a new prompt
export const createPromptSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name must be at most 100 characters'),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  type: z.enum(['analysis', 'generation'], {
    errorMap: () => ({ message: 'Type must be either "analysis" or "generation"' })
  }),
  prompt_text: z.string().min(10, 'Prompt text must be at least 10 characters'),
  tags: z.array(z.string()).optional(),
});

// 📌 Schema for updating a prompt
export const updatePromptSchema = createPromptSchema.partial().extend({
  id: z.string().min(1, 'ID is required'),
  is_active: z.boolean().optional(),
  is_default: z.boolean().optional(),
});

// 📌 Schema for toggling active status
export const togglePromptActiveSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  is_active: z.boolean(),
});

// 📌 Schema for setting default prompt
export const setDefaultPromptSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  type: z.enum(['analysis', 'generation']),
});

// 📌 Schema for getting prompts by type
export const getPromptsByTypeSchema = z.object({
  type: z.enum(['analysis', 'generation']).optional(),
});

// 📌 Schema for prompt ID parameter
export const promptIdSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

// 📌 Export types inferred from schemas
export type CreatePromptInput = z.infer<typeof createPromptSchema>;
export type UpdatePromptInput = z.infer<typeof updatePromptSchema>;
export type TogglePromptActiveInput = z.infer<typeof togglePromptActiveSchema>;
export type SetDefaultPromptInput = z.infer<typeof setDefaultPromptSchema>;
export type GetPromptsByTypeInput = z.infer<typeof getPromptsByTypeSchema>;
export type PromptIdInput = z.infer<typeof promptIdSchema>;

