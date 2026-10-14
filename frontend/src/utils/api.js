const configuredApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const API_URL = configuredApiUrl.replace(/\/+$/, '');

const API_ORIGIN = API_URL.replace(/\/api$/, '');

export const getAssetUrl = (path) => {
  if (!path || /^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
};
