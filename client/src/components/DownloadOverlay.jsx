'use client';
import '@/styles/preview.css';

export default function DownloadOverlay({ onDownload, downloading, downloaded }) {
  return (
    <div className="download-overlay">
      {downloaded ? (
        <div className="download-overlay__success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span>Downloading…</span>
        </div>
      ) : (
        <button
          className="download-overlay__btn"
          onClick={onDownload}
          disabled={downloading}
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download
        </button>
      )}
    </div>
  );
}