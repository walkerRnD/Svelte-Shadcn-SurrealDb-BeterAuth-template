import type { Surreal } from 'surrealdb';
import { StringRecordId } from 'surrealdb';
import type { PromptPublic, PromptAnalytics } from '../types/prompt';
import type { CreatePromptInput, UpdatePromptInput } from '../schema/prompt';

export class PromptManagementService {
  constructor(private readonly getDb: () => Promise<Surreal>) {}

  // 📌 List all prompts (optionally filtered by type)
  async listPrompts(type?: 'analysis' | 'generation'): Promise<PromptPublic[]> {
    const db = await this.getDb();

    const [prompts] = await db.query<[Array<PromptPublic>]>(
      /* surql */ `
        SELECT id, name, description, type, prompt_text, is_active, is_default, tags, created_at, updated_at, created_by
        FROM ai_prompt
        WHERE $type = NONE OR type = $type
        ORDER BY is_default DESC, is_active DESC, created_at DESC
      `,
      { type }
    );

    return prompts || [];
  }

  // 📌 Get a single prompt by ID
  async getPrompt(promptId: StringRecordId): Promise<PromptPublic | null> {
    const db = await this.getDb();

    const [prompts] = await db.query<[Array<PromptPublic>]>(
      /* surql */ `
        SELECT id, name, description, type, prompt_text, is_active, is_default, tags, created_at, updated_at, created_by
        FROM ai_prompt
        WHERE id = $promptId
        LIMIT 1
      `,
      { promptId }
    );

    return prompts?.[0] || null;
  }

  // 📌 Create a new prompt
  async createPrompt(createdBy: StringRecordId, data: CreatePromptInput): Promise<PromptPublic> {
    const db = await this.getDb();

    const [created] = await db.query<[Array<PromptPublic>]>(
      /* surql */ `
        CREATE ai_prompt CONTENT {
          name: $name,
          description: $description,
          type: $type,
          prompt_text: $prompt_text,
          is_active: false,
          is_default: false,
          tags: $tags,
          created_by: $createdBy,
          created_at: time::now(),
          updated_at: time::now()
        }
      `,
      {
        name: data.name,
        description: data.description,
        type: data.type,
        prompt_text: data.prompt_text,
        tags: data.tags || [],
        createdBy,
      }
    );

    if (!created || created.length === 0) {
      throw new Error('Failed to create prompt');
    }

    return created[0];
  }

  // 📌 Update an existing prompt
  async updatePrompt(promptId: StringRecordId, data: Partial<UpdatePromptInput>): Promise<PromptPublic> {
    const db = await this.getDb();

    // Build update fields dynamically
    const updateFields: string[] = [];
    const params: Record<string, any> = { promptId };

    if (data.name !== undefined) {
      updateFields.push('name = $name');
      params.name = data.name;
    }
    if (data.description !== undefined) {
      updateFields.push('description = $description');
      params.description = data.description;
    }
    if (data.prompt_text !== undefined) {
      updateFields.push('prompt_text = $prompt_text');
      params.prompt_text = data.prompt_text;
    }
    if (data.tags !== undefined) {
      updateFields.push('tags = $tags');
      params.tags = data.tags;
    }

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    updateFields.push('updated_at = time::now()');

    const [updated] = await db.query<[Array<PromptPublic>]>(
      /* surql */ `
        UPDATE $promptId SET ${updateFields.join(', ')} RETURN AFTER
      `,
      params
    );

    if (!updated || updated.length === 0) {
      throw new Error('Failed to update prompt');
    }

    return updated[0];
  }

  // 📌 Delete a prompt
  async deletePrompt(promptId: StringRecordId): Promise<void> {
    const db = await this.getDb();

    await db.query(
      /* surql */ `DELETE $promptId`,
      { promptId }
    );
  }

  // 📌 Toggle active/inactive status (multiple prompts can be active)
  async togglePromptActive(promptId: StringRecordId, isActive: boolean): Promise<PromptPublic> {
    const db = await this.getDb();

    const [updated] = await db.query<[Array<PromptPublic>]>(
      /* surql */ `
        UPDATE $promptId SET is_active = $isActive, updated_at = time::now() RETURN AFTER
      `,
      { promptId, isActive }
    );

    if (!updated || updated.length === 0) {
      throw new Error('Failed to toggle prompt active status');
    }

    return updated[0];
  }

  // 📌 Set as default prompt (only one default per type)
  async setDefaultPrompt(promptId: StringRecordId, type: 'analysis' | 'generation'): Promise<PromptPublic> {
    const db = await this.getDb();

    // Remove default flag from all prompts of this type
    await db.query(
      /* surql */ `UPDATE ai_prompt SET is_default = false WHERE type = $type`,
      { type }
    );

    // Set the selected prompt as default (and ensure it's active)
    const [updated] = await db.query<[Array<PromptPublic>]>(
      /* surql */ `
        UPDATE $promptId SET is_default = true, is_active = true, updated_at = time::now() RETURN AFTER
      `,
      { promptId }
    );

    if (!updated || updated.length === 0) {
      throw new Error('Failed to set default prompt');
    }

    return updated[0];
  }

  // 📌 Get active prompts for user selection
  async getActivePrompts(type: 'analysis' | 'generation'): Promise<PromptPublic[]> {
    const db = await this.getDb();

    const [prompts] = await db.query<[Array<PromptPublic>]>(
      /* surql */ `
        SELECT id, name, description, type, prompt_text, is_active, is_default, tags, created_at, updated_at
        FROM ai_prompt
        WHERE type = $type AND is_active = true
        ORDER BY is_default DESC, name ASC
      `,
      { type }
    );

    return prompts || [];
  }

  // 📌 Get default prompt for a type
  async getDefaultPrompt(type: 'analysis' | 'generation'): Promise<PromptPublic | null> {
    const db = await this.getDb();

    const [prompts] = await db.query<[Array<PromptPublic>]>(
      /* surql */ `
        SELECT id, name, description, type, prompt_text, is_active, is_default, tags, created_at, updated_at
        FROM ai_prompt
        WHERE type = $type AND is_default = true
        LIMIT 1
      `,
      { type }
    );

    return prompts?.[0] || null;
  }

  // 📌 Get prompt analytics
  async getPromptAnalytics(promptId: StringRecordId): Promise<PromptAnalytics> {
    const db = await this.getDb();

    const [analytics] = await db.query<[PromptAnalytics[]]>(
      /* surql */ `
        SELECT
          $promptId as prompt_id,
          count() as total_uses,
          math::sum(success) / count() as success_rate,
          math::mean(processing_time) as avg_processing_time,
          math::sum(feedback = 'positive') as positive_feedback,
          math::sum(feedback = 'negative') as negative_feedback,
          math::sum(feedback = 'positive') / math::sum(feedback = 'negative') as feedback_ratio,
          count(created_at > time::now() - 30d) as last_30_days_uses
        FROM prompt_usage
        WHERE prompt_id = $promptId
        GROUP ALL
      `,
      { promptId }
    );

    // Return default analytics if no data found
    if (!analytics || analytics.length === 0) {
      return {
        prompt_id: promptId,
        total_uses: 0,
        success_rate: 0,
        avg_processing_time: 0,
        positive_feedback: 0,
        negative_feedback: 0,
        feedback_ratio: 0,
        last_30_days_uses: 0,
      };
    }

    return analytics[0];
  }
}

