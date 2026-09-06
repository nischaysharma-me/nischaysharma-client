'use client';

import React, { useState } from 'react';
import { auth } from '@/lib/firebase';
import { Post } from '@/lib/types/post';
import { postsService } from '@/services/posts.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { toast } from 'sonner';

interface AIPostGeneratorProps {
  onGenerated: (post: Post) => void;
  onClose: () => void;
}

export default function AIPostGenerator({ onGenerated, onClose }: AIPostGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('conversational');
  const [instructions, setInstructions] = useState('');
  const [generating, setGenerating] = useState(false);

  const generate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (topic.trim().length < 3) {
      toast.error('Add a topic for the post');
      return;
    }

    try {
      setGenerating(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');
      const response = await postsService.generate({
        topic: topic.trim(),
        tone,
        instructions: instructions.trim()
      }, token);
      if (!response.data) throw new Error('AI did not return a post draft');
      toast.success('AI post draft created');
      onGenerated(response.data);
    } catch (error) {
      toast.error(`Post generation failed: ${(error as Error).message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card padded className="posts-admin__generator">
      <div className="posts-admin__generator-heading">
        <div>
          <span>AI writing room</span>
          <h3>Generate a post draft</h3>
          <p>The result stays editable and is saved as a draft.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close AI generator"><i className="ph ph-x" /></button>
      </div>
      <form onSubmit={generate}>
        <Input label="Topic or core idea" required value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="What did shipping a smaller version teach me?" />
        <div className="posts-admin__generator-row">
          <Select label="Tone" value={tone} onChange={(event) => setTone(event.target.value)}>
            <option value="conversational">Conversational</option>
            <option value="professional">Professional</option>
            <option value="bold">Bold</option>
            <option value="reflective">Reflective</option>
            <option value="educational">Educational</option>
          </Select>
          <Textarea label="Additional direction" value={instructions} onChange={(event) => setInstructions(event.target.value)} placeholder="Mention the feedback loop; avoid buzzwords…" />
        </div>
        <div className="posts-admin__generator-footer">
          <small>Uses the editable <strong>post.generate</strong> prompt from Prompt Library.</small>
          <Button type="submit" loading={generating} leftIcon={<i className="ph ph-sparkle" />}>Generate draft</Button>
        </div>
      </form>
    </Card>
  );
}
