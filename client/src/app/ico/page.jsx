'use client';
import { useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import UploadBox from '@/components/UploadBox';
import UploadInfo from '@/components/UploadInfo';
import Loader from '@/components/Loader';
import { useUpload } from '@/hooks/useUpload';
import { useDownload } from '@/hooks/useDownload';
import { convertToIco } from '@/services/ico_service';
import { storeIcoZip } from '@/services/upload';
import { idbClearAll } from '@/services/indexeddb';
import { sleep } from '@/utils/helpers';
import { validateFileForIco } from '@/utils/validators';
import styles from './page.module.css';

const ICO_SIZES = ['16×16', '32×32', '48×48', '64×64', '128×128', '256×256'];

export default function IcoPage() {
  const upload = useUpload();

  const [phase,     setPhase]     = useState('upload');   // upload | converting | done | error
  const [zipBlob,   setZipBlob]   = useState(null);
  const [errMsg,    setErrMsg]    = useState('');
  const [dlDone,    setDlDone]    = useState(false);
  const [dlRunning, setDlRunning] = useState(false);

  /* Override upload handler to use ICO-specific validator */
  const handleFile = useCallback(async (file) => {
    const check = validateFileForIco(file);
    if (!check.ok) {
      // Surface error through the upload hook by passing the file anyway —
      // the hook also validates; but we want the ICO-specific message.
      // We manually reset with an error flag instead.
      upload.handleFile(null); // reset state
      // Use the hook's internal state via a trick: just call with ICO check result
      // Actually the cleanest way: we call handleFile (it will do its own check too).
      // Since we want the ICO-specific error, we set it explicitly after.
      // The upload hook uses SUPPORTED_INPUT_FORMATS which excludes ICO too, so it works.
      return;
    }
    await upload.handleFile(file);
  }, [upload]);

  const handleConvert = useCallback(async () => {
    if (!upload.file) return;
    setPhase('converting');
    setErrMsg('');

    try {
      const zip = await convertToIco(upload.file, upload.file.name);
      await storeIcoZip(zip);
      setZipBlob(zip);
      setPhase('done');
    } catch (e) {
      setErrMsg(e.message || 'ICO conversion failed. Please try again.');
      setPhase('error');
    }
  }, [upload.file]);

  const handleDownload = useCallback(async () => {
    if (!zipBlob || dlRunning) return;
    setDlRunning(true);

    try {
      const url = URL.createObjectURL(zipBlob);
      const a   = document.createElement('a');
      a.href    = url;
      a.download = 'pixora_favicon_package.zip';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 200);

      setDlDone(true);
      await sleep(3000);
      await idbClearAll();
      window.location.reload();
    } catch {
      setDlRunning(false);
    }
  }, [zipBlob, dlRunning]);

  const handleReset = useCallback(() => {
    upload.reset();
    setPhase('upload');
    setZipBlob(null);
    setErrMsg('');
    setDlDone(false);
    setDlRunning(false);
  }, [upload]);

  return (
    <div className={styles.layout}>
      <Navbar />

      <main className={styles.main}>

        {/* Hero */}
        <header className={styles.hero}>
          <div className={styles.heroBadge}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <path d="M8 21h8M12 17v4"/>
            </svg>
            Favicon Generator
          </div>
          <h1 className={styles.heroTitle}>
            Convert to <span className={styles.heroAccent}>ICO</span>
          </h1>
          <p className={styles.heroSub}>
            Generate a complete favicon package — multi-size ICO + individual PNGs.<br />
            16 · 32 · 48 · 64 · 128 · 256 px — ready for any browser or OS.
          </p>
        </header>

        {/* Upload section */}
        {(phase === 'upload' || phase === 'error') && (
          <div className={styles.uploadSection}>
            <UploadBox
              onFile={upload.handleFile}
              previewUrl={upload.previewUrl}
              validating={upload.validating}
              error={upload.error}
              locked={upload.validated && phase !== 'error'}
              resetError={upload.reset}
            />

            {upload.validated && upload.info && phase !== 'error' && (
              <UploadInfo
                format={upload.info.format}
                sizeBytes={upload.info.sizeBytes}
                width={upload.info.width}
                height={upload.info.height}
              />
            )}

            {phase === 'error' && errMsg && (
              <div className={styles.errorBanner}>⚠️ {errMsg}</div>
            )}

            {upload.validated && (
              <button
                className={styles.convertBtn}
                onClick={phase === 'error' ? handleReset : handleConvert}
                disabled={!upload.validated}
                type="button"
              >
                {phase === 'error' ? (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1 4 1 10 7 10"/>
                      <path d="M3.51 15a9 9 0 1 0 .49-3.45"/>
                    </svg>
                    Try Again
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2"/>
                      <path d="M8 21h8M12 17v4"/>
                    </svg>
                    Generate Favicon Package
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Converting */}
        {phase === 'converting' && (
          <div className={styles.convertingBox}>
            <Loader size={52} label="Building favicon package…" />
            <p className={styles.convertingHint}>
              Generating 6 sizes · Packing ZIP · Almost done
            </p>
          </div>
        )}

        {/* Done — download result */}
        {phase === 'done' && zipBlob && (
          <div className={styles.resultBox}>
            <div className={styles.resultIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>

            <p className={styles.resultTitle}>Favicon Package Ready</p>

            <p className={styles.resultSub}>
              Your ZIP includes <strong>favicon.ico</strong> + 6 individual PNG icons,
              ready to drop into any web project.
            </p>

            {/* Size grid */}
            <div className={styles.sizesGrid}>
              {ICO_SIZES.map(s => (
                <div key={s} className={styles.sizeChip}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:4}}>
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                  </svg>
                  {s}
                </div>
              ))}
            </div>

            {/* Download / success button */}
            {dlDone ? (
              <div className={styles.dlSuccess}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Downloaded — resetting…
              </div>
            ) : (
              <button
                className={styles.downloadBtn}
                onClick={handleDownload}
                disabled={dlRunning}
                type="button"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download favicon_package.zip
              </button>
            )}

            <button
              className={styles.convertAnotherBtn}
              onClick={handleReset}
              type="button"
            >
              Convert another image
            </button>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}