'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { usersService } from '@/services/users.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

export default function ProfileClient() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form State
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [projects, setProjects] = useState<{title: string, description: string, link?: string}[]>([]);
  const [newProject, setNewProject] = useState({title: '', description: '', link: ''});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      
      const response = await usersService.getMe(token);
      if (response.success) {
        const userData = response.data;
        setUser(userData);
        setDisplayName(userData.displayName || '');
        setBio(userData.bio || '');
        setSkills(userData.skills || []);
        setResumeUrl(userData.resumeUrl || '');
        setProjects(userData.projects || []);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
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
        bio,
        skills,
        resumeUrl,
        projects
      } as any, token);

      if (response.success) {
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

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
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

  if (loading) return <div>Loading profile...</div>;

  return (
    <div className="profile-edit">
      <div className="dashboard__title">
        <h2>User Profile</h2>
        <p>Update your public identity and professional details.</p>
      </div>

      <div className="card card--padded">
        <form onSubmit={handleUpdateProfile} className="form-layout">
          <div className="form-group">
            <label className="label">Full Name</label>
            <Input 
              type="text" 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="form-group">
            <label className="label">Professional Bio / Description</label>
            <textarea 
              className="textarea"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={5}
            />
          </div>

          <div className="form-group">
            <label className="label">Technical Skills</label>
            <Input 
              type="text" 
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={addSkill}
              placeholder="Press Enter to add skills (e.g. React, Python)"
            />
            <div className="skills-tag-container">
              {skills.map((skill) => (
                <span key={skill} className="skill-tag">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)}>
                    <i className="ph ph-x-circle" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="label">Resume URL</label>
            <Input 
              type="url" 
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              placeholder="https://your-resume-link.com"
            />
          </div>

          <div className="form-divider" style={{ margin: '1rem 0', borderTop: '1px solid var(--color-border)' }}></div>

          <div className="form-group">
            <label className="label">Featured Projects</label>
            <div className="project-builder" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="project-inputs" style={{ display: 'grid', gap: '1rem', padding: '1.5rem', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <Input 
                  type="text" 
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                  placeholder="Project Title"
                />
                <textarea 
                  className="textarea"
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  placeholder="Short project description..."
                  rows={2}
                />
                <Input 
                  type="url" 
                  value={newProject.link}
                  onChange={(e) => setNewProject({...newProject, link: e.target.value})}
                  placeholder="Link (Optional)"
                />
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={addProject}
                  disabled={!newProject.title || !newProject.description}
                >
                  <i className="ph ph-plus" style={{ marginRight: '0.4rem' }} />
                  <span>Add Project to List</span>
                </Button>
              </div>

              <div className="project-list" style={{ display: 'grid', gap: '1rem' }}>
                {projects.length === 0 && <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>No projects added yet.</p>}
                {projects.map((project, index) => (
                  <div key={index} className="project-item" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    padding: '1rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg-primary)'
                  }}>
                    <div className="project-item-content">
                      <h4 style={{ margin: 0, fontSize: '1rem' }}>{project.title}</h4>
                      <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{project.description}</p>
                      {project.link && <a href={project.link} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--color-text-accent)' }}>{project.link}</a>}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeProject(index)}
                      style={{ color: 'var(--color-error)', padding: '0 0.5rem' }}
                    >
                      <i className="ph ph-trash" style={{ fontSize: '1.25rem' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <Button 
              type="submit" 
              variant="primary" 
              loading={saving}
              disabled={saving}
            >
              <i className="ph ph-floppy-disk" style={{ marginRight: '0.4rem' }} />
              <span>Save Profile & Projects</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
