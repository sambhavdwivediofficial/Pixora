'use client';
import { useState, useEffect, useRef } from 'react';
import '@/styles/settings.css';
import { getOutputFormats } from '@/utils/formats';
import { computeAspectHeight, computeAspectWidth } from '@/utils/dimensions';

export default function Settings({ sourceFormat, origWidth, origHeight, onChange }) {
  const [outputFormat,      setOutputFormat]      = useState('');
  const [width,             setWidth]             = useState('');
  const [height,            setHeight]            = useState('');
  const [preserveAspect,    setPreserveAspect]    = useState(true);
  const [preserveMetadata,  setPreserveMetadata]  = useState(true);
  const [quality,           setQuality]           = useState(90);

  const formats = getOutputFormats(sourceFormat);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Set default format when source format changes
  useEffect(() => {
    setOutputFormat('');
  }, [sourceFormat]);

  // Emit changes upward
  useEffect(() => {
    onChange?.({
      outputFormat,
      width:    width   ? parseInt(width)  : null,
      height:   height  ? parseInt(height) : null,
      preserveAspect,
      preserveMetadata,
      quality,
    });
  }, [outputFormat, width, height, preserveAspect, preserveMetadata, quality]);

  const handleWidthChange = (v) => {
    setWidth(v);
    if (preserveAspect && v && origWidth && origHeight) {
      setHeight(String(computeAspectHeight(origWidth, origHeight, parseInt(v))));
    }
  };

  const handleHeightChange = (v) => {
    setHeight(v);
    if (preserveAspect && v && origWidth && origHeight) {
      setWidth(String(computeAspectWidth(origWidth, origHeight, parseInt(v))));
    }
  };

  return (
    <div className="settings">
      <div className="settings__header">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.07 4.93l-1.41 1.41M21 12h-2M19.07 19.07l-1.41-1.41M12 21v-2M4.93 19.07l1.41-1.41M3 12h2M4.93 4.93l1.41 1.41M12 3v2"/>
        </svg>
        Conversion Settings
      </div>

      {/* Top Row: Output Format + Quality */}
      <div className="settings__top-row">
        {/* Output Format – Custom Dropdown */}
        <div className="settings__row settings__row--compact">
          <label className="settings__label">Convert To</label>
          <div className="settings__custom-select" ref={dropdownRef}>
            <button
              type="button"
              className="settings__custom-select-trigger"
              onClick={() => setDropdownOpen(prev => !prev)}
            >
              <span>{outputFormat || 'Select'}</span>
              <svg
                className={`settings__custom-select-arrow ${dropdownOpen ? 'settings__custom-select-arrow--open' : ''}`}
                width="10"
                height="6"
                viewBox="0 0 10 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 1l4 4 4-4" />
              </svg>
            </button>
            {dropdownOpen && (
              <ul className="settings__custom-select-menu">
                {formats.map(f => (
                  <li
                    key={f}
                    className={`settings__custom-select-item ${outputFormat === f ? 'settings__custom-select-item--selected' : ''}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setOutputFormat(f);
                      setDropdownOpen(false);
                    }}
                  >
                    {f}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Quality */}
        <div className="settings__row settings__row--compact">
          <label className="settings__label">Quality</label>
          <div className="settings__quality-options">
            {[100, 90, 80, 70, 60].map(q => (
              <button
                key={q}
                className={`settings__quality-btn ${quality === q ? 'settings__quality-btn--active' : ''}`}
                onClick={() => setQuality(q)}
                type="button"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dimensions */}
      <div className="settings__row">
        <label className="settings__label">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}>
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
          </svg>
          Dimensions
        </label>
        <div className="settings__dims">
          <div className="settings__input-wrap">
            <input
              className="settings__input"
              type="number"
              min="1"
              max="16384"
              placeholder={origWidth || 'Width'}
              value={width}
              onChange={e => handleWidthChange(e.target.value)}
            />
            <span className="settings__input-unit">px</span>
          </div>
          <div className="settings__input-wrap">
            <input
              className="settings__input"
              type="number"
              min="1"
              max="16384"
              placeholder={origHeight || 'Height'}
              value={height}
              onChange={e => handleHeightChange(e.target.value)}
            />
            <span className="settings__input-unit">px</span>
          </div>
        </div>
      </div>

      {/* Preserve Aspect Ratio */}
      <div
        className="settings__toggle-row"
        onClick={() => setPreserveAspect(v => !v)}
        role="switch"
        aria-checked={preserveAspect}
        tabIndex={0}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setPreserveAspect(v => !v)}
      >
        <span className="settings__toggle-label">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M3 16v3a2 2 0 002 2h3M16 21h3a2 2 0 002-2v-3"/>
          </svg>
          Preserve Aspect Ratio
        </span>
        <div className={`settings__toggle ${preserveAspect ? 'settings__toggle--on' : ''}`} />
      </div>

      {/* Metadata */}
      <div className="settings__row">
        <label className="settings__label">Metadata</label>
        <div className="settings__meta-options">
          <button
            className={`settings__meta-btn ${preserveMetadata ? 'settings__meta-btn--active' : ''}`}
            onClick={() => setPreserveMetadata(true)}
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Preserve
          </button>
          <button
            className={`settings__meta-btn ${!preserveMetadata ? 'settings__meta-btn--active' : ''}`}
            onClick={() => setPreserveMetadata(false)}
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}