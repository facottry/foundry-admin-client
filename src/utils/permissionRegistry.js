/**
 * Permission Registry
 * 
 * Single source of truth for all permissions.
 * Used by frontend UI for permission editor.
 */

export const PERMISSIONS = {
    DASHBOARD: ['DASHBOARD_VIEW', 'DASHBOARD_EDIT'],
    FOUNDERS: ['FOUNDERS_VIEW', 'FOUNDERS_EDIT'],
    PRODUCTS: ['PRODUCTS_VIEW', 'PRODUCTS_EDIT'],
    NEWSLETTER: ['NEWSLETTER_EDIT'],
    AI_JOBS: ['AI_JOBS_EDIT'],
    BOT_PERSONALITIES: ['BOT_PERSONALITIES_EDIT'],
    MESSAGES: ['MESSAGES_VIEW'],
    SERVER_HEALTH: ['SERVER_HEALTH_VIEW', 'SERVER_HEALTH_EDIT'],
    IMAGEMANAGER: ['IMAGEMANAGER_VIEW', 'IMAGEMANAGER_EDIT']
};

// Flat list of all valid permissions
export const ALL_PERMISSIONS = Object.values(PERMISSIONS).flat();

/**
 * Resource labels for UI
 */
export const RESOURCE_LABELS = {
    DASHBOARD: 'Dashboard',
    FOUNDERS: 'Founders',
    PRODUCTS: 'Products',
    NEWSLETTER: 'Newsletter',
    AI_JOBS: 'AI Jobs',
    BOT_PERSONALITIES: 'Bot Personalities',
    MESSAGES: 'Messages',
    SERVER_HEALTH: 'Server Health',
    IMAGEMANAGER: 'Image Manager'
};
