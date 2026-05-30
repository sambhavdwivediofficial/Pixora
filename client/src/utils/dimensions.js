export function computeAspectHeight(origW, origH, newW) {
  if (!origW || !origH || !newW) return '';
  return Math.round((newW / origW) * origH);
}

export function computeAspectWidth(origW, origH, newH) {
  if (!origW || !origH || !newH) return '';
  return Math.round((newH / origH) * origW);
}