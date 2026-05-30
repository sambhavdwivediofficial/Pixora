/**
 * Pixora API Service
 * Supports both Python (port 8598) and Rust (port 8599) backends.
 * Controlled by NEXT_PUBLIC_BACKEND env var.
 */

const BACKENDS = {
  python: process.env.NEXT_PUBLIC_PY_API_URL || 'http://localhost:8598',
  rust:   process.env.NEXT_PUBLIC_RUST_API_URL || 'http://localhost:8599',
};

export function getApiBase() {
  const backend = process.env.NEXT_PUBLIC_BACKEND || 'python';
  return BACKENDS[backend] || BACKENDS.python;
}

export function apiUrl(path) {
  return `${getApiBase()}${path}`;
}

export async function checkBackendHealth() {
  try {
    const res = await fetch(apiUrl('/health'), { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    return { ok: true, backend: data.backend };
  } catch {
    return { ok: false, backend: null };
  }
}