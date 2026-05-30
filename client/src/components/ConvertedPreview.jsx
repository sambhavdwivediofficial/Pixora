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

  return (
    <div
      className={`preview-box preview-box--converted ${result ? 'preview-box--expanded' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="preview-box__label preview-box__label--accent">Converted</div>

      <div className="preview-box__image-wrap">
        {converting && (
          <div className="preview-box__converting">
            <Loader size={44} label="Converting…" />
          </div>
        )}

        {!converting && result && (
          <>
            <img
              src={result.previewUrl}
              alt="Converted"
              draggable={false}
              className="preview-box__converted-img"
            />
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

      {/* Info below converted image — expands on completion */}
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