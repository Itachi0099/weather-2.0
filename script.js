/**
 * Weather AI Assistant - Main Application
 * Enhanced weather app with AI insights, voice commands, and advanced features
 */

class WeatherAIApp {
    constructor() {
        this.currentWeatherData = null;
        this.currentLocation = null;
        this.activeTab = 'current';
        this.isLoading = false;
        this.searchTimeout = null;
        this.updateInterval = null;
        this.forecastChart = null;
        
        this.initializeElements();
        this.init();
    }
    
    initializeElements() {
        // Get all DOM elements
        this.elements = {
            // Navigation
            navTabs: document.querySelectorAll('.nav-tab'),
            tabContents: document.querySelectorAll('.tab-content'),
            themeToggle: document.getElementById('themeToggle'),
            settingsBtn: document.getElementById('settingsBtn'),
            
            // Search
            cityInput: document.getElementById('cityInput'),
            searchBtn: document.getElementById('searchBtn'),
            locationBtn: document.getElementById('locationBtn'),
            favoriteBtn: document.getElementById('favoriteBtn'),
            shareBtn: document.getElementById('shareBtn'),
            searchSuggestions: document.getElementById('searchSuggestions'),
            
            // Loading and states
            loading: document.getElementById('loading'),
            
            // Current weather
            currentWeather: document.getElementById('currentWeather'),
            cityName: document.getElementById('cityName'),
            coordinates: document.getElementById('coordinates'),
            lastUpdate: document.getElementById('lastUpdate'),
            airQualityBadge: document.getElementById('airQualityBadge'),
            temperature: document.getElementById('temperature'),
            highTemp: document.getElementById('highTemp'),
            lowTemp: document.getElementById('lowTemp'),
            feelsLike: document.getElementById('feelsLike'),
            weatherIcon: document.getElementById('weatherIcon'),
            condition: document.getElementById('condition'),
            description: document.getElementById('description'),
            visibility: document.getElementById('visibility'),
            humidity: document.getElementById('humidity'),
            windSpeed: document.getElementById('windSpeed'),
            windDirection: document.getElementById('windDirection'),
            pressure: document.getElementById('pressure'),
            uvIndex: document.getElementById('uvIndex'),
            uvDescription: document.getElementById('uvDescription'),
            precipitation: document.getElementById('precipitation'),
            hourlyContainer: document.getElementById('hourlyContainer'),
            
            // Forecast
            forecastChart: document.getElementById('forecastChart'),
            dailyForecast: document.getElementById('dailyForecast'),
            chartToggles: document.querySelectorAll('.chart-toggle'),
            
            // AI Insights
            clothingAdvice: document.getElementById('clothingAdvice'),
            travelAdvice: document.getElementById('travelAdvice'),
            healthAdvice: document.getElementById('healthAdvice'),
            activitySuggestions: document.getElementById('activitySuggestions'),
            chatMessages: document.getElementById('chatMessages'),
            chatInput: document.getElementById('chatInput'),
            chatSend: document.getElementById('chatSend'),
            
            // Voice
            voiceBtn: document.getElementById('voiceBtn'),
            voiceFeedback: document.getElementById('voiceFeedback'),
            voiceStatus: document.getElementById('voiceStatus'),
            
            // Modals and Toasts
            settingsModal: document.getElementById('settingsModal'),
            closeSettings: document.getElementById('closeSettings'),
            errorToast: document.getElementById('errorToast'),
            successToast: document.getElementById('successToast'),
            dismissError: document.getElementById('dismissError'),
            errorText: document.getElementById('errorText'),
            successText: document.getElementById('successText')
        };
    }
    
    /**
     * Initialize the application
     */
    
    init() {
        // Event listeners
        this.elements.searchBtn.addEventListener('click', () => this.searchByCity());
        this.elements.locationBtn.addEventListener('click', () => this.getUserLocation());
        this.elements.dismissError.addEventListener('click', () => this.hideError());
        
        // Allow Enter key for search
        this.elements.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchByCity();
            }
        });
        
        // Check if API key is set
        if (this.API_KEY === 'YOUR_API_KEY_HERE') {
            this.showError('Please set your OpenWeatherMap API key in script.js');
            return;
        }
        
        // Try to get user location on load
        this.getUserLocation();
        
        document.querySelectorAll('.nav-tab').forEach(tab => {
          tab.onclick = () => {
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(tab.dataset.tab + 'Tab').classList.add('active');
          };
        });
        document.getElementById('themeToggle').onclick = () => {
          document.body.classList.toggle('dark');
          localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
        };
        window.onload = () => {
          if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark');
        };
    }
    
    // Geolocation functionality
    getUserLocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by this browser.');
            return;
        }
        
        this.showLoading();
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                // Show coordinates for debugging
                this.elements.coordinates.textContent = `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
                
                this.fetchWeatherByCoordinates(lat, lon);
            },
            (error) => {
                this.hideLoading();
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        this.showError('Location access denied by user. Please search for a city manually.');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        this.showError('Location information is unavailable. Please search for a city manually.');
                        break;
                    case error.TIMEOUT:
                        this.showError('Location request timed out. Please search for a city manually.');
                        break;
                    default:
                        this.showError('An unknown error occurred while getting location. Please search for a city manually.');
                        break;
                }
            },
            {
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    }
    
    // Search functionality
    searchByCity() {
        const cityName = this.elements.cityInput.value.trim();
        
        if (!cityName) {
            this.showError('Please enter a city name.');
            return;
        }
        
        this.showLoading();
        this.fetchWeatherByCity(cityName);
    }
    
    // API integration
    async fetchWeatherByCoordinates(lat, lon) {
        try {
            const url = `${this.API_BASE}?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.displayWeatherData(data);
            
        } catch (error) {
            this.hideLoading();
            this.showError('Failed to fetch weather data. Please check your internet connection.');
            console.error('Weather API Error:', error);
        }
    }
    
    async fetchWeatherByCity(cityName) {
        try {
            const url = `${this.API_BASE}?q=${encodeURIComponent(cityName)}&appid=${this.API_KEY}&units=metric`;
            const response = await fetch(url);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('City not found. Please check the spelling and try again.');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Update coordinates display
            this.elements.coordinates.textContent = `Lat: ${data.coord.lat.toFixed(4)}, Lon: ${data.coord.lon.toFixed(4)}`;
            
            this.displayWeatherData(data);
            
        } catch (error) {
            this.hideLoading();
            if (error.message.includes('City not found')) {
                this.showError(error.message);
            } else {
                this.showError('Failed to fetch weather data. Please check your internet connection.');
            }
            console.error('Weather API Error:', error);
        }
    }
    
    // Display weather data
    displayWeatherData(data) {
        this.hideLoading();
        
        // Update weather information
        this.elements.cityName.textContent = `${data.name}, ${data.sys.country}`;
        this.elements.temperature.textContent = Math.round(data.main.temp);
        this.elements.condition.textContent = data.weather[0].description
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        this.elements.humidity.textContent = `${data.main.humidity}%`;
        this.elements.feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
        
        // Weather icon
        const iconCode = data.weather[0].icon;
        this.elements.weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        this.elements.weatherIcon.alt = data.weather[0].description;
        
        // Show weather card
        this.elements.weatherCard.classList.remove('hidden');
        
        // Clear search input
        this.elements.cityInput.value = '';
    }
    
    // UI state management
    showLoading() {
        this.elements.loading.classList.remove('hidden');
        this.elements.weatherCard.classList.add('hidden');
        this.elements.errorMessage.classList.add('hidden');
    }
    
    hideLoading() {
        this.elements.loading.classList.add('hidden');
    }
    
    showError(message) {
        this.elements.errorText.textContent = message;
        this.elements.errorMessage.classList.remove('hidden');
        this.elements.weatherCard.classList.add('hidden');
    }
    
    hideError() {
        this.elements.errorMessage.classList.add('hidden');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});

// Export for potential testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeatherApp;
}