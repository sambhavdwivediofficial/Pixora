'use client';

import '@/styles/loader.css';

export default function Loader({ size = 48, color = null, label = null }) {
  return (
    <div className="loader-wrap">
      <svg
        className="loader-orbital"
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={color ? { '--loader-color': color } : {}}
      >
        {/* ── Ring 1: Outer full-ish, clockwise ── */}
        <circle
          className="orbital-track"
          cx="24" cy="24" r="21"
          strokeWidth="2"
        />
        <circle
          className="orbital-ring orbital-ring--1"
          cx="24" cy="24" r="21"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* ── Ring 2: Half arc, counter-clockwise ── */}
        <circle
          className="orbital-ring orbital-ring--2"
          cx="24" cy="24" r="15.5"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* ── Ring 3: Dotted ring, clockwise fast ── */}
        <circle
          className="orbital-ring orbital-ring--3"
          cx="24" cy="24" r="10"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* ── Ring 4: Tiny core arc, counter-clockwise ── */}
        <circle
          className="orbital-ring orbital-ring--4"
          cx="24" cy="24" r="5"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>

      {label && <span className="loader-label">{label}</span>}
    </div>
  );
}