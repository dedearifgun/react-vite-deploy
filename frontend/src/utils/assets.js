import { API_ORIGIN } from './api';

export const resolveAssetUrl = (url) => {
  if (!url) return '';
  // Jika path relatif ke uploads, prefix dengan origin backend
  if (url.startsWith('/uploads/')) {
    return API_ORIGIN + url;
  }
  return url;
};

// Pilih varian ukuran gambar berdasarkan konvensi nama "*-thumb.webp|*-medium.webp|*-large.webp"
export const resolveAssetUrlSized = (url, size = 'medium') => {
  if (!url) return '';
  const targetSize = ['thumb', 'medium', 'large'].includes(size) ? size : 'medium';
  if (url.startsWith('/uploads/')) {
    // Ganti suffix ukuran jika ada; jika tidak ada suffix, fallback ke URL asli
    const match = url.match(/^(.*?)-(thumb|medium|large)\.webp$/i);
    if (match) {
      const base = match[1];
      return API_ORIGIN + `${base}-${targetSize}.webp`;
    }
    // Jika sudah .webp tanpa suffix, coba gunakan sebagai default
    return API_ORIGIN + url;
  }
  return url;
};