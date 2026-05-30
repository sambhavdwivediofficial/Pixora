import { useState, useCallback, useRef } from 'react';
import { validateFileForUpload, getFileExtension } from '@/utils/validators';
import { storeUpload } from '@/services/upload';
import { validateImage } from '@/services/validate';
import { formatFileSize, createBlobUrl } from '@/utils/helpers';
import { formatLabel } from '@/utils/formats';

export function useUpload() {
  const [state, setState] = useState({
    file: null,
    previewUrl: null,
    validating: false,
    validated: false,
    error: null,
    info: null,  // { format, sizeBytes, width, height }
  });

  const prevUrlRef = useRef(null);

  const revokePrev = () => {
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = null;
    }
  };

  const handleFile = useCallback(async (file) => {
    if (!file) return;

    // Client-side check
    const check = validateFileForUpload(file);
    if (!check.ok) {
      setState(s => ({ ...s, error: check.reason }));
      return;
    }

    // Create preview immediately
    revokePrev();
    const { url } = createBlobUrl(file);
    prevUrlRef.current = url;

    setState({
      file,
      previewUrl: url,
      validating: true,
      validated: false,
      error: null,
      info: null,
    });

    // Store in IndexedDB
    await storeUpload(file);

    // Backend validation
    try {
      const result = await validateImage(file);
      if (!result.valid) {
        setState(s => ({
          ...s,
          validating: false,
          error: result.message || 'Invalid image',
        }));
        return;
      }
      setState(s => ({
        ...s,
        validating: false,
        validated: true,
        info: {
          format:    formatLabel(result.format),
          sizeBytes: result.size_bytes,
          width:     result.width,
          height:    result.height,
        },
      }));
    } catch (e) {
      setState(s => ({
        ...s,
        validating: false,
        error: e.message || 'Validation error',
      }));
    }
  }, []);

  const reset = useCallback(() => {
    revokePrev();
    setState({
      file: null,
      previewUrl: null,
      validating: false,
      validated: false,
      error: null,
      info: null,
    });
  }, []);

  return { ...state, handleFile, reset };
}