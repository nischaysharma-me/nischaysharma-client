'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { usersService } from '@/services/users.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import AdminLoading from '@/app/admin/loading';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const response = await usersService.getMe(token);
      if (response.success && response.data) {
        setDisplayName(response.data.displayName || '');
        setBio(response.data.bio || '');
        setEmail(response.data.email || '');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const response = await usersService.updateMe({ displayName, bio }, token);
      if (response.success) {
        alert('Profile updated successfully!');
      }
    } catch (err: any) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLoading />;

  return (
    <div className="profile">
      <div className="dashboard__title">
        <h2>User Profile</h2>
        <p>Manage your identity and preferences.</p>
      </div>
      
      <div className="card card--padded" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleUpdate} className="auth__fields">
          <div className="organization__form-group">
            <label className="label">Public Display Name</label>
            <Input 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)} 
              required 
            />
          </div>

          <div className="organization__form-group" style={{ marginTop: '1.5rem' }}>
            <label className="label">Email Address (Read Only)</label>
            <Input value={email} readOnly style={{ opacity: 0.6 }} />
          </div>

          <div className="organization__form-group" style={{ marginTop: '1.5rem' }}>
            <label className="label">Short Biography</label>
            <textarea 
              className="input" 
              style={{ height: '120px', resize: 'none', padding: '0.75rem' }}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
            />
          </div>

          <Button type="submit" variant="primary" className="btn--full" style={{ marginTop: '2rem' }} disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </Button>
        </form>
      </div>
    </div>
  );
}
