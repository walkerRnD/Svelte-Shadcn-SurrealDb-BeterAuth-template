import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/infra/db';
import { PromptManagementService } from '$lib/domain/admin/services/PromptManagementService';
import { transformPromptToUI } from '$lib/domain/admin/types/prompt';
import { z } from 'zod';

const promptService = new PromptManagementService(getDb);

const querySchema = z.object({
  type: z.enum(['analysis', 'generation']),
});

// 📌 GET /api/prompts/active?type=analysis - Get active prompts for user selection
export const GET: RequestHandler = async ({ url }) => {
  try {
    const type = url.searchParams.get('type');
    
    if (!type) {
      return json({ error: 'Type parameter is required (analysis or generation)' }, { status: 400 });
    }
    
    const validated = querySchema.parse({ type });
    
    const prompts = await promptService.getActivePrompts(validated.type);
    const uiPrompts = prompts.map(transformPromptToUI);
    
    return json({ prompts: uiPrompts });
  } catch (e: any) {
    console.error('GET /api/prompts/active error:', e);
    return json({ error: e?.message || 'Failed to get active prompts' }, { status: 400 });
  }
};

