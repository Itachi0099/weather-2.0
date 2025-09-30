const CONFIG = {
    // Weather APIs
    OPENWEATHER_API_KEY: '',
    WEATHERAPI_KEY: '', // Alternative weather API
    
    // AI APIs
    OPENAI_API_KEY: '', // For AI insights
    
    // Map APIs
    MAPBOX_API_KEY: '', // For geocoding and tiles
    
    // Other APIs
    UNSPLASH_API_KEY: '', // For location photos
    
    // API Endpoints
    ENDPOINTS: {
        OPENWEATHER_BASE: '',
        OPENWEATHER_ONECALL: '',
        WEATHERAPI_BASE: '',
        AIR_QUALITY: '',
        UV_INDEX: '',
        GEOCODING: '',
        MAPBOX_GEOCODING: '',
        UNSPLASH_PHOTOS: '',
        
        // Proxy endpoints for CORS-sensitive APIs
        PROXY_BASE: 'https://cors-anywhere.herokuapp.com/', // Use your own proxy
        OPENAI_PROXY: '/api/openai' // If you set up a backend proxy
    },
    
    // Default settings
    DEFAULTS: {
        UNITS: 'metric', // metric, imperial, kelvin
        LANGUAGE: 'en',
        THEME: 'light', // light, dark, auto
        VOICE_ENABLED: true,
        AUTO_LOCATION: true,
        NOTIFICATIONS: true,
        UPDATE_INTERVAL: 300000, // 5 minutes
        CACHE_DURATION: 600000, // 10 minutes
        AI_INSIGHTS_ENABLED: true,
        BACKGROUND_SYNC: true
    },
    
    // App constants
    APP: {
        NAME: 'Weather AI Assistant',
        VERSION: '2.0.0',
        DESCRIPTION: 'AI-powered weather companion with voice commands and personalized insights',
        AUTHOR: 'Weather AI Team',
        GITHUB: 'https://github.com/yourusername/weather-ai',
        SUPPORT_EMAIL: 'support@weatherai.app'
    },
    
    // Feature flags
    FEATURES: {
        VOICE_COMMANDS: true,
        AI_CHAT: true,
        WEATHER_MAPS: true,
        PUSH_NOTIFICATIONS: true,
        OFFLINE_MODE: true,
        SOCIAL_SHARING: true,
        LOCATION_PHOTOS: true,
        ADVANCED_CHARTS: true,
        WEATHER_ALERTS: true,
        FAVORITES: true
    },
    
    // Rate limiting
    RATE_LIMITS: {
        API_CALLS_PER_MINUTE: 60,
        AI_REQUESTS_PER_HOUR: 100,
        VOICE_REQUESTS_PER_MINUTE: 10
    },
    
    // Debugging
    DEBUG: true, // Set to false in production
    LOG_LEVEL: 'info' // error, warn, info, debug
};

// Validation function
function validateConfig() {
    const requiredKeys = [
        'OPENWEATHER_API_KEY'
    ];
    
    const missingKeys = requiredKeys.filter(key => 
        !CONFIG[key] || CONFIG[key] === `YOUR_${key}_HERE`
    );
    
    if (missingKeys.length > 0) {
        console.warn('Missing API keys:', missingKeys);
        return false;
    }
    
    return true;
}

// Initialize configuration
function initConfig() {
    // Load settings from localStorage
    const savedSettings = JSON.parse(localStorage.getItem('weatherapp_settings') || '{}');
    
    // Merge with defaults
    Object.assign(CONFIG.DEFAULTS, savedSettings);
    
    // Set theme
    if (CONFIG.DEFAULTS.THEME === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
        document.documentElement.setAttribute('data-theme', CONFIG.DEFAULTS.THEME);
    }
    
    // Validate configuration
    CONFIG.isValid = validateConfig();
    
    if (CONFIG.DEBUG) {
        console.log('Configuration initialized:', CONFIG);
    }
}

// Save settings to localStorage
function saveSettings(settings) {
    const currentSettings = JSON.parse(localStorage.getItem('weatherapp_settings') || '{}');
    const updatedSettings = { ...currentSettings, ...settings };
    localStorage.setItem('weatherapp_settings', JSON.stringify(updatedSettings));
    Object.assign(CONFIG.DEFAULTS, updatedSettings);
}

// Get API key with fallback
function getApiKey(service) {
    const key = CONFIG[`${service.toUpperCase()}_API_KEY`];
    if (!key || key.startsWith('YOUR_')) {
        throw new Error(`${service} API key not configured`);
    }
    return key;
}

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, initConfig, saveSettings, getApiKey };
}

// Initialize on load
if (typeof window !== 'undefined') {
    initConfig();
}

const WEATHER_API_KEY = 'YOUR_API_KEY';
const DEFAULT_CITY = 'New York';
