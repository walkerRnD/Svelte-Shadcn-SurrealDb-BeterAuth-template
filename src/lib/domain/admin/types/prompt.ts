import type { RecordId } from 'surrealdb';

// 📌 Database types (RecordId for DB operations)
export interface PromptPublic {
  id: RecordId<'ai_prompt'>;
  name: string;
  description?: string;
  type: 'analysis' | 'generation';
  prompt_text: string;
  is_active: boolean;      // 📌 Disponível para seleção pelos usuários
  is_default: boolean;     // 📌 Prompt padrão inicial (apenas 1 por tipo)
  tags?: string[];
  created_at: Date;
  updated_at: Date;
  created_by: RecordId<'user'>;
}

export interface PromptAnalytics {
  prompt_id: RecordId<'ai_prompt'>;
  total_uses: number;
  success_rate: number;
  avg_processing_time: number;
  positive_feedback: number;
  negative_feedback: number;
  feedback_ratio: number;
  last_30_days_uses: number;
}

// 📌 UI types (string IDs for frontend)
type EntityUITypeDiff = 'id' | 'created_at' | 'updated_at' | 'created_by' | 'prompt_id';

export interface UIPromptPublic extends Omit<PromptPublic, EntityUITypeDiff> {
  id: string;
  name: string;
  description?: string;
  type: 'analysis' | 'generation';
  prompt_text: string;
  is_active: boolean;
  is_default: boolean;
  tags?: string[];
  created_at?: string | number;
  updated_at?: string | number;
  created_by: string;
}

export interface UIPromptAnalytics extends Omit<PromptAnalytics, EntityUITypeDiff> {
  prompt_id: string;
  total_uses: number;
  success_rate: number;
  avg_processing_time: number;
  positive_feedback: number;
  negative_feedback: number;
  feedback_ratio: number;
  last_30_days_uses: number;
}

// 📌 Helper to transform DB types to UI types
export function transformPromptToUI(prompt: PromptPublic): UIPromptPublic {
  return {
    id: String(prompt.id),
    name: prompt.name,
    description: prompt.description,
    type: prompt.type,
    prompt_text: prompt.prompt_text,
    is_active: prompt.is_active,
    is_default: prompt.is_default,
    tags: prompt.tags,
    created_at: prompt.created_at?.getTime(),
    updated_at: prompt.updated_at?.getTime(),
    created_by: String(prompt.created_by),
  };
}

export function transformPromptAnalyticsToUI(analytics: PromptAnalytics): UIPromptAnalytics {
  return {
    prompt_id: String(analytics.prompt_id),
    total_uses: analytics.total_uses,
    success_rate: analytics.success_rate,
    avg_processing_time: analytics.avg_processing_time,
    positive_feedback: analytics.positive_feedback,
    negative_feedback: analytics.negative_feedback,
    feedback_ratio: analytics.feedback_ratio,
    last_30_days_uses: analytics.last_30_days_uses,
  };
}

