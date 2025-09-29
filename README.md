# AI Weather Assistant 🌤️

An **AI-powered weather companion** with voice commands, personalized insights, and advanced forecasting capabilities. This isn't just another weather app - it's your intelligent weather assistant!

## ✨ Features

### 🤖 AI-Powered Intelligence
- **Smart Insights**: AI-generated clothing recommendations, travel tips, health advisories, and activity suggestions
- **Interactive Chat**: Ask your weather AI anything and get personalized responses
- **Contextual Advice**: Weather-aware suggestions based on current conditions
- **Fallback Intelligence**: Smart rule-based recommendations when AI is unavailable

### 🎯 Advanced Weather Data
- **Multi-Source APIs**: Primary and fallback weather data sources
- **Air Quality Monitoring**: Real-time AQI data with health recommendations
- **UV Index Tracking**: Sun safety information
- **7-Day Detailed Forecasts**: Extended weather planning
- **24-Hour Hourly Data**: Precise short-term forecasting
- **Precipitation Tracking**: Rain/snow probability and amounts

### 🗣️ Voice & Interaction
- **Voice Commands**: "What should I wear today?", "Will it rain tomorrow?"
- **Speech-to-Text**: Natural language weather queries
- **Text-to-Speech**: Audio weather updates (coming soon)
- **Hands-free Operation**: Perfect for busy mornings

### 📊 Visualization & Charts
- **Interactive Forecast Charts**: Temperature and precipitation trends
- **Weather Maps**: Temperature, precipitation, wind, and cloud layers
- **Data Visualization**: Beautiful charts powered by Chart.js
- **Responsive Graphs**: Touch-friendly mobile charts

### 🌐 Modern Web App
- **Progressive Web App (PWA)**: Install on your device
- **Offline Support**: Cached data when connection is poor
- **Dark/Light Mode**: Automatic theme switching
- **Real-time Search**: Instant city suggestions as you type
- **Social Sharing**: Share weather via Web Share API
- **Geolocation**: Automatic location detection

### 📱 Mobile-First Design
- **Touch Optimized**: Smooth gestures and interactions
- **Responsive Layout**: Beautiful on all screen sizes
- **Fast Loading**: Optimized performance
- **Accessibility**: Screen reader friendly

## Setup Instructions

### 1. Get an OpenWeatherMap API Key

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to the API Keys section
4. Copy your API key

### 2. Configure the Application

1. Open `script.js` in your text editor
2. Find line 5: `this.API_KEY = 'YOUR_API_KEY_HERE';`
3. Replace `'YOUR_API_KEY_HERE'` with your actual API key:
   ```javascript
   this.API_KEY = 'your-actual-api-key-here';
   ```

### 3. Run the Application

1. Open `index.html` in your web browser
2. Allow location access when prompted (optional)
3. The app will automatically load weather for your location
4. You can also search for any city using the search box

## File Structure

```
weather-app/
├── index.html      # Main HTML structure
├── styles.css      # CSS styling and responsive design
├── script.js       # JavaScript functionality
└── README.md       # This file
```

## Browser Compatibility

- Modern browsers with JavaScript enabled
- Geolocation API support (optional)
- Fetch API support

## API Information

This app uses the OpenWeatherMap Current Weather Data API:
- **Endpoint**: `https://api.openweathermap.org/data/2.5/weather`
- **Rate Limit**: 60 calls/minute, 1,000 calls/day (free tier)
- **Data Includes**: Temperature, humidity, weather conditions, icons

## Error Handling

The app handles various error scenarios:
- Invalid city names
- Network connection issues
- Location access denied
- API errors
- Missing API key

## Future Enhancements

- 7-day weather forecast
- Hourly weather data
- Weather alerts
- Favorite cities
- Local storage for preferences
- Unit conversion (Celsius/Fahrenheit)

## Contributing

Feel free to fork this project and submit pull requests for improvements!