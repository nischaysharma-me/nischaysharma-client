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

export async function updateTemplateAction(id: string, data: any, token: string) {
  try {
    return await templatesService.updateTemplate(id, data, token);
  } catch (error) {
    console.error('Server Action Error (updateTemplate):', error);
    return { success: false, error: 'Failed to update template' };
  }
}

export async function deleteTemplateAction(id: string, token: string) {
  try {
    return await templatesService.deleteTemplate(id, token);
  } catch (error) {
    console.error('Server Action Error (deleteTemplate):', error);
    return { success: false, error: 'Failed to delete template' };
  }
}
