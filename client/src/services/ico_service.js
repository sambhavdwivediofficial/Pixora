import { apiUrl } from './api';

/**
 * Convert image to ICO favicon package via backend.
 * Returns a ZIP blob.
 */
export async function convertToIco(blob, filename) {
  const fd = new FormData();
  fd.append('file', blob, filename);

  const res = await fetch(apiUrl('/api/ico/convert'), {
    method: 'POST',
    body: fd,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'ICO conversion failed' }));
    throw new Error(err.detail || 'ICO conversion failed');
  }

  return res.blob();
}