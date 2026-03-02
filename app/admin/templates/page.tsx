'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { templatesService } from '@/services/templates.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import AdminLoading from '@/app/admin/loading';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await templatesService.listTemplates();
      if (response.success) {
        setTemplates(response.data);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGenerating(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const response = await templatesService.generateTemplate({
        description,
        category: 'general'
      }, token);

      if (response.success) {
        alert('Template generation job started!');
        setDescription('');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <AdminLoading />;

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
                  placeholder="Describe the type of article you want a template for (e.g. A technical comparison of databases)"
                  style={{ height: '100px', resize: 'none', padding: '0.75rem' }}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" variant="primary" className="btn--full" disabled={generating}>
                {generating ? 'Requesting...' : 'Generate Template'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
