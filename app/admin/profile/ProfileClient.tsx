'use client';

import React, { useState, useEffect, useRef } from 'react';
import { auth } from '@/lib/firebase';
import { usersService } from '@/services/users.service';
import { articlesService } from '@/services/articles.service';
import { booksService } from '@/services/books.service';
import { integrationsService, IntegrationsList } from '@/services/integrations.service';
import { projectsService } from '@/services/projects.service';
import { experienceService, Experience } from '@/services/experience.service';
import { educationService, Education } from '@/services/education.service';
import { Project } from '@/lib/types/project';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import AdminLoading from '@/app/admin/loading';
import { format } from 'date-fns';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import TiptapEditor from '@/components/editor/TiptapEditor';

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
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProjectIndex, setEditingProjectIndex] = useState<number | null>(null);
  const [projForm, setProjForm] = useState<Partial<Project>>({ 
    title: '', 
    description: '', 
    link: '', 
    image: '',
    tags: [],
    skills: [],
    relatedArticles: [],
    resources: []
  });
  
  const [experience, setExperience] = useState<Experience[]>([]);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [editingExperienceIndex, setEditingExperienceIndex] = useState<number | null>(null);
  const [expForm, setExpForm] = useState<Partial<Experience>>({ 
    company: '', 
    logo: '', 
    location: '', 
    roles: [{ title: '', startDate: '', endDate: '', description: '', employmentType: '' }] 
  });

  const [education, setEducation] = useState<Education[]>([]);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [editingEducationIndex, setEditingEducationIndex] = useState<number | null>(null);
  const [eduForm, setEduForm] = useState<Partial<Education>>({ school: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', logo: '' });
  
  const [syncingProfile, setSyncingProfile] = useState(false);
  const [isUploadingNested, setIsUploadingNested] = useState<'project' | 'experience' | 'education' | null>(null);

  const [featured, setFeatured] = useState<{id: string, type: 'article' | 'book', title: string}[]>([]);
  const [showFeaturedModal, setShowFeaturedModal] = useState(false);
  const [availableItems, setAvailableItems] = useState<{id: string, type: 'article' | 'book', title: string}[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [configModal, setConfigModal] = useState<'github' | 'linkedin' | null>(null);
  const [tempConfig, setTempConfig] = useState({ clientId: '', clientSecret: '' });
  const [featuredSearch, setFeaturedSearch] = useState('');
  const [showGitHubReposModal, setShowGitHubReposModal] = useState(false);
  const [gitHubRepos, setGitHubRepos] = useState<any[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  
  const [projectTagInput, setProjectTagInput] = useState('');
  const [projectSkillInput, setProjectSkillInput] = useState('');
  const [resourceForm, setResourceForm] = useState({ title: '', url: '' });

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
      
      const [response, expRes, eduRes, projRes] = await Promise.all([
        usersService.getMe(token),
        experienceService.list(token),
        educationService.list(token),
        projectsService.list(token)
      ]);

      if (response.success) {
        const userData = response.data;
        setUser(userData);
        setDisplayName(userData.displayName || '');
        setEmail(userData.email || auth.currentUser?.email || '');
        setOccupation(userData.occupation || '');
        setBio(userData.bio || '');
        setVision(userData.vision || '');
        setFeatured(userData.featured || []);
        setSkills(userData.skills || []);
        setExpertise(userData.expertise || []);
        setSocialLinks(userData.socialLinks || { twitter: '', linkedin: '', github: '', website: '' });
      }

      if (expRes?.success) {
        // Merge legacy experience
        const legacyExp = response.data?.experience || [];
        const expMap = new Map();
        legacyExp.forEach((e: any) => {
          const key = e.company?.toLowerCase();
          if (key) expMap.set(key, {
            ...e,
            roles: e.roles || [{ title: e.title, startDate: e.startDate, endDate: e.endDate, description: e.description }]
          });
        });
        expRes.data?.forEach((e: any) => {
          const key = e.company?.toLowerCase();
          if (key) expMap.set(key, e);
        });
        setExperience(Array.from(expMap.values()));
      }

      if (eduRes?.success) {
        // Merge legacy education
        const legacyEdu = response.data?.education || [];
        const eduMap = new Map();
        legacyEdu.forEach((e: any) => {
          const key = `${e.school}-${e.degree}`.toLowerCase();
          if (key) eduMap.set(key, e);
        });
        eduRes.data?.forEach((e: any) => {
          const key = `${e.school}-${e.degree}`.toLowerCase();
          if (key) eduMap.set(key, e);
        });
        setEducation(Array.from(eduMap.values()));
      }

      if (projRes?.success) {
        // Merge legacy projects
        const legacyProj = response.data?.projects || [];
        const projMap = new Map();
        legacyProj.forEach((p: any) => {
          const key = p.title?.toLowerCase();
          if (key) projMap.set(key, {
            ...p,
            image: p.image || '',
            tags: p.tags || [],
            skills: p.skills || [],
            relatedArticles: p.relatedArticles || [],
            resources: p.resources || []
          });
        });
        projRes.data?.forEach((p: any) => {
          const key = p.title?.toLowerCase();
          if (key) projMap.set(key, p);
        });
        setProjects(Array.from(projMap.values()));
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
          // Sync each repo as a project to the new model
          for (const repo of newProjectsFromGit) {
             await projectsService.create(repo, token);
          }
          const projRes = await projectsService.list(token);
          if (projRes.success) setProjects(projRes.data);
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

  const openGitHubImport = async () => {
    if (!integrations.github?.connected) {
      toast.error('Please connect your GitHub account first.');
      return;
    }
    setShowGitHubReposModal(true);
    try {
      setLoadingRepos(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const res = await integrationsService.syncGitHubProjects(token);
      if (res.success && Array.isArray(res.data)) {
        setGitHubRepos(res.data);
      }
    } catch (err: any) {
      toast.error('Failed to fetch repositories: ' + err.message);
    } finally {
      setLoadingRepos(false);
    }
  };

  const importRepoAsProject = (repo: any) => {
    setProjForm({
      title: repo.title || '',
      description: repo.description || '',
      link: repo.link || '',
      image: '',
      tags: [],
      skills: [],
      relatedArticles: [],
      resources: []
    });
    setEditingProjectIndex(null);
    setShowGitHubReposModal(false);
    setShowProjectModal(true);
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
        // projects, // No longer updated via updateMe
        experience,
        education,
        featured
      } as any, token);

      if (response.success) {
        setUser(response.data);
        toast.success('Profile updated successfully and persisted to cloud!');
      } else {
        toast.error('Failed to update profile: ' + (response as any).error || 'Unknown error');
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
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
        if (type === 'project') setProjForm(prev => ({ ...prev, image: res.url }));
        else if (type === 'experience') {
          setExpForm(prev => ({ ...prev, logo: res.url }));
        }
        else if (type === 'education') setEduForm(prev => ({ ...prev, logo: res.url }));
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

  const openAddProject = () => {
    setProjForm({ 
      title: '', 
      description: '', 
      link: '', 
      image: '',
      tags: [],
      skills: [],
      relatedArticles: [],
      resources: []
    });
    setEditingProjectIndex(null);
    setShowProjectModal(true);
  };

  const openEditProject = (index: number) => {
    const proj = projects[index];
    setProjForm({ 
      title: proj.title || '', 
      description: proj.description || '', 
      link: proj.link || '', 
      image: proj.image || '',
      tags: proj.tags || [],
      skills: proj.skills || [],
      relatedArticles: proj.relatedArticles || [],
      resources: proj.resources || [],
      isFeatured: proj.isFeatured ?? true,
      order: proj.order || 0
    } as any);
    setEditingProjectIndex(index);
    setShowProjectModal(true);
  };

  const saveProject = async () => {
    if (!projForm.title || !projForm.description) {
      toast.error('Title and Description are required');
      return;
    }

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      let res;
      if (editingProjectIndex !== null && projects[editingProjectIndex].id) {
        res = await projectsService.update(projects[editingProjectIndex].id!, projForm, token);
      } else {
        res = await projectsService.create(projForm as any, token);
      }

      if (res.success) {
        await fetchProfile();
        setShowProjectModal(false);
        toast.success(editingProjectIndex !== null ? 'Project updated' : 'Project created');
      }
    } catch (err: any) {
      toast.error('Failed to save project: ' + err.message);
    }
  };

  const removeProject = async (index: number) => {
    if (confirm('Are you sure you want to remove this project?')) {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;
        const projId = projects[index].id;
        if (projId) {
          const res = await projectsService.delete(projId, token);
          if (res.success) {
            await fetchProfile();
            toast.success('Project removed');
          }
        } else {
          await fetchProfile();
          toast.success('Project removed');
        }
      } catch (err: any) {
        toast.error('Failed to remove project: ' + err.message);
      }
    }
  };

  const openAddExperience = () => {
    setExpForm({
      company: '',
      logo: '',
      location: '',
      roles: [{ title: '', startDate: '', endDate: '', description: '', employmentType: '' }]
    });
    setEditingExperienceIndex(null);
    setShowExperienceModal(true);
  };

  const openEditExperience = (index: number) => {
    const exp = experience[index];
    setExpForm({
      company: exp.company || '',
      location: exp.location || '',
      logo: exp.logo || '',
      roles: (exp.roles || []).length > 0 ? exp.roles.map((r: any) => ({
        title: r.title || '',
        type: r.type || 'full-time',
        startDate: r.startDate || '',
        endDate: r.endDate || '',
        current: r.current || false,
        description: r.description || ''
      })) : [{
        title: exp.title || '', // Fallback for very old records
        type: 'full-time',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        current: false,
        description: exp.description || ''
      }]
    });
    setEditingExperienceIndex(index);
    setShowExperienceModal(true);
  };

  const handleAddRole = () => {
    setExpForm({
      ...expForm,
      roles: [...expForm.roles, { title: '', startDate: '', endDate: '', description: '', employmentType: '' }]
    });
  };

  const handleRemoveRole = (roleIndex: number) => {
    if (expForm.roles.length <= 1) return;
    const updatedRoles = expForm.roles.filter((_, i) => i !== roleIndex);
    setExpForm({ ...expForm, roles: updatedRoles });
  };

  const handleRoleChange = (roleIndex: number, field: string, value: any) => {
    const updatedRoles = [...expForm.roles];
    updatedRoles[roleIndex] = { ...updatedRoles[roleIndex], [field]: value };
    setExpForm({ ...expForm, roles: updatedRoles });
  };

  const saveExperience = async () => {
    if (!expForm.company || expForm.roles?.some(r => !r.title)) {
      toast.error('Company and all Role Titles are required');
      return;
    }

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      let res;
      if (editingExperienceIndex !== null && experience[editingExperienceIndex].id) {
        res = await experienceService.update(experience[editingExperienceIndex].id!, expForm, token);
      } else {
        res = await experienceService.create(expForm, token);
      }

      if (res.success) {
        await fetchProfile();
        setShowExperienceModal(false);
        toast.success(editingExperienceIndex !== null ? 'Experience updated' : 'Experience added');
      }
    } catch (err: any) {
      toast.error('Failed to save experience: ' + err.message);
    }
  };

  const removeExperience = async (index: number) => {
    if (confirm('Are you sure you want to remove this professional experience?')) {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;
        const expId = experience[index].id;
        if (expId) {
          const res = await experienceService.delete(expId, token);
          if (res.success) {
            await fetchProfile();
            toast.success('Experience removed');
          }
        } else {
          await fetchProfile();
          toast.success('Experience removed');
        }
      } catch (err: any) {
        toast.error('Failed to remove experience: ' + err.message);
      }
    }
  };

  const openAddEducation = () => {
    setEduForm({ school: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', logo: '' });
    setEditingEducationIndex(null);
    setShowEducationModal(true);
  };

  const openEditEducation = (index: number) => {
    const edu = education[index];
    setEduForm({
      school: edu.school || '',
      degree: edu.degree || '',
      fieldOfStudy: edu.fieldOfStudy || '',
      startDate: edu.startDate || '',
      endDate: edu.endDate || '',
      current: edu.current || false,
      description: edu.description || '',
      logo: edu.logo || ''
    });
    setEditingEducationIndex(index);
    setShowEducationModal(true);
  };

  const saveEducation = async () => {
    if (!eduForm.school || !eduForm.degree) {
      toast.error('School and Degree are required');
      return;
    }

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      let res;
      if (editingEducationIndex !== null && education[editingEducationIndex].id) {
        res = await educationService.update(education[editingEducationIndex].id!, eduForm, token);
      } else {
        res = await educationService.create(eduForm, token);
      }

      if (res.success) {
        await fetchProfile();
        setShowEducationModal(false);
        toast.success(editingEducationIndex !== null ? 'Academic record updated' : 'Academic record added');
      }
    } catch (err: any) {
      toast.error('Failed to save academic record: ' + err.message);
    }
  };

  const removeEducation = async (index: number) => {
    if (confirm('Are you sure you want to remove this academic background?')) {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;
        const eduId = education[index].id;
        if (eduId) {
          const res = await educationService.delete(eduId, token);
          if (res.success) {
            await fetchProfile();
            toast.success('Academic record removed');
          }
        } else {
          await fetchProfile();
          toast.success('Academic record removed');
        }
      } catch (err: any) {
        toast.error('Failed to remove academic record: ' + err.message);
      }
    }
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
              <TiptapEditor 
                content={bio}
                onChange={setBio}
                isCompact={true}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="label">The Vision</label>
              <TiptapEditor 
                content={vision}
                onChange={setVision}
                isCompact={true}
              />
            </div>

            <div className="form-divider" style={{ borderTop: '1px solid var(--color-border)', margin: '2rem 0' }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="label" style={{ margin: 0, fontSize: '0.875rem' }}>Professional Experience</h3>
              <Button type="button" variant="secondary" onClick={openAddExperience}>
                <i className="ph ph-plus" style={{ marginRight: '0.5rem' }} />
                Add Professional Experience
              </Button>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {experience.map((exp, i) => {
                  // Handle legacy data or new structure
                  const isLegacy = !exp.roles;
                  const companyName = isLegacy ? exp.company : exp.company;
                  const logo = isLegacy ? exp.logo : exp.logo;
                  const rolesCount = isLegacy ? 1 : exp.roles.length;

                  return (
                    <div key={i} className="experience-item-card" style={{ display: 'flex', justifyContent: 'space-between', padding: '1.25rem', border: '1px solid var(--color-border)', borderRadius: '1rem', background: 'var(--color-bg-primary)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', gap: '1.25rem' }}>
                         <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', background: 'var(--color-bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                           {logo ? <img src={logo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <i className="ph ph-buildings" style={{ fontSize: '1.5rem', opacity: 0.5 }} />}
                         </div>
                         <div>
                           <h4 style={{ margin: 0, color: 'var(--color-text-primary)', fontSize: '1rem', fontWeight: 700 }}>{companyName}</h4>
                           <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                             {isLegacy ? exp.title : `${rolesCount} role${rolesCount > 1 ? 's' : ''}`}
                             {exp.location && ` • ${exp.location}`}
                           </p>
                         </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Button type="button" variant="ghost" onClick={() => openEditExperience(i)} style={{ padding: '0.5rem' }}><i className="ph ph-pencil-simple" /></Button>
                        <Button type="button" variant="ghost" onClick={() => removeExperience(i)} style={{ padding: '0.5rem', color: 'var(--color-error)' }}><i className="ph ph-trash" /></Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="form-divider" style={{ borderTop: '1px solid var(--color-border)', margin: '2rem 0' }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="label" style={{ margin: 0, fontSize: '0.875rem' }}>Academic Background</h3>
              <Button type="button" variant="secondary" onClick={openAddEducation}>
                <i className="ph ph-plus" style={{ marginRight: '0.5rem' }} />
                Add Academic Background
              </Button>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {education.map((edu, i) => (
                  <div key={i} className="experience-item-card" style={{ display: 'flex', justifyContent: 'space-between', padding: '1.25rem', border: '1px solid var(--color-border)', borderRadius: '1rem', background: 'var(--color-bg-primary)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', gap: '1.25rem' }}>
                       <div style={{ width: '48px', height: '48px', borderRadius: '0.75rem', background: 'var(--color-bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                         {edu.logo ? <img src={edu.logo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <i className="ph ph-student" style={{ fontSize: '1.5rem', opacity: 0.5 }} />}
                       </div>
                       <div>
                         <h4 style={{ margin: 0, color: 'var(--color-text-primary)', fontSize: '1rem', fontWeight: 700 }}>{edu.school}</h4>
                         <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                           {edu.degree} in {edu.fieldOfStudy}
                           {(edu.startDate || edu.endDate) && ` • ${edu.startDate || ''} - ${edu.endDate || ''}`}
                         </p>
                       </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Button type="button" variant="ghost" onClick={() => openEditEducation(i)} style={{ padding: '0.5rem' }}><i className="ph ph-pencil-simple" /></Button>
                      <Button type="button" variant="ghost" onClick={() => removeEducation(i)} style={{ padding: '0.5rem', color: 'var(--color-error)' }}><i className="ph ph-trash" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-divider" style={{ borderTop: '1px solid var(--color-border)', margin: '2rem 0' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="label" style={{ margin: 0, fontSize: '0.875rem' }}>Featured Projects</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button type="button" variant="secondary" onClick={openGitHubImport} loading={loadingRepos}>
                  <i className="ph ph-github-logo" style={{ marginRight: '0.5rem' }} />
                  Import from GitHub
                </Button>
                <Button type="button" variant="secondary" onClick={openAddProject}>
                  <i className="ph ph-plus" style={{ marginRight: '0.5rem' }} />
                  Add Featured Project
                </Button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {projects.map((proj, i) => (
                  <div key={i} className="project-item-card" style={{ padding: '1.25rem', border: '1px solid var(--color-border)', borderRadius: '1rem', background: 'var(--color-bg-primary)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {proj.image && <img src={proj.image} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '0.75rem' }} />}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, color: 'var(--color-text-primary)', fontSize: '1rem', fontWeight: 700 }}>{proj.title}</h4>
                      {proj.link && <p style={{ fontSize: '0.75rem', color: 'var(--color-accent)', marginTop: '0.25rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{proj.link}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                      <Button type="button" variant="ghost" onClick={() => openEditProject(i)} style={{ padding: '0.5rem' }}><i className="ph ph-pencil-simple" /></Button>
                      <Button type="button" variant="ghost" onClick={() => removeProject(i)} style={{ padding: '0.5rem', color: 'var(--color-error)' }}><i className="ph ph-trash" /></Button>
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
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {(integrations as any)[p]?.connected && (
                          <Button 
                            variant="ghost" 
                            style={{ fontSize: '0.7rem' }} 
                            onClick={() => handleSyncStats(p)}
                            loading={syncingStats === p}
                          >
                            <i className="ph ph-arrows-clockwise" style={{ marginRight: '0.3rem' }} />
                            Sync
                          </Button>
                        )}
                        <Button variant="ghost" style={{ fontSize: '0.7rem' }} onClick={() => (integrations as any)[p]?.connected ? handleDisconnect(p) : handleConnect(p)}>
                           {(integrations as any)[p]?.connected ? 'Disconnect' : 'Connect'}
                        </Button>
                      </div>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
             <motion.div 
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 10 }}
                className="card" 
                style={{ width: '100%', maxWidth: '600px', background: '#ffffff', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: '1.5rem', boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.35)', border: '1px solid #eeeeee' }}
              >
                <div style={{ padding: '1.75rem 2.5rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff' }}>
                   <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#111', fontFamily: 'var(--font-merriweather), serif' }}>Featured Content</h3>
                   <Button variant="ghost" onClick={() => setShowFeaturedModal(false)} style={{ padding: '0.5rem', borderRadius: '50%' }}><i className="ph ph-x" style={{ fontSize: '1.25rem' }} /></Button>
                </div>
                <div style={{ padding: '2rem 2.5rem', flex: 1, overflowY: 'auto' }}>
                  <Input placeholder="Search articles or books..." value={featuredSearch} onChange={e => setFeaturedSearch(e.target.value)} style={{ marginBottom: '1.5rem', padding: '0.85rem' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {availableItems.filter(i => i.title.toLowerCase().includes(featuredSearch.toLowerCase())).map(item => {
                        const isF = featured.some(f => f.id === item.id);
                        return (
                          <div key={item.id} onClick={() => toggleFeaturedItem(item)} style={{ padding: '1rem', border: '1px solid ' + (isF ? 'var(--color-accent)' : '#f0f0f0'), borderRadius: '1rem', cursor: 'pointer', background: isF ? '#f0f7ff' : '#fcfcfc', transition: 'all 0.2s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontWeight: 700, color: isF ? 'var(--color-accent)' : '#111', fontSize: '1rem' }}>{item.title}</div>
                                <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>{item.type}</div>
                              </div>
                              {isF && <i className="ph ph-check-circle" style={{ color: 'var(--color-accent)', fontSize: '1.25rem' }} />}
                            </div>
                          </div>
                        );
                    })}
                  </div>
                </div>
                <div style={{ padding: '1.5rem 2.5rem', borderTop: '1px solid #f0f0f0', background: '#fcfcfc' }}>
                  <Button className="btn--full" height="50px" onClick={() => setShowFeaturedModal(false)}>Save Selections</Button>
                </div>
             </motion.div>
          </motion.div>
        )}

        {showExperienceModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="modal-overlay" 
            style={{ 
              position: 'fixed', 
              inset: 0, 
              zIndex: 9999, 
              background: 'rgba(0, 0, 0, 0.6)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '1.5rem' 
            }}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="card" 
              style={{ 
                width: '100%', 
                maxWidth: '900px', 
                background: '#ffffff', 
                maxHeight: '90vh', 
                overflow: 'hidden', 
                display: 'flex', 
                flexDirection: 'column', 
                borderRadius: '1.5rem',
                boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.35)',
                border: '1px solid #eeeeee'
              }}
            >
              <div style={{ padding: '1.75rem 3rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#111111', fontFamily: 'var(--font-merriweather), serif' }}>{editingExperienceIndex !== null ? 'Edit Professional Experience' : 'Add Professional Experience'}</h3>
                <Button variant="ghost" onClick={() => setShowExperienceModal(false)} style={{ padding: '0.5rem', borderRadius: '50%' }}><i className="ph ph-x" style={{ fontSize: '1.5rem' }} /></Button>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', padding: '3rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', marginBottom: '3.5rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="label" style={{ marginBottom: '0.85rem', display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#444' }}>Company Name</label>
                    <Input value={expForm.company} onChange={e => setExpForm({ ...expForm, company: e.target.value })} placeholder="e.g. Google, TaughtCode" style={{ padding: '1rem', fontSize: '1rem' }} />
                  </div>
                  <div>
                    <label className="label" style={{ marginBottom: '0.85rem', display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#444' }}>Location (Optional)</label>
                    <Input value={expForm.location} onChange={e => setExpForm({ ...expForm, location: e.target.value })} placeholder="e.g. Remote, Mountain View, CA" style={{ padding: '1rem', fontSize: '1rem' }} />
                  </div>
                  <div>
                    <label className="label" style={{ marginBottom: '0.85rem', display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#444' }}>Company Logo</label>
                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                      <Button variant="secondary" onClick={() => experienceInputRef.current?.click()} loading={isUploadingNested === 'experience'} style={{ flex: 1, height: '48px' }}>
                        {expForm.logo ? 'Change Logo' : 'Upload Logo'}
                      </Button>
                      {expForm.logo && (
                        <div style={{ width: '48px', height: '48px', background: '#fff', borderRadius: '1rem', overflow: 'hidden', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                          <img src={expForm.logo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                      )}
                      <input type="file" ref={experienceInputRef} hidden accept="image/*" onChange={(e) => e.target.files?.[0] && handleNestedFileUpload('experience', e.target.files[0])} />
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '2px solid #f8f8f8', paddingTop: '3rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#111', fontFamily: 'var(--font-merriweather), serif' }}>Roles & Positions</h4>
                    <Button variant="ghost" onClick={handleAddRole} style={{ fontSize: '0.9rem', color: 'var(--color-accent)', fontWeight: 700 }}>
                      <i className="ph ph-plus-circle" style={{ marginRight: '0.6rem', fontSize: '1.1rem' }} /> Add Another Role
                    </Button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    {(expForm.roles || []).map((role: any, idx: number) => (
                      <div key={idx} style={{ padding: '2.5rem', background: '#fbfbfb', borderRadius: '1.5rem', position: 'relative', border: '1px solid #f0f0f0' }}>
                        {expForm.roles.length > 1 && (
                          <button onClick={() => handleRemoveRole(idx)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#fff', border: '1px solid #eee', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.borderColor = '#ef4444'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = '#eee'; }}><i className="ph ph-trash" /></button>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                          <div style={{ gridColumn: 'span 2' }}>
                            <label className="label" style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.65rem', display: 'block', color: '#555' }}>Job Title</label>
                            <Input value={role.title} onChange={e => handleRoleChange(idx, 'title', e.target.value)} placeholder="e.g. Senior Software Engineer" style={{ padding: '0.85rem' }} />
                          </div>
                          <div>
                            <label className="label" style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.65rem', display: 'block', color: '#555' }}>Start Date</label>
                            <Input value={role.startDate} onChange={e => handleRoleChange(idx, 'startDate', e.target.value)} placeholder="e.g. Jan 2021" style={{ padding: '0.85rem' }} />
                          </div>
                          <div>
                            <label className="label" style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.65rem', display: 'block', color: '#555' }}>End Date</label>
                            <Input value={role.endDate} onChange={e => handleRoleChange(idx, 'endDate', e.target.value)} placeholder="e.g. Present or Dec 2022" style={{ padding: '0.85rem' }} />
                          </div>
                          <div style={{ gridColumn: 'span 2' }}>
                            <label className="label" style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.65rem', display: 'block', color: '#555' }}>Employment Type</label>
                            <Input value={role.employmentType} onChange={e => handleRoleChange(idx, 'employmentType', e.target.value)} placeholder="e.g. Full-time, Freelance" style={{ padding: '0.85rem' }} />
                          </div>
                        </div>
                        <div>
                          <label className="label" style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', display: 'block', color: '#555' }}>Role Description</label>
                          <TiptapEditor 
                            content={role.description} 
                            onChange={html => handleRoleChange(idx, 'description', html)} 
                            isCompact={true} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ padding: '2rem 3rem', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '1.5rem', background: '#fcfcfc' }}>
                <Button variant="secondary" onClick={() => setShowExperienceModal(false)} style={{ flex: 1, height: '54px', fontSize: '1rem' }}>Cancel</Button>
                <Button variant="primary" onClick={saveExperience} style={{ flex: 2, height: '54px', fontSize: '1rem' }}>Save Experience</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showEducationModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <motion.div initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }} className="card" style={{ width: '100%', maxWidth: '750px', background: '#ffffff', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: '1.5rem', boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.35)', border: '1px solid #eeeeee' }}>
              <div style={{ padding: '1.75rem 3rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#111', fontFamily: 'var(--font-merriweather), serif' }}>{editingEducationIndex !== null ? 'Edit Academic Background' : 'Add Academic Background'}</h3>
                <Button variant="ghost" onClick={() => setShowEducationModal(false)} style={{ padding: '0.5rem', borderRadius: '50%' }}><i className="ph ph-x" style={{ fontSize: '1.5rem' }} /></Button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '3rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="label" style={{ fontWeight: 700, color: '#444', marginBottom: '0.75rem', display: 'block' }}>School / University</label>
                    <Input value={eduForm.school} onChange={e => setEduForm({ ...eduForm, school: e.target.value })} placeholder="e.g. Stanford University" style={{ padding: '1rem' }} />
                  </div>
                  <div>
                    <label className="label" style={{ fontWeight: 700, color: '#444', marginBottom: '0.75rem', display: 'block' }}>Degree</label>
                    <Input value={eduForm.degree} onChange={e => setEduForm({ ...eduForm, degree: e.target.value })} placeholder="e.g. Bachelor of Science" style={{ padding: '1rem' }} />
                  </div>
                  <div>
                    <label className="label" style={{ fontWeight: 700, color: '#444', marginBottom: '0.75rem', display: 'block' }}>Field of Study</label>
                    <Input value={eduForm.fieldOfStudy} onChange={e => setEduForm({ ...eduForm, fieldOfStudy: e.target.value })} placeholder="e.g. Computer Science" style={{ padding: '1rem' }} />
                  </div>
                  <div>
                    <label className="label" style={{ fontWeight: 700, color: '#444', marginBottom: '0.75rem', display: 'block' }}>Start Date</label>
                    <Input value={eduForm.startDate} onChange={e => setEduForm({ ...eduForm, startDate: e.target.value })} placeholder="e.g. 2018" style={{ padding: '1rem' }} />
                  </div>
                  <div>
                    <label className="label" style={{ fontWeight: 700, color: '#444', marginBottom: '0.75rem', display: 'block' }}>End Date</label>
                    <Input value={eduForm.endDate} onChange={e => setEduForm({ ...eduForm, endDate: e.target.value })} placeholder="e.g. 2022 or Present" style={{ padding: '1rem' }} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="label" style={{ fontWeight: 700, color: '#444', marginBottom: '0.75rem', display: 'block' }}>Institute Logo</label>
                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                      <Button variant="secondary" onClick={() => educationInputRef.current?.click()} loading={isUploadingNested === 'education'} style={{ flex: 1, height: '48px' }}>
                        {eduForm.logo ? 'Change Logo' : 'Upload Logo'}
                      </Button>
                      {eduForm.logo && (
                        <div style={{ width: '48px', height: '48px', background: '#fff', borderRadius: '1rem', overflow: 'hidden', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
                          <img src={eduForm.logo} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                      )}
                      <input type="file" ref={educationInputRef} hidden accept="image/*" onChange={(e) => e.target.files?.[0] && handleNestedFileUpload('education', e.target.files[0])} />
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ padding: '2rem 3rem', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '1.5rem', background: '#fcfcfc' }}>
                <Button variant="secondary" onClick={() => setShowEducationModal(false)} style={{ flex: 1, height: '54px' }}>Cancel</Button>
                <Button variant="primary" onClick={saveEducation} style={{ flex: 2, height: '54px' }}>Save Academic Record</Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showProjectModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <motion.div initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }} className="card" style={{ width: '100%', maxWidth: '850px', background: '#ffffff', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: '1.5rem', boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.35)', border: '1px solid #eeeeee' }}>
              <div style={{ padding: '1.75rem 3rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#111', fontFamily: 'var(--font-merriweather), serif' }}>{editingProjectIndex !== null ? 'Edit Featured Project' : 'Add Featured Project'}</h3>
                <Button variant="ghost" onClick={() => setShowProjectModal(false)} style={{ padding: '0.5rem', borderRadius: '50%' }}><i className="ph ph-x" style={{ fontSize: '1.5rem' }} /></Button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '3rem' }}>
                <div style={{ display: 'grid', gap: '2.5rem' }}>
                  <div>
                    <label className="label" style={{ fontWeight: 700, color: '#444', marginBottom: '0.75rem', display: 'block' }}>Project Title</label>
                    <Input value={projForm.title} onChange={e => setProjForm({ ...projForm, title: e.target.value })} placeholder="e.g. AI Content Engine" style={{ padding: '1rem' }} />
                  </div>
                  <div>
                    <label className="label" style={{ fontWeight: 700, color: '#444', marginBottom: '1rem', display: 'block' }}>Description</label>
                    <TiptapEditor 
                      content={projForm.description} 
                      onChange={html => setProjForm({ ...projForm, description: html })} 
                      isCompact={true} 
                    />
                  </div>
                  <div>
                    <label className="label" style={{ fontWeight: 700, color: '#444', marginBottom: '0.75rem', display: 'block' }}>Project Link (Optional)</label>
                    <Input value={projForm.link} onChange={e => setProjForm({ ...projForm, link: e.target.value })} placeholder="https://..." style={{ padding: '1rem' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                    <div>
                      <label className="label" style={{ fontWeight: 700, color: '#444', marginBottom: '0.75rem', display: 'block' }}>Project Tags</label>
                      <Input 
                        value={projectTagInput} 
                        onChange={e => setProjectTagInput(e.target.value)} 
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (projectTagInput.trim() && !projForm.tags?.includes(projectTagInput.trim())) {
                              setProjForm({ ...projForm, tags: [...(projForm.tags || []), projectTagInput.trim()] });
                              setProjectTagInput('');
                            }
                          }
                        }}
                        placeholder="Type tag and press Enter" 
                        style={{ padding: '1rem' }} 
                      />
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                        {projForm.tags?.map(tag => (
                          <span key={tag} className="badge badge--draft" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#f0f0f0', color: '#444', padding: '0.4rem 0.8rem', borderRadius: '2rem', fontSize: '0.8rem' }}>
                            {tag} <i className="ph ph-x" style={{ cursor: 'pointer' }} onClick={() => setProjForm({ ...projForm, tags: projForm.tags?.filter(t => t !== tag) })} />
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="label" style={{ fontWeight: 700, color: '#444', marginBottom: '0.75rem', display: 'block' }}>Key Skills</label>
                      <Input 
                        value={projectSkillInput} 
                        onChange={e => setProjectSkillInput(e.target.value)} 
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (projectSkillInput.trim() && !projForm.skills?.includes(projectSkillInput.trim())) {
                              setProjForm({ ...projForm, skills: [...(projForm.skills || []), projectSkillInput.trim()] });
                              setProjectSkillInput('');
                            }
                          }
                        }}
                        placeholder="Type skill and press Enter" 
                        style={{ padding: '1rem' }} 
                      />
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                        {projForm.skills?.map(skill => (
                          <span key={skill} className="badge badge--published" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.8rem', borderRadius: '2rem', fontSize: '0.8rem' }}>
                            {skill} <i className="ph ph-x" style={{ cursor: 'pointer' }} onClick={() => setProjForm({ ...projForm, skills: projForm.skills?.filter(s => s !== skill) })} />
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="label" style={{ fontWeight: 700, color: '#444', marginBottom: '1rem', display: 'block' }}>Related Articles (Pinned)</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto', padding: '1rem', background: '#fbfbfb', borderRadius: '1rem', border: '1px solid #eee' }}>
                      {availableItems.filter(i => i.type === 'article').map(art => {
                        const isPinned = projForm.relatedArticles?.includes(art.id);
                        return (
                          <div 
                            key={art.id} 
                            onClick={() => {
                              const current = projForm.relatedArticles || [];
                              const updated = isPinned ? current.filter(id => id !== art.id) : [...current, art.id];
                              setProjForm({ ...projForm, relatedArticles: updated });
                            }}
                            style={{ 
                              padding: '0.75rem 1rem', 
                              borderRadius: '0.75rem', 
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              background: isPinned ? '#eef6ff' : 'transparent',
                              border: `1px solid ${isPinned ? 'var(--color-accent)' : 'transparent'}`,
                              transition: 'all 0.2s'
                            }}
                          >
                            <span style={{ fontSize: '0.9rem', color: isPinned ? 'var(--color-accent)' : '#444', fontWeight: isPinned ? 700 : 400 }}>{art.title}</span>
                            {isPinned && <i className="ph ph-push-pin-fill" style={{ color: 'var(--color-accent)' }} />}
                          </div>
                        );
                      })}
                      {availableItems.filter(i => i.type === 'article').length === 0 && <div style={{ textAlign: 'center', color: '#999', padding: '1rem' }}>No articles found to pin.</div>}
                    </div>
                  </div>

                  <div>
                    <label className="label" style={{ fontWeight: 700, color: '#444', marginBottom: '1rem', display: 'block' }}>External Resources</label>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                      <Input value={resourceForm.title} onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })} placeholder="Resource Title (e.g. GitHub Repo)" style={{ flex: 1 }} />
                      <Input value={resourceForm.url} onChange={e => setResourceForm({ ...resourceForm, url: e.target.value })} placeholder="https://..." style={{ flex: 2 }} />
                      <Button 
                        variant="secondary" 
                        onClick={() => {
                          if (resourceForm.title && resourceForm.url) {
                            setProjForm({ ...projForm, resources: [...(projForm.resources || []), resourceForm] });
                            setResourceForm({ title: '', url: '' });
                          }
                        }}
                      >Add</Button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {projForm.resources?.map((res, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#f8f8f8', borderRadius: '0.75rem' }}>
                          <div style={{ fontSize: '0.9rem' }}>
                            <span style={{ fontWeight: 700, color: '#111' }}>{res.title}</span>
                            <span style={{ color: '#888', marginLeft: '0.5rem' }}>({res.url})</span>
                          </div>
                          <i className="ph ph-trash" style={{ color: '#ef4444', cursor: 'pointer' }} onClick={() => setProjForm({ ...projForm, resources: projForm.resources?.filter((_, i) => i !== idx) })} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="label" style={{ fontWeight: 700, color: '#444', marginBottom: '1.25rem', display: 'block' }}>Project Preview Image</label>
                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                      <Button variant="secondary" onClick={() => projectInputRef.current?.click()} loading={isUploadingNested === 'project'} style={{ flex: 1, height: '48px' }}>
                        {projForm.image ? 'Change Image' : 'Upload Image'}
                      </Button>
                      <input type="file" ref={projectInputRef} hidden accept="image/*" onChange={(e) => e.target.files?.[0] && handleNestedFileUpload('project', e.target.files[0])} />
                    </div>
                    {projForm.image && <img src={projForm.image} style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '1.5rem', marginTop: '2rem', border: '1px solid #eee' }} />}
                  </div>
                </div>
              </div>
              <div style={{ padding: '2rem 3rem', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '1.5rem', background: '#fcfcfc' }}>
                <Button variant="secondary" onClick={() => setShowProjectModal(false)} style={{ flex: 1, height: '54px' }}>Cancel</Button>
                <Button variant="primary" onClick={saveProject} style={{ flex: 2, height: '54px' }}>Save Project</Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showGitHubReposModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <motion.div initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }} className="card" style={{ width: '100%', maxWidth: '700px', background: '#ffffff', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: '1.5rem', boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.35)', border: '1px solid #eeeeee' }}>
              <div style={{ padding: '1.75rem 3rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#111', fontFamily: 'var(--font-merriweather), serif' }}>Import Repository</h3>
                <Button variant="ghost" onClick={() => setShowGitHubReposModal(false)} style={{ padding: '0.5rem', borderRadius: '50%' }}><i className="ph ph-x" style={{ fontSize: '1.5rem' }} /></Button>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                {loadingRepos ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1rem' }}>
                    <i className="ph ph-spinner animate-spin" style={{ fontSize: '2.5rem', color: 'var(--color-accent)' }} />
                    <p style={{ color: '#666', fontWeight: 600 }}>Fetching your repositories...</p>
                  </div>
                ) : gitHubRepos.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {gitHubRepos.map((repo, i) => (
                      <div 
                        key={i} 
                        onClick={() => importRepoAsProject(repo)}
                        style={{ 
                          padding: '1.25rem', 
                          border: '1px solid #eee', 
                          borderRadius: '1rem', 
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          background: '#fff'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.background = '#f9f9f9'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#eee'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <h4 style={{ margin: 0, color: '#111', fontSize: '1.1rem', fontWeight: 700 }}>{repo.title}</h4>
                          <i className="ph ph-github-logo" style={{ fontSize: '1.25rem', color: '#555' }} />
                        </div>
                        {repo.description && <p style={{ margin: 0, fontSize: '0.9rem', color: '#666', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{repo.description}</p>}
                        <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 600 }}>{repo.link}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <p style={{ color: '#666' }}>No repositories found or GitHub not connected properly.</p>
                  </div>
                )}
              </div>
              
              <div style={{ padding: '1.5rem 3rem', borderTop: '1px solid #f0f0f0', background: '#fcfcfc', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>Select a repository to import it as a featured project.</p>
              </div>
            </motion.div>
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
