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
        <div className="convert-btn__content">
          <div className="convert-btn__top">
            <span className="convert-btn__icon">
              <svg viewBox="0 0 24 24" fill="currentColor" strokeWidth="0">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </span>
            <span className="convert-btn__label">Convert</span>
          </div>
          {hasMapping && (
            <div className="convert-btn__mapping">
              {sourceFormat} → {outputFormat}
            </div>
          )}
        </div>
      </button>
    </div>
  );
}