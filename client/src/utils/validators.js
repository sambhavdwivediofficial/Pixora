import { SUPPORTED_INPUT_FORMATS, UNSUPPORTED_FORMATS, ICO_INPUT_FORMATS } from './formats';

export function getFileExtension(file) {
  if (!file?.name) return '';
  const parts = file.name.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

export function validateFileForUpload(file) {
  if (!file) return { ok: false, reason: 'No file provided' };

  const ext = getFileExtension(file);

  if (UNSUPPORTED_FORMATS.has(ext)) {
    return { ok: false, reason: `${ext.toUpperCase()} is not supported. GIFs, videos, audio, and documents cannot be converted.` };
  }

  if (!SUPPORTED_INPUT_FORMATS.has(ext) && ext !== '') {
    return { ok: false, reason: `Unsupported format: .${ext}` };
  }

  const MAX_SIZE = 50 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return { ok: false, reason: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 50 MB.` };
  }

  return { ok: true, reason: null };
}

export function validateFileForIco(file) {
  if (!file) return { ok: false, reason: 'No file provided' };

  const ext = getFileExtension(file);

  if (ext === 'ico') {
    return { ok: false, reason: 'ICO files cannot be converted to ICO.' };
  }

  if (UNSUPPORTED_FORMATS.has(ext)) {
    return { ok: false, reason: `${ext.toUpperCase()} is not supported.` };
  }

  if (!ICO_INPUT_FORMATS.has(ext)) {
    return { ok: false, reason: `Unsupported format for ICO conversion: .${ext}` };
  }

  return { ok: true, reason: null };
}