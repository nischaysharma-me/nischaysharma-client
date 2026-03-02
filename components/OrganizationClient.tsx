'use client';

import React, { useState } from 'react';
import { auth } from '@/lib/firebase';
import { OrganizationData } from '@/services/organizations.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  createOrganizationAction, 
  updateOrganizationAction 
} from '@/actions/organizations';
import { organizationsService } from '@/services/organizations.service';
import AdminLoading from '@/app/admin/loading';

interface OrganizationClientProps {
  initialOrg: OrganizationData | null;
  availableOrgs: any[];
}

export default function OrganizationClient({ initialOrg, availableOrgs }: OrganizationClientProps) {
  const [organization, setOrganization] = useState<OrganizationData | null>(initialOrg);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form states
  const [orgName, setOrgName] = useState(initialOrg?.name || '');
  const [orgDescription, setOrgDescription] = useState(initialOrg?.description || '');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showEditOrg, setShowEditOrg] = useState(false);
  
  const [newMemberId, setNewMemberId] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('user');

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');

      const response = await createOrganizationAction({
        name: orgName,
        description: orgDescription
      }, token);

      if (response.success && 'data' in response) {
        setOrganization(response.data as OrganizationData);
        setShowCreateForm(false);
      } else {
        setError('error' in response ? (response as any).error : 'Failed to create');
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

      if (response.success && response.data) {
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

      const response = await updateOrganizationAction(organization.id, {
        name: orgName,
        description: orgDescription
      }, token);

      if (response.success && 'data' in response) {
        setOrganization(response.data as OrganizationData);
        setShowEditOrg(false);
      } else {
        setError('error' in response ? (response as any).error : 'Failed to update');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (actionLoading) {
    return <AdminLoading />;
  }

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
                   {availableOrgs && availableOrgs.length > 0 ? (
                    availableOrgs.map((org, i) => (
                      <div key={i} className="dashboard__recent-item">
                        <div className="dashboard__recent-item-info">
                          <div className="dashboard__recent-item-title">{org.name}</div>
                        </div>
                        <Button variant="secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}>
                          Request Access
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                      <p style={{ color: '#737373', marginBottom: '1.5rem' }}>No organizations found.</p>
                      <Button variant="primary" onClick={() => setShowCreateForm(true)}>Create First One</Button>
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
            <div className="card card--padded" style={{ marginBottom: '2rem', border: '1px solid #111' }}>
              <h3 className="dashboard__recent-item-title" style={{ marginBottom: '1.5rem' }}>Add New Member</h3>
              <form onSubmit={handleAddMember} className="auth__fields">
                <div className="organization__form-group">
                  <label className="label">User ID</label>
                  <Input value={newMemberId} onChange={(e) => setNewMemberId(e.target.value)} required />
                </div>
                <div className="organization__actions">
                  <Button type="submit" variant="primary" className="btn--full" disabled={actionLoading}>Add Member</Button>
                  <Button type="button" variant="secondary" className="btn--full" onClick={() => setShowAddMember(false)}>Cancel</Button>
                </div>
              </form>
            </div>
          )}

          {/* Members List */}
          <div className="card dashboard__recent">
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
                    <div className="dashboard__recent-item-meta">Joined {new Date(member.addedAt || '').toLocaleDateString()}</div>
                  </div>
                  <span className={`badge badge--${member.role === 'admin' ? 'published' : 'draft'}`}>
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dashboard__sidebar-col">
          <div className="card card--padded">
            <h3 className="label" style={{ marginBottom: '1.5rem' }}>Organization Details</h3>
            <div className="stat-group">
              <span className="label">Name</span>
              <p className="value">{organization.name}</p>
            </div>
            <div className="stat-group">
              <span className="label">Description</span>
              <p className="description">{organization.description || 'N/A'}</p>
            </div>
            <Button variant="secondary" className="btn--full" style={{ marginTop: '1.5rem' }} onClick={() => setShowEditOrg(true)}>
              Edit Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
