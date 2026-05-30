'use client';
import '@/styles/uploadinfo.css';
import { formatFileSize, formatResolution } from '@/utils/helpers';

export default function UploadInfo({ format, sizeBytes, width, height }) {
  if (!format) return null;

  return (
    <div className="upload-info">
      <div className="upload-info__chip upload-info__chip--format">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        {format}
      </div>
      <div className="upload-info__chip">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <path d="M7 10l5 5 5-5"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        {formatFileSize(sizeBytes)}
      </div>
      <div className="upload-info__chip">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
        </svg>
        {formatResolution(width, height)}
      </div>
    </div>
  );
}