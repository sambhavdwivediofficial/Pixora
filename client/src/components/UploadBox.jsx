'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import '@/styles/uploadbox.css';
import Loader from './Loader';

// Main page formats — NO ICO in the list
const MAIN_FORMATS = ['PNG', 'JPG', 'WEBP', 'AVIF', 'HEIC', 'BMP', 'TIFF', 'SVG'];

// ICO page formats — NO ICO (not allowed as input there either)
const ICO_PAGE_FORMATS = ['PNG', 'JPG', 'WEBP', 'AVIF', 'HEIC', 'BMP', 'TIFF', 'SVG'];

function getFileExt(file) {
  if (!file?.name) return '';
  const parts = file.name.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

export default function UploadBox({
  onFile,
  previewUrl,
  validating,
  error,
  locked,
  resetError,
  icoPage = false,   // true on /ico page — blocks ICO input with inline warning
}) {
  const inputRef = useRef(null);
  const [dragover,    setDragover]    = useState(false);
  const [icoWarning,  setIcoWarning]  = useState(false); // 2-sec inline warning
  const icoTimerRef = useRef(null);

  // Show 2-sec ICO warning then auto-clear
  const triggerIcoWarning = useCallback(() => {
    setIcoWarning(true);
    if (icoTimerRef.current) clearTimeout(icoTimerRef.current);
    icoTimerRef.current = setTimeout(() => setIcoWarning(false), 2000);
  }, []);

  useEffect(() => () => clearTimeout(icoTimerRef.current), []);

  const tryFile = useCallback((file) => {
    if (!file) return;
    if (icoPage && getFileExt(file) === 'ico') {
      triggerIcoWarning();
      return;
    }
    onFile(file);
  }, [icoPage, onFile, triggerIcoWarning]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragover(false);
    if (locked) return;
    const file = e.dataTransfer?.files?.[0];
    if (file) tryFile(file);
  }, [locked, tryFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (!locked) setDragover(true);
  }, [locked]);

  const handleDragLeave = useCallback(() => setDragover(false), []);

  const handleClick = useCallback(() => {
    if (locked) return;
    inputRef.current?.click();
  }, [locked]);

  const handleInputChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      tryFile(file);
      e.target.value = '';
    }
  }, [tryFile]);

  const handleKeyDown = useCallback((e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !locked) {
      e.preventDefault();
      inputRef.current?.click();
    }
  }, [locked]);

  const formats = icoPage ? ICO_PAGE_FORMATS : MAIN_FORMATS;

  let boxClass = 'upload-box';
  if (dragover)    boxClass += ' upload-box--dragover';
  if (previewUrl)  boxClass += ' upload-box--has-image';
  if (error)       boxClass += ' upload-box--error';
  if (icoWarning)  boxClass += ' upload-box--ico-warn';

  return (
    <div
      className={boxClass}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onKeyDown={handleKeyDown}
      tabIndex={locked ? -1 : 0}
      role="button"
      aria-label="Upload image"
    >
      <input
        ref={inputRef}
        type="file"
        accept={
          icoPage
            ? '.png,.jpg,.jpeg,.webp,.bmp,.tiff,.tif,.avif,.heic,.heif,.svg'
            : '.png,.jpg,.jpeg,.webp,.bmp,.tiff,.tif,.avif,.heic,.heif,.svg,.ico'
        }
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />

      {/* Preview layer */}
      {previewUrl && !error && (
        <div className="upload-box__preview">
          <img src={previewUrl} alt="Uploaded preview" draggable={false} />
        </div>
      )}

      {/* Validating overlay */}
      {validating && (
        <div className="upload-box__validating">
          <Loader size={40} label="Validating…" />
        </div>
      )}

      {/* ICO-not-allowed warning — 2 sec inline, auto-disappears */}
      {icoWarning && (
        <div className="upload-box__ico-warning">
          <div className="upload-box__ico-warning-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <p className="upload-box__ico-warning-title">ICO files not accepted here</p>
          <p className="upload-box__ico-warning-sub">
            This page converts <em>to</em> ICO.<br />
            To convert an ICO file, go to the main page.
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !validating && !icoWarning && (
        <div className="upload-box__error">
          <div className="upload-box__error-icon">⚠️</div>
          <p className="upload-box__error-msg">{error}</p>
          <p className="upload-box__error-retry">Click to try a different file</p>
        </div>
      )}

      {/* Idle / empty state */}
      {!previewUrl && !error && !validating && !icoWarning && (
        <div className="upload-box__idle">
          <div className="upload-box__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <p className="upload-box__title">
            {dragover ? 'Drop it here' : 'Drop image or click to upload'}
          </p>
          <p className="upload-box__sub">Max 50 MB · No GIF, video, or audio</p>
          <div className="upload-box__formats">
            {formats.map(f => (
              <span key={f} className="upload-box__fmt-tag">{f}</span>
            ))}
            <span className="upload-box__fmt-tag upload-box__fmt-tag--blocked">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:8,height:8,marginRight:3}}>
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              {icoPage ? 'No ICO' : 'No ICO output'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}