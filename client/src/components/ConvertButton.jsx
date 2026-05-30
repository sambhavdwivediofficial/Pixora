'use client';
import '@/styles/convertbutton.css';

export default function ConvertButton({ sourceFormat, outputFormat, onClick, disabled }) {
  const hasMapping = sourceFormat && outputFormat;

  return (
    <div className="convert-btn-wrap">
      <button
        className="convert-btn"
        onClick={onClick}
        disabled={disabled || !outputFormat}
        type="button"
        aria-label={hasMapping ? `Convert ${sourceFormat} to ${outputFormat}` : 'Convert'}
      >
        <span className="convert-btn__text">
          {hasMapping
            ? `${sourceFormat} → ${outputFormat}`
            : 'Convert'}
        </span>
        <span className="convert-btn__arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </span>
      </button>
    </div>
  );
}