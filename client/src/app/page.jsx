'use client';
import { useState, useCallback, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import UploadBox from '@/components/UploadBox';
import UploadInfo from '@/components/UploadInfo';
import Settings from '@/components/Settings';
import ConvertButton from '@/components/ConvertButton';
import ConversionView from '@/components/ConversionView';
import { useUpload } from '@/hooks/useUpload';
import { useConversion } from '@/hooks/useConversion';
import { useDownload } from '@/hooks/useDownload';
import styles from './page.module.css';

export default function Home() {
  const upload    = useUpload();
  const conversion = useConversion();
  const dl        = useDownload();

  const [settings, setSettings] = useState({
    outputFormat: '',
    width: null, height: null,
    preserveAspect: true,
    preserveMetadata: true,
    quality: 90,
  });

  const [phase, setPhase] = useState('upload'); // 'upload' | 'converting' | 'done'

  const handleConvert = useCallback(async () => {
    if (!upload.file || !settings.outputFormat) return;
    setPhase('converting');
    await conversion.convert(upload.file, {
      targetFormat: settings.outputFormat,
      width: settings.width,
      height: settings.height,
      preserveAspect: settings.preserveAspect,
      preserveMetadata: settings.preserveMetadata,
      quality: settings.quality,
    });
    setPhase('done');
  }, [upload.file, settings, conversion]);

  const handleDownload = useCallback(async () => {
    if (!conversion.result?.blob) return;
    await dl.download(
      conversion.result.blob,
      upload.file?.name || 'image',
      settings.outputFormat
    );
  }, [conversion.result, upload.file, settings.outputFormat, dl]);

  const isConverting = phase === 'converting';
  const isConversionPhase = phase === 'converting' || phase === 'done';

  return (
    <div className={styles.layout}>
      <Navbar />

      <main className={styles.main}>
        {/* Hero */}
        {!upload.validated && (
          <header className={styles.hero}>
            <h1 className={styles.heroTitle}>
              Convert Any<br />
              <span className={styles.heroAccent}>Image Format</span>
            </h1>
            <p className={styles.heroSub}>
              PNG · JPG · WEBP · AVIF · HEIC · BMP · TIFF · SVG · ICO<br />
              Fast, private, 100% in-memory — nothing stored.
            </p>
          </header>
        )}

        {/* Upload phase */}
        {!isConversionPhase && (
          <div className={styles.uploadSection}>
            <UploadBox
              onFile={upload.handleFile}
              previewUrl={upload.previewUrl}
              validating={upload.validating}
              error={upload.error}
              locked={upload.validated}
              resetError={upload.reset}
            />

            {upload.validated && upload.info && (
              <>
                <UploadInfo
                  format={upload.info.format}
                  sizeBytes={upload.info.sizeBytes}
                  width={upload.info.width}
                  height={upload.info.height}
                />

                <Settings
                  sourceFormat={upload.info.format}
                  origWidth={upload.info.width}
                  origHeight={upload.info.height}
                  onChange={setSettings}
                />

                <ConvertButton
                  sourceFormat={upload.info.format}
                  outputFormat={settings.outputFormat}
                  onClick={handleConvert}
                  disabled={!settings.outputFormat || isConverting}
                />
              </>
            )}
          </div>
        )}

        {/* Conversion phase — dual preview */}
        {isConversionPhase && (
          <div className={styles.conversionSection}>
            <ConversionView
              originalPreviewUrl={upload.previewUrl}
              originalInfo={upload.info}
              converting={isConverting}
              conversionResult={conversion.result}
              onDownload={handleDownload}
              downloading={dl.downloading}
              downloaded={dl.downloaded}
            />

            {/* Error during conversion */}
            {conversion.error && (
              <div className={styles.conversionError}>
                <span>⚠️ {conversion.error}</span>
                <button
                  onClick={() => {
                    conversion.resetConversion();
                    setPhase('upload');
                  }}
                  className={styles.retryBtn}
                  type="button"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}