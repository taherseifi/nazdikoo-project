export function getCanonicalUrl(path = '') {
  const baseUrl = import.meta.env.VITE_SITE_URL || 'https://example.com';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}