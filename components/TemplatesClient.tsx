'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { generateTemplateAction } from '@/actions/templates';
import AdminLoading from '@/app/admin/loading';
import { useTemplateStore } from '@/store/admin/useTemplateStore';

interface TemplatesClientProps {
  initialTemplates: any[];
  templateConfig: any;
}

export default function TemplatesClient({ initialTemplates, templateConfig }: TemplatesClientProps) {
  const { 
    templates, 
    setTemplates, 
    templateConfig: storeConfig, 
    setTemplateConfig,
    generating,
    setGenerating
  } = useTemplateStore();

  // Form states remain local to the component for immediate UI feedback
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(templateConfig?.categories?.[0]?.id || 'blog-post');

  // Hydrate store on mount
  useEffect(() => {
    if (initialTemplates) setTemplates(initialTemplates);
    if (templateConfig) setTemplateConfig(templateConfig);
  }, [initialTemplates, templateConfig, setTemplates, setTemplateConfig]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGenerating(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const response = await generateTemplateAction({
        description,
        category: category
      }, token);

      if (response.success) {
        alert('Template generation job started!');
        setDescription('');
      } else {
        alert('Error: ' + (('error' in response) ? response.error : 'Failed to generate'));
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (generating) return <AdminLoading />;

  return (
    <div className="templates">
      <div className="dashboard__title">
        <h2>Content Templates</h2>
        <p>Use AI to generate structured blueprints for your articles.</p>
      </div>

      <div className="dashboard__grid-layout">
        <div className="lg:col-span-2">
          <div className="card dashboard__recent">
            <div className="dashboard__recent-header">
              <h3>Available Templates</h3>
            </div>
            <div className="dashboard__recent-list">
              {templates.length > 0 ? (
                templates.map((template) => (
                  <div key={template.id} className="dashboard__recent-item">
                    <div className="dashboard__recent-item-info">
                      <div className="dashboard__recent-item-title">{template.name}</div>
                      <div className="dashboard__recent-item-meta">
                        <span>Category: {template.category}</span>
                      </div>
                    </div>
                    <Button variant="secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}>
                      Use Template
                    </Button>
                  </div>
                ))
              ) : (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#737373' }}>
                  No templates found. Generate your first one!
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard__sidebar-col">
          <div className="card card--padded">
            <h3 className="label" style={{ marginBottom: '1.5rem' }}>AI Template Generator</h3>
            <form onSubmit={handleGenerate} className="auth__fields">
              <div className="organization__form-group">
                <label className="label">Template Description</label>
                <textarea 
                  className="input" 
                  placeholder="Describe the type of article (e.g. A technical comparison of databases)"
                  style={{ height: '100px', resize: 'none', padding: '0.75rem' }}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="organization__form-group" style={{ marginTop: '1.5rem' }}>
                <label className="label">Category</label>
                <select 
                  className="input" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ background: '#fff' }}
                >
                  {storeConfig?.categories?.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                {storeConfig?.categories?.find((c: any) => c.id === category)?.description && (
                  <p style={{ fontSize: '0.65rem', color: '#737373', marginTop: '0.5rem', lineHeight: 1.4 }}>
                    {storeConfig.categories.find((c: any) => c.id === category).description}
                  </p>
                )}
              </div>

              <Button type="submit" variant="primary" className="btn--full" style={{ marginTop: '1rem' }} disabled={generating}>
                {generating ? 'Requesting...' : 'Generate Template'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
