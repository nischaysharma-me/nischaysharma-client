'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { getAuthToken } from '@/lib/auth';
import { PromptDefinition, PromptRevision } from '@/lib/types/prompt';
import { promptsService } from '@/services/prompts.service';

const sampleValue = (variable: string): unknown => {
  if (/json|outline|structure|sections|headings/i.test(variable)) return [{ title: `Sample ${variable}`, summary: 'Preview content' }];
  if (/count|number|index/i.test(variable)) return 3;
  return `[${variable}]`;
};

export default function PromptLibraryClient() {
  const [prompts, setPrompts] = useState<PromptDefinition[]>([]);
  const [selectedKey, setSelectedKey] = useState('');
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [preview, setPreview] = useState('');
  const [revisions, setRevisions] = useState<PromptRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const selected = prompts.find((prompt) => prompt.key === selectedKey) || null;
  const isDirty = Boolean(selected && draft !== selected.template);
  const categories = useMemo(() => ['All', ...Array.from(new Set(prompts.map((prompt) => prompt.category))).sort()], [prompts]);
  const visiblePrompts = useMemo(() => prompts.filter((prompt) => {
    const matchesCategory = category === 'All' || prompt.category === category;
    const haystack = `${prompt.name} ${prompt.key} ${prompt.description}`.toLowerCase();
    return matchesCategory && haystack.includes(query.trim().toLowerCase());
  }), [prompts, category, query]);

  const requireToken = useCallback(async () => {
    const token = await getAuthToken();
    if (!token) throw new Error('Your admin session has expired. Please sign in again.');
    return token;
  }, []);

  const loadPrompts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await promptsService.list(await requireToken());
      const nextPrompts = response.data || [];
      setPrompts(nextPrompts);
      setSelectedKey((current) => current || nextPrompts[0]?.key || '');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load prompts');
    } finally {
      setLoading(false);
    }
  }, [requireToken]);

  useEffect(() => { loadPrompts(); }, [loadPrompts]);
  useEffect(() => {
    if (selected) {
      setDraft(selected.template);
      setPreview('');
      setRevisions([]);
      setHistoryOpen(false);
    }
  }, [selectedKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  const selectPrompt = (key: string) => {
    if (key === selectedKey) return;
    if (isDirty && !window.confirm('Discard your unsaved prompt changes?')) return;
    setSelectedKey(key);
  };

  const replacePrompt = (updated: PromptDefinition) => {
    setPrompts((current) => current.map((prompt) => prompt.key === updated.key ? updated : prompt));
    setDraft(updated.template);
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const response = await promptsService.update(selected.key, draft, await requireToken());
      if (response.data) replacePrompt(response.data);
      toast.success('Prompt saved. New generations will use it shortly.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save prompt');
    } finally {
      setSaving(false);
    }
  };

  const renderPreview = async () => {
    if (!selected) return;
    setPreviewing(true);
    try {
      const values = Object.fromEntries(selected.variables.map((variable) => [variable, sampleValue(variable)]));
      const response = await promptsService.preview(selected.key, draft, values, await requireToken());
      setPreview(response.data?.rendered || '');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to preview prompt');
    } finally {
      setPreviewing(false);
    }
  };

  const resetCurrent = async () => {
    if (!selected || !window.confirm(`Reset “${selected.name}” to its committed default?`)) return;
    try {
      const response = await promptsService.reset(selected.key, await requireToken());
      if (response.data) replacePrompt(response.data);
      setPreview('');
      toast.success('Prompt reset to default');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to reset prompt');
    }
  };

  const resetAll = async () => {
    if (!window.confirm('Reset every prompt to its committed default? Existing versions remain in history.')) return;
    setSaving(true);
    try {
      const response = await promptsService.resetAll(await requireToken());
      const next = response.data || [];
      setPrompts(next);
      const current = next.find((prompt) => prompt.key === selectedKey);
      if (current) setDraft(current.template);
      toast.success('All prompts reset to defaults');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to reset prompts');
    } finally {
      setSaving(false);
    }
  };

  const toggleHistory = async () => {
    if (!selected) return;
    const nextOpen = !historyOpen;
    setHistoryOpen(nextOpen);
    if (!nextOpen || revisions.length) return;
    try {
      const response = await promptsService.revisions(selected.key, await requireToken());
      setRevisions(response.data || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load prompt history');
    }
  };

  const rollback = async (revision: PromptRevision) => {
    if (!selected || !window.confirm('Restore this version? Your current version will be saved in history.')) return;
    try {
      const response = await promptsService.rollback(selected.key, revision.id, await requireToken());
      if (response.data) replacePrompt(response.data);
      setHistoryOpen(false);
      setRevisions([]);
      toast.success('Earlier prompt version restored');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to restore version');
    }
  };

  return (
    <section className="prompt-library">
      <header className="prompt-library__header">
        <div className="dashboard__title">
          <h2>Prompt Library</h2>
          <p>Edit the instructions used by article, book, image, social, and conversation generation.</p>
        </div>
        <Button variant="outline" onClick={resetAll} disabled={loading || saving}>Reset all defaults</Button>
      </header>

      <div className="prompt-library__workspace">
        <aside className="prompt-library__catalog">
          <div className="prompt-library__filters">
            <label className="prompt-library__search">
              <i className="ph ph-magnifying-glass" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search prompts" aria-label="Search prompts" />
            </label>
            <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category">
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <div className="prompt-library__list">
            {loading && <p className="prompt-library__empty">Loading prompt catalog…</p>}
            {!loading && !visiblePrompts.length && <p className="prompt-library__empty">No prompts match this filter.</p>}
            {visiblePrompts.map((prompt) => (
              <button key={prompt.key} className={`prompt-library__item ${selectedKey === prompt.key ? 'is-active' : ''}`} onClick={() => selectPrompt(prompt.key)}>
                <span className="prompt-library__item-title">{prompt.name}</span>
                <span className="prompt-library__item-meta">{prompt.category}<span aria-hidden="true">·</span>{prompt.isOverridden ? 'Edited' : 'Default'}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="prompt-library__editor">
          {!selected ? <div className="prompt-library__empty prompt-library__empty--large">Select a prompt to begin.</div> : <>
            <div className="prompt-library__editor-head">
              <div>
                <div className="prompt-library__eyebrow">{selected.category} / {selected.key}</div>
                <h3>{selected.name}</h3>
                <p>{selected.description}</p>
              </div>
              <span className={`prompt-library__status ${selected.isOverridden ? 'is-edited' : ''}`}>{selected.isOverridden ? 'Admin override' : selected.source === 'local' ? 'Local override' : 'Default'}</span>
            </div>

            <div className="prompt-library__variables">
              <span>Available variables</span>
              {selected.variables.length ? selected.variables.map((variable) => (
                <code key={variable} className={selected.requiredVariables.includes(variable) ? 'is-required' : ''}>{`{{${variable}}}`}</code>
              )) : <em>None</em>}
            </div>

            <label className="prompt-library__field">
              <span>Prompt template</span>
              <textarea value={draft} onChange={(event) => setDraft(event.target.value)} spellCheck={false} />
              <small>{draft.length.toLocaleString()} characters {isDirty ? '· Unsaved changes' : '· Saved'}</small>
            </label>

            <div className="prompt-library__actions">
              <Button onClick={save} loading={saving} disabled={!isDirty}>Save prompt</Button>
              <Button variant="secondary" onClick={renderPreview} loading={previewing}>Preview with sample values</Button>
              <Button variant="ghost" onClick={toggleHistory}>Version history</Button>
              <Button variant="ghost" onClick={resetCurrent} disabled={!selected.isOverridden && selected.source === 'default'}>Reset</Button>
            </div>

            {preview && <section className="prompt-library__preview"><h4>Rendered preview</h4><pre>{preview}</pre></section>}
            {historyOpen && <section className="prompt-library__history">
              <h4>Version history</h4>
              {!revisions.length && <p>No earlier versions yet.</p>}
              {revisions.map((revision) => <article key={revision.id}>
                <div><strong>{revision.changedAt ? new Date(revision.changedAt).toLocaleString() : 'Unknown date'}</strong><span>{revision.source}{revision.changedBy ? ` · ${revision.changedBy}` : ''}</span></div>
                <button onClick={() => rollback(revision)}>Restore</button>
              </article>)}
            </section>}
          </>}
        </main>
      </div>
    </section>
  );
}
