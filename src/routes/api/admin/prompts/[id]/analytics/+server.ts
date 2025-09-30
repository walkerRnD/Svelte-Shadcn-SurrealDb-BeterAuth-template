import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/infra/db';
import { getAuthUser } from '$lib/server/auth-helpers';
import { PromptManagementService } from '$lib/domain/admin/services/PromptManagementService';
import { StringRecordId } from 'surrealdb';
import { transformPromptAnalyticsToUI } from '$lib/domain/admin/types/prompt';

const promptService = new PromptManagementService(getDb);

// 📌 GET /api/admin/prompts/[id]/analytics - Get prompt analytics
export const GET: RequestHandler = async ({ params, locals }) => {
  try {
    const user = getAuthUser(locals);
    
    // 🔒 TODO: Add admin role check here
    
    const promptId = new StringRecordId(params.id);
    const analytics = await promptService.getPromptAnalytics(promptId);
    const uiAnalytics = transformPromptAnalyticsToUI(analytics);
    
    return json({ analytics: uiAnalytics });
  } catch (e: any) {
    console.error('GET /api/admin/prompts/[id]/analytics error:', e);
    return json({ error: e?.message || 'Failed to get prompt analytics' }, { status: 400 });
  }
};

