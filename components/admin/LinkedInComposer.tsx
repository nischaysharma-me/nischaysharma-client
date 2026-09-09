'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import {
  integrationsService,
  LinkedInPostFormat,
  LinkedInSlide
} from '@/services/integrations.service';
import { toast } from 'sonner';
import { useImageCrop } from '@/components/image/ImageCropProvider';

interface LinkedInComposerProps {
  connected: boolean;
  title: string;
  description?: string;
  type: 'article' | 'book' | 'post';
  sourcePath: string;
  initialImageUrl?: string;
  sourceContent?: string;
  mode?: 'modal' | 'page';
  backHref?: string;
}

const formatOptions: { value: LinkedInPostFormat; label: string; icon: string; detail: string }[] = [
  { value: 'text', label: 'Text', icon: 'ph-text-t', detail: 'Caption and link' },
  { value: 'image', label: 'Image', icon: 'ph-image', detail: 'Cover or upload' },
  { value: 'document', label: 'Slides', icon: 'ph-cards-three', detail: 'Swipeable PDF' }
];

const generationLabels: Record<LinkedInPostFormat, string> = {
  text: 'Generate copy',
  image: 'Generate copy & image',
  document: 'Generate slides'
};

export default function LinkedInComposer({
  connected,
  title,
  description = '',
  type,
  sourcePath,
  initialImageUrl = '',
  sourceContent = '',
  mode = 'modal',
  backHref = '/admin/articles'
}: LinkedInComposerProps) {
  const isPage = mode === 'page';
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<LinkedInPostFormat>('document');
  const [commentary, setCommentary] = useState(`I just published “${title}”.\n\n${description}`.trim());
  const [slides, setSlides] = useState<LinkedInSlide[]>([]);
  const [altText, setAltText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(initialImageUrl);
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatingSlide, setGeneratingSlide] = useState<number | null>(null);
  const [generatingAllSlides, setGeneratingAllSlides] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [needsReconnect, setNeedsReconnect] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const { cropImageUrl } = useImageCrop();

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!open || isPage) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isPage, open]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const canPublish = useMemo(() => {
    if (!commentary.trim()) return false;
    if (format === 'image') return Boolean(imageFile || generatedImageUrl || initialImageUrl);
    if (format === 'document') {
      return slides.length >= 2 && slides.every((slide) => slide.headline.trim() && slide.body.trim());
    }
    return true;
  }, [commentary, format, generatedImageUrl, imageFile, initialImageUrl, slides]);

  const sourceContext = useMemo(() => sourceContent
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 20000), [sourceContent]);

  const applyGeneratedImage = (url: string) => {
    if (!url) throw new Error('The image service did not return a preview URL');
    setImageFile(null);
    setGeneratedImageUrl(url);
    setImagePreview(url);
  };

  const generateImage = async (token?: string) => {
    const authToken = token || await auth.currentUser?.getIdToken();
    if (!authToken) throw new Error('No authentication token');
    const response = await integrationsService.generateLinkedInImage({ title, description, sourceContent: sourceContext, type }, authToken);
    if (!response.success) throw new Error('Image generation failed');
    applyGeneratedImage(response.data.url);
  };

  const generate = async () => {
    try {
      setGenerating(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');
      const [response] = await Promise.all([
        integrationsService.generateAIPost({ title, description, sourceContent: sourceContext, type, format }, token),
        ...(format === 'image' ? [generateImage(token)] : [])
      ]);
      if (response.success) {
        setCommentary(response.data.commentary || response.data.text);
        setSlides(response.data.slides || []);
        setAltText(response.data.imageAltText || '');
        toast.success(format === 'document' ? 'Editable slides generated' : format === 'image' ? 'LinkedIn copy and image generated' : 'LinkedIn copy generated');
      }
    } catch (error) {
      toast.error(`AI generation failed: ${(error as Error).message}`);
    } finally {
      setGenerating(false);
    }
  };

  const generateImageOnly = async () => {
    try {
      setGenerating(true);
      await generateImage();
      toast.success('LinkedIn image generated');
    } catch (error) {
      toast.error(`Image generation failed: ${(error as Error).message}`);
    } finally {
      setGenerating(false);
    }
  };

  const selectImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('Image must be smaller than 20 MB');
      return;
    }
    setImageFile(file);
    setGeneratedImageUrl('');
    setImagePreview(URL.createObjectURL(file));
  };

  const convertToSlideJpeg = async (file: File) => {
    if (!file.type.startsWith('image/')) throw new Error('Please choose an image file');
    if (file.size > 20 * 1024 * 1024) throw new Error('Image must be smaller than 20 MB');

    const bitmap = await createImageBitmap(file);
    const maximumDimension = 1800;
    const scale = Math.min(1, maximumDimension / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('This browser could not prepare the slide image');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Could not convert the slide image')), 'image/jpeg', 0.88);
    });
    return new File([blob], 'slide-image.jpg', { type: 'image/jpeg' });
  };

  const setSlideImage = async (index: number, file: File) => {
    const jpeg = await convertToSlideJpeg(file);
    const preview = URL.createObjectURL(jpeg);
    setSlides((current) => current.map((slide, slideIndex) => (
      slideIndex === index ? { ...slide, imageFile: jpeg, imageUrl: undefined, imagePreview: preview } : slide
    )));
  };

  const selectSlideImage = async (index: number, file?: File) => {
    if (!file) return;
    try {
      await setSlideImage(index, file);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const cropCurrentImage = async () => {
    if (!imagePreview) return;
    try {
      const cropped = await cropImageUrl(imagePreview, { aspect: 4 / 5, label: 'LinkedIn post image', maxWidth: 1200 });
      if (cropped) selectImage(cropped);
    } catch (error) {
      toast.error(`Unable to crop current image: ${(error as Error).message}`);
    }
  };

  const cropCurrentSlideImage = async (index: number) => {
    const preview = slides[index]?.imagePreview;
    if (!preview) return;
    try {
      const cropped = await cropImageUrl(preview, { aspect: 4 / 5, label: `LinkedIn slide ${index + 1}`, maxWidth: 1200 });
      if (cropped) await setSlideImage(index, cropped);
    } catch (error) {
      toast.error(`Unable to crop slide image: ${(error as Error).message}`);
    }
  };

  const requestSlideImage = async (index: number, token: string) => {
    const slide = slides[index];
    if (!slide) throw new Error(`Slide ${index + 1} was not found`);
    const response = await integrationsService.generateLinkedInImage({
      title,
      description,
      sourceContent: sourceContext,
      type,
      purpose: 'slide',
      slideHeadline: slide.headline,
      slideBody: slide.body,
      imagePrompt: slide.imagePrompt
    }, token);
    if (!response.success || !response.data?.url) {
      throw new Error(`The image service did not return an image for slide ${index + 1}`);
    }
    setSlides((current) => current.map((currentSlide, slideIndex) => (
      slideIndex === index
        ? { ...currentSlide, imageFile: undefined, imageUrl: response.data.url, imagePreview: response.data.url }
        : currentSlide
    )));
  };

  const generateSlideImage = async (index: number) => {
    try {
      setGeneratingSlide(index);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');
      await requestSlideImage(index, token);
      toast.success(`Slide ${index + 1} image generated`);
    } catch (error) {
      toast.error(`Slide image generation failed: ${(error as Error).message}`);
    } finally {
      setGeneratingSlide(null);
    }
  };

  const generateAllSlideImages = async () => {
    if (!slides.length) {
      toast.error('Generate or add slides first');
      return;
    }
    try {
      setGeneratingAllSlides(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');
      let failures = 0;
      for (let index = 0; index < slides.length; index += 1) {
        try {
          setGeneratingSlide(index);
          await requestSlideImage(index, token);
        } catch {
          failures += 1;
        }
      }
      if (failures) {
        toast.error(`${slides.length - failures} images generated; ${failures} failed`);
      } else {
        toast.success(`Generated images for all ${slides.length} slides`);
      }
    } catch (error) {
      toast.error(`Slide image generation failed: ${(error as Error).message}`);
    } finally {
      setGeneratingSlide(null);
      setGeneratingAllSlides(false);
    }
  };

  const publish = async () => {
    if (!canPublish) return;
    try {
      setPublishing(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');
      const media = format === 'image' ? imageFile || undefined : undefined;
      const remoteImageUrl = format === 'image' && !imageFile
        ? generatedImageUrl || initialImageUrl
        : undefined;
      const url = `${window.location.origin}${sourcePath}`;
      const response = await integrationsService.publishLinkedInPost({
        commentary: commentary.trim(),
        format,
        title,
        url,
        altText,
        generatedImageUrl: remoteImageUrl,
        slides: format === 'document' ? slides : undefined,
        media
      }, token);
      if (response.success) {
        toast.success('Published to LinkedIn');
        setOpen(false);
      }
    } catch (error) {
      const message = (error as Error).message;
      if (/reconnect linkedin|token.*expired|authorization expired/i.test(message)) {
        setNeedsReconnect(true);
        toast.error('Your LinkedIn session expired. Reconnect once, then publish again.');
      } else {
        toast.error(`LinkedIn publish failed: ${message}`);
      }
    } finally {
      setPublishing(false);
    }
  };

  const reconnectLinkedIn = async () => {
    try {
      setReconnecting(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('No authentication token');
      const response = await integrationsService.initiateAuth('linkedin', token);
      if (!response.success || !response.authUrl) throw new Error('Could not start LinkedIn authorization');
      window.location.href = response.authUrl;
    } catch (error) {
      toast.error(`LinkedIn reconnect failed: ${(error as Error).message}`);
      setReconnecting(false);
    }
  };

  const updateSlide = (index: number, field: 'headline' | 'body' | 'imagePrompt', value: string) => {
    setSlides((current) => current.map((slide, slideIndex) => (
      slideIndex === index ? { ...slide, [field]: value } : slide
    )));
  };

  if (!connected) {
    return (
      <div className={isPage ? 'linkedin-connection-required' : undefined}>
        {isPage && <i className="ph ph-linkedin-logo" />}
        {isPage && <h2>Connect LinkedIn to start publishing</h2>}
        <p className="linkedin-launcher__empty">
          Connect LinkedIn in <Link href="/admin/profile">Profile Settings</Link> to publish posts.
        </p>
        {isPage && <Link className="btn btn--primary" href="/admin/profile">Open Profile Settings</Link>}
      </div>
    );
  }

  const composerContent = (
        <div className={`linkedin-composer ${isPage ? 'linkedin-composer--page' : ''}`} role={isPage ? undefined : 'dialog'} aria-modal={isPage ? undefined : true} aria-label="LinkedIn post studio">
          {!isPage && <button className="linkedin-composer__backdrop" type="button" aria-label="Close" onClick={() => setOpen(false)} />}
          <section className="linkedin-composer__panel">
            <header className="linkedin-composer__header">
              <div>
                <span className="linkedin-composer__eyebrow">LinkedIn Studio</span>
                <h2>{type === 'post' ? 'Shape this post for LinkedIn' : `Turn this ${type} into a post`}</h2>
                <Link className="linkedin-composer__prompt-link" href="/admin/prompt-library?category=LinkedIn"><i className="ph ph-sliders-horizontal" /> Tune LinkedIn prompts</Link>
              </div>
              {isPage
                ? <Link href={backHref} aria-label="Back to article"><i className="ph ph-arrow-left" /></Link>
                : <button type="button" onClick={() => setOpen(false)} aria-label="Close composer"><i className="ph ph-x" /></button>}
            </header>

            <div className="linkedin-composer__formats" role="tablist" aria-label="Post format">
              {formatOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="tab"
                  aria-selected={format === option.value}
                  className={format === option.value ? 'is-active' : ''}
                  onClick={() => setFormat(option.value)}
                >
                  <i className={`ph ${option.icon}`} />
                  <span><strong>{option.label}</strong><small>{option.detail}</small></span>
                </button>
              ))}
            </div>

            <div className="linkedin-composer__workspace">
              <div className="linkedin-composer__editor">
                {needsReconnect && (
                  <div className="linkedin-composer__reauth" role="alert">
                    <i className="ph ph-warning-circle" />
                    <span><strong>LinkedIn session expired</strong><small>Reconnect your account, then return here to publish.</small></span>
                  </div>
                )}
                <div className="linkedin-composer__field-heading">
                  <label htmlFor="linkedin-commentary">Post commentary</label>
                  <button type="button" onClick={generate} disabled={generating}>
                    <i className={`ph ${generating ? 'ph-spinner linkedin-spin' : 'ph-sparkle'}`} />
                    {generating ? 'Generating…' : generationLabels[format]}
                  </button>
                </div>
                <textarea
                  id="linkedin-commentary"
                  value={commentary}
                  maxLength={3000}
                  onChange={(event) => setCommentary(event.target.value)}
                  placeholder="What should your network know?"
                />
                <span className="linkedin-composer__counter">{commentary.length} / 3000</span>

                {format === 'image' && (
                  <div className="linkedin-composer__media-editor">
                    <button className="linkedin-composer__generate-image" type="button" onClick={generateImageOnly} disabled={generating}>
                      <i className={`ph ${generating ? 'ph-spinner linkedin-spin' : 'ph-magic-wand'}`} />
                      <span><strong>{imageFile ? 'Generate a new image' : 'Generate image with AI'}</strong><small>Creates a LinkedIn-ready 4:5 visual</small></span>
                    </button>
                    <label className="linkedin-composer__upload">
                      <i className="ph ph-upload-simple" />
                      <span><strong>{imageFile ? imageFile.name : 'Choose an image'}</strong><small>PNG, JPG, GIF — up to 20 MB</small></span>
                      <input type="file" accept="image/*" data-crop-aspect="4/5" data-crop-label="LinkedIn post image" data-crop-max-width="1200" onChange={(event) => selectImage(event.target.files?.[0])} />
                    </label>
                    {imagePreview && <button className="linkedin-composer__crop-image" type="button" onClick={cropCurrentImage}><i className="ph ph-crop" /> Crop current image</button>}
                    {initialImageUrl && !imageFile && <span className="linkedin-composer__cover-note"><i className="ph ph-check-circle" /> Current cover selected</span>}
                    <label htmlFor="linkedin-alt-text">Image alt text</label>
                    <input id="linkedin-alt-text" value={altText} maxLength={300} onChange={(event) => setAltText(event.target.value)} placeholder="Describe the image for accessibility" />
                  </div>
                )}

                {format === 'document' && (
                  <div className="linkedin-composer__slides-editor">
                    <div className="linkedin-composer__field-heading">
                      <label>Slides</label>
                      <div className="linkedin-composer__slide-actions">
                        <button type="button" disabled={!slides.length || generatingAllSlides || generatingSlide !== null} onClick={generateAllSlideImages}>
                          <i className={`ph ${generatingAllSlides ? 'ph-spinner linkedin-spin' : 'ph-images'}`} />
                          {generatingAllSlides ? `Generating ${generatingSlide !== null ? generatingSlide + 1 : 1}/${slides.length}` : 'Generate all images'}
                        </button>
                        <button type="button" disabled={slides.length >= 10 || generatingAllSlides} onClick={() => setSlides([...slides, { headline: 'New idea', body: 'Add one focused takeaway.' }])}>
                          <i className="ph ph-plus" /> Add slide
                        </button>
                      </div>
                    </div>
                    {slides.length < 2 && <p className="linkedin-composer__hint">Generate a slide plan or add at least two slides.</p>}
                    {slides.map((slide, index) => (
                      <article className="linkedin-slide-editor" key={index}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <div>
                          <input value={slide.headline} maxLength={90} onChange={(event) => updateSlide(index, 'headline', event.target.value)} aria-label={`Slide ${index + 1} headline`} />
                          <textarea value={slide.body} maxLength={420} onChange={(event) => updateSlide(index, 'body', event.target.value)} aria-label={`Slide ${index + 1} body`} />
                          <input value={slide.imagePrompt || ''} maxLength={1000} onChange={(event) => updateSlide(index, 'imagePrompt', event.target.value)} aria-label={`Slide ${index + 1} visual direction`} placeholder="Visual direction for AI (optional)" />
                          <div className="linkedin-slide-editor__media">
                            {slide.imagePreview && <img src={slide.imagePreview} alt={slide.altText || `Slide ${index + 1} visual`} />}
                            <button type="button" onClick={() => generateSlideImage(index)} disabled={generatingSlide !== null || generatingAllSlides}>
                              <i className={`ph ${generatingSlide === index ? 'ph-spinner linkedin-spin' : 'ph-magic-wand'}`} />
                              {slide.imageFile ? 'Regenerate' : 'Generate image'}
                            </button>
                            <label>
                              <i className="ph ph-upload-simple" /> Upload
                              <input type="file" accept="image/*" data-crop-aspect="4/5" data-crop-label={`LinkedIn slide ${index + 1}`} data-crop-max-width="1200" onChange={(event) => selectSlideImage(index, event.target.files?.[0])} />
                            </label>
                            {slide.imagePreview && (
                              <button type="button" onClick={() => cropCurrentSlideImage(index)}>
                                <i className="ph ph-crop" /> Crop
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="linkedin-slide-editor__actions">
                          <button type="button" disabled={index === 0} onClick={() => setSlides((current) => current.map((item, itemIndex) => itemIndex === index - 1 ? current[index] : itemIndex === index ? current[index - 1] : item))} aria-label="Move slide up"><i className="ph ph-arrow-up" /></button>
                          <button type="button" disabled={slides.length <= 2} onClick={() => setSlides((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label="Delete slide"><i className="ph ph-trash" /></button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              <aside className="linkedin-composer__preview">
                <span>Preview</span>
                <div className="linkedin-preview-card">
                  <div className="linkedin-preview-card__profile"><span>N</span><div><strong>Nischay Sharma</strong><small>Now · Public</small></div></div>
                  <p>{commentary || 'Your post will appear here.'}</p>
                  {format === 'image' && imagePreview && <img src={imagePreview} alt={altText || 'LinkedIn post preview'} />}
                  {format === 'document' && (
                    <div className="linkedin-preview-deck">
                      {(slides.length ? slides : [{ headline: 'Your slide deck', body: 'Generate with AI to create an editable visual story.' }]).slice(0, 3).map((slide, index) => (
                        <div
                          key={index}
                          className={slide.imagePreview ? 'has-image' : ''}
                          style={{
                            '--slide-index': index,
                            ...(slide.imagePreview ? { backgroundImage: `linear-gradient(180deg, rgba(8, 13, 23, .08), rgba(8, 13, 23, .94)), url(${slide.imagePreview})` } : {})
                          } as React.CSSProperties}
                        >
                          <small>{String(index + 1).padStart(2, '0')}</small>
                          <strong>{slide.headline}</strong>
                          <p>{slide.body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </aside>
            </div>

            <footer className="linkedin-composer__footer">
              <span>{format === 'document' ? `${slides.length} editable slides · published as PDF` : format === 'image' ? 'Native LinkedIn image post' : 'Text and article link'}</span>
              <button type="button" onClick={needsReconnect ? reconnectLinkedIn : publish} disabled={needsReconnect ? reconnecting : !canPublish || publishing}>
                {needsReconnect
                  ? reconnecting ? <><i className="ph ph-spinner linkedin-spin" /> Reconnecting…</> : <><i className="ph ph-arrow-clockwise" /> Reconnect LinkedIn</>
                  : publishing ? <><i className="ph ph-spinner linkedin-spin" /> Publishing…</> : <><i className="ph ph-linkedin-logo" /> Publish to LinkedIn</>}
              </button>
            </footer>
          </section>
        </div>
  );

  return (
    <>
      {!isPage && (
        <button className="linkedin-launcher" type="button" onClick={() => setOpen(true)}>
          <span className="linkedin-launcher__icon"><i className="ph ph-linkedin-logo" /></span>
          <span><strong>Create LinkedIn post</strong><small>Text, image, or swipeable slides</small></span>
          <i className="ph ph-arrow-up-right" />
        </button>
      )}
      {isPage ? composerContent : open && portalReady && createPortal(composerContent, document.body)}
    </>
  );
}
