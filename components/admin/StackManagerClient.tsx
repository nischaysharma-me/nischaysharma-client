'use client';

import React, { useState, useEffect } from 'react';
import { useStackStore } from '@/store/admin/useStackStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export default function StackManagerClient() {
  const { items, loading, fetchItems, addItem, updateItem, deleteItem, generateImage, processingId } = useStackStore();
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    linkType: 'internal' as 'internal' | 'external',
    icon: 'ph-link',
    color: '#000000',
    description: '',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      const success = await updateItem(editingItem, formData);
      if (success) {
        toast.success('Stack item updated successfully');
        handleCancelEdit();
      } else {
        toast.error('Failed to update stack item');
      }
    } else {
      const success = await addItem(formData);
      if (success) {
        toast.success('Stack item added successfully');
        resetForm();
      } else {
        toast.error('Failed to add stack item');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      link: '',
      linkType: 'internal',
      icon: 'ph-link',
      color: '#000000',
      description: '',
      order: 0,
      isActive: true
    });
  };

  const handleEdit = (item: any) => {
    setEditingItem(item.id);
    setFormData({
      title: item.title,
      link: item.link,
      linkType: item.linkType,
      icon: item.icon,
      color: item.color,
      description: item.description || '',
      order: item.order,
      isActive: item.isActive
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    resetForm();
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    const success = await updateItem(id, { isActive: !current });
    if (success) {
      toast.success(`Item ${!current ? 'activated' : 'deactivated'}`);
    }
  };

  const handleGenerateImage = async (id: string, prompt: string) => {
    if (!prompt) {
      toast.error('Please provide a description/prompt for image generation');
      return;
    }
    const success = await generateImage(id, prompt);
    if (success) {
      toast.success('AI Image generation started');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this item?')) {
      const success = await deleteItem(id);
      if (success) {
        toast.success('Item deleted');
      }
    }
  };

  return (
    <div className="stack-admin">
      <div className="stack-admin__header">
        <div className="dashboard__title">
          <h2>Stack Menu Management</h2>
          <p>Curate the 3D resource deck for the global navigation and landing sections.</p>
        </div>
      </div>

      <div className="stack-admin__layout">
        {/* Left Column: Form */}
        <aside className="stack-admin__form-container">
          <Card padded className="form-premium">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">
                {editingItem ? 'Edit Resource' : 'Add New Resource'}
              </h3>
              {editingItem && (
                <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                  Cancel Edit
                </Button>
              )}
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="label">Title</label>
                <input
                  className="input"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  placeholder="e.g. Master Documentation"
                />
              </div>

              <div className="form-group">
                <label className="label">Link Type</label>
                <select
                  className="input"
                  value={formData.linkType}
                  onChange={(e) => setFormData({...formData, linkType: e.target.value as 'internal' | 'external'})}
                >
                  <option value="internal">Internal Application Route</option>
                  <option value="external">External Resource URL</option>
                </select>
              </div>

              <div className="form-group">
                <label className="label">Destination Link</label>
                <input
                  className="input"
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  required
                  placeholder={formData.linkType === 'internal' ? '/docs/guides' : 'https://github.com/...'}
                />
              </div>

              <div className="form-group">
                <label className="label">Visual Description (AI Prompt)</label>
                <textarea
                  className="input h-24 py-3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the 3D graphic for this card. e.g. 'A futuristic crystal library with glowing books'..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label">Icon Class</label>
                  <input
                    className="input text-center"
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="label">Accent Color</label>
                  <div className="flex gap-2">
                    <input
                      className="input p-1 h-10 w-full"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="label">Display Order</label>
                <input
                  className="input"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                />
              </div>

              <Button type="submit" loading={loading} variant="primary" className="mt-2">
                <i className={`ph ${editingItem ? 'ph-check-circle' : 'ph-plus-circle'} mr-2`} />
                {editingItem ? 'Update Item' : 'Add to Stack'}
              </Button>
            </form>
          </Card>
        </aside>

        {/* Right Column: Grid */}
        <div className="stack-admin__grid">
          {items.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center">
              <i className="ph ph-stack-overflow text-6xl text-gray-200 mb-4" />
              <p className="text-gray-400 font-medium">No resources in your stack yet.</p>
            </div>
          )}

          {items.map((item) => (
            <div key={item.id} className={`stack-admin__card ${editingItem === item.id ? 'ring-2 ring-primary' : ''}`}>
              <div className="stack-admin__card-preview">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} />
                ) : (
                  <div className="icon-fallback">
                    <i className={`ph ${item.icon}`} />
                  </div>
                )}

                <div
                  className="absolute inset-0 opacity-20"
                  style={{ backgroundColor: item.color }}
                />

                <div className="card-overlay">
                  <Button
                    variant="minimal"
                    size="sm"
                    className="btn-generate"
                    onClick={() => handleGenerateImage(item.id, item.description || '')}
                    loading={processingId === item.id}
                  >
                    <i className="ph ph-magic-wand mr-2" />
                    Regenerate AI Visual
                  </Button>
                </div>
              </div>

              <div className="stack-admin__card-content">
                <div className="card-header">
                  <div className="title-group">
                    <h3>{item.title}</h3>
                    <span className="link-badge">{item.linkType}</span>
                  </div>
                  <div className="action-group">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(item)}
                      className={editingItem === item.id ? 'text-primary' : 'text-gray-400'}
                    >
                      <i className="ph ph-pencil-simple text-lg" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(item.id, item.isActive)}
                      className={item.isActive ? 'text-primary' : 'text-gray-400'}
                    >
                      <i className={`ph ${item.isActive ? 'ph-eye' : 'ph-eye-slash'} text-lg`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:bg-red-50"
                    >
                      <i className="ph ph-trash text-lg" />
                    </Button>
                  </div>
                </div>

                <div className="card-body">
                  <code className="link-text">{item.link}</code>

                  <div className="prompt-preview">
                    <label>AI Visualization Prompt</label>
                    <p title={item.description}>{item.description || 'No description provided'}</p>
                  </div>
                </div>

                <div className="stack-admin__card-footer mt-auto">
                  <div className={`status-pill ${item.isActive ? 'status-pill--active' : 'status-pill--inactive'}`}>
                    <span className="dot" />
                    {item.isActive ? 'Published' : 'Draft'}
                  </div>
                  <div className="order-text">
                    Order: #{item.order}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
