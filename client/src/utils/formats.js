export const SUPPORTED_INPUT_FORMATS = new Set([
  'png', 'jpg', 'jpeg', 'webp', 'bmp', 'tiff', 'tif',
  'avif', 'svg', 'ico',
]);

export const ICO_INPUT_FORMATS = new Set([
  'png', 'jpg', 'jpeg', 'webp', 'bmp', 'tiff', 'tif',
  'avif', 'svg',
]);

export const UNSUPPORTED_FORMATS = new Set([
  'gif', 'mp4', 'mov', 'avi', 'mkv', 'webm',
  'mp3', 'wav', 'ogg', 'flac',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'txt',
  'heic', 'heif',
]);

export const ALL_OUTPUT_FORMATS = ['PNG', 'JPG', 'WEBP', 'BMP', 'TIFF', 'AVIF', 'SVG'];

/** Get available output formats excluding the source format and ICO */
export function getOutputFormats(sourceFormat) {
  const src = normalizeFormat(sourceFormat);
  return ALL_OUTPUT_FORMATS.filter(f => {
    const n = normalizeFormat(f);
    // exclude source
    if (n === src) return false;
    // jpeg/jpg aliasing
    if ((src === 'jpg' || src === 'jpeg') && (n === 'jpg' || n === 'jpeg')) return false;
    // never show ICO as output
    if (n === 'ico') return false;
    return true;
  });
}

export function normalizeFormat(fmt) {
  if (!fmt) return '';
  const n = fmt.toLowerCase().replace(/^\./, '');
  if (n === 'jpeg') return 'jpg';
  if (n === 'tif')  return 'tiff';
  if (n === 'heif') return 'heic';
  return n;
}

export function getExtFromMime(mime) {
  const map = {
    'image/png':        'png',
    'image/jpeg':       'jpg',
    'image/webp':       'webp',
    'image/bmp':        'bmp',
    'image/tiff':       'tiff',
    'image/avif':       'avif',
    'image/svg+xml':    'svg',
    'image/x-icon':     'ico',
    'application/zip':  'zip',
  };
  return map[mime] || 'bin';
}

export function formatLabel(fmt) {
  if (!fmt) return '';
  const n = normalizeFormat(fmt);
  const labels = {
    jpg: 'JPG', jpeg: 'JPG', png: 'PNG', webp: 'WEBP',
    bmp: 'BMP', tiff: 'TIFF', avif: 'AVIF',
    svg: 'SVG', ico: 'ICO',
  };
  return labels[n] || fmt.toUpperCase();
}