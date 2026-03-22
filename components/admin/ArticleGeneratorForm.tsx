'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { templatesService } from '@/services/templates.service';
import { generateArticleAction } from '@/lib/actions/articles';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

interface ArticleGeneratorFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const ArticleGeneratorForm = ({ onSuccess, onClose }: ArticleGeneratorFormProps) => {
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
      const response = await templatesService.listTemplates();
      if (response.success) {
        setTemplates(response.data);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGenerating(true);
      setError('');
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');

      const result = await generateArticleAction({
        topic,
        instructions,
        templateId: templateId || undefined,
        depth
      }, token);

      if (result.success) {
        toast.success('AI generation started!', {
          description: 'Draft will appear shortly.'
        });
        setTopic('');
        setInstructions('');
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Failed to start generation');
      }
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card padded className="articles-admin__generator-card">
      <div className="articles-admin__generator-header">
        <h3>AI Article Generator</h3>
        <button onClick={onClose} className="close-btn">
          <i className="ph ph-x" style={{ fontSize: '1rem' }} />
        </button>
      </div>
      
      <form onSubmit={handleGenerate}>
        <Input 
          label="Primary Topic"
          placeholder="e.g. The impact of Web3 on modern finance" 
          value={topic} 
          name="topic"
          onChange={(e) => setTopic(e.target.value)} 
          required
        />

        <Textarea 
          label="Custom Instructions"
          placeholder="Specific points to cover, or preferred tone..." 
          value={instructions}
          name="instructions"
          onChange={(e) => setInstructions(e.target.value)}
          containerClassName="mt-4"
        />

        <div className="articles-admin__form-row mt-4">
          <Select 
            label="Editorial Template"
            value={templateId} 
            name="templateId"
            onChange={(e) => setTemplateId(e.target.value)}
            containerClassName="flex-1"
          >
            <option value="">No Template</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
          
          <Select 
            label="Content Depth"
            value={depth} 
            name="depth"
            onChange={(e) => setDepth(e.target.value)}
            containerClassName="flex-1"
          >
            <option value="brief">Brief</option>
            <option value="standard">Standard</option>
            <option value="deep-dive">Deep-Dive</option>
          </Select>
        </div>

        {error && <p className="input-error-message mt-4">{error}</p>}

        <div className="mt-8">
          <Button type="submit" variant="primary" size="full" loading={generating}>
            Start AI Generation
          </Button>
        </div>
      </form>
    </Card>
  );
};
