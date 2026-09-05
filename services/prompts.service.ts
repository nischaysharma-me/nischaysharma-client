import { apiFetch } from './apiClient';
import { ActionResponse } from '@/lib/types/common';
import { PromptDefinition, PromptRevision } from '@/lib/types/prompt';

const promptPath = (key: string) => `/prompts/${encodeURIComponent(key)}`;

export const promptsService = {
  list: (token: string): Promise<ActionResponse<PromptDefinition[]>> =>
    apiFetch('/prompts', { method: 'GET', token }),

  update: (key: string, template: string, token: string): Promise<ActionResponse<PromptDefinition>> =>
    apiFetch(promptPath(key), { method: 'PUT', token, body: { template } }),

  preview: (key: string, template: string, values: Record<string, unknown>, token: string): Promise<ActionResponse<{ rendered: string }>> =>
    apiFetch(`${promptPath(key)}/preview`, { method: 'POST', token, body: { template, values } }),

  reset: (key: string, token: string): Promise<ActionResponse<PromptDefinition>> =>
    apiFetch(`${promptPath(key)}/reset`, { method: 'POST', token }),

  resetAll: (token: string): Promise<ActionResponse<PromptDefinition[]>> =>
    apiFetch('/prompts/reset-all', { method: 'POST', token }),

  revisions: (key: string, token: string): Promise<ActionResponse<PromptRevision[]>> =>
    apiFetch(`${promptPath(key)}/revisions`, { method: 'GET', token }),

  rollback: (key: string, revisionId: string, token: string): Promise<ActionResponse<PromptDefinition>> =>
    apiFetch(`${promptPath(key)}/rollback/${encodeURIComponent(revisionId)}`, { method: 'POST', token }),
};
