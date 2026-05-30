import { apiUrl } from './api';

/**
 * Send image to backend for validation.
 * @param {File} file
 * @returns {Promise<{valid, format, width, height, size_bytes, message}>}
 */
export async function validateImage(file) {
  const fd = new FormData();
  fd.append('file', file, file.name);

  const res = await fetch(apiUrl('/api/validate'), {
    method: 'POST',
    body: fd,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Validation failed' }));
    throw new Error(err.detail || 'Validation failed');
  }

  return res.json();
}