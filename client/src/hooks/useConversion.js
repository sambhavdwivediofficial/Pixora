import { useState, useCallback } from 'react';
import { convertImage } from '@/services/convert';
import { storeConverted } from '@/services/upload';
import { createBlobUrl } from '@/utils/helpers';

export function useConversion() {
  const [state, setState] = useState({
    converting: false,
    done: false,
    error: null,
    result: null, // { blob, previewUrl, format, width, height, size }
  });

  const convert = useCallback(async (file, options) => {
    setState({ converting: true, done: false, error: null, result: null });

    try {
      const result = await convertImage(file, file.name, options);

      // Store in IndexedDB
      await storeConverted(result.blob);

      const { url } = createBlobUrl(result.blob);

      setState({
        converting: false,
        done: true,
        error: null,
        result: {
          blob: result.blob,
          previewUrl: url,
          format: result.format,
          width: result.width,
          height: result.height,
          size: result.size,
          mime: result.mime,
        },
      });
    } catch (e) {
      setState({
        converting: false,
        done: false,
        error: e.message || 'Conversion failed',
        result: null,
      });
    }
  }, []);

  const resetConversion = useCallback(() => {
    setState({ converting: false, done: false, error: null, result: null });
  }, []);

  return { ...state, convert, resetConversion };
}