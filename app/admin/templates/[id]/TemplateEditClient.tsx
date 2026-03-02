'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { updateTemplateAction, deleteTemplateAction } from '@/actions/templates';
import AdminLoading from '@/app/admin/loading';
import { useTemplateStore } from '@/store/admin/useTemplateStore';

interface TemplateEditClientProps {
  templateId: string;
  templateConfig: any;
}

export default function TemplateEditClient({ templateId, templateConfig }: TemplateEditClientProps) {
  const router = useRouter();
  const { templates, setTemplates, templateConfig: storeConfig, setTemplateConfig } = useTemplateStore();
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Form State
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editAiInstructions, setEditAiInstructions] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(false);
  const [editStructure, setEditStructure] = useState<{heading: string, contentBrief: string, imagePrompt?: string}[]>([]);

  useEffect(() => {
    if (templateConfig && !storeConfig) {
      setTemplateConfig(templateConfig);
    }
  }, [templateConfig, storeConfig, setTemplateConfig]);

  useEffect(() => {
    // Find the template from the store
    const template = templates.find(t => t.id === templateId);
    
    if (template) {
      setEditName(template.name || '');
      setEditDescription(template.description || '');
      setEditCategory(template.category || storeConfig?.categories?.[0]?.id || 'blog-post');
      setEditAiInstructions(template.aiInstructions || '');
      setEditIsPublic(template.isPublic || false);
      setEditStructure(template.structure || []);
      setLoading(false);
    } else {
      alert('Template data not found in session. Redirecting...');
      router.push('/admin/templates');
    }
  }, [templateId, templates, storeConfig, router]);

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const response = await updateTemplateAction(templateId, {
        name: editName,
        description: editDescription,
        category: editCategory,
        aiInstructions: editAiInstructions,
        isPublic: editIsPublic,
        structure: editStructure
      }, token);

      if (response.success && 'data' in response) {
        const updatedTemplates = templates.map(t => 
          t.id === templateId ? response.data : t
        );
        setTemplates(updatedTemplates);
        alert('Template updated successfully!');
        router.push('/admin/templates');
      } else {
        alert('Failed to update template');
      }
    } catch (err: any) {
      alert('Error updating template: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!confirm('Are you sure you want to permanently delete this template?')) return;

    try {
      setActionLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const response = await deleteTemplateAction(templateId, token);

      if (response.success) {
        setTemplates(templates.filter(t => t.id !== templateId));
        router.push('/admin/templates');
      } else {
        alert('Failed to delete template');
      }
    } catch (err: any) {
      alert('Error deleting template: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <AdminLoading />;

  return (
    <div className="template-edit">
      {/* Fixed Header within the page */}
      <div className="template-edit__header">
        <div className="dashboard__title">
          <h2>Edit Template</h2>
          <p>Modify the AI blueprint for {editName}.</p>
        </div>
        <div className="dashboard__header-actions">
          <Button variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateTemplate} disabled={actionLoading}>
            {actionLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Scrollable Form Body */}
      <div className="template-edit__scroll-area">
        <div className="dashboard__grid-layout">
          <div className="lg:col-span-2">
            <div className="template-edit__form-card">
              <form onSubmit={handleUpdateTemplate} className="auth__fields">
                <div className="organization__form-group">
                  <label className="label">Template Name</label>
                  <Input 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)} 
                    required
                  />
                </div>

                <div className="organization__form-group" style={{ marginTop: '1.5rem' }}>
                  <label className="label">Category</label>
                  <select 
                    className="input" 
                    value={editCategory} 
                    onChange={(e) => setEditCategory(e.target.value)}
                    style={{ background: '#fff' }}
                  >
                    {storeConfig?.categories?.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="organization__form-group" style={{ marginTop: '1.5rem' }}>
                  <label className="label">Public Template</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={editIsPublic}
                      onChange={(e) => setEditIsPublic(e.target.checked)}
                    />
                    Make this template available to everyone
                  </label>
                </div>

                <div className="organization__form-group" style={{ marginTop: '1.5rem' }}>
                  <label className="label">Description</label>
                  <textarea 
                    className="input" 
                    style={{ height: '60px', resize: 'none', padding: '0.75rem' }}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </div>

                <div className="organization__form-group" style={{ marginTop: '1.5rem' }}>
                  <label className="label">AI Instructions</label>
                  <textarea 
                    className="input" 
                    placeholder="Specific guidelines for the AI when using this template..."
                    style={{ height: '80px', resize: 'none', padding: '0.75rem' }}
                    value={editAiInstructions}
                    onChange={(e) => setEditAiInstructions(e.target.value)}
                  />
                </div>

                <div className="organization__form-group" style={{ marginTop: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <label className="label" style={{ fontSize: '1rem' }}>Structure (Sections)</label>
                    <button 
                      type="button" 
                      onClick={() => setEditStructure([...editStructure, { heading: '', contentBrief: '', imagePrompt: '' }])}
                      style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#111', background: '#eee', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}
                    >
                      + Add Section
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {editStructure.map((section, idx) => (
                      <div key={idx} style={{ padding: '1.5rem', border: '1px solid #eee', borderRadius: '0.75rem', position: 'relative', backgroundColor: '#fafafa' }}>
                        <button 
                          type="button" 
                          onClick={() => setEditStructure(editStructure.filter((_, i) => i !== idx))}
                          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: '#ff6b6b', fontSize: '0.65rem', fontWeight: 'bold' }}
                        >
                          REMOVE
                        </button>
                        <div style={{ marginBottom: '1rem', paddingRight: '60px' }}>
                           <label className="label">Heading</label>
                           <Input 
                            placeholder="Section Heading" 
                            value={section.heading}
                            onChange={(e) => {
                              const newStructure = [...editStructure];
                              newStructure[idx].heading = e.target.value;
                              setEditStructure(newStructure);
                            }}
                          />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                          <label className="label">Content Brief</label>
                          <textarea 
                            className="input" 
                            placeholder="What should this section cover?"
                            style={{ height: '80px', resize: 'none', padding: '0.75rem' }}
                            value={section.contentBrief}
                            onChange={(e) => {
                              const newStructure = [...editStructure];
                              newStructure[idx].contentBrief = e.target.value;
                              setEditStructure(newStructure);
                            }}
                          />
                        </div>
                        <div>
                          <label className="label">Image Prompt (Optional)</label>
                          <Input 
                            placeholder="Visual description for AI image generation..." 
                            value={section.imagePrompt || ''}
                            onChange={(e) => {
                              const newStructure = [...editStructure];
                              newStructure[idx].imagePrompt = e.target.value;
                              setEditStructure(newStructure);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    {editStructure.length === 0 && (
                      <div style={{ padding: '3rem', textAlign: 'center', color: '#737373', fontSize: '0.875rem', border: '2px dashed #ccc', borderRadius: '0.75rem' }}>
                        No sections defined. Add sections to outline your article.
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="dashboard__sidebar-col">
            <div className="card card--padded">
              <h3 className="label" style={{ marginBottom: '1rem' }}>Danger Zone</h3>
              <p style={{ fontSize: '0.75rem', color: '#737373', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Deleting this template will permanently remove it from your workspace. Existing articles generated with this template will not be affected.
              </p>
              <Button 
                variant="secondary" 
                className="btn--full" 
                style={{ color: '#ff6b6b', borderColor: 'transparent', backgroundColor: 'rgba(255, 107, 107, 0.1)' }}
                onClick={handleDeleteTemplate}
                disabled={actionLoading}
              >
                Delete Template
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
