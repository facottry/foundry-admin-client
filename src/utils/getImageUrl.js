/**
 * Get public image URL from key or URL
 * @param {string} keyOrUrl - storage key or full URL
 * @returns {string} Public URL
 */
export const getImageUrl = (keyOrUrl) => {
    if (!keyOrUrl) return '';

    if (keyOrUrl.startsWith('http') || keyOrUrl.startsWith('data:')) {
        return keyOrUrl;
    }

    // Use environment variable for base URL
    const baseUrl = import.meta.env.VITE_R2_PUBLIC_BASE_URL;

    if (!baseUrl) {
        console.warn('VITE_R2_PUBLIC_BASE_URL is not defined');
        return keyOrUrl;
    }

    const cleanKey = keyOrUrl.startsWith('/') ? keyOrUrl.slice(1) : keyOrUrl;
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

    return `${cleanBase}/${cleanKey}`;
};
