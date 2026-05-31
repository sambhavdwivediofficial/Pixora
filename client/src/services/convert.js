import { apiUrl } from './api';

/**
 * Convert image via backend.
 */
export async function convertImage(blob, filename, options) {
  const {
    targetFormat,
    width,
    height,
    preserveAspect = true,
    quality = 90,
    preserveMetadata = true,
  } = options;

  const fd = new FormData();
  fd.append('file', blob, filename);
  fd.append('target_format', targetFormat);
  if (width)  fd.append('width',  String(width));
  if (height) fd.append('height', String(height));
  fd.append('preserve_aspect',    String(preserveAspect));
  fd.append('quality',            String(quality));
  fd.append('preserve_metadata',  String(preserveMetadata));

  const res = await fetch(apiUrl('/api/convert'), {
    method: 'POST',
    body: fd,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Conversion failed' }));
    throw new Error(err.detail || 'Conversion failed');
  }

  const outBlob   = await res.blob();

  // Read exposed headers
  const outWidth  = parseInt(res.headers.get('X-Output-Width')  || '0', 10);
  const outHeight = parseInt(res.headers.get('X-Output-Height') || '0', 10);
  const outSize   = parseInt(res.headers.get('X-Output-Size')   || '0', 10);
  const outFormat = res.headers.get('X-Output-Format') || targetFormat.toUpperCase();

  return {
    blob:   outBlob,
    mime:   outBlob.type,
    width:  outWidth  || null,
    height: outHeight || null,
    size:   outSize   || outBlob.size,
    format: outFormat,
  };
}