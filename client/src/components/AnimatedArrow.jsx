'use client';
import '@/styles/conversionview.css';

export default function AnimatedArrow() {
  return (
    <div className="animated-arrow" aria-hidden="true">
      <svg
        className="animated-arrow__svg"
        viewBox="0 0 60 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Dashed line */}
        <line
          x1="0" y1="12" x2="44" y2="12"
          stroke="var(--border-bright)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        {/* Arrowhead */}
        <path
          d="M44 6 L56 12 L44 18"
          stroke="var(--accent-bright)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="animated-arrow__head"
        />
      </svg>
    </div>
  );
}