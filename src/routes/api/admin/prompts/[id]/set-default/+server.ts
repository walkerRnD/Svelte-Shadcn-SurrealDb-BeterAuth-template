import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/infra/db';
import { getAuthUser } from '$lib/server/auth-helpers';
import { PromptManagementService } from '$lib/domain/admin/services/PromptManagementService';
import { setDefaultPromptSchema } from '$lib/domain/admin/schema/prompt';
import { StringRecordId } from 'surrealdb';
import { transformPromptToUI } from '$lib/domain/admin/types/prompt';

const promptService = new PromptManagementService(getDb);

// 📌 POST /api/admin/prompts/[id]/set-default - Set as default prompt
export const POST: RequestHandler = async ({ params, request, locals }) => {
  try {
    const user = getAuthUser(locals);
    
    // 🔒 TODO: Add admin role check here
    
    const body = await request.json();
    const validated = setDefaultPromptSchema.parse({ ...body, id: params.id });
    
    const promptId = new StringRecordId(params.id);
    const prompt = await promptService.setDefaultPrompt(promptId, validated.type);
    const uiPrompt = transformPromptToUI(prompt);
    
    return json({ prompt: uiPrompt });
  } catch (e: any) {
    console.error('POST /api/admin/prompts/[id]/set-default error:', e);
    return json({ error: e?.message || 'Failed to set default prompt' }, { status: 400 });
  }
};

