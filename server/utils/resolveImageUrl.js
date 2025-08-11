// src/utils/resolveImageUrl.js
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function resolveImageUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/')) return `${API_BASE}${url}`;
  return `${API_BASE}/${url}`;
}
