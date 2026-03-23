'use client';

import React, { useEffect, useState } from 'react';
import { useBillboardStore } from '@/store/admin/useBillboardStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';
import { CreateBillboardData, Billboard } from '@/lib/types/billboard';
import { motion, AnimatePresence } from 'framer-motion';

export default function BillboardManagement() {
  const { 
    billboards, 
    loading, 
    fetchBillboards, 
    createBillboard, 
    updateBillboard, 
    deleteBillboard, 
    generateImage 
  } = useBillboardStore();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateBillboardData>({
    label: '',
    headline: '',
    summary: '',
    href: '/',
    layoutType: 'mini',
    position: 0,
    isActive: true,
    imagePrompt: ''
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchBillboards();
    });
    return () => unsubscribe();
  }, [fetchBillboards]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      const success = await updateBillboard(editingId, formData);
      if (success) {
        toast.success('Billboard item updated');
        setEditingId(null);
        resetForm();
      }
    } else {
      const success = await createBillboard(formData);
      if (success) {
        toast.success('Billboard item created');
        setIsAdding(false);
        resetForm();
      } else {
        toast.error('Failed to create item');
      }
    }
  };

  const resetForm = () => {
    setFormData({ label: '', headline: '', summary: '', href: '/', layoutType: 'mini', position: 0, isActive: true, imagePrompt: '' });
  };

  const handleEdit = (item: Billboard) => {
    setFormData({
      label: item.label,
      headline: item.headline,
      summary: item.summary,
      href: item.href,
      layoutType: item.layoutType,
      position: item.position,
      isActive: item.isActive,
      imagePrompt: item.imagePrompt
    });
    setEditingId(item.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerateImage = async (id: string) => {
    toast.promise(generateImage(id), {
      loading: 'Designing newspaper illustration...',
      success: 'Broadsheet art generated successfully',
      error: 'Failed to generate art'
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this headline?')) {
      const success = await deleteBillboard(id);
      if (success) toast.success('Removed from Billboard');
    }
  };

  return (
    <div className="billboard-admin">
      <div className="dashboard__title">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2>Broadsheet Editor</h2>
            <p>Curate the newspaper navigation and daily stories.</p>
          </div>
          <Button 
            onClick={() => {
              if (isAdding) {
                setIsAdding(false);
                setEditingId(null);
                resetForm();
              } else {
                setIsAdding(true);
              }
            }} 
            variant={isAdding ? 'secondary' : 'primary'}
            leftIcon={<i className={`ph ${isAdding ? 'ph-x' : 'ph-plus'}`} />}
          >
            {isAdding ? 'Cancel' : 'New Headline'}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <Card padded className="billboard-admin__form-card mb-8">
              <form onSubmit={handleSubmit} className="billboard-admin__form">
                <div className="billboard-admin__form-grid">
                  <div className="field">
                    <label>Internal Label</label>
                    <input 
                      placeholder="e.g. Home, About" 
                      value={formData.label} 
                      onChange={e => setFormData({...formData, label: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="field">
                    <label>Destination Slug</label>
                    <input 
                      placeholder="e.g. /docs, /#contact" 
                      value={formData.href} 
                      onChange={e => setFormData({...formData, href: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="field full">
                    <label>Headline Title</label>
                    <input 
                      placeholder="The Big News..." 
                      value={formData.headline} 
                      onChange={e => setFormData({...formData, headline: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="field full">
                    <label>Summary / Editorial</label>
                    <textarea 
                      placeholder="Brief overview of the story..." 
                      value={formData.summary} 
                      onChange={e => setFormData({...formData, summary: e.target.value})} 
                    />
                  </div>
                  <div className="field">
                    <label>Layout Style</label>
                    <select 
                      value={formData.layoutType} 
                      onChange={e => setFormData({...formData, layoutType: e.target.value as any})}
                    >
                      <option value="lead">Lead Story (Centerpiece)</option>
                      <option value="middle">Standard Article (Column)</option>
                      <option value="mini">Mini Snippet (Sidebar)</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Position Order</label>
                    <input 
                      type="number" 
                      value={formData.position} 
                      onChange={e => setFormData({...formData, position: parseInt(e.target.value)})} 
                    />
                  </div>
                  <div className="field full">
                    <label>AI Image Prompt (Optional)</label>
                    <input 
                      placeholder="A vintage newspaper illustration of..." 
                      value={formData.imagePrompt} 
                      onChange={e => setFormData({...formData, imagePrompt: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="billboard-admin__form-actions">
                  <Button type="submit" variant="primary" loading={loading}>
                    {editingId ? 'Update Headline' : 'Publish to Billboard'}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="billboard-admin__list">
        <div className="billboard-admin__list-header">
          <span>Active Headlines ({billboards.length})</span>
          <div className="dots"></div>
        </div>
        
        {billboards.map(item => (
          <div key={item.id} className={`billboard-admin__item billboard-admin__item--${item.layoutType}`}>
            <div className="billboard-admin__item-preview">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt="" />
              ) : (
                <div className="placeholder"><i className="ph ph-image" /></div>
              )}
            </div>
            
            <div className="billboard-admin__item-content">
              <div className="meta">
                <span className="type">{item.layoutType}</span>
                <span className="label">{item.label}</span>
                <span className="href">{item.href}</span>
              </div>
              <h4>{item.headline}</h4>
              <p>{item.summary}</p>
            </div>

            <div className="billboard-admin__item-actions">
              <button className="action-btn" title="Edit" onClick={() => handleEdit(item)}>
                <i className="ph ph-pencil-simple" />
              </button>
              <button className="action-btn" title="Generate Image" onClick={() => handleGenerateImage(item.id)}>
                <i className="ph ph-sparkle" />
              </button>
              <button className="action-btn action-btn--delete" title="Delete" onClick={() => handleDelete(item.id)}>
                <i className="ph ph-trash" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
