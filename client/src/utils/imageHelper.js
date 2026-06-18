export const BASE_URL = 'http://localhost:5000';

export const PLACEHOLDERS = {
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop', // Beautiful default user avatar
  post: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800&auto=format&fit=crop' // Stable default blog cover
};

/**
 * Resolves an image path (local uploads vs absolute web URLs)
 * and returns the correct URL string.
 */
export const getImageUrl = (path, fallbackType = 'post') => {
  if (!path) {
    return PLACEHOLDERS[fallbackType];
  }
  
  if (path.startsWith('/uploads')) {
    return `${BASE_URL}${path}`;
  }
  
  return path;
};

/**
 * Safe fallback handler for HTML <img> onError events.
 */
export const handleImageError = (e, fallbackType = 'post') => {
  e.target.onerror = null; // Prevent infinite looping
  e.target.src = PLACEHOLDERS[fallbackType];
};
