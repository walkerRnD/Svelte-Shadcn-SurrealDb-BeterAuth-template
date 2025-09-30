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

// 📌 GET /api/prompts/default?type=analysis - Get default prompt
export const GET: RequestHandler = async ({ url }) => {
  try {
    const type = url.searchParams.get('type');
    
    if (!type) {
      return json({ error: 'Type parameter is required (analysis or generation)' }, { status: 400 });
    }
    
    const validated = querySchema.parse({ type });
    
    const prompt = await promptService.getDefaultPrompt(validated.type);
    
    if (!prompt) {
      return json({ prompt: null });
    }
    
    const uiPrompt = transformPromptToUI(prompt);
    
    return json({ prompt: uiPrompt });
  } catch (e: any) {
    console.error('GET /api/prompts/default error:', e);
    return json({ error: e?.message || 'Failed to get default prompt' }, { status: 400 });
  }
};

