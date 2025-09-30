import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/infra/db';
import { getAuthUser } from '$lib/server/auth-helpers';
import { PromptManagementService } from '$lib/domain/admin/services/PromptManagementService';
import { updatePromptSchema } from '$lib/domain/admin/schema/prompt';
import { StringRecordId } from 'surrealdb';
import { transformPromptToUI } from '$lib/domain/admin/types/prompt';

const promptService = new PromptManagementService(getDb);

// 📌 GET /api/admin/prompts/[id] - Get a single prompt
export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    const user = getAuthUser(locals);
    
    // 🔒 TODO: Add admin role check here
    
    const promptId = new StringRecordId(params.id);
    const prompt = await promptService.getPrompt(promptId);
    
    if (!prompt) {
      return json({ error: 'Prompt not found' }, { status: 404 });
    }
    
    const uiPrompt = transformPromptToUI(prompt);
    return json({ prompt: uiPrompt });
  } catch (e: any) {
    console.error('GET /api/admin/prompts/[id] error:', e);
    return json({ error: e?.message || 'Failed to get prompt' }, { status: 400 });
  }
};

// 📌 PUT /api/admin/prompts/[id] - Update a prompt
export const PUT: RequestHandler = async ({ params, request, locals }) => {
  try {
    const user = getAuthUser(locals);
    
    // 🔒 TODO: Add admin role check here
    
    const body = await request.json();
    const validated = updatePromptSchema.parse({ ...body, id: params.id });
    
    const promptId = new StringRecordId(params.id);
    const prompt = await promptService.updatePrompt(promptId, validated);
    const uiPrompt = transformPromptToUI(prompt);
    
    return json({ prompt: uiPrompt });
  } catch (e: any) {
    console.error('PUT /api/admin/prompts/[id] error:', e);
    return json({ error: e?.message || 'Failed to update prompt' }, { status: 400 });
  }
};

// 📌 DELETE /api/admin/prompts/[id] - Delete a prompt
export const DELETE: RequestHandler = async ({ params, locals }) => {
  try {
    const user = getAuthUser(locals);
    
    // 🔒 TODO: Add admin role check here
    
    const promptId = new StringRecordId(params.id);
    await promptService.deletePrompt(promptId);
    
    return json({ success: true });
  } catch (e: any) {
    console.error('DELETE /api/admin/prompts/[id] error:', e);
    return json({ error: e?.message || 'Failed to delete prompt' }, { status: 400 });
  }
};

