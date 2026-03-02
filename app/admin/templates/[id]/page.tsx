import React from 'react';
import TemplateEditClient from './TemplateEditClient';
import { listTemplatesAction, getTemplateConfigAction } from '@/actions/templates';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TemplateEditPage({ params }: PageProps) {
  const { id } = await params;
  
  // We can fetch the specific template if we had a getById action, 
  // but for now we can pass the ID to the client which can hydrate from the store
  // OR we fetch config to ensure the dropdown works
  const configRes = await getTemplateConfigAction();
  const templateConfig = ('data' in configRes && configRes.success) ? configRes.data : null;

  return <TemplateEditClient templateId={id} templateConfig={templateConfig} />;
}
