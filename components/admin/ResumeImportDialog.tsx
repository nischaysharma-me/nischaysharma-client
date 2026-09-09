'use client';

import React, { useMemo, useRef, useState } from 'react';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { ResumeImportPayload, ResumePreview, ResumeSection, usersService } from '@/services/users.service';

const sectionOptions: Array<{ id: ResumeSection; label: string; hint: string; icon: string }> = [
  { id: 'basics', label: 'Contact & title', hint: 'Name, email, occupation', icon: 'ph-user' },
  { id: 'summary', label: 'Biography', hint: 'Professional summary', icon: 'ph-text-align-left' },
  { id: 'skills', label: 'Skills', hint: 'Skills and expertise', icon: 'ph-sparkle' },
  { id: 'experience', label: 'Experience', hint: 'Companies and roles', icon: 'ph-briefcase' },
  { id: 'education', label: 'Education', hint: 'Schools and qualifications', icon: 'ph-graduation-cap' },
  { id: 'projects', label: 'Projects', hint: 'Selected work and links', icon: 'ph-folder-open' },
  { id: 'socialLinks', label: 'Social links', hint: 'LinkedIn, GitHub and more', icon: 'ph-link' },
];

type SelectedMap = Record<string, boolean>;

const hasText = (value: unknown) => typeof value === 'string' && value.trim().length > 0;

function selectionFor(preview: ResumePreview): SelectedMap {
  const selected: SelectedMap = {};
  Object.entries(preview.basics || {}).forEach(([field, value]) => { if (hasText(value)) selected[`basics.${field}`] = true; });
  if (hasText(preview.summary)) selected.summary = true;
  preview.skills.forEach((_, index) => { selected[`skills.${index}`] = true; });
  preview.expertise.forEach((_, index) => { selected[`expertise.${index}`] = true; });
  preview.experience.forEach((_, index) => { selected[`experience.${index}`] = true; });
  preview.education.forEach((_, index) => { selected[`education.${index}`] = true; });
  preview.projects.forEach((_, index) => { selected[`projects.${index}`] = true; });
  Object.entries(preview.socialLinks || {}).forEach(([field, value]) => { if (hasText(value)) selected[`socialLinks.${field}`] = true; });
  return selected;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onImported: () => Promise<void> | void;
}

export default function ResumeImportDialog({ open, onClose, onImported }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [sections, setSections] = useState<ResumeSection[]>(sectionOptions.map((section) => section.id));
  const [preview, setPreview] = useState<ResumePreview | null>(null);
  const [selected, setSelected] = useState<SelectedMap>({});
  const [extracting, setExtracting] = useState(false);
  const [importing, setImporting] = useState(false);

  const selectedCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected]);
  if (!open) return null;

  const reset = () => {
    setFile(null);
    setPreview(null);
    setSelected({});
    setSections(sectionOptions.map((section) => section.id));
    if (inputRef.current) inputRef.current.value = '';
  };

  const close = () => {
    if (extracting || importing) return;
    reset();
    onClose();
  };

  const toggleSection = (section: ResumeSection) => {
    setSections((current) => current.includes(section) ? current.filter((item) => item !== section) : [...current, section]);
  };

  const extract = async () => {
    if (!file) return toast.error('Choose a PDF, DOCX, or text resume first');
    if (!sections.length) return toast.error('Choose at least one section');
    try {
      setExtracting(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Please sign in again');
      const response = await usersService.previewResume(file, sections, token);
      setPreview(response.data.data);
      setSelected(selectionFor(response.data.data));
      toast.success('Resume extracted. Review every item before importing.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to extract resume');
    } finally {
      setExtracting(false);
    }
  };

  const updateListItem = (group: 'skills' | 'expertise', index: number, value: string) => {
    setPreview((current) => current ? { ...current, [group]: current[group].map((item, itemIndex) => itemIndex === index ? value : item) } : current);
  };

  const buildPayload = (): ResumeImportPayload => {
    if (!preview) return {};
    const profile: Record<string, unknown> = {};
    (['displayName', 'email', 'occupation'] as const).forEach((field) => {
      if (selected[`basics.${field}`] && preview.basics[field]) profile[field] = preview.basics[field];
    });
    if (selected.summary) profile.bio = preview.summary;
    const skills = preview.skills.filter((_, index) => selected[`skills.${index}`]).map((item) => item.trim()).filter(Boolean);
    const expertise = preview.expertise.filter((_, index) => selected[`expertise.${index}`]).map((item) => item.trim()).filter(Boolean);
    if (skills.length) profile.skills = skills;
    if (expertise.length) profile.expertise = expertise;
    const socialLinks = Object.fromEntries(Object.entries(preview.socialLinks).filter(([field, value]) => selected[`socialLinks.${field}`] && hasText(value)));
    if (Object.keys(socialLinks).length) profile.socialLinks = socialLinks;
    const payload: ResumeImportPayload = {};
    if (Object.keys(profile).length) payload.profile = profile;
    const experience = preview.experience.filter((_, index) => selected[`experience.${index}`]);
    const education = preview.education.filter((_, index) => selected[`education.${index}`]);
    const projects = preview.projects.filter((_, index) => selected[`projects.${index}`]);
    if (experience.length) payload.experience = experience;
    if (education.length) payload.education = education;
    if (projects.length) payload.projects = projects;
    return payload;
  };

  const importSelected = async () => {
    const payload = buildPayload();
    if (!Object.keys(payload).length) return toast.error('Select at least one item to import');
    try {
      setImporting(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Please sign in again');
      const response = await usersService.applyResumeImport(payload, token);
      const created = Object.values(response.data.created).reduce((sum, count) => sum + count, 0);
      const skipped = Object.values(response.data.skipped).reduce((sum, count) => sum + count, 0);
      toast.success(`Resume imported${created ? ` · ${created} records added` : ''}${skipped ? ` · ${skipped} duplicates skipped` : ''}`);
      await onImported();
      reset();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to import selected items');
    } finally {
      setImporting(false);
    }
  };

  const toggle = (key: string) => setSelected((current) => ({ ...current, [key]: !current[key] }));

  return (
    <div className="resume-import" role="dialog" aria-modal="true" aria-labelledby="resume-import-title">
      <button className="resume-import__backdrop" onClick={close} aria-label="Close resume importer" />
      <section className="resume-import__panel">
        <header className="resume-import__header">
          <div>
            <span className="resume-import__eyebrow">Selective import</span>
            <h2 id="resume-import-title">{preview ? 'Review extracted details' : 'Import from your resume'}</h2>
            <p>{preview ? 'Edit the result and untick anything you do not want to save.' : 'Choose exactly what the system may extract. Your document is processed in memory and is not stored.'}</p>
          </div>
          <button className="resume-import__close" onClick={close} aria-label="Close"><i className="ph ph-x" /></button>
        </header>

        {!preview ? (
          <div className="resume-import__body">
            <button type="button" className={`resume-import__dropzone ${file ? 'is-ready' : ''}`} onClick={() => inputRef.current?.click()}>
              <input ref={inputRef} type="file" hidden accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" onChange={(event) => setFile(event.target.files?.[0] || null)} />
              <i className={`ph ${file ? 'ph-file-check' : 'ph-file-arrow-up'}`} />
              <strong>{file ? file.name : 'Choose a resume'}</strong>
              <span>{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB · click to replace` : 'PDF, DOCX, or TXT · maximum 10 MB'}</span>
            </button>
            <div className="resume-import__section-heading">
              <div><strong>What should be extracted?</strong><span>{sections.length} of {sectionOptions.length} categories selected</span></div>
              <button type="button" onClick={() => setSections(sections.length === sectionOptions.length ? [] : sectionOptions.map((section) => section.id))}>{sections.length === sectionOptions.length ? 'Clear all' : 'Select all'}</button>
            </div>
            <div className="resume-import__categories">
              {sectionOptions.map((section) => {
                const active = sections.includes(section.id);
                return <button type="button" key={section.id} className={active ? 'is-selected' : ''} onClick={() => toggleSection(section.id)} aria-pressed={active}>
                  <i className={`ph ${section.icon}`} /><span><strong>{section.label}</strong><small>{section.hint}</small></span><i className={active ? 'ph-fill ph-check-circle' : 'ph ph-circle'} />
                </button>;
              })}
            </div>
          </div>
        ) : (
          <div className="resume-import__body resume-import__review">
            {(Object.keys(preview.basics) as Array<keyof typeof preview.basics>).map((field) => hasText(preview.basics[field]) && (
              <ReviewField key={field} checked={!!selected[`basics.${field}`]} onToggle={() => toggle(`basics.${field}`)} label={field === 'displayName' ? 'Name' : field === 'occupation' ? 'Occupation' : 'Email'} value={preview.basics[field] || ''} onChange={(value) => setPreview({ ...preview, basics: { ...preview.basics, [field]: value } })} />
            ))}
            {hasText(preview.summary) && <ReviewField checked={!!selected.summary} onToggle={() => toggle('summary')} label="Biography" value={preview.summary} multiline onChange={(value) => setPreview({ ...preview, summary: value })} />}
            <ReviewTags title="Skills" items={preview.skills} prefix="skills" selected={selected} onToggle={toggle} onChange={(index, value) => updateListItem('skills', index, value)} />
            <ReviewTags title="Expertise" items={preview.expertise} prefix="expertise" selected={selected} onToggle={toggle} onChange={(index, value) => updateListItem('expertise', index, value)} />
            <ReviewCards title="Experience" items={preview.experience} prefix="experience" selected={selected} onToggle={toggle} render={(item, index) => <>
              <input value={item.company} aria-label="Company" onChange={(event) => setPreview({ ...preview, experience: preview.experience.map((entry, i) => i === index ? { ...entry, company: event.target.value } : entry) })} />
              <span>{item.roles.map((role) => [role.title, role.startDate && role.endDate ? `${role.startDate} – ${role.endDate}` : ''].filter(Boolean).join(' · ')).join(' / ')}</span>
            </>} />
            <ReviewCards title="Education" items={preview.education} prefix="education" selected={selected} onToggle={toggle} render={(item, index) => <>
              <input value={item.school} aria-label="School" onChange={(event) => setPreview({ ...preview, education: preview.education.map((entry, i) => i === index ? { ...entry, school: event.target.value } : entry) })} />
              <span>{[item.degree, item.fieldOfStudy, item.startDate && item.endDate ? `${item.startDate} – ${item.endDate}` : ''].filter(Boolean).join(' · ')}</span>
            </>} />
            <ReviewCards title="Projects" items={preview.projects} prefix="projects" selected={selected} onToggle={toggle} render={(item, index) => <>
              <input value={item.title} aria-label="Project title" onChange={(event) => setPreview({ ...preview, projects: preview.projects.map((entry, i) => i === index ? { ...entry, title: event.target.value } : entry) })} />
              <span>{item.description}</span>
            </>} />
            {(Object.keys(preview.socialLinks) as Array<keyof typeof preview.socialLinks>).map((field) => hasText(preview.socialLinks[field]) && (
              <ReviewField key={field} checked={!!selected[`socialLinks.${field}`]} onToggle={() => toggle(`socialLinks.${field}`)} label={field} value={preview.socialLinks[field] || ''} onChange={(value) => setPreview({ ...preview, socialLinks: { ...preview.socialLinks, [field]: value } })} />
            ))}
          </div>
        )}

        <footer className="resume-import__footer">
          {preview ? <Button variant="secondary" onClick={() => { setPreview(null); setSelected({}); }}>Back</Button> : <Button variant="ghost" onClick={close}>Cancel</Button>}
          <div className="resume-import__footer-action">
            {preview && <span>{selectedCount} selected</span>}
            {preview ? <Button onClick={importSelected} loading={importing} disabled={!selectedCount}>Import selected</Button> : <Button onClick={extract} loading={extracting} disabled={!file || !sections.length}>Extract for review</Button>}
          </div>
        </footer>
      </section>
    </div>
  );
}

function ReviewField({ checked, onToggle, label, value, onChange, multiline = false }: { checked: boolean; onToggle: () => void; label: string; value: string; onChange: (value: string) => void; multiline?: boolean }) {
  return <div className={`resume-import__review-row ${checked ? 'is-selected' : ''}`}>
    <input type="checkbox" checked={checked} onChange={onToggle} aria-label={`Import ${label}`} />
    <label><span>{label}</span>{multiline ? <textarea rows={4} value={value} onChange={(event) => onChange(event.target.value)} /> : <input value={value} onChange={(event) => onChange(event.target.value)} />}</label>
  </div>;
}

function ReviewTags({ title, items, prefix, selected, onToggle, onChange }: { title: string; items: string[]; prefix: string; selected: SelectedMap; onToggle: (key: string) => void; onChange: (index: number, value: string) => void }) {
  if (!items.length) return null;
  return <section className="resume-import__review-group"><h3>{title}</h3><div className="resume-import__tags">{items.map((item, index) => <label key={`${prefix}-${index}`} className={selected[`${prefix}.${index}`] ? 'is-selected' : ''}><input type="checkbox" checked={!!selected[`${prefix}.${index}`]} onChange={() => onToggle(`${prefix}.${index}`)} /><input value={item} aria-label={`${title} item`} onChange={(event) => onChange(index, event.target.value)} /></label>)}</div></section>;
}

function ReviewCards<T>({ title, items, prefix, selected, onToggle, render }: { title: string; items: T[]; prefix: string; selected: SelectedMap; onToggle: (key: string) => void; render: (item: T, index: number) => React.ReactNode }) {
  if (!items.length) return null;
  return <section className="resume-import__review-group"><h3>{title}</h3><div className="resume-import__cards">{items.map((item, index) => <div key={`${prefix}-${index}`} className={selected[`${prefix}.${index}`] ? 'is-selected' : ''}><input type="checkbox" checked={!!selected[`${prefix}.${index}`]} onChange={() => onToggle(`${prefix}.${index}`)} aria-label={`Import ${title} item ${index + 1}`} /><div>{render(item, index)}</div></div>)}</div></section>;
}
