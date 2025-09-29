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
        this.setupEventListeners();
        this.initializeApp();
    }
    
    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Navigation tabs
        this.elements.navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Theme toggle
        this.elements.themeToggle?.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Search functionality
        this.elements.searchBtn?.addEventListener('click', () => {
            this.handleSearch();
        });
        
        this.elements.cityInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });
        
        // Real-time search suggestions
        this.elements.cityInput?.addEventListener('input', (e) => {
            this.handleSearchInput(e.target.value);
        });
        
        // Location and actions
        this.elements.locationBtn?.addEventListener('click', () => {
            this.getUserLocation();
        });
        
        this.elements.shareBtn?.addEventListener('click', () => {
            this.shareWeather();
        });
        
        // AI Chat
        this.elements.chatSend?.addEventListener('click', () => {
            this.sendChatMessage();
        });
        
        this.elements.chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });
        
        // Error dismissal
        this.elements.dismissError?.addEventListener('click', () => {
            this.hideError();
        });
        
        // Forecast chart toggles
        this.elements.chartToggles?.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                this.updateForecastChart(e.target.dataset.chart);
            });
        });
    }
    
    /**
     * Initialize the application
     */
    async initializeApp() {
        // Check API configuration
        if (!CONFIG.isValid) {
            this.showError('Please configure your API keys in config.js');
            return;
        }
        
        // Load saved location or get user location
        const savedLocation = this.loadSavedLocation();
        if (savedLocation) {
            await this.loadWeatherData(savedLocation.lat, savedLocation.lon);
        } else if (CONFIG.DEFAULTS.AUTO_LOCATION) {
            this.getUserLocation();
        }
        
        // Set up auto-refresh
        if (CONFIG.DEFAULTS.UPDATE_INTERVAL > 0) {
            this.setupAutoRefresh();
        }
        
        // Initialize AI insights if enabled
        if (CONFIG.FEATURES.AI_CHAT && CONFIG.DEFAULTS.AI_INSIGHTS_ENABLED) {
            this.enableAIInsights();
        }
    }
    
    /**
     * Switch between tabs
     */
    switchTab(tabName) {
        // Update active tab
        this.elements.navTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        this.elements.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}Tab`);
        });
        
        this.activeTab = tabName;
        
        // Load tab-specific data
        if (tabName === 'forecast' && this.currentWeatherData) {
            this.loadForecastData();
        } else if (tabName === 'ai' && this.currentWeatherData) {
            this.loadAIInsights();
        }
    }
    
    /**
     * Handle search input with suggestions
     */
    handleSearchInput(query) {
        clearTimeout(this.searchTimeout);
        
        if (query.length < 2) {
            this.hideSearchSuggestions();
            return;
        }
        
        this.searchTimeout = setTimeout(async () => {
            try {
                const suggestions = await API.geocodeCity(query);
                this.showSearchSuggestions(suggestions);
            } catch (error) {
                console.warn('Search suggestions failed:', error);
            }
        }, 300);
    }
    
    /**
     * Show search suggestions
     */
    showSearchSuggestions(suggestions) {
        if (!suggestions.length) {
            this.hideSearchSuggestions();
            return;
        }
        
        const html = suggestions.map(suggestion => `
            <div class="suggestion-item" data-lat="${suggestion.lat}" data-lon="${suggestion.lon}">
                <i class="fas fa-map-marker-alt"></i>
                <span>${suggestion.displayName}</span>
            </div>
        `).join('');
        
        this.elements.searchSuggestions.innerHTML = html;
        this.elements.searchSuggestions.classList.remove('hidden');
        
        // Add click handlers to suggestions
        this.elements.searchSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const lat = parseFloat(item.dataset.lat);
                const lon = parseFloat(item.dataset.lon);
                this.loadWeatherData(lat, lon);
                this.hideSearchSuggestions();
                this.elements.cityInput.value = '';
            });
        });
    }
    
    /**
     * Hide search suggestions
     */
    hideSearchSuggestions() {
        this.elements.searchSuggestions?.classList.add('hidden');
    }
    
    /**
     * Handle search button click
     */
    async handleSearch() {
        const query = this.elements.cityInput.value.trim();
        if (!query) {
            this.showError('Please enter a city name');
            return;
        }
        
        this.showLoading('Searching for location...');
        
        try {
            const weatherData = await API.getCurrentWeatherByCity(query);
            await this.displayWeatherData(weatherData);
            this.elements.cityInput.value = '';
            this.hideSearchSuggestions();
        } catch (error) {
            this.hideLoading();
            this.showError(error.message);
        }
    }
    
    /**
     * Get user's current location
     */
    getUserLocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by this browser');
            return;
        }
        
        this.showLoading('Getting your location...');
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude: lat, longitude: lon } = position.coords;
                await this.loadWeatherData(lat, lon);
                this.saveCurrentLocation(lat, lon);
            },
            (error) => {
                this.hideLoading();
                let message = 'Failed to get your location. ';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message += 'Please allow location access and try again.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message += 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        message += 'Location request timed out.';
                        break;
                    default:
                        message += 'Please try searching for a city instead.';
                        break;
                }
                this.showError(message);
            },
            {
                timeout: 10000,
                maximumAge: 300000,
                enableHighAccuracy: true
            }
        );
    }
    
    /**
     * Load weather data for coordinates
     */
    async loadWeatherData(lat, lon) {
        this.showLoading('Loading weather data...');
        
        try {
            // Get current weather
            const weatherData = await API.getCurrentWeather(lat, lon);
            
            // Get additional data in parallel
            const [airQuality] = await Promise.allSettled([
                API.getAirQuality(lat, lon)
            ]);
            
            // Add air quality if available
            if (airQuality.status === 'fulfilled' && airQuality.value) {
                weatherData.airQuality = airQuality.value;
            }
            
            await this.displayWeatherData(weatherData);
            
        } catch (error) {
            this.hideLoading();
            this.showError('Failed to load weather data: ' + error.message);
        }
    }
    
    /**
     * Display weather data in the UI
     */
    async displayWeatherData(weatherData) {
        this.currentWeatherData = weatherData;
        this.currentLocation = weatherData.location;
        
        this.hideLoading();
        
        // Update current weather display
        this.updateCurrentWeatherUI(weatherData);
        
        // Show weather card
        this.elements.currentWeather?.classList.remove('hidden');
        
        // Load AI insights if on AI tab
        if (this.activeTab === 'ai' && CONFIG.FEATURES.AI_CHAT) {
            this.loadAIInsights();
        }
        
        // Update last update time
        this.updateLastUpdateTime();
        
        this.showSuccess('Weather data updated successfully');
    }
    
    /**
     * Update current weather UI elements
     */
    updateCurrentWeatherUI(weatherData) {
        const { location, current } = weatherData;
        
        // Location info
        if (this.elements.cityName) {
            this.elements.cityName.textContent = `${location.name}, ${location.country}`;
        }
        
        if (this.elements.coordinates) {
            this.elements.coordinates.textContent = 
                `${location.coordinates.lat.toFixed(4)}, ${location.coordinates.lon.toFixed(4)}`;
        }
        
        // Temperature
        if (this.elements.temperature) {
            this.elements.temperature.textContent = current.temperature;
        }
        
        if (this.elements.feelsLike) {
            this.elements.feelsLike.textContent = `${current.feelsLike}°`;
        }
        
        if (this.elements.highTemp) {
            this.elements.highTemp.textContent = `${current.tempMax}°`;
        }
        
        if (this.elements.lowTemp) {
            this.elements.lowTemp.textContent = `${current.tempMin}°`;
        }
        
        // Weather condition
        if (this.elements.condition) {
            this.elements.condition.textContent = current.condition;
        }
        
        if (this.elements.description) {
            this.elements.description.textContent = 
                current.description.charAt(0).toUpperCase() + current.description.slice(1);
        }
        
        // Weather icon
        if (this.elements.weatherIcon) {
            this.elements.weatherIcon.src = `https://openweathermap.org/img/wn/${current.icon}@2x.png`;
            this.elements.weatherIcon.alt = current.description;
        }
        
        // Weather details
        if (this.elements.humidity) {
            this.elements.humidity.textContent = `${current.humidity}%`;
        }
        
        if (this.elements.pressure) {
            this.elements.pressure.textContent = `${current.pressure} hPa`;
        }
        
        if (this.elements.visibility && current.visibility) {
            this.elements.visibility.textContent = `${current.visibility} km`;
        }
        
        if (this.elements.windSpeed) {
            this.elements.windSpeed.textContent = `${current.wind.speed} km/h`;
        }
        
        if (this.elements.windDirection) {
            this.elements.windDirection.textContent = API.getWindDirection(current.wind.direction);
        }
        
        if (this.elements.precipitation) {
            const total = current.precipitation.rain1h + current.precipitation.snow1h;
            this.elements.precipitation.textContent = `${total.toFixed(1)} mm`;
        }
        
        // Air quality
        if (weatherData.airQuality && this.elements.airQualityBadge) {
            const aqi = weatherData.airQuality;
            this.elements.airQualityBadge.classList.remove('hidden');
            this.elements.airQualityBadge.querySelector('.aqi-value').textContent = aqi.aqi;
            this.elements.airQualityBadge.querySelector('.aqi-label').textContent = aqi.label;
            this.elements.airQualityBadge.className = `air-quality-badge aqi-${aqi.aqi}`;
        }
    }
    
    /**
     * Load forecast data
     */
    async loadForecastData() {
        if (!this.currentLocation) return;
        
        try {
            const forecast = await API.getForecast(this.currentLocation.coordinates.lat, this.currentLocation.coordinates.lon);
            this.displayForecastData(forecast);
        } catch (error) {
            console.error('Failed to load forecast:', error);
            this.showError('Failed to load forecast data');
        }
    }
    
    /**
     * Display forecast data
     */
    displayForecastData(forecast) {
        // Update hourly forecast
        this.updateHourlyForecast(forecast.hourly);
        
        // Update daily forecast
        this.updateDailyForecast(forecast.daily);
        
        // Initialize chart
        this.initializeForecastChart(forecast.daily);
    }
    
    /**
     * Update hourly forecast
     */
    updateHourlyForecast(hourlyData) {
        if (!this.elements.hourlyContainer) return;
        
        const html = hourlyData.slice(0, 24).map(hour => `
            <div class="hourly-item">
                <div class="hourly-time">${new Date(hour.time).toLocaleTimeString([], { hour: '2-digit' })}</div>
                <img src="https://openweathermap.org/img/wn/${hour.icon}.png" alt="${hour.description}" class="hourly-icon">
                <div class="hourly-temp">${hour.temperature}°</div>
                <div class="hourly-precip">${hour.precipitation.probability}%</div>
            </div>
        `).join('');
        
        this.elements.hourlyContainer.innerHTML = html;
    }
    
    /**
     * Update daily forecast
     */
    updateDailyForecast(dailyData) {
        if (!this.elements.dailyForecast) return;
        
        const html = dailyData.map(day => `
            <div class="daily-item">
                <div class="daily-date">${new Date(day.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                <img src="https://openweathermap.org/img/wn/${day.icon}.png" alt="${day.description}" class="daily-icon">
                <div class="daily-condition">${day.condition}</div>
                <div class="daily-temps">
                    <span class="high">${day.tempMax}°</span>
                    <span class="low">${day.tempMin}°</span>
                </div>
                <div class="daily-precip">
                    <i class="fas fa-cloud-rain"></i>
                    ${day.precipitation}%
                </div>
            </div>
        `).join('');
        
        this.elements.dailyForecast.innerHTML = html;
    }
    
    /**
     * Initialize forecast chart
     */
    initializeForecastChart(dailyData) {
        if (!this.elements.forecastChart) return;
        
        const ctx = this.elements.forecastChart.getContext('2d');
        
        if (this.forecastChart) {
            this.forecastChart.destroy();
        }
        
        this.forecastChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dailyData.map(day => new Date(day.date).toLocaleDateString([], { weekday: 'short' })),
                datasets: [{
                    label: 'High Temperature',
                    data: dailyData.map(day => day.tempMax),
                    borderColor: '#ff6b6b',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Low Temperature',
                    data: dailyData.map(day => day.tempMin),
                    borderColor: '#4ecdc4',
                    backgroundColor: 'rgba(78, 205, 196, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return value + '°C';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }
    
    /**
     * Load AI insights
     */
    async loadAIInsights() {
        if (!this.currentWeatherData || !CONFIG.FEATURES.AI_CHAT) return;
        
        const insights = [
            { element: this.elements.clothingAdvice, method: 'getClothingAdvice' },
            { element: this.elements.travelAdvice, method: 'getTravelAdvice' },
            { element: this.elements.healthAdvice, method: 'getHealthAdvice' },
            { element: this.elements.activitySuggestions, method: 'getActivitySuggestions' }
        ];
        
        insights.forEach(async ({ element, method }) => {
            if (!element) return;
            
            try {
                const advice = await AI[method](this.currentWeatherData);
                this.updateAIInsight(element, advice);
            } catch (error) {
                console.warn(`Failed to load ${method}:`, error);
                this.updateAIInsight(element, { advice: 'Unable to load advice at this time.', source: 'error' });
            }
        });
        
        // Enable chat if AI is available
        if (AI.isAvailable()) {
            this.elements.chatInput.disabled = false;
            this.elements.chatSend.disabled = false;
        }
    }
    
    /**
     * Update AI insight card
     */
    updateAIInsight(element, advice) {
        const contentDiv = element?.querySelector('.ai-content');
        if (!contentDiv) return;
        
        contentDiv.classList.remove('loading');
        contentDiv.innerHTML = `
            <p>${advice.advice}</p>
            <div class="ai-source">
                <i class="fas fa-${advice.source === 'ai' ? 'robot' : 'lightbulb'}"></i>
                <span>${advice.source === 'ai' ? 'AI Generated' : 'Smart Rules'}</span>
            </div>
        `;
    }
    
    /**
     * Send chat message
     */
    async sendChatMessage() {
        const message = this.elements.chatInput?.value.trim();
        if (!message) return;
        
        // Add user message
        this.addChatMessage(message, 'user');
        this.elements.chatInput.value = '';
        
        // Show typing indicator
        const typingId = this.addChatMessage('AI is thinking...', 'assistant', true);
        
        try {
            const response = await AI.handleChatMessage(message, this.currentWeatherData);
            this.removeChatMessage(typingId);
            this.addChatMessage(response.response, 'assistant');
        } catch (error) {
            this.removeChatMessage(typingId);
            this.addChatMessage('Sorry, I encountered an error. Please try again.', 'assistant');
        }
    }
    
    /**
     * Add chat message to UI
     */
    addChatMessage(content, type, isTemporary = false) {
        const messageId = 'msg_' + Date.now() + Math.random().toString(36).substr(2, 9);
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;
        messageDiv.id = messageId;
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${type === 'user' ? 'user' : 'robot'}"></i>
            </div>
            <div class="message-content">
                <p>${content}</p>
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
            </div>
        `;
        
        this.elements.chatMessages?.appendChild(messageDiv);
        if (this.elements.chatMessages) {
            this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
        }
        
        return isTemporary ? messageId : null;
    }
    
    /**
     * Remove chat message
     */
    removeChatMessage(messageId) {
        const message = document.getElementById(messageId);
        if (message) {
            message.remove();
        }
    }
    
    /**
     * Toggle theme
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        saveSettings({ THEME: newTheme });
        
        // Update theme toggle icon
        const icon = this.elements.themeToggle?.querySelector('i');
        if (icon) {
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
    
    /**
     * Show loading state
     */
    showLoading(message = 'Loading...') {
        this.isLoading = true;
        if (this.elements.loading) {
            this.elements.loading.classList.remove('hidden');
            const loadingText = this.elements.loading.querySelector('.loading-text');
            if (loadingText) loadingText.textContent = message;
        }
    }
    
    /**
     * Hide loading state
     */
    hideLoading() {
        this.isLoading = false;
        if (this.elements.loading) {
            this.elements.loading.classList.add('hidden');
        }
    }
    
    /**
     * Show error message
     */
    showError(message) {
        if (this.elements.errorText) {
            this.elements.errorText.textContent = message;
        }
        if (this.elements.errorToast) {
            this.elements.errorToast.classList.remove('hidden');
            setTimeout(() => this.hideError(), 5000);
        }
    }
    
    /**
     * Hide error message
     */
    hideError() {
        if (this.elements.errorToast) {
            this.elements.errorToast.classList.add('hidden');
        }
    }
    
    /**
     * Show success message
     */
    showSuccess(message) {
        if (this.elements.successText) {
            this.elements.successText.textContent = message;
        }
        if (this.elements.successToast) {
            this.elements.successToast.classList.remove('hidden');
            setTimeout(() => {
                this.elements.successToast.classList.add('hidden');
            }, 3000);
        }
    }
    
    /**
     * Setup auto-refresh
     */
    setupAutoRefresh() {
        this.updateInterval = setInterval(() => {
            if (this.currentLocation && !this.isLoading) {
                this.loadWeatherData(this.currentLocation.coordinates.lat, this.currentLocation.coordinates.lon);
            }
        }, CONFIG.DEFAULTS.UPDATE_INTERVAL);
    }
    
    /**
     * Update last update time
     */
    updateLastUpdateTime() {
        if (this.elements.lastUpdate) {
            this.elements.lastUpdate.textContent = `Updated ${new Date().toLocaleTimeString()}`;
        }
    }
    
    /**
     * Save current location
     */
    saveCurrentLocation(lat, lon) {
        localStorage.setItem('weatherapp_location', JSON.stringify({ lat, lon, timestamp: Date.now() }));
    }
    
    /**
     * Load saved location
     */
    loadSavedLocation() {
        try {
            const saved = localStorage.getItem('weatherapp_location');
            if (!saved) return null;
            
            const location = JSON.parse(saved);
            // Check if location is not too old (24 hours)
            if (Date.now() - location.timestamp > 86400000) {
                return null;
            }
            
            return location;
        } catch (error) {
            return null;
        }
    }
    
    /**
     * Share weather functionality
     */
    async shareWeather() {
        if (!this.currentWeatherData) {
            this.showError('No weather data to share');
            return;
        }
        
        const { location, current } = this.currentWeatherData;
        const shareData = {
            title: `Weather in ${location.name}`,
            text: `Current weather: ${current.temperature}°C, ${current.description} in ${location.name}, ${location.country}`,
            url: window.location.href
        };
        
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback to clipboard
                await navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
                this.showSuccess('Weather info copied to clipboard!');
            }
        } catch (error) {
            console.error('Sharing failed:', error);
            this.showError('Failed to share weather data');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.weatherApp = new WeatherAIApp();
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeatherAIApp;
}
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