'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  generateTemplateAction, 
  updateTemplateAction, 
  deleteTemplateAction 
} from '@/actions/templates';
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

  const handleEditClick = (template: any) => {
    setEditingTemplate(template);
    setEditName(template.name || '');
    setEditDescription(template.description || '');
    setEditCategory(template.category || storeConfig?.categories?.[0]?.id || 'blog-post');
    setEditAiInstructions(template.aiInstructions || '');
    setEditIsPublic(template.isPublic || false);
    setEditStructure(template.structure || []);
  };

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    try {
      setActionLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const response = await updateTemplateAction(editingTemplate.id, {
        name: editName,
        description: editDescription,
        category: editCategory,
        aiInstructions: editAiInstructions,
        isPublic: editIsPublic,
        structure: editStructure
      }, token);

      if (response.success && 'data' in response) {
        // Update local store
        const updatedTemplates = templates.map(t => 
          t.id === editingTemplate.id ? response.data : t
        );
        setTemplates(updatedTemplates);
        setEditingTemplate(null);
      } else {
        alert('Failed to update template');
      }
    } catch (err: any) {
      alert('Error updating template: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this template?')) return;

    try {
      setActionLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const response = await deleteTemplateAction(id, token);

      if (response.success) {
        // Remove from local store
        setTemplates(templates.filter(t => t.id !== id));
        if (editingTemplate?.id === id) {
          setEditingTemplate(null);
        }
      } else {
        alert('Failed to delete template');
      }
    } catch (err: any) {
      alert('Error deleting template: ' + err.message);
    } finally {
      setActionLoading(false);
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
          
          {/* Edit Template Form (Inline) */}
          {editingTemplate && (
            <div className="card card--padded" style={{ marginBottom: '2rem', border: '1px solid #111' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 className="dashboard__recent-item-title">Edit Template: {editingTemplate.name}</h3>
                <button onClick={() => setEditingTemplate(null)} style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.4 }}>CLOSE</button>
              </div>
              
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

                <div className="organization__form-group" style={{ marginTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label className="label">Structure (Sections)</label>
                    <button 
                      type="button" 
                      onClick={() => setEditStructure([...editStructure, { heading: '', contentBrief: '', imagePrompt: '' }])}
                      style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#111' }}
                    >
                      + Add Section
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                    {editStructure.map((section, idx) => (
                      <div key={idx} style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '0.5rem', position: 'relative', backgroundColor: '#fafafa' }}>
                        <button 
                          type="button" 
                          onClick={() => setEditStructure(editStructure.filter((_, i) => i !== idx))}
                          style={{ position: 'absolute', top: '1rem', right: '1rem', color: '#ff6b6b', fontSize: '0.65rem', fontWeight: 'bold' }}
                        >
                          REMOVE
                        </button>
                        <div style={{ marginBottom: '0.75rem', paddingRight: '40px' }}>
                           <label className="label" style={{ fontSize: '0.65rem' }}>Heading</label>
                           <Input 
                            placeholder="Section Heading" 
                            value={section.heading}
                            onChange={(e) => {
                              const newStructure = [...editStructure];
                              newStructure[idx].heading = e.target.value;
                              setEditStructure(newStructure);
                            }}
                            style={{ height: '2rem', fontSize: '0.8rem' }}
                          />
                        </div>
                        <div style={{ marginBottom: '0.75rem' }}>
                          <label className="label" style={{ fontSize: '0.65rem' }}>Content Brief</label>
                          <textarea 
                            className="input" 
                            placeholder="What should this section cover?"
                            style={{ height: '60px', resize: 'none', padding: '0.5rem', fontSize: '0.8rem' }}
                            value={section.contentBrief}
                            onChange={(e) => {
                              const newStructure = [...editStructure];
                              newStructure[idx].contentBrief = e.target.value;
                              setEditStructure(newStructure);
                            }}
                          />
                        </div>
                        <div>
                          <label className="label" style={{ fontSize: '0.65rem' }}>Image Prompt (Optional)</label>
                          <Input 
                            placeholder="Visual description for AI image generation..." 
                            value={section.imagePrompt || ''}
                            onChange={(e) => {
                              const newStructure = [...editStructure];
                              newStructure[idx].imagePrompt = e.target.value;
                              setEditStructure(newStructure);
                            }}
                            style={{ height: '2rem', fontSize: '0.8rem' }}
                          />
                        </div>
                      </div>
                    ))}
                    {editStructure.length === 0 && (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#737373', fontSize: '0.75rem', border: '1px dashed #ccc', borderRadius: '0.5rem' }}>
                        No sections defined. Add sections to outline your article.
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <Button type="submit" variant="primary" disabled={actionLoading}>
                    {actionLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    style={{ color: '#ff6b6b', borderColor: 'transparent', marginLeft: 'auto' }}
                    onClick={() => handleDeleteTemplate(editingTemplate.id)}
                    disabled={actionLoading}
                  >
                    Delete Template
                  </Button>
                </div>
              </form>
            </div>
          )}

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
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn--ghost" 
                        style={{ padding: '0.4rem' }} 
                        title="Edit Template"
                        onClick={() => handleEditClick(template)}
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1rem' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button 
                        className="btn btn--ghost" 
                        style={{ padding: '0.4rem', color: '#ff6b6b' }} 
                        title="Delete Template"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1rem' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#737373' }}>
                  No templates found. Generate your first one using the AI tool!
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
                    {storeConfig?.categories?.find((c: any) => c.id === category)?.description}
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
