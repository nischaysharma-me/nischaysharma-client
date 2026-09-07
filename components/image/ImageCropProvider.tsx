'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type CropOptions = {
  aspect?: number;
  label?: string;
  maxWidth?: number;
};

type CropRequest = Required<CropOptions> & {
  file: File;
  resolve: (file: File | null) => void;
};

type CropContextValue = {
  cropImage: (file: File, options?: CropOptions) => Promise<File | null>;
  cropImageUrl: (url: string, options?: CropOptions) => Promise<File | null>;
};

const ImageCropContext = createContext<CropContextValue | null>(null);

const parseAspect = (value: string | undefined, fallback: number) => {
  if (!value || value === 'original') return fallback;
  if (value.includes('/')) {
    const [width, height] = value.split('/').map(Number);
    return width > 0 && height > 0 ? width / height : fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const readImage = (file: File) => new Promise<HTMLImageElement>((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    URL.revokeObjectURL(url);
    resolve(image);
  };
  image.onerror = () => {
    URL.revokeObjectURL(url);
    reject(new Error('Unable to read this image'));
  };
  image.src = url;
});

const drawCrop = (
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  aspect: number,
  zoom: number,
  offsetX: number,
  offsetY: number,
  outputWidth: number,
) => {
  const outputHeight = Math.max(1, Math.round(outputWidth / aspect));
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const context = canvas.getContext('2d');
  if (!context) return;

  const coverScale = Math.max(outputWidth / image.naturalWidth, outputHeight / image.naturalHeight) * zoom;
  const drawnWidth = image.naturalWidth * coverScale;
  const drawnHeight = image.naturalHeight * coverScale;
  const movableX = Math.max(0, drawnWidth - outputWidth) / 2;
  const movableY = Math.max(0, drawnHeight - outputHeight) / 2;
  const x = (outputWidth - drawnWidth) / 2 + (offsetX / 100) * movableX;
  const y = (outputHeight - drawnHeight) / 2 + (offsetY / 100) * movableY;

  context.clearRect(0, 0, outputWidth, outputHeight);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, x, y, drawnWidth, drawnHeight);
};

function ImageCropDialog({ request, onFinish }: { request: CropRequest; onFinish: (file: File | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ pointerId: number; x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  const renderPreview = useCallback(() => {
    if (!canvasRef.current || !imageRef.current) return;
    drawCrop(canvasRef.current, imageRef.current, request.aspect, zoom, offsetX, offsetY, 1000);
  }, [offsetX, offsetY, request.aspect, zoom]);

  useEffect(() => {
    let active = true;
    readImage(request.file).then((image) => {
      if (!active) return;
      imageRef.current = image;
      setReady(true);
    }).catch(() => onFinish(null));
    return () => { active = false; };
  }, [onFinish, request.file]);

  useEffect(() => {
    if (ready) renderPreview();
  }, [ready, renderPreview]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onFinish(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [onFinish]);

  const saveCrop = () => {
    if (!imageRef.current) return;
    setSaving(true);
    const output = document.createElement('canvas');
    const width = Math.min(request.maxWidth, Math.max(480, imageRef.current.naturalWidth));
    drawCrop(output, imageRef.current, request.aspect, zoom, offsetX, offsetY, width);
    const mimeType = request.file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    output.toBlob((blob) => {
      if (!blob) {
        setSaving(false);
        return;
      }
      const baseName = request.file.name.replace(/\.[^.]+$/, '') || 'image';
      const extension = mimeType === 'image/png' ? 'png' : 'jpg';
      onFinish(new File([blob], `${baseName}-cropped.${extension}`, { type: mimeType, lastModified: Date.now() }));
    }, mimeType, 0.92);
  };

  const reset = () => {
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
  };

  const startPan = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, offsetX, offsetY };
  };

  const movePan = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const nextX = drag.offsetX + ((event.clientX - drag.x) / Math.max(1, bounds.width)) * 200;
    const nextY = drag.offsetY + ((event.clientY - drag.y) / Math.max(1, bounds.height)) * 200;
    setOffsetX(Math.max(-100, Math.min(100, nextX)));
    setOffsetY(Math.max(-100, Math.min(100, nextY)));
  };

  const endPan = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return createPortal(
    <div className="image-crop" role="dialog" aria-modal="true" aria-labelledby="image-crop-title">
      <button className="image-crop__backdrop" type="button" aria-label="Cancel image cropping" onClick={() => onFinish(null)} />
      <section className="image-crop__panel">
        <header className="image-crop__header">
          <div>
            <span>Image editor</span>
            <h2 id="image-crop-title">Crop {request.label}</h2>
          </div>
          <button type="button" aria-label="Close image cropper" onClick={() => onFinish(null)}><i className="ph ph-x" /></button>
        </header>

        <div className="image-crop__body">
          <div
            className="image-crop__viewport"
            style={{ aspectRatio: String(request.aspect), maxWidth: `min(100%, calc(52dvh * ${request.aspect}))` }}
            onPointerDown={startPan}
            onPointerMove={movePan}
            onPointerUp={endPan}
            onPointerCancel={endPan}
          >
            <canvas ref={canvasRef} aria-label="Cropped image preview" />
            <div className="image-crop__grid" aria-hidden="true" />
            {!ready && <div className="image-crop__loading">Preparing image…</div>}
          </div>

          <div className="image-crop__controls">
            <label>
              <span><i className="ph ph-magnifying-glass" /> Zoom</span>
              <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} />
            </label>
            <label>
              <span><i className="ph ph-arrows-horizontal" /> Horizontal</span>
              <input type="range" min="-100" max="100" step="1" value={offsetX} onChange={(event) => setOffsetX(Number(event.target.value))} />
            </label>
            <label>
              <span><i className="ph ph-arrows-vertical" /> Vertical</span>
              <input type="range" min="-100" max="100" step="1" value={offsetY} onChange={(event) => setOffsetY(Number(event.target.value))} />
            </label>
          </div>
        </div>

        <footer className="image-crop__footer">
          <button type="button" className="image-crop__reset" onClick={reset}>Reset</button>
          <div>
            <button type="button" className="image-crop__cancel" onClick={() => onFinish(null)}>Cancel</button>
            <button type="button" className="image-crop__save" onClick={saveCrop} disabled={!ready || saving}>
              {saving ? 'Cropping…' : 'Use cropped image'}
            </button>
          </div>
        </footer>
      </section>
    </div>,
    document.body,
  );
}

export function ImageCropProvider({ children }: { children: React.ReactNode }) {
  const [request, setRequest] = useState<CropRequest | null>(null);
  const bypassedInputs = useRef(new WeakSet<HTMLInputElement>());

  const cropImage = useCallback(async (file: File, options: CropOptions = {}) => {
    if (!file.type.startsWith('image/')) {
      return file;
    }
    try {
      const image = await readImage(file);
      return await new Promise<File | null>((resolve) => {
        setRequest({
          file,
          aspect: options.aspect || image.naturalWidth / image.naturalHeight,
          label: options.label || 'image',
          maxWidth: options.maxWidth || 1800,
          resolve,
        });
      });
    } catch {
      return null;
    }
  }, []);

  const cropImageUrl = useCallback(async (url: string, options: CropOptions = {}) => {
    const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
    if (!response.ok) throw new Error('The current image could not be downloaded for cropping');
    const blob = await response.blob();
    const mimeType = blob.type.startsWith('image/') ? blob.type : 'image/jpeg';
    const extension = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    return cropImage(new File([blob], `current-image.${extension}`, { type: mimeType }), options);
  }, [cropImage]);

  const finish = useCallback((file: File | null) => {
    request?.resolve(file);
    setRequest(null);
  }, [request]);

  useEffect(() => {
    const interceptImageInput = (event: Event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || input.type !== 'file') return;
      if (bypassedInputs.current.has(input)) {
        bypassedInputs.current.delete(input);
        return;
      }
      const file = input.files?.[0];
      if (!file?.type.startsWith('image/')) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      readImage(file).then((image) => cropImage(file, {
        aspect: parseAspect(input.dataset.cropAspect, image.naturalWidth / image.naturalHeight),
        label: input.dataset.cropLabel || 'image',
        maxWidth: Number(input.dataset.cropMaxWidth) || 1800,
      })).then((cropped) => {
        if (!cropped) {
          input.value = '';
          return;
        }
        const transfer = new DataTransfer();
        transfer.items.add(cropped);
        input.files = transfer.files;
        bypassedInputs.current.add(input);
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    };

    document.addEventListener('change', interceptImageInput, true);
    return () => document.removeEventListener('change', interceptImageInput, true);
  }, [cropImage]);

  const value = useMemo(() => ({ cropImage, cropImageUrl }), [cropImage, cropImageUrl]);

  return (
    <ImageCropContext.Provider value={value}>
      {children}
      {request && <ImageCropDialog request={request} onFinish={finish} />}
    </ImageCropContext.Provider>
  );
}

export const useImageCrop = () => {
  const context = useContext(ImageCropContext);
  if (!context) throw new Error('useImageCrop must be used within ImageCropProvider');
  return context;
};
