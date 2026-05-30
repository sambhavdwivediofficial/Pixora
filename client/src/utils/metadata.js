export function buildImageInfoString(format, sizeBytes, width, height) {
  const { formatFileSize } = require('./helpers');
  return `${format} | ${formatFileSize(sizeBytes)} | ${width}×${height}`;
}