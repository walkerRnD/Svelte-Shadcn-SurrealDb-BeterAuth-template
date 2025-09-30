import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/infra/db';
import { getAuthUser } from '$lib/server/auth-helpers';
import { PromptManagementService } from '$lib/domain/admin/services/PromptManagementService';
import { createPromptSchema, getPromptsByTypeSchema } from '$lib/domain/admin/schema/prompt';
import { StringRecordId } from 'surrealdb';
import { transformPromptToUI } from '$lib/domain/admin/types/prompt';

const promptService = new PromptManagementService(getDb);

// 📌 GET /api/admin/prompts - List all prompts (with optional type filter)
export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    const user = getAuthUser(locals);
    
    // 🔒 TODO: Add admin role check here
    // For now, any authenticated user can access (will be fixed with proper RBAC)
    
    const type = url.searchParams.get('type');
    const validated = getPromptsByTypeSchema.parse({ type: type || undefined });
    
    const prompts = await promptService.listPrompts(validated.type);
    const uiPrompts = prompts.map(transformPromptToUI);
    
    return json({ prompts: uiPrompts });
  } catch (e: any) {
    console.error('GET /api/admin/prompts error:', e);
    return json({ error: e?.message || 'Failed to list prompts' }, { status: 400 });
  }
};

// 📌 POST /api/admin/prompts - Create a new prompt
export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const user = getAuthUser(locals);
    
    // 🔒 TODO: Add admin role check here
    
    const body = await request.json();
    const validated = createPromptSchema.parse(body);
    
    const createdBy = new StringRecordId(user.id);
    const prompt = await promptService.createPrompt(createdBy, validated);
    const uiPrompt = transformPromptToUI(prompt);
    
    return json({ prompt: uiPrompt }, { status: 201 });
  } catch (e: any) {
    console.error('POST /api/admin/prompts error:', e);
    return json({ error: e?.message || 'Failed to create prompt' }, { status: 400 });
  }
};

