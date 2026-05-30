'use client';
import { useRef, useState, useCallback } from 'react';
import '@/styles/uploadbox.css';
import Loader from './Loader';
import { validateFileForUpload } from '@/utils/validators';

const FORMATS = ['PNG', 'JPG', 'WEBP', 'AVIF', 'HEIC', 'BMP', 'TIFF', 'SVG', 'ICO'];

export default function UploadBox({
  onFile,
  previewUrl,
  validating,
  error,
  locked,          // true once a file is loaded and workflow started
  resetError,
}) {
  const inputRef = useRef(null);
  const [dragover, setDragover] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragover(false);
    if (locked) return;
    const file = e.dataTransfer?.files?.[0];
    if (file) onFile(file);
  }, [locked, onFile]);

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
      onFile(file);
      e.target.value = '';
    }
  }, [onFile]);

  const handleKeyDown = useCallback((e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !locked) {
      e.preventDefault();
      inputRef.current?.click();
    }
  }, [locked]);

  let boxClass = 'upload-box';
  if (dragover) boxClass += ' upload-box--dragover';
  if (previewUrl) boxClass += ' upload-box--has-image';
  if (error)      boxClass += ' upload-box--error';

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
        accept=".png,.jpg,.jpeg,.webp,.bmp,.tiff,.tif,.avif,.heic,.heif,.svg,.ico"
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

      {/* Error state */}
      {error && !validating && (
        <div className="upload-box__error">
          <div className="upload-box__error-icon">⚠️</div>
          <p className="upload-box__error-msg">{error}</p>
          <p className="upload-box__error-retry">Click to try a different file</p>
        </div>
      )}

      {/* Idle / empty state */}
      {!previewUrl && !error && !validating && (
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
            {FORMATS.map(f => (
              <span key={f} className="upload-box__fmt-tag">{f}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}