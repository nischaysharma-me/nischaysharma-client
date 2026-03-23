'use client';

import React, { useEffect, useState } from 'react';
import { useBillboardStore } from '@/store/admin/useBillboardStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';
import { CreateBillboardData } from '@/lib/types/billboard';

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
  const [formData, setFormData] = useState<CreateBillboardData>({
    label: '',
    headline: '',
    summary: '',
    href: '/',
    layoutType: 'mini',
    position: 0,
    isActive: true
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchBillboards();
    });
    return () => unsubscribe();
  }, [fetchBillboards]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createBillboard(formData);
    if (success) {
      toast.success('Billboard item created');
      setIsAdding(false);
      setFormData({ label: '', headline: '', summary: '', href: '/', layoutType: 'mini', position: 0, isActive: true });
    } else {
      toast.error('Failed to create item');
    }
  };

  const handleGenerateImage = async (id: string) => {
    toast.promise(generateImage(id), {
      loading: 'Generating newspaper illustration...',
      success: 'Image generated successfully',
      error: 'Failed to generate image'
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const success = await deleteBillboard(id);
      if (success) toast.success('Deleted successfully');
    }
  };

  return (
    <div className="billboard-admin">
      <div className="dashboard__title">
        <h2>Billboard Management</h2>
        <p>Control the newspaper navigation on the main /billboard page.</p>
      </div>

      <div className="mb-6">
        <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? 'secondary' : 'primary'}>
          {isAdding ? 'Cancel' : 'Add New Item'}
        </Button>
      </div>

      {isAdding && (
        <Card padded className="mb-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input 
              className="p-2 border" 
              placeholder="Label (e.g. Home)" 
              value={formData.label} 
              onChange={e => setFormData({...formData, label: e.target.value})} 
              required 
            />
            <input 
              className="p-2 border" 
              placeholder="Href (Slug e.g. /about)" 
              value={formData.href} 
              onChange={e => setFormData({...formData, href: e.target.value})} 
              required 
            />
            <input 
              className="p-2 border col-span-2" 
              placeholder="Headline" 
              value={formData.headline} 
              onChange={e => setFormData({...formData, headline: e.target.value})} 
              required 
            />
            <textarea 
              className="p-2 border col-span-2" 
              placeholder="Summary" 
              value={formData.summary} 
              onChange={e => setFormData({...formData, summary: e.target.value})} 
            />
            <select 
              className="p-2 border" 
              value={formData.layoutType} 
              onChange={e => setFormData({...formData, layoutType: e.target.value as any})}
            >
              <option value="lead">Lead (Featured)</option>
              <option value="middle">Middle (Standard)</option>
              <option value="mini">Mini (Sidebar)</option>
            </select>
            <input 
              type="number" 
              className="p-2 border" 
              placeholder="Position" 
              value={formData.position} 
              onChange={e => setFormData({...formData, position: parseInt(e.target.value)})} 
            />
            <Button type="submit" className="col-span-2">Create Item</Button>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {billboards.map(item => (
          <Card key={item.id} padded className="flex justify-between items-center">
            <div className="flex gap-4 items-center">
              {item.imageUrl && (
                <img src={item.imageUrl} alt="" className="w-16 h-16 object-cover border" />
              )}
              <div>
                <h4 className="font-bold">{item.label}: {item.headline}</h4>
                <p className="text-sm text-gray-500">{item.layoutType} | {item.href}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => handleGenerateImage(item.id)}>AI Image</Button>
              <Button size="sm" variant="secondary" onClick={() => handleDelete(item.id)}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
