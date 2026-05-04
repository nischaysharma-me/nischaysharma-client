'use client';

import React, { useState, useEffect, useRef } from 'react';
import { auth } from '@/lib/firebase';
import { usersService } from '@/services/users.service';
import { articlesService } from '@/services/articles.service';
import { booksService } from '@/services/books.service';
import { integrationsService, IntegrationsList } from '@/services/integrations.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import AdminLoading from '@/app/admin/loading';
import { format } from 'date-fns';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfileClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncingRepos, setSyncingRepos] = useState(false);
  const [syncingStats, setSyncingStats] = useState<'github' | 'linkedin' | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [integrations, setIntegrations] = useState<IntegrationsList>({});
  const [connectingProvider, setConnectingProvider] = useState<'github' | 'linkedin' | null>(null);
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);
  const experienceInputRef = useRef<HTMLInputElement>(null);
  const editExperienceInputRef = useRef<HTMLInputElement>(null);
  const educationInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState(auth.currentUser?.email || '');
  const [occupation, setOccupation] = useState('');
  const [bio, setBio] = useState('');
  const [vision, setVision] = useState('');
  const [writingStyle, setWritingStyle] = useState('casual');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [expertise, setExpertise] = useState<string[]>([]);
  const [expertiseInput, setExpertiseInput] = useState('');
  const [socialLinks, setSocialLinks] = useState({ twitter: '', linkedin: '', github: '', website: '' });
  
  const [projects, setProjects] = useState<{title: string, description: string, link?: string, image?: string}[]>([]);
  const [newProject, setNewProject] = useState({title: '', description: '', link: '', image: ''});
  
  const [experience, setExperience] = useState<any[]>([]);
  const [newExperience, setNewExperience] = useState({ title: '', company: '', startDate: '', endDate: '', description: '', logo: '' });
  const [editingExperienceIndex, setEditingExperienceIndex] = useState<number | null>(null);
  const [editExperience, setEditExperience] = useState({ title: '', company: '', startDate: '', endDate: '', description: '', logo: '' });
  
  const [education, setEducation] = useState<any[]>([]);
  const [newEducation, setNewEducation] = useState({ school: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', logo: '' });
  
  const [syncingProfile, setSyncingProfile] = useState(false);
  const [isUploadingNested, setIsUploadingNested] = useState<'project' | 'experience' | 'education' | null>(null);

  const [featured, setFeatured] = useState<{id: string, type: 'article' | 'book', title: string}[]>([]);
  const [showFeaturedModal, setShowFeaturedModal] = useState(false);
  const [availableItems, setAvailableItems] = useState<{id: string, type: 'article' | 'book', title: string}[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [configModal, setConfigModal] = useState<'github' | 'linkedin' | null>(null);
  const [tempConfig, setTempConfig] = useState({ clientId: '', clientSecret: '' });
  const [featuredSearch, setFeaturedSearch] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchIntegrations();
    
    const success = searchParams.get('integration_success');
    const error = searchParams.get('integration_error');
    
    if (success) {
      toast.success(`Successfully connected to ${success}!`);
      fetchIntegrations();
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
        setEmail(userData.email || auth.currentUser?.email || '');
        setOccupation(userData.occupation || '');
        setBio(userData.bio || '');
        setVision(userData.vision || '');
        setExperience(userData.experience || []);
        setEducation(userData.education || []);
        setWritingStyle(userData.writingStyle || 'casual');
        setSkills(userData.skills || []);
        setExpertise(userData.expertise || []);
        setSocialLinks(userData.socialLinks || { twitter: '', linkedin: '', github: '', website: '' });
        setProjects(userData.projects || []);
        setFeatured(userData.featured || []);
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
    const currentIntegrations = integrations as any;
    if (!currentIntegrations[provider]?.clientId) {
      setTempConfig({ 
        clientId: currentIntegrations[provider]?.clientId || '', 
        clientSecret: currentIntegrations[provider]?.clientSecret || '' 
      });
      setConfigModal(provider);
      return;
    }

    try {
      setConnectingProvider(provider);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const res = await integrationsService.initiateAuth(provider, token);
      if (res.success && res.authUrl) {
        window.location.href = res.authUrl;
      } else {
        setConnectingProvider(null);
      }
    } catch (err: any) {
      toast.error(`Failed to initiate ${provider} connection: ` + err.message);
      setConnectingProvider(null);
    }
  };

  const handleSaveConfig = async () => {
    if (!configModal) return;
    try {
      const updatedIntegrations = {
        ...integrations,
        [configModal]: {
          ...(integrations[configModal] || {}),
          ...tempConfig
        }
      };
      setIntegrations(updatedIntegrations);

      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      
      const response = await usersService.updateMe({
        integrations: updatedIntegrations
      } as any, token);

      if (response.success) {
        toast.success(`${configModal} configuration saved!`);
        setConfigModal(null);
        fetchProfile();
        fetchIntegrations();
      }
    } catch (err: any) {
      toast.error('Failed to save configuration: ' + err.message);
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
        const currentLinks = projects.map(p => p.link);
        const newProjectsFromGit = res.data
          .filter(repo => !currentLinks.includes(repo.link))
          .slice(0, 5)
          .map(repo => ({
            title: repo.title,
            description: repo.description,
            link: repo.link,
            image: ''
          }));

        if (newProjectsFromGit.length > 0) {
          const updatedProjects = [...projects, ...newProjectsFromGit];
          setProjects(updatedProjects);
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

  const handleSyncStats = async (provider: 'github' | 'linkedin') => {
    try {
      setSyncingStats(provider);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const res = await integrationsService.syncStats(provider, token);
      if (res.success) {
        toast.success(`Successfully synced ${provider} stats!`);
        fetchProfile();
      }
    } catch (err: any) {
      toast.error(`Failed to sync ${provider} stats: ` + err.message);
    } finally {
      setSyncingStats(null);
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
        email: email || auth.currentUser?.email,
        occupation,
        bio,
        vision,
        writingStyle,
        skills,
        expertise,
        socialLinks,
        projects,
        experience,
        education,
        featured
      } as any, token);

      if (response.success) {
        setUser(response.data);
        toast.success('Profile updated successfully!');
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

  const handleNestedFileUpload = async (type: 'project' | 'experience' | 'education', file: File) => {
    try {
      setIsUploadingNested(type);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const folder = type === 'project' ? 'projects' : 'logos';
      const res = await usersService.uploadAsset(file, folder, token);
      
      if (res.success) {
        if (type === 'project') setNewProject({ ...newProject, image: res.url });
        else if (type === 'experience') {
          if (editingExperienceIndex !== null) {
            setEditExperience({ ...editExperience, logo: res.url });
          } else {
            setNewExperience({ ...newExperience, logo: res.url });
          }
        }
        else if (type === 'education') setNewEducation({ ...newEducation, logo: res.url });
        toast.success(`${type} image uploaded`);
      }
    } catch (err: any) {
      toast.error(`Upload failed: ${err.message}`);
    } finally {
      setIsUploadingNested(null);
    }
  };

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
    if (type === 'skills') setSkills(skills.filter(s => s !== tag));
    else setExpertise(expertise.filter(e => e !== tag));
  };

  const addProject = () => {
    if (newProject.title.trim() && newProject.description.trim()) {
      setProjects([...projects, { ...newProject }]);
      setNewProject({ title: '', description: '', link: '', image: '' });
    }
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const addExperience = () => {
    if (newExperience.title && newExperience.company) {
      setExperience([...experience, { ...newExperience }]);
      setNewExperience({ title: '', company: '', startDate: '', endDate: '', description: '', logo: '' });
    }
  };

  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const startEditExperience = (index: number) => {
    setEditExperience({ ...experience[index] });
    setEditingExperienceIndex(index);
  };

  const saveEditExperience = () => {
    if (editingExperienceIndex === null) return;
    if (!editExperience.title || !editExperience.company) return;
    const updated = [...experience];
    updated[editingExperienceIndex] = { ...editExperience };
    setExperience(updated);
    setEditingExperienceIndex(null);
    setEditExperience({ title: '', company: '', startDate: '', endDate: '', description: '', logo: '' });
  };

  const cancelEditExperience = () => {
    setEditingExperienceIndex(null);
    setEditExperience({ title: '', company: '', startDate: '', endDate: '', description: '', logo: '' });
  };

  const addEducation = () => {
    if (newEducation.school && newEducation.degree) {
      setEducation([...education, { ...newEducation }]);
      setNewEducation({ school: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', logo: '' });
    }
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const toggleFeaturedItem = (item: {id: string, type: 'article' | 'book', title: string}) => {
    const isFeatured = featured.some(f => f.id === item.id);
    if (isFeatured) setFeatured(featured.filter(f => f.id !== item.id));
    else setFeatured([...featured, item]);
  };

  const fetchAvailableItems = async () => {
    try {
      setLoadingItems(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const [articlesRes, booksRes] = await Promise.all([
        articlesService.listArticles({ limit: 50 }, token),
        booksService.getUserBooks(token)
      ]);

      const items: any[] = [];
      if (articlesRes.success && Array.isArray(articlesRes.data)) {
        articlesRes.data.forEach((a: any) => items.push({ id: a.id, type: 'article', title: a.title }));
      }
      if (booksRes.success && Array.isArray(booksRes.data)) {
        booksRes.data.forEach((b: any) => items.push({ id: b.id, type: 'book', title: b.title }));
      }
      setAvailableItems(items);
    } catch (err) {
      toast.error('Failed to fetch available content');
    } finally {
      setLoadingItems(false);
    }
  };

  if (loading) return <AdminLoading />;

  return (
    <div className="profile-admin">
      <div className="dashboard__title">
        <h2>Your Identity</h2>
        <p>Manage your public persona and professional background.</p>
      </div>

      {/* Hero / Cover Section */}
      <div className="card" style={{ marginBottom: '2rem', overflow: 'hidden' }}>
        <div 
          className="profile-admin__cover"
          style={{ 
            height: '240px', 
            background: user?.coverURL ? `url(${user.coverURL}) center/cover` : 'var(--color-bg-tertiary)',
            position: 'relative'
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
                background: user?.photoURL ? `url(${user.photoURL}) center/cover` : 'var(--color-bg-tertiary)',
                border: '4px solid var(--color-bg-primary)',
                position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {!user?.photoURL && <span style={{ fontSize: '3rem', color: 'var(--color-text-primary)', fontWeight: 800 }}>{displayName[0] || 'U'}</span>}
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
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>{displayName || 'Anonymous'}</h3>
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
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="label">Email Address (Read-only)</label>
              <Input value={email} disabled />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="label">Occupation / Title</label>
              <Input value={occupation} onChange={(e) => setOccupation(e.target.value)} />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="label">Biography</label>
              <textarea 
                className="input"
                style={{ minHeight: '120px', resize: 'vertical', padding: '1rem', backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                maxLength={1000}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="label">The Vision</label>
              <textarea 
                className="input"
                style={{ minHeight: '120px', resize: 'vertical', padding: '1rem', backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                placeholder="What is your long-term goal or vision?"
                maxLength={2000}
              />
            </div>

            <div className="form-divider" style={{ borderTop: '1px solid var(--color-border)', margin: '2rem 0' }}></div>

            <h3 className="label" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>Professional Experience</h3>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <input type="file" ref={experienceInputRef} hidden accept="image/*" onChange={(e) => e.target.files?.[0] && handleNestedFileUpload('experience', e.target.files[0])} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1.5rem', background: 'var(--color-bg-tertiary)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                   <Input value={newExperience.title} onChange={e => setNewExperience({...newExperience, title: e.target.value})} placeholder="Job Title" />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                   <Input value={newExperience.company} onChange={e => setNewExperience({...newExperience, company: e.target.value})} placeholder="Company Name" />
                </div>
                <Input value={newExperience.startDate} onChange={e => setNewExperience({...newExperience, startDate: e.target.value})} placeholder="Start Date" />
                <Input value={newExperience.endDate} onChange={e => setNewExperience({...newExperience, endDate: e.target.value})} placeholder="End Date" />
                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                   <Button type="button" variant="ghost" onClick={() => experienceInputRef.current?.click()} loading={isUploadingNested === 'experience'}>
                      {newExperience.logo ? 'Logo Uploaded' : 'Upload Logo'}
                   </Button>
                   {newExperience.logo && <img src={newExperience.logo} style={{ height: '40px' }} alt="Logo" />}
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <textarea className="input" style={{ minHeight: '80px', padding: '0.75rem', backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }} value={newExperience.description} onChange={e => setNewExperience({...newExperience, description: e.target.value})} placeholder="Description" />
                </div>
                <Button type="button" variant="secondary" className="btn--full" onClick={addExperience} disabled={!newExperience.title || !newExperience.company}>Add Experience</Button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {experience.map((exp, i) => (
                  editingExperienceIndex === i ? (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1.5rem', border: '1px solid var(--color-accent)', borderRadius: '0.5rem', background: 'var(--color-bg-tertiary)' }}>
                      <input type="file" ref={editExperienceInputRef} hidden accept="image/*" onChange={(e) => e.target.files?.[0] && handleNestedFileUpload('experience', e.target.files[0])} />
                      <div style={{ gridColumn: 'span 2' }}>
                        <Input value={editExperience.title} onChange={e => setEditExperience({...editExperience, title: e.target.value})} placeholder="Job Title" />
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <Input value={editExperience.company} onChange={e => setEditExperience({...editExperience, company: e.target.value})} placeholder="Company Name" />
                      </div>
                      <Input value={editExperience.startDate} onChange={e => setEditExperience({...editExperience, startDate: e.target.value})} placeholder="Start Date" />
                      <Input value={editExperience.endDate} onChange={e => setEditExperience({...editExperience, endDate: e.target.value})} placeholder="End Date" />
                      <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Button type="button" variant="ghost" onClick={() => editExperienceInputRef.current?.click()} loading={isUploadingNested === 'experience'}>
                          {editExperience.logo ? 'Logo Uploaded' : 'Upload Logo'}
                        </Button>
                        {editExperience.logo && <img src={editExperience.logo} style={{ height: '40px' }} alt="Logo" />}
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <textarea className="input" style={{ minHeight: '80px', padding: '0.75rem', backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }} value={editExperience.description} onChange={e => setEditExperience({...editExperience, description: e.target.value})} placeholder="Description" />
                      </div>
                      <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem' }}>
                        <Button type="button" variant="primary" className="btn--full" onClick={saveEditExperience} disabled={!editExperience.title || !editExperience.company}><i className="ph ph-check" style={{ marginRight: '0.5rem' }} /> Save</Button>
                        <Button type="button" variant="ghost" className="btn--full" onClick={cancelEditExperience}><i className="ph ph-x" style={{ marginRight: '0.5rem' }} /> Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', background: 'var(--color-bg-primary)' }}>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                         {exp.logo && <img src={exp.logo} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />}
                         <div>
                           <h4 style={{ margin: 0, color: 'var(--color-text-primary)' }}>{exp.title} @ {exp.company}</h4>
                           <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{exp.startDate} - {exp.endDate}</p>
                         </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button type="button" onClick={() => startEditExperience(i)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)' }}><i className="ph ph-pencil-simple" /></button>
                        <button type="button" onClick={() => removeExperience(i)} style={{ background: 'none', border: 'none', color: 'var(--color-error)' }}><i className="ph ph-trash" /></button>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>

            <div className="form-divider" style={{ borderTop: '1px solid var(--color-border)', margin: '2rem 0' }}></div>

            <h3 className="label" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>Academic Background</h3>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <input type="file" ref={educationInputRef} hidden accept="image/*" onChange={(e) => e.target.files?.[0] && handleNestedFileUpload('education', e.target.files[0])} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1.5rem', background: 'var(--color-bg-tertiary)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                   <Input value={newEducation.school} onChange={e => setNewEducation({...newEducation, school: e.target.value})} placeholder="School Name" />
                </div>
                <Input value={newEducation.degree} onChange={e => setNewEducation({...newEducation, degree: e.target.value})} placeholder="Degree" />
                <Input value={newEducation.fieldOfStudy} onChange={e => setNewEducation({...newEducation, fieldOfStudy: e.target.value})} placeholder="Field of Study" />
                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                   <Button type="button" variant="ghost" onClick={() => educationInputRef.current?.click()} loading={isUploadingNested === 'education'}>
                      {newEducation.logo ? 'Logo Uploaded' : 'Upload Logo'}
                   </Button>
                   {newEducation.logo && <img src={newEducation.logo} style={{ height: '40px' }} alt="Logo" />}
                </div>
                <Button type="button" variant="secondary" className="btn--full" onClick={addEducation} disabled={!newEducation.school}>Add Education</Button>
              </div>
              {education.map((edu, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', marginBottom: '0.5rem', background: 'var(--color-bg-primary)' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                     {edu.logo && <img src={edu.logo} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />}
                     <div><h4 style={{ margin: 0, color: 'var(--color-text-primary)' }}>{edu.school}</h4><p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{edu.degree} in {edu.fieldOfStudy}</p></div>
                  </div>
                  <button type="button" onClick={() => removeEducation(i)} style={{ background: 'none', border: 'none', color: 'var(--color-error)' }}><i className="ph ph-trash" /></button>
                </div>
              ))}
            </div>

            <div className="form-divider" style={{ borderTop: '1px solid var(--color-border)', margin: '2rem 0' }}></div>
            
            <h3 className="label" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>Featured Projects</h3>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <input type="file" ref={projectInputRef} hidden accept="image/*" onChange={(e) => e.target.files?.[0] && handleNestedFileUpload('project', e.target.files[0])} />
              <div style={{ display: 'grid', gap: '1rem', padding: '1.5rem', background: 'var(--color-bg-tertiary)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                <Input value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} placeholder="Title" />
                <textarea className="input" style={{ minHeight: '80px', padding: '0.75rem', backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }} value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} placeholder="Description" />
                <Input value={newProject.link} onChange={e => setNewProject({...newProject, link: e.target.value})} placeholder="Link" />
                <Button type="button" variant="ghost" onClick={() => projectInputRef.current?.click()} loading={isUploadingNested === 'project'}>
                  {newProject.image ? 'Image Uploaded' : 'Upload Project Image'}
                </Button>
                {newProject.image && <img src={newProject.image} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '0.5rem' }} />}
                <Button type="button" variant="secondary" onClick={addProject} disabled={!newProject.title}>Add Project</Button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                {projects.map((proj, i) => (
                  <div key={i} style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', background: 'var(--color-bg-primary)' }}>
                    {proj.image && <img src={proj.image} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '0.4rem', marginBottom: '0.5rem' }} />}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <h4 style={{ margin: 0 }}>{proj.title}</h4>
                      <button type="button" onClick={() => removeProject(i)} style={{ background: 'none', border: 'none', color: 'var(--color-error)' }}><i className="ph ph-trash" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-divider" style={{ borderTop: '1px solid var(--color-border)', margin: '2rem 0' }}></div>

            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
               <div style={{ flex: 1, minWidth: '300px' }}>
                  <label className="label">Technical Skills</label>
                  <Input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => handleAddTag(e, 'skills')} placeholder="Press Enter" />
                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {skills.map(s => <span key={s} className="badge badge--draft" style={{ color: 'var(--color-text-primary)' }}>{s} <i className="ph ph-x" onClick={() => removeTag(s, 'skills')} /></span>)}
                   </div>
               </div>
               <div style={{ flex: 1, minWidth: '300px' }}>
                  <label className="label">Expertise</label>
                  <Input value={expertiseInput} onChange={e => setExpertiseInput(e.target.value)} onKeyDown={e => handleAddTag(e, 'expertise')} placeholder="Press Enter" />
                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {expertise.map(e => <span key={e} className="badge badge--published" style={{ color: 'var(--color-text-primary)' }}>{e} <i className="ph ph-x" onClick={() => removeTag(e, 'expertise')} /></span>)}
                   </div>
               </div>
            </div>

            <Button type="submit" variant="primary" className="btn--full" loading={saving}>Save Profile Changes</Button>
          </form>
        </div>

        <div className="dashboard__sidebar-col">
           <div className="card card--padded">
              <h3 className="label" style={{ marginBottom: '1.5rem' }}>Home Anthology</h3>
              <Button variant="secondary" className="btn--full" onClick={() => { setShowFeaturedModal(true); fetchAvailableItems(); }}>Manage Featured Content</Button>
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                 {featured.map(item => (
                   <div key={item.id} style={{ fontSize: '0.75rem', padding: '0.5rem', background: 'var(--color-bg-tertiary)', borderRadius: '0.4rem', display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-primary)' }}>
                      <span>{item.title}</span>
                      <i className="ph ph-trash" style={{ cursor: 'pointer', color: 'var(--color-error)' }} onClick={() => toggleFeaturedItem(item)} />
                   </div>
                 ))}
              </div>
           </div>

           <div className="card card--padded" style={{ marginTop: '1.5rem' }}>
              <h3 className="label" style={{ marginBottom: '1.5rem' }}>Integrations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 {['github', 'linkedin'].map((p: any) => (
                   <div key={p} style={{ padding: '1rem', background: 'var(--color-bg-tertiary)', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: 700, color: 'var(--color-text-primary)' }}>{p}</span>
                      <Button variant="ghost" style={{ fontSize: '0.7rem' }} onClick={() => (integrations as any)[p]?.connected ? handleDisconnect(p) : handleConnect(p)}>
                         {(integrations as any)[p]?.connected ? 'Disconnect' : 'Connect'}
                      </Button>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {configModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card card--padded" style={{ width: '400px', background: 'var(--color-bg-secondary)' }}>
               <h3 className="label" style={{ color: 'var(--color-text-primary)' }}>Configure {configModal}</h3>
               <Input value={tempConfig.clientId} onChange={e => setTempConfig({...tempConfig, clientId: e.target.value})} placeholder="Client ID" style={{ marginBottom: '1rem' }} />
               <Input type="password" value={tempConfig.clientSecret} onChange={e => setTempConfig({...tempConfig, clientSecret: e.target.value})} placeholder="Client Secret" />
               <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <Button variant="secondary" className="btn--full" onClick={() => setConfigModal(null)}>Cancel</Button>
                  <Button variant="primary" className="btn--full" onClick={handleSaveConfig}>Save Keys</Button>
               </div>
            </div>
          </motion.div>
        )}

        {showFeaturedModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <div className="card card--padded" style={{ width: '500px', background: 'var(--color-bg-secondary)', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                   <h3 className="label" style={{ color: 'var(--color-text-primary)' }}>Featured Content</h3>
                   <i className="ph ph-x" style={{ cursor: 'pointer', color: 'var(--color-text-secondary)' }} onClick={() => setShowFeaturedModal(false)} />
                </div>
                <Input placeholder="Search..." value={featuredSearch} onChange={e => setFeaturedSearch(e.target.value)} style={{ marginBottom: '1.5rem' }} />
                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem' }}>
                   {availableItems.filter(i => i.title.toLowerCase().includes(featuredSearch.toLowerCase())).map(item => {
                      const isF = featured.some(f => f.id === item.id);
                      return (
                        <div key={item.id} onClick={() => toggleFeaturedItem(item)} style={{ padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer', background: isF ? 'var(--color-bg-tertiary)' : 'var(--color-bg-primary)' }}>
                           <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.title}</div>
                           <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>{item.type.toUpperCase()}</div>
                        </div>
                      );
                   })}
                </div>
                <Button className="btn--full" onClick={() => setShowFeaturedModal(false)}>Done</Button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .profile-admin__photo-btn {
          position: absolute; bottom: 0; right: 0; width: 36px; height: 36px; border-radius: 50%;
          background: var(--color-text-primary); color: var(--color-bg-primary); border: 3px solid var(--color-bg-primary);
          display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .logo-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--color-bg-tertiary); color: var(--color-text-primary); }
      `}</style>
    </div>
  );
}
