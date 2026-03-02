'use server';

import { templatesService } from '@/services/templates.service';

export async function listTemplatesAction() {
  try {
    return await templatesService.listTemplates();
  } catch (error) {
    console.error('Server Action Error (listTemplates):', error);
    return { success: false, error: 'Failed to fetch templates' };
  }
}

export async function getTemplateConfigAction() {
  try {
    return await templatesService.getTemplateConfig();
  } catch (error) {
    console.error('Server Action Error (getTemplateConfig):', error);
    return { success: false, error: 'Failed to fetch template config' };
  }
}

export async function generateTemplateAction(data: { description: string; category: string }, token: string) {
  try {
    return await templatesService.generateTemplate(data, token);
  } catch (error) {
    console.error('Server Action Error (generateTemplate):', error);
    return { success: false, error: 'Failed to request template generation' };
  }
}
