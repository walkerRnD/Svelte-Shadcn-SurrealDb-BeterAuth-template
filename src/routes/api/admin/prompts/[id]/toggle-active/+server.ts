import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/infra/db';
import { getAuthUser } from '$lib/server/auth-helpers';
import { PromptManagementService } from '$lib/domain/admin/services/PromptManagementService';
import { togglePromptActiveSchema } from '$lib/domain/admin/schema/prompt';
import { StringRecordId } from 'surrealdb';
import { transformPromptToUI } from '$lib/domain/admin/types/prompt';

const promptService = new PromptManagementService(getDb);

// 📌 PATCH /api/admin/prompts/[id]/toggle-active - Toggle active/inactive status
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  try {
    const user = getAuthUser(locals);
    
    // 🔒 TODO: Add admin role check here
    
    const body = await request.json();
    const validated = togglePromptActiveSchema.parse({ ...body, id: params.id });
    
    const promptId = new StringRecordId(params.id);
    const prompt = await promptService.togglePromptActive(promptId, validated.is_active);
    const uiPrompt = transformPromptToUI(prompt);
    
    return json({ prompt: uiPrompt });
  } catch (e: any) {
    console.error('PATCH /api/admin/prompts/[id]/toggle-active error:', e);
    return json({ error: e?.message || 'Failed to toggle prompt active status' }, { status: 400 });
  }
};

