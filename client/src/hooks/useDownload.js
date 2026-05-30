import { useState, useCallback } from 'react';
import { downloadBlob, buildFilename } from '@/services/download';
import { idbClearAll } from '@/services/indexeddb';
import { sleep } from '@/utils/helpers';

export function useDownload() {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const download = useCallback(async (blob, originalName, targetFormat) => {
    setDownloading(true);
    try {
      const filename = buildFilename(originalName, targetFormat);
      await downloadBlob(blob, filename);
      setDownloaded(true);

      // Wait 3 seconds, clear DB, reload
      await sleep(3000);
      await idbClearAll();
      window.location.reload();
    } catch (e) {
      console.error('Download failed:', e);
      setDownloading(false);
    }
  }, []);

  return { downloading, downloaded, download };
}