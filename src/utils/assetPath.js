export function asset(path) {
  // import.meta.env.BASE_URL is set by Vite (e.g., '/Web-portfolio/')
  const base = import.meta.env.BASE_URL || '/';
  // ensure no duplicate slashes
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}