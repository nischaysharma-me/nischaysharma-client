'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { Post, PostInput, PostStatus } from '@/lib/types/post';
import { postsService } from '@/services/posts.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import { usersService } from '@/services/users.service';
import { useImageCrop } from '@/components/image/ImageCropProvider';

const emptyForm: PostInput = {
  title: '',
  content: '',
  imageUrl: '',
  imageAltText: '',
  tags: [],
  status: 'draft'
};

export default function PostEditor({ postId }: { postId?: string }) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [form, setForm] = useState<PostInput>(emptyForm);
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(Boolean(postId));
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [visualDirection, setVisualDirection] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { cropImageUrl } = useImageCrop();

  useEffect(() => {
    if (!postId) return;
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const response = await postsService.getById(postId, token);
        if (!response.data) throw new Error('Post not found');
        setPost(response.data);
        setForm({
          title: response.data.title,
          content: response.data.content,
          imageUrl: response.data.imageUrl || '',
          imageAltText: response.data.imageAltText || '',
          tags: response.data.tags || [],
          status: response.data.status
        });
        setTags((response.data.tags || []).join(', '));
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [postId]);

  const normalizedForm = (): PostInput => ({
    ...form,
    title: form.title.trim(),
    content: form.content.trim(),
    imageUrl: form.imageUrl?.trim(),
    imageAltText: form.imageAltText?.trim(),
    tags: tags.split(',').map((tag) => tag.trim().replace(/^#/, '')).filter(Boolean).slice(0, 12)
  });

  const save = async () => {
    const payload = normalizedForm();
    if (!payload.title) return toast.error('Post title is required');
    if (!payload.content) return toast.error('Post content is required');

    try {
      setSaving(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');
      const response = postId
        ? await postsService.update(postId, payload, token)
        : await postsService.create(payload, token);
      if (!response.data) throw new Error('The post could not be saved');
      setPost(response.data);
      setForm((current) => ({ ...current, status: response.data!.status }));
      toast.success(postId ? 'Post saved' : 'Draft created');
      if (!postId) router.replace(`/admin/posts/${response.data.id}`);
    } catch (error) {
      toast.error(`Could not save post: ${(error as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    if (!postId) {
      toast.error('Save the draft before publishing');
      return;
    }
    try {
      setPublishing(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');
      const response = await postsService.publish(postId, token);
      if (response.data) {
        setPost(response.data);
        setForm((current) => ({ ...current, status: response.data!.status }));
      }
      toast.success('Post published to your feed');
    } catch (error) {
      toast.error(`Could not publish post: ${(error as Error).message}`);
    } finally {
      setPublishing(false);
    }
  };

  const generateImage = async () => {
    if (!postId) {
      toast.error('Save the draft before generating an image');
      return;
    }
    const payload = normalizedForm();
    if (!payload.title || !payload.content) {
      toast.error('Add a headline and post copy first');
      return;
    }
    try {
      setGeneratingImage(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');
      await postsService.update(postId, payload, token);
      const response = await postsService.generateImage(postId, { visualDirection: visualDirection.trim() }, token);
      if (!response.data?.imageUrl) throw new Error('AI did not return a post image');
      setPost(response.data);
      setForm((current) => ({
        ...current,
        imageUrl: response.data!.imageUrl || '',
        imageAltText: response.data!.imageAltText || current.imageAltText
      }));
      toast.success('Post image generated');
    } catch (error) {
      toast.error(`Image generation failed: ${(error as Error).message}`);
    } finally {
      setGeneratingImage(false);
    }
  };

  const uploadImage = async (file?: File) => {
    if (!file) return;
    try {
      setUploadingImage(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');
      const response = await usersService.uploadAsset(file, 'posts', token);
      if (!response.success || !response.url) throw new Error('Upload failed');
      update('imageUrl', response.url);
      toast.success('Cropped post image uploaded');
    } catch (uploadError) {
      toast.error(`Image upload failed: ${(uploadError as Error).message}`);
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const cropCurrentImage = async () => {
    if (!form.imageUrl) return;
    try {
      const cropped = await cropImageUrl(form.imageUrl, { aspect: 16 / 10, label: 'post image', maxWidth: 1800 });
      if (cropped) await uploadImage(cropped);
    } catch (cropError) {
      toast.error(`Unable to crop current image: ${(cropError as Error).message}`);
    }
  };

  const update = <K extends keyof PostInput>(key: K, value: PostInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  if (loading) return <div className="posts-admin__empty">Loading post…</div>;

  return (
    <div className="post-editor">
      <header className="post-editor__header">
        <div className="dashboard__title">
          <span className="post-editor__eyebrow">Short-form publishing</span>
          <h2>{postId ? 'Edit post' : 'Create post'}</h2>
          <p>Write once, publish to your feed, and adapt it for LinkedIn.</p>
        </div>
        <div className="post-editor__header-actions">
          <Link className="btn btn--secondary btn--md" href="/admin/posts">Cancel</Link>
          <Button variant="primary" onClick={save} loading={saving}>Save {postId ? 'changes' : 'draft'}</Button>
          {postId && form.status !== 'published' && <Button variant="primary" onClick={publish} loading={publishing}>Publish</Button>}
        </div>
      </header>

      <div className="post-editor__grid">
        <section className="post-editor__canvas">
          <Input label="Headline" required maxLength={160} value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="A clear label for this post" />
          <label className="post-editor__label" htmlFor="post-content">Post copy <span>*</span></label>
          <textarea id="post-content" maxLength={10000} value={form.content} onChange={(event) => update('content', event.target.value)} placeholder="Share an idea, lesson, observation, or update…" />
          <div className="post-editor__count">{form.content.length.toLocaleString()} / 10,000</div>
        </section>

        <aside className="post-editor__sidebar">
          <div className="post-editor__panel">
            <h3>Distribution</h3>
            {postId ? (
              <Link className="linkedin-launcher" href={`/admin/posts/${postId}/post/linkedin`}>
                <span className="linkedin-launcher__icon"><i className="ph ph-linkedin-logo" /></span>
                <span><strong>Create LinkedIn post</strong><small>Open the publishing studio</small></span>
                <i className="ph ph-arrow-right" />
              </Link>
            ) : <p>Save the draft to unlock LinkedIn publishing.</p>}
          </div>

          <div className="post-editor__panel">
            <h3>Media and discovery</h3>
            <div className="post-editor__image-generator">
              <Input label="AI visual direction" value={visualDirection} onChange={(event) => setVisualDirection(event.target.value)} placeholder="Optional mood, subject, or art direction" />
              <Button type="button" variant="secondary" size="full" onClick={generateImage} loading={generatingImage} disabled={!postId} leftIcon={<i className="ph ph-magic-wand" />}>
                {form.imageUrl ? 'Regenerate post image' : 'Generate post image'}
              </Button>
              <Button type="button" variant="secondary" size="full" onClick={() => imageInputRef.current?.click()} loading={uploadingImage} leftIcon={<i className="ph ph-crop" />}>
                Upload and crop image
              </Button>
              {form.imageUrl && (
                <Button type="button" variant="secondary" size="full" onClick={cropCurrentImage} disabled={uploadingImage} leftIcon={<i className="ph ph-corners-out" />}>
                  Crop current image
                </Button>
              )}
              <input
                ref={imageInputRef}
                type="file"
                hidden
                accept="image/*"
                data-crop-aspect="16/10"
                data-crop-label="post image"
                data-crop-max-width="1800"
                onChange={(event) => uploadImage(event.target.files?.[0])}
              />
              {!postId && <small>Save the draft to enable image generation.</small>}
              <Link href="/admin/prompt-library?prompt=post.image">Tune the post image prompt</Link>
            </div>
            <Input label="Image URL" type="url" value={form.imageUrl} onChange={(event) => update('imageUrl', event.target.value)} placeholder="https://…" />
            {form.imageUrl && <img className="post-editor__preview" src={form.imageUrl} alt="Post preview" />}
            <Input label="Image alt text" maxLength={300} value={form.imageAltText} onChange={(event) => update('imageAltText', event.target.value)} placeholder="Describe the image" />
            <Input label="Tags" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="ai, engineering, notes" />
          </div>

          {postId && (
            <div className="post-editor__panel">
              <label className="post-editor__label" htmlFor="post-status">Status</label>
              <select id="post-status" value={form.status} onChange={(event) => update('status', event.target.value as PostStatus)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
              {post?.publishedAt && <small>Published {new Date(post.publishedAt).toLocaleDateString()}</small>}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
