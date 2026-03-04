'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { generateTemplateAction, deleteTemplateAction } from '@/actions/templates';
import AdminLoading from '@/app/admin/loading';
import { useTemplateStore } from '@/store/admin/useTemplateStore';
import { useRouter } from 'next/navigation';

interface TemplatesClientProps {
  initialTemplates: any[];
  templateConfig: any;
}

export default function TemplatesClient({ initialTemplates, templateConfig }: TemplatesClientProps) {
  const router = useRouter();
  const { 
    templates, 
    setTemplates, 
    templateConfig: storeConfig, 
    setTemplateConfig,
    generating,
    setGenerating
  } = useTemplateStore();

  // Generator Form State
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
        alert('Template generation job started! You will be notified when it is ready.');
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

  const handleEditClick = (templateId: string) => {
    router.push(`/admin/templates/${templateId}`);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this template?')) return;

    try {
      setGenerating(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const response = await deleteTemplateAction(id, token);

      if (response.success) {
        setTemplates(templates.filter(t => t.id !== id));
      } else {
        alert('Failed to delete template');
      }
    } catch (err: any) {
      alert('Error deleting template: ' + err.message);
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
        <div className="dashboard__grid-main">
          <div className="card dashboard__recent">
            <div className="dashboard__recent-header">
              <h3>Available Templates</h3>
            </div>
            <div className="dashboard__recent-list">
              {templates.length > 0 ? (
                templates.map((template) => (
                  <div key={template.id} className="dashboard__recent-item templates__item">
                    <div className="dashboard__recent-item-info">
                      <div className="dashboard__recent-item-title">{template.name}</div>
                      <div className="dashboard__recent-item-meta">
                        <span>Category: {template.category}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn--ghost" 
                        style={{ padding: '0.4rem' }} 
                        title="Edit Template"
                        onClick={() => handleEditClick(template.id)}
                      >
                        <i className="ph ph-pencil-line" style={{ fontSize: '1.2rem' }} />
                      </button>
                      <button 
                        className="btn btn--ghost" 
                        style={{ padding: '0.4rem', color: '#ff6b6b' }} 
                        title="Delete Template"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <i className="ph ph-trash" style={{ fontSize: '1.2rem' }} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="templates__empty-msg">
                  No templates found. Generate your first one using the AI tool!
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard__grid-sidebar">
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
                  <p className="templates__category-desc">
                    {storeConfig?.categories?.find((c: any) => c.id === category)?.description}
                  </p>
                )}
              </div>

              <Button type="submit" variant="primary" className="btn--full" style={{ marginTop: '1rem' }} disabled={generating}>
                <i className="ph ph-sparkle" style={{ marginRight: '0.4rem' }} />
                <span>{generating ? 'Requesting...' : 'Generate Template'}</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
