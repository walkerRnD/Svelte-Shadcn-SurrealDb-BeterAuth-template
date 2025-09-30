import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { Surreal, StringRecordId, type Surreal as SurrealType } from 'surrealdb';
import { PromptManagementService } from './PromptManagementService';

describe('PromptManagementService (Jest, real SurrealDB memory)', () => {
  let db: SurrealType;
  const getDB = async () => db;
  const service = new PromptManagementService(getDB);
  const testUserId = new StringRecordId('user:test-admin-1');

  beforeAll(async () => {
    const { surrealdbNodeEngines } = await import('@surrealdb/node');
    db = new Surreal({ engines: surrealdbNodeEngines() }) as unknown as SurrealType;
    await db.connect('mem://test.db', { namespace: 'test', database: 'test' });
    
    // Create test user
    await db.query(
      /* surql */ `CREATE type::thing('user', 'test-admin-1') SET email = $email, name = $name`,
      {
        email: 'admin@test.com',
        name: 'Test Admin',
      }
    );
  });

  afterAll(async () => {
    await db.close();
  });

  it('should create a new prompt', async () => {
    const prompt = await service.createPrompt(testUserId, {
      name: 'Test Analysis Prompt',
      description: 'A test prompt for analysis',
      type: 'analysis',
      prompt_text: 'Analyze the following content...',
      tags: ['test', 'analysis'],
    });

    expect(prompt).toBeDefined();
    expect(prompt.name).toBe('Test Analysis Prompt');
    expect(prompt.type).toBe('analysis');
    expect(prompt.is_active).toBe(false);
    expect(prompt.is_default).toBe(false);
  });

  it('should list all prompts', async () => {
    const prompts = await service.listPrompts();
    expect(Array.isArray(prompts)).toBe(true);
    expect(prompts.length).toBeGreaterThan(0);
  });

  it('should list prompts by type', async () => {
    const analysisPrompts = await service.listPrompts('analysis');
    expect(Array.isArray(analysisPrompts)).toBe(true);
    analysisPrompts.forEach(p => {
      expect(p.type).toBe('analysis');
    });
  });

  it('should toggle prompt active status', async () => {
    // Create a prompt first
    const prompt = await service.createPrompt(testUserId, {
      name: 'Toggle Test Prompt',
      type: 'generation',
      prompt_text: 'Generate an image...',
    });

    // Toggle to active
    const activated = await service.togglePromptActive(prompt.id, true);
    expect(activated.is_active).toBe(true);

    // Toggle back to inactive
    const deactivated = await service.togglePromptActive(prompt.id, false);
    expect(deactivated.is_active).toBe(false);
  });

  it('should set a prompt as default', async () => {
    // Create two prompts
    const prompt1 = await service.createPrompt(testUserId, {
      name: 'Default Test 1',
      type: 'analysis',
      prompt_text: 'Test prompt 1...',
    });

    const prompt2 = await service.createPrompt(testUserId, {
      name: 'Default Test 2',
      type: 'analysis',
      prompt_text: 'Test prompt 2...',
    });

    // Set prompt1 as default
    const default1 = await service.setDefaultPrompt(prompt1.id, 'analysis');
    expect(default1.is_default).toBe(true);
    expect(default1.is_active).toBe(true);

    // Set prompt2 as default (should remove default from prompt1)
    const default2 = await service.setDefaultPrompt(prompt2.id, 'analysis');
    expect(default2.is_default).toBe(true);

    // Verify prompt1 is no longer default
    const updated1 = await service.getPrompt(prompt1.id);
    expect(updated1?.is_default).toBe(false);
  });

  it('should get active prompts', async () => {
    // Create and activate a prompt
    const prompt = await service.createPrompt(testUserId, {
      name: 'Active Test Prompt',
      type: 'generation',
      prompt_text: 'Generate...',
    });

    await service.togglePromptActive(prompt.id, true);

    const activePrompts = await service.getActivePrompts('generation');
    expect(Array.isArray(activePrompts)).toBe(true);
    expect(activePrompts.some(p => String(p.id) === String(prompt.id))).toBe(true);
  });

  it('should get default prompt', async () => {
    // Create and set as default
    const prompt = await service.createPrompt(testUserId, {
      name: 'Default Getter Test',
      type: 'generation',
      prompt_text: 'Generate...',
    });

    await service.setDefaultPrompt(prompt.id, 'generation');

    const defaultPrompt = await service.getDefaultPrompt('generation');
    expect(defaultPrompt).toBeDefined();
    expect(String(defaultPrompt?.id)).toBe(String(prompt.id));
  });

  it('should get prompt analytics', async () => {
    const prompt = await service.createPrompt(testUserId, {
      name: 'Analytics Test',
      type: 'analysis',
      prompt_text: 'Analyze...',
    });

    const analytics = await service.getPromptAnalytics(prompt.id);
    expect(analytics).toBeDefined();
    expect(analytics.total_uses).toBe(0);
    expect(analytics.success_rate).toBe(0);
  });

  it('should update a prompt', async () => {
    const prompt = await service.createPrompt(testUserId, {
      name: 'Update Test',
      type: 'analysis',
      prompt_text: 'Original text...',
    });

    const updated = await service.updatePrompt(prompt.id, {
      name: 'Updated Name',
      description: 'Updated description',
    });

    expect(updated.name).toBe('Updated Name');
    expect(updated.description).toBe('Updated description');
    expect(updated.prompt_text).toBe('Original text...'); // Should remain unchanged
  });

  it('should delete a prompt', async () => {
    const prompt = await service.createPrompt(testUserId, {
      name: 'Delete Test',
      type: 'analysis',
      prompt_text: 'To be deleted...',
    });

    await service.deletePrompt(prompt.id);

    const deleted = await service.getPrompt(prompt.id);
    expect(deleted).toBeNull();
  });
});

