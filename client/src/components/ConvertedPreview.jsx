'use client';
import { useState } from 'react';
import '@/styles/preview.css';
import Loader from './Loader';
import DownloadOverlay from './DownloadOverlay';
import UploadInfo from './UploadInfo';

export default function ConvertedPreview({
  converting,
  result,
  onDownload,
  downloading,
  downloaded,
}) {
  const [hovered, setHovered] = useState(false);

  const isUnsupportedPreview = result && ['tiff', 'tif'].includes(result.format?.toLowerCase());

  return (
    <div
      className={`preview-box preview-box--converted ${result ? 'preview-box--expanded' : ''}`}
    >
      <div className="preview-box__label preview-box__label--accent">Converted</div>

      <div
        className="preview-box__image-wrap"
        onMouseEnter={() => result && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {converting && (
          <div className="preview-box__converting">
            <Loader size={44} label="Converting…" />
          </div>
        )}

        {!converting && result && (
          <>
            {isUnsupportedPreview ? (
              <div className="preview-box__unsupported-format">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <line x1="9" y1="9" x2="9" y2="15"/>
                  <line x1="15" y1="9" x2="15" y2="15"/>
                </svg>
                <p className="preview-box__unsupported-format-label">{result.format.toUpperCase()}</p>
                <p className="preview-box__unsupported-format-sub">Download to view</p>
              </div>
            ) : (
              <img
                src={result.previewUrl}
                alt="Converted"
                draggable={false}
                className="preview-box__converted-img"
              />
            )}
            {hovered && (
              <DownloadOverlay
                onDownload={onDownload}
                downloading={downloading}
                downloaded={downloaded}
              />
            )}
          </>
        )}

        {!converting && !result && (
          <div className="preview-box__empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}
      </div>

      {result && (
        <div className="preview-box__info preview-box__info--animated">
          <UploadInfo
            format={result.format}
            sizeBytes={result.size}
            width={result.width}
            height={result.height}
          />
        </div>
      )}
    </div>
  );
}