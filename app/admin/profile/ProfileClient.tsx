'use client';

import React, { useState, useEffect, useRef } from 'react';
import { auth } from '@/lib/firebase';
import { usersService } from '@/services/users.service';
import { integrationsService, IntegrationsList } from '@/services/integrations.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import AdminLoading from '@/app/admin/loading';
import { format } from 'date-fns';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ProfileClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncingRepos, setSyncingRepos] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [integrations, setIntegrations] = useState<IntegrationsList>({});
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [displayName, setDisplayName] = useState('');
  const [occupation, setOccupation] = useState('');
  const [bio, setBio] = useState('');
  const [writingStyle, setWritingStyle] = useState('casual');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [expertise, setExpertise] = useState<string[]>([]);
  const [expertiseInput, setExpertiseInput] = useState('');
  const [socialLinks, setSocialLinks] = useState({ twitter: '', linkedin: '', github: '', website: '' });
  const [projects, setProjects] = useState<{title: string, description: string, link?: string}[]>([]);
  const [newProject, setNewProject] = useState({title: '', description: '', link: ''});

  useEffect(() => {
    fetchProfile();
    fetchIntegrations();
    
    // Handle OAuth results from URL
    const success = searchParams.get('integration_success');
    const error = searchParams.get('integration_error');
    
    if (success) {
      toast.success(`Successfully connected to ${success}!`);
      fetchIntegrations(); // Refresh immediately
      // Clean URL
      router.replace('/admin/profile');
    } else if (error) {
      toast.error(`Connection failed: ${error}`);
      router.replace('/admin/profile');
    }
  }, [searchParams]);

  const fetchProfile = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      
      const response = await usersService.getMe(token);
      if (response.success) {
        const userData = response.data;
        setUser(userData);
        setDisplayName(userData.displayName || '');
        setOccupation(userData.occupation || '');
        setBio(userData.bio || '');
        setWritingStyle(userData.writingStyle || 'casual');
        setSkills(userData.skills || []);
        setExpertise(userData.expertise || []);
        setSocialLinks(userData.socialLinks || { twitter: '', linkedin: '', github: '', website: '' });
        setProjects(userData.projects || []);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchIntegrations = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const res = await integrationsService.list(token);
      if (res.success) setIntegrations(res.data);
    } catch (err) {
      console.error('Error fetching integrations:', err);
    }
  };

  const handleConnect = async (provider: 'github' | 'linkedin') => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const res = await integrationsService.initiateAuth(provider, token);
      if (res.success && res.authUrl) {
        window.location.href = res.authUrl;
      }
    } catch (err: any) {
      toast.error(`Failed to initiate ${provider} connection: ` + err.message);
    }
  };

  const handleDisconnect = async (provider: 'github' | 'linkedin') => {
    if (!confirm(`Are you sure you want to disconnect ${provider}?`)) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const res = await integrationsService.remove(provider, token);
      if (res.success) {
        toast.success(`Disconnected from ${provider}`);
        fetchIntegrations();
      }
    } catch (err: any) {
      toast.error(`Failed to disconnect ${provider}: ` + err.message);
    }
  };

  const handleSyncGitHubRepos = async () => {
    try {
      setSyncingRepos(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const res = await integrationsService.syncGitHubProjects(token);
      if (res.success && Array.isArray(res.data)) {
        // Map top 5 starred/updated repos that aren't already in projects
        const currentLinks = projects.map(p => p.link);
        const newProjectsFromGit = res.data
          .filter(repo => !currentLinks.includes(repo.link))
          .slice(0, 5)
          .map(repo => ({
            title: repo.title,
            description: repo.description,
            link: repo.link
          }));

        if (newProjectsFromGit.length > 0) {
          const updatedProjects = [...projects, ...newProjectsFromGit];
          setProjects(updatedProjects);
          
          // Persist to server automatically
          await usersService.updateMe({ projects: updatedProjects } as any, token);
          
          toast.success(`Synced ${newProjectsFromGit.length} projects from GitHub!`);
        } else {
          toast.info('All your GitHub projects are already listed.');
        }
      }
    } catch (err: any) {
      toast.error('Failed to sync projects: ' + err.message);
    } finally {
      setSyncingRepos(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const response = await usersService.updateMe({
        displayName,
        occupation,
        bio,
        writingStyle,
        skills,
        expertise,
        socialLinks,
        projects
      } as any, token);

      if (response.success) {
        setUser(response.data);
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (err: any) {
      toast.error('Error updating profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (type: 'photo' | 'cover' | 'gallery', file: File) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      if (type === 'photo') {
        setUploadingPhoto(true);
        const res = await usersService.updateProfilePicture(file, token);
        if (res.success) setUser(res.data);
        toast.success('Profile picture updated');
      } else if (type === 'cover') {
        setUploadingCover(true);
        const res = await usersService.updateCoverPhoto(file, token);
        if (res.success) setUser(res.data);
        toast.success('Cover photo updated');
      } else if (type === 'gallery') {
        setUploadingGallery(true);
        const res = await usersService.addGalleryAsset(file, { title: file.name }, token);
        if (res.success) setUser(res.data);
        toast.success('Asset added to gallery');
      }
    } catch (err: any) {
      toast.error(`Error uploading ${type}: ` + err.message);
    } finally {
      setUploadingPhoto(false);
      setUploadingCover(false);
      setUploadingGallery(false);
    }
  };

  const handleDeleteGalleryAsset = async (url: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const res = await usersService.deleteGalleryAsset(url, token);
      if (res.success) {
        setUser(res.data);
        toast.success('Asset removed from gallery');
      }
    } catch (err: any) {
      toast.error('Error removing asset: ' + err.message);
    }
  };

  // Array Handlers
  const handleAddTag = (e: React.KeyboardEvent, type: 'skills' | 'expertise') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = type === 'skills' ? skillInput.trim() : expertiseInput.trim();
      const list = type === 'skills' ? skills : expertise;
      
      if (input && !list.includes(input)) {
        if (type === 'skills') {
          setSkills([...skills, input]);
          setSkillInput('');
        } else {
          setExpertise([...expertise, input]);
          setExpertiseInput('');
        }
      }
    }
  };

  const removeTag = (tag: string, type: 'skills' | 'expertise') => {
    if (type === 'skills') {
      setSkills(skills.filter(s => s !== tag));
    } else {
      setExpertise(expertise.filter(e => e !== tag));
    }
  };

  const addProject = () => {
    if (newProject.title.trim() && newProject.description.trim()) {
      setProjects([...projects, { ...newProject }]);
      setNewProject({ title: '', description: '', link: '' });
    }
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  if (loading) return <AdminLoading />;

  return (
    <div className="profile-admin">
      <div className="dashboard__title">
        <h2>Your Identity</h2>
        <p>Manage your public persona, assets, and professional background.</p>
      </div>

      {/* Hero / Cover Section */}
      <div className="card" style={{ marginBottom: '2rem', overflow: 'hidden' }}>
        <div 
          className="profile-admin__cover"
          style={{ 
            height: '240px', 
            background: user?.coverURL ? `url(${user.coverURL}) center/cover` : '#eee',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
             <input type="file" ref={coverInputRef} hidden accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload('cover', e.target.files[0])} />
             <Button variant="secondary" onClick={() => coverInputRef.current?.click()} loading={uploadingCover}>
               <i className="ph ph-image" style={{ marginRight: '0.5rem' }} />
               Change Cover
             </Button>
          </div>
        </div>

        <div style={{ padding: '0 2rem 2rem 2rem', display: 'flex', gap: '2rem', position: 'relative' }}>
          <div style={{ marginTop: '-4rem' }}>
            <div 
              style={{
                width: '120px', height: '120px', 
                borderRadius: '50%', 
                background: user?.photoURL ? `url(${user.photoURL}) center/cover` : '#ccc',
                border: '4px solid var(--color-bg-primary)',
                position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {!user?.photoURL && <span style={{ fontSize: '3rem', color: '#fff', fontWeight: 800 }}>{displayName[0] || 'U'}</span>}
              <button 
                className="profile-admin__photo-btn"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
              >
                <i className={uploadingPhoto ? "ph ph-spinner animate-spin" : "ph ph-camera"} />
              </button>
              <input type="file" ref={photoInputRef} hidden accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload('photo', e.target.files[0])} />
            </div>
          </div>
          
          <div style={{ paddingTop: '1rem', flex: 1 }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{displayName || 'Anonymous'}</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>{user?.email} • {user?.role}</p>
          </div>
        </div>
      </div>

      <div className="dashboard__grid-layout">
        <div className="dashboard__grid-main">
          <form onSubmit={handleUpdateProfile} className="card card--padded">
            <h3 className="label" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>Personal Information</h3>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="label">Display Name</label>
              <Input 
                type="text" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. John Doe"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="label">Occupation / Title</label>
              <Input 
                type="text" 
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="label">Biography</label>
              <textarea 
                className="input"
                style={{ minHeight: '120px', resize: 'vertical', padding: '1rem' }}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                maxLength={1000}
              />
            </div>

            <div className="form-divider" style={{ borderTop: '1px solid var(--color-border)', margin: '2rem 0' }}></div>
            
            <h3 className="label" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>Professional Profile</h3>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="label">Technical Skills</label>
              <Input 
                type="text" 
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => handleAddTag(e, 'skills')}
                placeholder="Press Enter to add (e.g., React, Go, Firebase)"
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                {skills.map(s => (
                  <span key={s} className="badge badge--draft" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem' }}>
                    {s}
                    <i className="ph ph-x" style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => removeTag(s, 'skills')} />
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="label">Subject Matter Expertise</label>
              <Input 
                type="text" 
                value={expertiseInput}
                onChange={(e) => setExpertiseInput(e.target.value)}
                onKeyDown={(e) => handleAddTag(e, 'expertise')}
                placeholder="Press Enter to add (e.g., System Design, SEO, Leadership)"
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                {expertise.map(e => (
                  <span key={e} className="badge badge--published" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem' }}>
                    {e}
                    <i className="ph ph-x" style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => removeTag(e, 'expertise')} />
                  </span>
                ))}
              </div>
            </div>

            <div className="form-divider" style={{ borderTop: '1px solid var(--color-border)', margin: '2rem 0' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="label" style={{ margin: 0, fontSize: '0.875rem' }}>Featured Projects</h3>
              {integrations.github?.connected && (
                <Button 
                  variant="ghost" 
                  style={{ fontSize: '0.7rem' }} 
                  onClick={handleSyncGitHubRepos}
                  loading={syncingRepos}
                >
                  <i className="ph ph-arrow-counter-clockwise" style={{ marginRight: '0.4rem' }} />
                  Sync from GitHub
                </Button>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'grid', gap: '1rem', padding: '1.5rem', background: 'var(--color-bg-tertiary)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                <Input 
                  type="text" 
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                  placeholder="Project Title"
                />
                <textarea 
                  className="input"
                  style={{ minHeight: '80px', padding: '0.75rem', resize: 'vertical' }}
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  placeholder="Short project description..."
                />
                <Input 
                  type="url" 
                  value={newProject.link}
                  onChange={(e) => setNewProject({...newProject, link: e.target.value})}
                  placeholder="Link (Optional) - https://..."
                />
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={addProject}
                  disabled={!newProject.title || !newProject.description}
                >
                  <i className="ph ph-plus" style={{ marginRight: '0.4rem' }} />
                  <span>Add Project</span>
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {projects.length === 0 && <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>No projects added yet.</p>}
                {projects.map((project, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    padding: '1rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: '0.5rem',
                    background: 'var(--color-bg-primary)'
                  }}>
                    <div style={{ flex: 1, minWidth: 0, paddingRight: '1rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{project.title}</h4>
                      <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{project.description}</p>
                      {project.link && <a href={project.link} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--color-text-primary)', textDecoration: 'underline' }}>{project.link}</a>}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeProject(index)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: '0.2rem' }}
                    >
                      <i className="ph ph-trash" style={{ fontSize: '1.25rem' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-divider" style={{ borderTop: '1px solid var(--color-border)', margin: '2rem 0' }}></div>
            
            <h3 className="label" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>Social Links</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="form-group">
                <label className="label"><i className="ph ph-link" /> Website</label>
                <Input value={socialLinks.website} onChange={e => setSocialLinks({...socialLinks, website: e.target.value})} placeholder="https://" />
              </div>
              <div className="form-group">
                <label className="label"><i className="ph ph-github-logo" /> GitHub</label>
                <Input value={socialLinks.github} onChange={e => setSocialLinks({...socialLinks, github: e.target.value})} placeholder="github.com/..." />
              </div>
              <div className="form-group">
                <label className="label"><i className="ph ph-twitter-logo" /> Twitter / X</label>
                <Input value={socialLinks.twitter} onChange={e => setSocialLinks({...socialLinks, twitter: e.target.value})} placeholder="x.com/..." />
              </div>
              <div className="form-group">
                <label className="label"><i className="ph ph-linkedin-logo" /> LinkedIn</label>
                <Input value={socialLinks.linkedin} onChange={e => setSocialLinks({...socialLinks, linkedin: e.target.value})} placeholder="linkedin.com/in/..." />
              </div>
            </div>

            <Button type="submit" variant="primary" className="btn--full" loading={saving}>
              <i className="ph ph-floppy-disk" style={{ marginRight: '0.5rem' }} />
              Save Changes
            </Button>
          </form>
        </div>

        {/* Sidebar Column */}
        <div className="dashboard__sidebar-col">
          
          <div className="card card--padded">
            <h3 className="label" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>External Connections</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* GitHub */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: '0.5rem', background: 'var(--color-bg-tertiary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <i className="ph ph-github-logo" style={{ fontSize: '1.25rem' }} />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>GitHub</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                      {integrations.github?.connected ? `@${integrations.github.accountName}` : 'Not connected'}
                    </div>
                  </div>
                </div>
                {integrations.github?.connected ? (
                  <button onClick={() => handleDisconnect('github')} style={{ background: 'none', border: 'none', color: 'var(--color-error)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>Disconnect</button>
                ) : (
                  <button onClick={() => handleConnect('github')} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>Connect</button>
                )}
              </div>

              {/* LinkedIn */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: '0.5rem', background: 'var(--color-bg-tertiary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <i className="ph ph-linkedin-logo" style={{ fontSize: '1.25rem' }} />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>LinkedIn</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                      {integrations.linkedin?.connected ? 'Connected' : 'Not connected'}
                    </div>
                  </div>
                </div>
                {integrations.linkedin?.connected ? (
                  <button onClick={() => handleDisconnect('linkedin')} style={{ background: 'none', border: 'none', color: 'var(--color-error)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>Disconnect</button>
                ) : (
                  <button onClick={() => handleConnect('linkedin')} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>Connect</button>
                )}
              </div>
            </div>
          </div>

          <div className="card card--padded">
            <h3 className="label" style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>AI Persona Settings</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              This defines how the AI ghostwriter structures and tones your content when generating articles and books.
            </p>
            
            <div className="form-group">
              <label className="label">Writing Style</label>
              <select 
                className="input" 
                value={writingStyle} 
                onChange={e => setWritingStyle(e.target.value)}
                style={{ width: '100%', cursor: 'pointer', background: 'var(--color-bg-tertiary)' }}
              >
                <option value="casual">Casual & Approachable</option>
                <option value="professional">Strictly Professional</option>
                <option value="technical">Highly Technical & Dense</option>
                <option value="storyteller">Storyteller / Narrative</option>
                <option value="academic">Academic & Cited</option>
                <option value="witty">Witty & Engaging</option>
              </select>
            </div>
          </div>

          <div className="card dashboard__recent" style={{ marginTop: '1.5rem' }}>
            <div className="dashboard__recent-header">
              <h3>Media Gallery</h3>
              <input type="file" ref={galleryInputRef} hidden accept="image/*,video/*" onChange={(e) => e.target.files?.[0] && handleFileUpload('gallery', e.target.files[0])} />
              <button onClick={() => galleryInputRef.current?.click()} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: uploadingGallery ? 0.5 : 1 }}>
                 {uploadingGallery ? <i className="ph ph-spinner animate-spin" /> : <i className="ph ph-upload-simple" />} Add Media
              </button>
            </div>
            <div className="dashboard__recent-list" style={{ padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {user?.gallery && user.gallery.length > 0 ? (
                user.gallery.map((asset: any, i: number) => (
                  <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '0.5rem', overflow: 'hidden', background: '#eee', border: '1px solid var(--color-border)' }}>
                    <img src={asset.url} alt={asset.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', background: 'rgba(0,0,0,0.5)', padding: '0.2rem', borderRadius: '50%', display: 'flex', cursor: 'pointer' }} onClick={() => handleDeleteGalleryAsset(asset.url)}>
                      <i className="ph ph-trash" style={{ color: '#fff', fontSize: '0.75rem' }} />
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: 'span 2', padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                  No media uploaded yet.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        .profile-admin__photo-btn {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--color-text-primary);
          color: var(--color-bg-primary);
          border: 3px solid var(--color-bg-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .profile-admin__photo-btn:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
