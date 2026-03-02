import React from 'react';
import TemplatesClient from '@/components/TemplatesClient';
import { listTemplatesAction, getTemplateConfigAction } from '@/actions/templates';

// This is a Server Component
export default async function TemplatesPage() {
  const [templatesRes, configRes] = await Promise.all([
    listTemplatesAction(),
    getTemplateConfigAction()
  ]);

  const initialTemplates = ('data' in templatesRes && templatesRes.success) ? templatesRes.data : [];
  const templateConfig = ('data' in configRes && configRes.success) ? configRes.data : null;

  return (
    <TemplatesClient 
      initialTemplates={initialTemplates} 
      templateConfig={templateConfig} 
    />
  );
}
