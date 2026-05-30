/**
 * Trigger browser download for a Blob.
 * Returns true if download was initiated successfully.
 */
export function downloadBlob(blob, filename) {
  return new Promise((resolve, reject) => {
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        resolve(true);
      }, 200);
    } catch (e) {
      reject(e);
    }
  });
}

/** Build a filename for the converted image */
export function buildFilename(originalName, targetFormat) {
  const base = originalName.replace(/\.[^/.]+$/, '');
  const ext = targetFormat.toLowerCase() === 'jpeg' ? 'jpg' : targetFormat.toLowerCase();
  return `${base}_pixora.${ext}`;
}