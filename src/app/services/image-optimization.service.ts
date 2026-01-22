/*
 * image-optimization.service.ts
 * Client-side image optimization for uploads (browser)
 * - Resizes images to configured max dimensions
 * - Compresses to target max size (KB) with iterative quality reduction
 * - Produces an additional thumbnail image
 *
 * Recommends installing `pica` for higher quality and speed:
 *   npm install pica
 *
 * Environment variables (Vite):
 * - VITE_IMAGE_MAX_WIDTH (default 1024)
 * - VITE_IMAGE_MAX_HEIGHT (default 768)
 * - VITE_IMAGE_MAX_SIZE_KB (default 300)
 * - VITE_IMAGE_THUMB_WIDTH (default 320)
 * - VITE_IMAGE_THUMB_HEIGHT (default 240)
 * - VITE_IMAGE_THUMB_MAX_SIZE_KB (default 50)
 * - VITE_IMAGE_OUTPUT_FORMAT (webp|jpeg|original) (default: webp if supported)
 * - VITE_IMAGE_DEFAULT_QUALITY (0.5 - 0.95) (default: 0.8)
 */

import pica from 'pica';

export interface OptimizeOptions {
  maxWidth: number;
  maxHeight: number;
  maxSizeKB: number; // target max size in KB
  thumbWidth: number;
  thumbHeight: number;
  thumbMaxSizeKB: number;
  outputFormat: 'webp' | 'jpeg' | 'original';
  quality: number; // initial quality 0..1
}

const p = pica({ features: ['js', 'wasm', 'cib'] });

function envOrNumber(name: string, fallback: number) {
  try {
    const v = (import.meta as any).env[name];
    if (!v) return fallback;
    const n = parseInt(v, 10);
    return isNaN(n) ? fallback : n;
  } catch {
    return fallback; // during tests or SSR
  }
}

function envOrString(name: string, fallback: string) {
  try {
    const v = (import.meta as any).env[name];
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

export const defaultOptions: OptimizeOptions = {
  maxWidth: envOrNumber('VITE_IMAGE_MAX_WIDTH', 1024),
  maxHeight: envOrNumber('VITE_IMAGE_MAX_HEIGHT', 768),
  maxSizeKB: envOrNumber('VITE_IMAGE_MAX_SIZE_KB', 300),
  thumbWidth: envOrNumber('VITE_IMAGE_THUMB_WIDTH', 320),
  thumbHeight: envOrNumber('VITE_IMAGE_THUMB_HEIGHT', 240),
  thumbMaxSizeKB: envOrNumber('VITE_IMAGE_THUMB_MAX_SIZE_KB', 50),
  outputFormat: envOrString('VITE_IMAGE_OUTPUT_FORMAT', 'webp') as any as
    | 'webp'
    | 'jpeg'
    | 'original',
  quality: parseFloat(envOrString('VITE_IMAGE_DEFAULT_QUALITY', '0.8')),
};

async function fileToImageBitmap(file: File): Promise<ImageBitmap> {
  if ('createImageBitmap' in window) {
    return await createImageBitmap(file);
  }

  // Fallback for older browsers
  return new Promise<ImageBitmap>((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        const blob = await new Promise<Blob | null>((res) =>
          canvas.toBlob(res as any, 'image/png')
        );
        if (!blob) return reject(new Error('Failed to convert image'));
        const bitmap = await createImageBitmap(blob);
        resolve(bitmap);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function calcFitSize(srcW: number, srcH: number, maxW: number, maxH: number) {
  if (!maxW && !maxH) return { w: srcW, h: srcH };
  const ratio = Math.min(maxW / srcW || Infinity, maxH / srcH || Infinity, 1);
  return { w: Math.round(srcW * ratio), h: Math.round(srcH * ratio) };
}

async function canvasToBlobWithQuality(
  canvas: HTMLCanvasElement,
  mime: string,
  quality: number
): Promise<Blob> {
  return await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), mime, quality);
  });
}

/**
 * Attempt to produce a blob from a canvas that is <= maxBytes by binary-searching quality.
 * Returns the best found Blob (may be > maxBytes if minQuality reached).
 */
async function compressCanvasToTargetSize(
  canvas: HTMLCanvasElement,
  mime: string,
  targetBytes: number,
  initialQuality = 0.8,
  minQuality = 0.45,
  iterations = 6
): Promise<Blob> {
  let low = minQuality;
  let high = initialQuality;
  let best: Blob | null = null;

  for (let i = 0; i < iterations; i++) {
    const q = (low + high) / 2;
    const blob = await canvasToBlobWithQuality(canvas, mime, q);
    const size = blob.size;
    if (size <= targetBytes) {
      best = blob;
      // try higher quality to improve result but stay under size
      low = q;
    } else {
      // size too big, reduce quality
      high = q;
    }
  }

  if (best) return best;

  // fallback: return with minQuality
  return await canvasToBlobWithQuality(canvas, mime, minQuality);
}

function chooseMime(originalType: string, outputFormat: OptimizeOptions['outputFormat']) {
  if (outputFormat === 'original') return originalType;
  if (outputFormat === 'webp') {
    // Ensure browser support for webp
    try {
      const canvas = document.createElement('canvas');
      const data = canvas.toDataURL('image/webp');
      if (data.indexOf('data:image/webp') === 0) return 'image/webp';
    } catch {
      // fallback
    }
    return 'image/jpeg';
  }
  return 'image/jpeg';
}

export async function optimizeImage(file: File, opts?: Partial<OptimizeOptions>) {
  const options = { ...defaultOptions, ...opts } as OptimizeOptions;
  const imgBitmap = await fileToImageBitmap(file);

  // compute resize
  const fit = calcFitSize(imgBitmap.width, imgBitmap.height, options.maxWidth, options.maxHeight);
  const thumbFit = calcFitSize(
    imgBitmap.width,
    imgBitmap.height,
    options.thumbWidth,
    options.thumbHeight
  );

  // prepare canvases
  const canvas = document.createElement('canvas');
  canvas.width = fit.w;
  canvas.height = fit.h;

  const thumbCanvas = document.createElement('canvas');
  thumbCanvas.width = thumbFit.w;
  thumbCanvas.height = thumbFit.h;

  // use pica for high-quality resizing
  // Note: avoid passing unsupported options to Pica's resize to keep TypeScript types happy
  await p.resize(imgBitmap, canvas, { unsharpAmount: 80 });
  await p.resize(imgBitmap, thumbCanvas, { unsharpAmount: 80 });

  const mime = chooseMime(file.type, options.outputFormat);

  // compress main image to target size
  const targetBytes = options.maxSizeKB * 1024;
  const optimizedBlob = await compressCanvasToTargetSize(
    canvas,
    mime,
    targetBytes,
    options.quality
  );

  // compress thumbnail
  const targetThumbBytes = options.thumbMaxSizeKB * 1024;
  const thumbBlob = await compressCanvasToTargetSize(
    thumbCanvas,
    mime,
    targetThumbBytes,
    Math.min(0.85, options.quality)
  );

  // Build File objects to preserve name & type when uploading
  const ext =
    mime === 'image/webp'
      ? 'webp'
      : mime === 'image/jpeg'
      ? 'jpg'
      : file.name.split('.').pop() || 'bin';
  const baseName = file.name.replace(/\.[^.]+$/, '');

  const optimizedFile = new File([optimizedBlob], `${baseName}-optimized.${ext}`, { type: mime });
  const thumbFile = new File([thumbBlob], `${baseName}-thumb.${ext}`, { type: mime });

  return {
    optimizedFile,
    thumbFile,
    optimizedBlob,
    thumbBlob,
  };
}

export default {
  optimizeImage,
  defaultOptions,
};
