'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { clientAppsService, ClientApp, ClientPermission } from '@/services/clientApps.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import AdminLoading from '@/app/admin/loading';

export default function ClientsPage() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [clients, setClients] = useState<ClientApp[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<ClientPermission[]>([]);
  const [error, setError] = useState('');
  
  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [appName, setAppName] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');

      const [clientsRes, permsRes] = await Promise.all([
        clientAppsService.list(token),
        clientAppsService.getAvailablePermissions()
      ]);

      if (clientsRes.success) setClients(clientsRes.data);
      if (permsRes.success) setAvailablePermissions(permsRes.data);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');

      const response = await clientAppsService.create({
        name: appName,
        url: appUrl,
        permissions: selectedPermissions,
        status: 'active'
      }, token);

      if (response.success) {
        setClients([...clients, response.data]);
        setShowCreateForm(false);
        setAppName('');
        setAppUrl('');
        setSelectedPermissions([]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const togglePermission = (key: string) => {
    setSelectedPermissions(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API client? Access will be revoked immediately.')) return;
    
    try {
      setActionLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');

      const res = await clientAppsService.delete(id, token);
      if (res.success) {
        setClients(clients.filter(c => c.id !== id));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <AdminLoading />;

  return (
    <div className="clients">
      <div className="dashboard__title">
        <h2>API Clients</h2>
        <p>Manage external applications and their permissions to access your data.</p>
      </div>

      <div className="dashboard__grid-layout">
        <div className="lg:col-span-2">
          {showCreateForm ? (
            <div className="card card--padded">
              <h3 className="dashboard__recent-item-title" style={{ marginBottom: '1.5rem' }}>Register New Application</h3>
              <form onSubmit={handleCreateApp} className="auth__fields">
                <div className="organization__form-group">
                  <label className="label">Application Name</label>
                  <Input 
                    placeholder="e.g. Personal Portfolio" 
                    value={appName} 
                    onChange={(e) => setAppName(e.target.value)} 
                    required
                  />
                </div>
                <div className="organization__form-group">
                  <label className="label">Client URL (Origin)</label>
                  <Input 
                    placeholder="https://nischaysharma.com" 
                    value={appUrl} 
                    onChange={(e) => setAppUrl(e.target.value)} 
                    required
                  />
                </div>
                
                <div className="organization__form-group">
                  <label className="label" style={{ marginBottom: '1rem' }}>Permissions Matrix</label>
                  <div className="permissions-grid" style={{ display: 'grid', gap: '0.75rem' }}>
                    {availablePermissions.map(perm => (
                      <div 
                        key={perm.key} 
                        onClick={() => togglePermission(perm.key)}
                        style={{ 
                          padding: '1rem', 
                          borderRadius: '0.75rem', 
                          border: `1px solid ${selectedPermissions.includes(perm.key) ? '#111' : '#eee'}`,
                          background: selectedPermissions.includes(perm.key) ? '#fafafa' : '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem'
                        }}
                      >
                        <div style={{ 
                          width: '1.25rem', 
                          height: '1.25rem', 
                          borderRadius: '0.25rem', 
                          border: '2px solid #111',
                          background: selectedPermissions.includes(perm.key) ? '#111' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {selectedPermissions.includes(perm.key) && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" style={{ width: '0.75rem' }}><path d="M5 13l4 4L19 7" /></svg>
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{perm.label}</div>
                          <div style={{ fontSize: '0.75rem', color: '#737373' }}>{perm.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {error && <p className="auth__error" style={{ marginBottom: '1rem' }}>{error}</p>}
                
                <div className="organization__actions">
                  <Button type="submit" variant="primary" className="btn--full" disabled={actionLoading}>
                    {actionLoading ? 'Registering...' : 'Register Application'}
                  </Button>
                  <Button type="button" variant="secondary" className="btn--full" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="card dashboard__recent">
              <div className="dashboard__recent-header">
                <h3>Whitelisted Applications</h3>
                <Button variant="primary" style={{ padding: '0.5rem 1rem', height: 'auto' }} onClick={() => setShowCreateForm(true)}>
                  + Register App
                </Button>
              </div>
              <div className="dashboard__recent-list">
                {clients.length > 0 ? (
                  clients.map((client, i) => (
                    <div key={i} className="dashboard__recent-item">
                      <div className="dashboard__recent-item-info">
                        <div className="dashboard__recent-item-title">{client.name}</div>
                        <div className="dashboard__recent-item-meta">
                          <span>{client.url}</span>
                          <span className="dot" />
                          <span>{client.permissions.length} Scopes</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                         <button 
                          className="btn btn--ghost" 
                          style={{ color: '#ff6b6b', padding: '0.5rem' }}
                          onClick={() => handleDelete(client.id!)}
                          disabled={actionLoading}
                        >
                          Revoke
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                    <p style={{ color: '#737373', marginBottom: '1.5rem' }}>No external applications registered yet.</p>
                    <Button variant="secondary" onClick={() => setShowCreateForm(true)}>Register your first app</Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="dashboard__sidebar-col">
          <div className="card card--padded">
            <h3 className="label" style={{ marginBottom: '1.5rem', display: 'block', fontSize: '0.625rem', fontWeight: 700, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.1em' }}>About API Clients</h3>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#737373' }}>
              Register external domains here to allow them to fetch data from your platform.
              <br /><br />
              <strong>Permissions Matrix:</strong> Use this to strictly control which routes each domain can access. For example, your portfolio might only need 'Read Articles' and 'Read Profile'.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
