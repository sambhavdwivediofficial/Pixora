'use client';
import '@/styles/footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__left">
        <span>Pixora</span> — Image Converter
      </div>
      <div className="footer__center">
        Made by{' '}
        <a
          href="https://www.sambhavdwivedi.in"
          target="_blank"
          rel="noopener noreferrer"
        >
          Sambhav Dwivedi
        </a>
      </div>
      <div className="footer__right">
        <span>PNG · JPG · WEBP · AVIF · HEIC</span>
        <span className="footer__dot" />
        <span>100% in-memory</span>
      </div>
    </footer>
  );
}