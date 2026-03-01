'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { organizationsService, OrganizationData } from '@/services/organizations.service';
import { usersService } from '@/services/users.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function OrganizationPage() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [organization, setOrganization] = useState<OrganizationData | null>(null);
  const [allOrganizations, setAllOrganizations] = useState<(OrganizationData & { isOwner?: boolean; isMember?: boolean })[]>([]);
  const [error, setError] = useState('');
  
  // Form states
  const [orgName, setOrgName] = useState('');
  const [orgDescription, setOrgDescription] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Modal states
  const [showAddMember, setShowAddMember] = useState(false);
  const [showEditOrg, setShowEditOrg] = useState(false);
  
  // New member state
  const [newMemberId, setNewMemberId] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('user');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');

      // 1. Get current user's profile
      const userProfile = await usersService.getMe(token);
      
      if (userProfile.success && userProfile.data.organizationId) {
        const orgResponse = await organizationsService.getById(userProfile.data.organizationId, token);
        if (orgResponse.success) {
          setOrganization(orgResponse.data);
          setOrgName(orgResponse.data.name);
          setOrgDescription(orgResponse.data.description || '');
          setLoading(false);
          return;
        }
      }

      // 2. If no linked org, fetch all organizations
      const allOrgsResponse = await organizationsService.list(token);
      if (allOrgsResponse.success) {
        setAllOrganizations(allOrgsResponse.data);
      }

    } catch (err: any) {
      console.error('Error fetching organization data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnterWorkspace = async (orgId: string) => {
    try {
      setActionLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');

      const response = await organizationsService.join(orgId, token);
      if (response.success) {
        // Re-fetch to load the full workspace
        fetchData();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');

      const response = await organizationsService.create({
        name: orgName,
        description: orgDescription
      }, token);

      if (response.success) {
        setOrganization(response.data);
        setShowCreateForm(false);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;
    try {
      setActionLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');

      const response = await organizationsService.addMember(organization.id, {
        userId: newMemberId,
        role: newMemberRole
      }, token);

      if (response.success) {
        setOrganization(response.data);
        setShowAddMember(false);
        setNewMemberId('');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;
    try {
      setActionLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');

      const response = await organizationsService.update(organization.id, {
        name: orgName,
        description: orgDescription
      }, token);

      if (response.success) {
        setOrganization(response.data);
        setShowEditOrg(false);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading organization settings...</div>;
  }

  // View 1: User has no organization
  if (!organization) {
    return (
      <div className="organization">
        <div className="dashboard__title">
          <h2>Organizations</h2>
          <p>You are not currently associated with an organization.</p>
        </div>
        
        <div className="dashboard__grid-layout">
          <div className="lg:col-span-2">
            {showCreateForm ? (
              <div className="card card--padded">
                <h3 className="dashboard__recent-item-title" style={{ marginBottom: '1.5rem' }}>Create New Organization</h3>
                <form onSubmit={handleCreateOrganization} className="auth__fields">
                  <div className="organization__form-group">
                    <label className="label">Organization Name</label>
                    <Input 
                      placeholder="e.g. TaughtCode Team" 
                      value={orgName} 
                      onChange={(e) => setOrgName(e.target.value)} 
                      required
                    />
                  </div>
                  <div className="organization__form-group">
                    <label className="label">Description (Optional)</label>
                    <Input 
                      placeholder="Tell us about your organization" 
                      value={orgDescription} 
                      onChange={(e) => setOrgDescription(e.target.value)}
                    />
                  </div>
                  {error && <p className="auth__error" style={{ marginBottom: '1rem' }}>{error}</p>}
                  <div className="organization__actions">
                    <Button type="submit" variant="primary" className="btn--full" disabled={actionLoading}>
                      {actionLoading ? 'Creating...' : 'Confirm & Create'}
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
                  <h3>Available Organizations</h3>
                  <Button variant="primary" style={{ padding: '0.5rem 1rem', height: 'auto' }} onClick={() => setShowCreateForm(true)}>
                    + New
                  </Button>
                </div>
                <div className="dashboard__recent-list">
                  {allOrganizations.length > 0 ? (
                    allOrganizations.map((org, i) => (
                      <div key={i} className="dashboard__recent-item">
                        <div className="dashboard__recent-item-info">
                          <div className="dashboard__recent-item-title">{org.name}</div>
                          <div className="dashboard__recent-item-meta">
                            <span>{org.type}</span>
                            <span className="dot" />
                            <span>{org.members?.length || 0} Members</span>
                          </div>
                        </div>
                        {org.isMember ? (
                          <Button 
                            variant="primary" 
                            style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}
                            onClick={() => handleEnterWorkspace(org.id!)}
                            disabled={actionLoading}
                          >
                            Enter
                          </Button>
                        ) : (
                          <Button variant="secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}>
                            Request
                          </Button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                      <p style={{ color: '#737373', marginBottom: '1.5rem' }}>No organizations have been created yet.</p>
                      <Button variant="primary" onClick={() => setShowCreateForm(true)}>Create the first one</Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // View 2: User has an organization
  return (
    <div className="organization">
      <div className="dashboard__title">
        <h2>Organization Settings</h2>
        <p>Manage <strong>{organization.name}</strong> and team members.</p>
      </div>

      <div className="dashboard__grid-layout">
        <div className="lg:col-span-2">
          
          {/* Add Member Form */}
          {showAddMember && (
            <div className="card card--padded" style={{ marginBottom: '2rem', border: '1px solid #000' }}>
              <h3 className="dashboard__recent-item-title" style={{ marginBottom: '1.5rem' }}>Add New Member</h3>
              <form onSubmit={handleAddMember} className="auth__fields">
                <div className="organization__form-group">
                  <label className="label">User ID</label>
                  <Input 
                    placeholder="Enter User UID" 
                    value={newMemberId} 
                    onChange={(e) => setNewMemberId(e.target.value)} 
                    required
                  />
                </div>
                <div className="organization__form-group">
                  <label className="label">Role</label>
                  <select 
                    value={newMemberRole} 
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className="input"
                    style={{ background: '#fff' }}
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="organization__actions">
                  <Button type="submit" variant="primary" className="btn--full" disabled={actionLoading}>
                    {actionLoading ? 'Adding...' : 'Add Member'}
                  </Button>
                  <Button type="button" variant="secondary" className="btn--full" onClick={() => setShowAddMember(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Members List */}
          <div className="card dashboard__recent" style={{ marginBottom: '2rem' }}>
            <div className="dashboard__recent-header">
              <h3>Members</h3>
              <button className="btn btn--secondary" style={{ padding: '0.5rem 1rem', height: 'auto' }} onClick={() => setShowAddMember(true)}>
                + Add Member
              </button>
            </div>
            <div className="dashboard__recent-list">
              {organization.members?.map((member, i) => (
                <div key={i} className="dashboard__recent-item">
                  <div className="dashboard__recent-item-info">
                    <div className="dashboard__recent-item-title">{member.userId}</div>
                    <div className="dashboard__recent-item-meta">
                      <span>Joined {new Date(member.addedAt || '').toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className={`badge badge--${member.role === 'admin' ? 'published' : 'draft'}`}>
                      {member.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dashboard__sidebar-col">
          {showEditOrg ? (
            <div className="card card--padded">
              <h3 className="label" style={{ marginBottom: '1.5rem' }}>Edit Details</h3>
              <form onSubmit={handleUpdateOrg} className="auth__fields">
                <div className="organization__form-group">
                  <label className="label">Name</label>
                  <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} required />
                </div>
                <div className="organization__form-group">
                  <label className="label">Description</label>
                  <Input value={orgDescription} onChange={(e) => setOrgDescription(e.target.value)} />
                </div>
                <div className="organization__actions">
                  <Button type="submit" variant="primary" className="btn--full">Save</Button>
                  <Button type="button" variant="secondary" className="btn--full" onClick={() => setShowEditOrg(false)}>Cancel</Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="card card--padded">
              <h3 className="label" style={{ marginBottom: '1.5rem', display: 'block', fontSize: '0.625rem', fontWeight: 700, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Organization Details</h3>
              <div className="stat-group">
                <span className="label">Type</span>
                <p className="value">{organization.type || 'Standard'}</p>
              </div>
              <div className="stat-group">
                <span className="label">Description</span>
                <p className="description">
                  {organization.description || 'No description provided.'}
                </p>
              </div>
              {error && <p className="auth__error" style={{ marginTop: '1rem' }}>{error}</p>}
              <Button variant="secondary" className="btn--full" style={{ marginTop: '1.5rem' }} onClick={() => setShowEditOrg(true)}>
                Edit Details
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
