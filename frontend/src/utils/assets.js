import { API_ORIGIN } from './api';

export const resolveAssetUrl = (url) => {
  if (!url) return '';
  // Jika path relatif ke uploads, prefix dengan origin backend
  if (url.startsWith('/uploads/')) {
    return API_ORIGIN + url;
  }
  return url;
};