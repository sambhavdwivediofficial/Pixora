'use client';
import '@/styles/navbar.css';

export default function Navbar() {
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
          target="_blank"
          rel="noopener noreferrer"
          className="navbar__link navbar__link--ico"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <path d="M8 21h8M12 17v4"/>
          </svg>
          Convert to ICO
        </a>
      </div>
    </nav>
  );
}