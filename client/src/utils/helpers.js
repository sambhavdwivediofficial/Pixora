export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatResolution(w, h) {
  if (!w || !h) return '—';
  return `${w}×${h}`;
}

export function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/** Create an object URL from a Blob, returns {url, revoke} */
export function createBlobUrl(blob) {
  const url = URL.createObjectURL(blob);
  return {
    url,
    revoke: () => URL.revokeObjectURL(url),
  };
}