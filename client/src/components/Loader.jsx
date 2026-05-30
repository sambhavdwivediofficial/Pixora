'use client';
import '@/styles/loader.css';

export default function Loader({ size = 36, color = 'var(--accent)', label = null }) {
  return (
    <div className="loader-wrap">
      <svg
        className="loader-ring"
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ '--loader-color': color }}
      >
        <circle
          className="loader-track"
          cx="18" cy="18" r="15"
          strokeWidth="2.5"
        />
        <circle
          className="loader-arc"
          cx="18" cy="18" r="15"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      {label && <span className="loader-label">{label}</span>}
    </div>
  );
}