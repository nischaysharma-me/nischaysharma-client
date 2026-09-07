'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStackStore } from '@/store/admin/useStackStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { auth } from '@/lib/firebase';
import { usersService } from '@/services/users.service';
import { useImageCrop } from '@/components/image/ImageCropProvider';

export default function StackManagerClient() {
  const { items, loading, fetchItems, addItem, updateItem, deleteItem, generateImage, processingId } = useStackStore();
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { cropImageUrl } = useImageCrop();
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    linkType: 'internal' as 'internal' | 'external',
    icon: 'ph-link',
    color: '#000000',
    description: '',
    imageUrl: '',
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
      imageUrl: '',
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
      imageUrl: item.imageUrl || '',
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

  const handleImageUpload = async (file?: File) => {
    if (!file) return;
    try {
      setUploadingImage(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');
      const response = await usersService.uploadAsset(file, 'stack', token);
      if (!response.success || !response.url) throw new Error('Upload failed');
      setFormData((current) => ({ ...current, imageUrl: response.url }));
      toast.success('Cropped stack image uploaded');
    } catch (error) {
      toast.error(`Image upload failed: ${(error as Error).message}`);
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleCropCurrentImage = async () => {
    if (!formData.imageUrl) return;
    try {
      const cropped = await cropImageUrl(formData.imageUrl, { aspect: 16 / 9, label: 'stack card image', maxWidth: 1800 });
      if (cropped) await handleImageUpload(cropped);
    } catch (error) {
      toast.error(`Unable to crop current image: ${(error as Error).message}`);
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
            <div className="stack-admin__form-header">
              <h3>
                {editingItem ? 'Edit Resource' : 'Add New Resource'}
              </h3>
              {editingItem && (
                <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                  Cancel Edit
                </Button>
              )}
            </div>
            <form onSubmit={handleSubmit} className="stack-admin__form">
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
                  className="input stack-admin__textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the 3D graphic for this card. e.g. 'A futuristic crystal library with glowing books'..."
                />
              </div>

              <div className="form-group">
                <label className="label">Card Image</label>
                {formData.imageUrl && (
                  <img src={formData.imageUrl} alt="Stack card preview" style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: '0.75rem', marginBottom: '0.75rem' }} />
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <Button type="button" variant="secondary" size="sm" onClick={() => imageInputRef.current?.click()} loading={uploadingImage}>
                    <i className="ph ph-upload-simple mr-2" /> Upload & Crop
                  </Button>
                  {formData.imageUrl && (
                    <Button type="button" variant="secondary" size="sm" onClick={handleCropCurrentImage} disabled={uploadingImage}>
                      <i className="ph ph-crop mr-2" /> Crop Current
                    </Button>
                  )}
                </div>
                <input
                  ref={imageInputRef}
                  type="file"
                  hidden
                  accept="image/*"
                  data-crop-aspect="16/9"
                  data-crop-label="stack card image"
                  data-crop-max-width="1800"
                  onChange={(event) => handleImageUpload(event.target.files?.[0])}
                />
              </div>

              <div className="stack-admin__form-grid">
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
                  <div className="stack-admin__color-field">
                    <input
                      className="input stack-admin__color-input"
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

              <Button type="submit" loading={loading} variant="primary" className="stack-admin__submit">
                <i className={`ph ${editingItem ? 'ph-check-circle' : 'ph-plus-circle'} mr-2`} />
                {editingItem ? 'Update Item' : 'Add to Stack'}
              </Button>
            </form>
          </Card>
        </aside>

        {/* Right Column: Grid */}
        <div className="stack-admin__grid">
          {items.length === 0 && !loading && (
            <div className="stack-admin__empty">
              <i className="ph ph-stack-overflow" />
              <p>No resources in your stack yet.</p>
            </div>
          )}

          {items.map((item) => (
            <div key={item.id} className={`stack-admin__card ${editingItem === item.id ? 'is-editing' : ''}`}>
              <div className="stack-admin__card-preview">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} />
                ) : (
                  <div className="icon-fallback">
                    <i className={`ph ${item.icon}`} />
                  </div>
                )}

                <div
                  className="stack-admin__card-tint"
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
                      className={editingItem === item.id ? 'action-btn is-active' : 'action-btn'}
                      aria-label={`Edit ${item.title}`}
                      title="Edit item"
                    >
                      <i className="ph ph-pencil-simple text-lg" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(item.id, item.isActive)}
                      className={item.isActive ? 'action-btn is-active' : 'action-btn'}
                      aria-label={`${item.isActive ? 'Hide' : 'Publish'} ${item.title}`}
                      title={item.isActive ? 'Hide item' : 'Publish item'}
                    >
                      <i className={`ph ${item.isActive ? 'ph-eye' : 'ph-eye-slash'} text-lg`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="action-btn action-btn--danger"
                      aria-label={`Delete ${item.title}`}
                      title="Delete item"
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

                <div className="stack-admin__card-footer">
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
