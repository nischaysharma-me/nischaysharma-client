'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { articlesService } from '@/services/articles.service';
import { templatesService } from '@/services/templates.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import AdminLoading from '@/app/admin/loading';
import { useRouter } from 'next/navigation';

export default function GenerateArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  
  // Form states
  const [topic, setTopic] = useState('');
  const [instructions, setInstructions] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [depth, setDepth] = useState('standard');
  const [error, setError] = useState('');

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
    if (!topic) {
      setError('Topic is required');
      return;
    }

    try {
      setGenerating(true);
      setError('');
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');

      const response = await articlesService.generateArticle({
        topic,
        instructions,
        templateId: templateId || undefined,
        depth
      }, token);

      if (response.success) {
        alert('AI generation started! You will be redirected to the articles list.');
        router.push('/admin/articles');
      } else {
        setError(response.error || 'Failed to start generation');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <AdminLoading />;

  return (
    <div className="article-generate">
      <div className="dashboard__title">
        <h2>AI Article Generator</h2>
        <p>Harness artificial intelligence to draft high-quality technical content.</p>
      </div>

      <div className="dashboard__grid-layout">
        <div className="lg:col-span-2">
          <div className="card card--padded">
            <form onSubmit={handleGenerate} className="auth__fields">
              <div className="organization__form-group">
                <label className="label">Primary Topic</label>
                <Input 
                  placeholder="e.g. The impact of Web3 on modern finance" 
                  value={topic} 
                  onChange={(e) => setTopic(e.target.value)} 
                  required
                />
              </div>

              <div className="organization__form-group" style={{ marginTop: '2rem' }}>
                <label className="label">Custom Instructions</label>
                <textarea 
                  className="input" 
                  placeholder="Additional context, specific points to cover, or preferred tone..." 
                  style={{ height: '120px', resize: 'none', padding: '0.75rem' }}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>

              {error && <p className="auth__error" style={{ marginTop: '1rem' }}>{error}</p>}

              <div className="organization__actions" style={{ marginTop: '2rem' }}>
                <Button type="submit" variant="primary" className="btn--full" disabled={generating}>
                  {generating ? 'Engine Processing...' : 'Start AI Generation'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="dashboard__sidebar-col">
          <div className="card card--padded">
            <h3 className="label" style={{ marginBottom: '1.5rem' }}>Generation Parameters</h3>
            
            <div className="organization__form-group">
              <label className="label">Editorial Template</label>
              <select 
                value={templateId} 
                onChange={(e) => setTemplateId(e.target.value)}
                className="input"
                style={{ background: '#fff' }}
              >
                <option value="">No Template (General)</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="organization__form-group" style={{ marginTop: '1.5rem' }}>
              <label className="label">Content Depth</label>
              <select 
                value={depth} 
                onChange={(e) => setDepth(e.target.value)}
                className="input"
                style={{ background: '#fff' }}
              >
                <option value="brief">Brief Overview</option>
                <option value="standard">Standard Article</option>
                <option value="deep-dive">Technical Deep-Dive</option>
              </select>
            </div>

            <div style={{ marginTop: '2rem', padding: '1rem', borderRadius: '0.75rem', backgroundColor: '#fafafa', border: '1px solid #eee' }}>
              <p style={{ fontSize: '0.7rem', color: '#737373', lineHeight: 1.5 }}>
                <strong>Note:</strong> AI generation typically takes 30-60 seconds. The resulting draft will appear in your Articles list automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
