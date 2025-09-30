/**
 * API Handler for Weather AI Assistant
 * Handles all external API calls with caching and error handling
 */

class ApiHandler {
    constructor() {
        this.cache = new Map();
        this.rateLimiter = new Map();
        this.requestQueue = [];
        this.isOnline = navigator.onLine;
        
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processQueue();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }
    
    /**
     * Get current weather by coordinates
     */
    async getCurrentWeather(lat, lon) {
        if (!CONFIG.isValid) {
            throw new Error('OpenWeather API key not configured');
        }
        
        const url = `${CONFIG.ENDPOINTS.OPENWEATHER_BASE}/weather?lat=${lat}&lon=${lon}&appid=${CONFIG.OPENWEATHER_API_KEY}&units=${CONFIG.DEFAULTS.UNITS}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            return this.normalizeCurrentWeather(data);
        } catch (error) {
            console.error('Failed to fetch current weather:', error);
            throw error;
        }
    }
    
    /**
     * Get current weather by city name
     */
    async getCurrentWeatherByCity(cityName) {
        if (!CONFIG.isValid) {
            throw new Error('OpenWeather API key not configured');
        }
        
        const url = `${CONFIG.ENDPOINTS.OPENWEATHER_BASE}/weather?q=${encodeURIComponent(cityName)}&appid=${CONFIG.OPENWEATHER_API_KEY}&units=${CONFIG.DEFAULTS.UNITS}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('City not found. Please check the spelling and try again.');
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            return this.normalizeCurrentWeather(data);
        } catch (error) {
            if (error.message.includes('City not found')) {
                throw error;
            }
            console.error('Failed to fetch weather by city:', error);
            throw new Error('Failed to fetch weather data. Please try again.');
        }
    }
    
    /**
     * Get 7-day forecast
     */
    async getForecast(lat, lon) {
        if (!CONFIG.isValid) {
            throw new Error('OpenWeather API key not configured');
        }
        
        const url = `${CONFIG.ENDPOINTS.OPENWEATHER_BASE}/forecast?lat=${lat}&lon=${lon}&appid=${CONFIG.OPENWEATHER_API_KEY}&units=${CONFIG.DEFAULTS.UNITS}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            return this.normalizeForecast(data);
        } catch (error) {
            console.error('Failed to fetch forecast:', error);
            throw error;
        }
    }
    
    /**
     * Get air quality data
     */
    async getAirQuality(lat, lon) {
        if (!CONFIG.isValid) {
            return null; // Air quality is optional
        }
        
        const url = `${CONFIG.ENDPOINTS.AIR_QUALITY}?lat=${lat}&lon=${lon}&appid=${CONFIG.OPENWEATHER_API_KEY}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Air quality API error');
            const data = await response.json();
            return this.normalizeAirQuality(data);
        } catch (error) {
            console.warn('Air quality data not available:', error);
            return null;
        }
    }
    
    /**
     * Geocoding - convert city name to coordinates
     */
    async geocodeCity(cityName) {
        if (!CONFIG.isValid) {
            throw new Error('API key not configured');
        }
        
        const url = `${CONFIG.ENDPOINTS.GEOCODING}/direct?q=${encodeURIComponent(cityName)}&limit=5&appid=${CONFIG.OPENWEATHER_API_KEY}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Geocoding failed');
            const data = await response.json();
            return data.map(item => ({
                name: item.name,
                country: item.country,
                state: item.state || '',
                lat: item.lat,
                lon: item.lon,
                displayName: `${item.name}${item.state ? ', ' + item.state : ''}, ${item.country}`
            }));
        } catch (error) {
            console.error('Geocoding failed:', error);
            return [];
        }
    }
    
    /**
     * Normalize current weather data
     */
    normalizeCurrentWeather(data) {
        return {
            location: {
                name: data.name,
                country: data.sys.country,
                coordinates: {
                    lat: data.coord.lat,
                    lon: data.coord.lon
                },
                timezone: data.timezone,
                sunrise: new Date(data.sys.sunrise * 1000),
                sunset: new Date(data.sys.sunset * 1000)
            },
            current: {
                temperature: Math.round(data.main.temp),
                feelsLike: Math.round(data.main.feels_like),
                tempMin: Math.round(data.main.temp_min),
                tempMax: Math.round(data.main.temp_max),
                pressure: data.main.pressure,
                humidity: data.main.humidity,
                visibility: data.visibility ? Math.round(data.visibility / 1000) : null,
                condition: data.weather[0].main,
                description: data.weather[0].description,
                icon: data.weather[0].icon,
                wind: {
                    speed: Math.round(data.wind?.speed * 3.6) || 0,
                    direction: data.wind?.deg || 0,
                    gust: data.wind?.gust ? Math.round(data.wind.gust * 3.6) : null
                },
                clouds: data.clouds.all,
                precipitation: {
                    rain1h: data.rain?.['1h'] || 0,
                    snow1h: data.snow?.['1h'] || 0
                }
            },
            timestamp: new Date(data.dt * 1000),
            raw: data
        };
    }
    
    /**
     * Normalize forecast data
     */
    normalizeForecast(data) {
        const hourly = data.list.slice(0, 24).map(item => ({
            time: new Date(item.dt * 1000),
            temperature: Math.round(item.main.temp),
            condition: item.weather[0].main,
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            precipitation: {
                probability: Math.round((item.pop || 0) * 100),
                amount: (item.rain?.['3h'] || item.snow?.['3h'] || 0)
            },
            wind: {
                speed: Math.round(item.wind.speed * 3.6),
                direction: item.wind.deg
            }
        }));
        
        // Group by days for daily forecast
        const dailyMap = new Map();
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000).toDateString();
            if (!dailyMap.has(date)) {
                dailyMap.set(date, {
                    date: new Date(item.dt * 1000),
                    tempMin: item.main.temp_min,
                    tempMax: item.main.temp_max,
                    condition: item.weather[0].main,
                    description: item.weather[0].description,
                    icon: item.weather[0].icon,
                    precipitation: item.pop || 0,
                    humidity: item.main.humidity,
                    items: []
                });
            }
            
            const day = dailyMap.get(date);
            day.tempMin = Math.min(day.tempMin, item.main.temp_min);
            day.tempMax = Math.max(day.tempMax, item.main.temp_max);
            day.precipitation = Math.max(day.precipitation, item.pop || 0);
            day.items.push(item);
        });
        
        const daily = Array.from(dailyMap.values()).slice(0, 7).map(day => ({
            date: day.date,
            tempMin: Math.round(day.tempMin),
            tempMax: Math.round(day.tempMax),
            condition: day.condition,
            description: day.description,
            icon: day.icon,
            precipitation: Math.round(day.precipitation * 100),
            humidity: day.humidity
        }));
        
        return { hourly, daily };
    }
    
    /**
     * Normalize air quality data
     */
    normalizeAirQuality(data) {
        const aqi = data.list[0].main.aqi;
        const components = data.list[0].components;
        
        const aqiLabels = {
            1: 'Good',
            2: 'Fair',
            3: 'Moderate',
            4: 'Poor',
            5: 'Very Poor'
        };
        
        return {
            aqi: aqi,
            label: aqiLabels[aqi],
            components: {
                co: components.co,
                no: components.no,
                no2: components.no2,
                o3: components.o3,
                so2: components.so2,
                pm2_5: components.pm2_5,
                pm10: components.pm10,
                nh3: components.nh3
            },
            timestamp: new Date(data.list[0].dt * 1000)
        };
    }
    
    /**
     * Get wind direction text
     */
    getWindDirection(degrees) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        return directions[Math.round(degrees / 22.5) % 16];
    }
}

// Create global instance
const API = new ApiHandler();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiHandler;
}

async function getWeather(city) {
  const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`);
  return res.json();
}