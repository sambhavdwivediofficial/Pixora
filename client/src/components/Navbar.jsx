'use client';

import { useEffect, useState } from 'react';
import '@/styles/navbar.css';

export default function Navbar() {
  const [isTauriApp, setIsTauriApp] = useState(false);

  useEffect(() => {
    setIsTauriApp('__TAURI_INTERNALS__' in window);
  }, []);

  return (
    <nav className="navbar">
      <a href="/" className="navbar__logo">
        <div className="navbar__logo-mark">Px</div>
        <span className="navbar__logo-text">
          Pix<span>ora</span>
        </span>
      </a>

      <div className="navbar__nav">
        <a
          href="/ico"
          target={isTauriApp ? undefined : '_blank'}
          rel="noopener noreferrer"
          className="navbar__link navbar__link--ico"
          onClick={(e) => {
            if (isTauriApp) {
              e.preventDefault();
              window.location.href = '/ico';
            }
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          Convert to ICO
        </a>
      </div>
    </nav>
  );
}