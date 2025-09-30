/**
 * AI Integration for Weather Assistant
 * Handles OpenAI API calls for weather insights and chat
 */

class WeatherAI {
    constructor() {
        this.apiKey = CONFIG.OPENAI_API_KEY;
        this.baseURL = 'https://api.openai.com/v1';
        this.model = 'gpt-3.5-turbo';
        this.requestCount = 0;
        this.lastRequestTime = 0;
    }
    
    /**
     * Check if AI is available
     */
    isAvailable() {
        return this.apiKey && !this.apiKey.startsWith('YOUR_') && CONFIG.FEATURES.AI_CHAT;
    }
    
    /**
     * Generate clothing advice based on weather
     */
    async getClothingAdvice(weatherData) {
        if (!this.isAvailable()) {
            return this.getFallbackClothingAdvice(weatherData);
        }
        
        const prompt = this.buildClothingPrompt(weatherData);
        
        try {
            const response = await this.makeAIRequest([
                { role: 'system', content: 'You are a weather-aware fashion assistant. Provide practical clothing advice based on weather conditions.' },
                { role: 'user', content: prompt }
            ]);
            
            return {
                advice: response.content,
                confidence: 'high',
                source: 'ai'
            };
        } catch (error) {
            console.warn('AI clothing advice failed, using fallback:', error);
            return this.getFallbackClothingAdvice(weatherData);
        }
    }
    
    /**
     * Generate travel tips based on weather
     */
    async getTravelAdvice(weatherData) {
        if (!this.isAvailable()) {
            return this.getFallbackTravelAdvice(weatherData);
        }
        
        const prompt = this.buildTravelPrompt(weatherData);
        
        try {
            const response = await this.makeAIRequest([
                { role: 'system', content: 'You are a travel advisor specializing in weather-related travel tips.' },
                { role: 'user', content: prompt }
            ]);
            
            return {
                advice: response.content,
                confidence: 'high',
                source: 'ai'
            };
        } catch (error) {
            console.warn('AI travel advice failed, using fallback:', error);
            return this.getFallbackTravelAdvice(weatherData);
        }
    }
    
    /**
     * Generate health advisory based on weather
     */
    async getHealthAdvice(weatherData) {
        if (!this.isAvailable()) {
            return this.getFallbackHealthAdvice(weatherData);
        }
        
        const prompt = this.buildHealthPrompt(weatherData);
        
        try {
            const response = await this.makeAIRequest([
                { role: 'system', content: 'You are a health advisor providing weather-related health tips. Focus on practical advice.' },
                { role: 'user', content: prompt }
            ]);
            
            return {
                advice: response.content,
                confidence: 'high',
                source: 'ai'
            };
        } catch (error) {
            console.warn('AI health advice failed, using fallback:', error);
            return this.getFallbackHealthAdvice(weatherData);
        }
    }
    
    /**
     * Generate activity suggestions based on weather
     */
    async getActivitySuggestions(weatherData) {
        if (!this.isAvailable()) {
            return this.getFallbackActivitySuggestions(weatherData);
        }
        
        const prompt = this.buildActivityPrompt(weatherData);
        
        try {
            const response = await this.makeAIRequest([
                { role: 'system', content: 'You are an activity planner who suggests weather-appropriate activities.' },
                { role: 'user', content: prompt }
            ]);
            
            return {
                advice: response.content,
                confidence: 'high',
                source: 'ai'
            };
        } catch (error) {
            console.warn('AI activity suggestions failed, using fallback:', error);
            return this.getFallbackActivitySuggestions(weatherData);
        }
    }
    
    /**
     * Handle chat messages
     */
    async handleChatMessage(message, weatherData) {
        if (!this.isAvailable()) {
            return {
                response: "I'm sorry, but AI chat is not available right now. Please make sure your API key is configured.",
                source: 'fallback'
            };
        }
        
        const prompt = this.buildChatPrompt(message, weatherData);
        
        try {
            const response = await this.makeAIRequest([
                { role: 'system', content: 'You are a helpful weather AI assistant. Answer questions about weather and provide practical advice.' },
                { role: 'user', content: prompt }
            ]);
            
            return {
                response: response.content,
                source: 'ai'
            };
        } catch (error) {
            console.error('AI chat failed:', error);
            return {
                response: "I'm having trouble processing your request right now. Please try again later.",
                source: 'error'
            };
        }
    }
    
    /**
     * Make API request to OpenAI
     */
    async makeAIRequest(messages) {
        // Rate limiting check
        if (!this.checkRateLimit()) {
            throw new Error('Rate limit exceeded for AI requests');
        }
        
        const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: this.model,
                messages: messages,
                max_tokens: 300,
                temperature: 0.7,
                stream: false
            })
        });
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`OpenAI API error: ${response.status} - ${error}`);
        }
        
        const data = await response.json();
        return data.choices[0].message;
    }
    
    /**
     * Build prompts for different advice types
     */
    buildClothingPrompt(weatherData) {
        const { current, location } = weatherData;
        return `Current weather in ${location.name}: ${current.temperature}°C, ${current.description}, humidity ${current.humidity}%, wind ${current.wind.speed} km/h. What should someone wear today? Provide practical, specific clothing recommendations in 2-3 sentences.`;
    }
    
    buildTravelPrompt(weatherData) {
        const { current, location } = weatherData;
        return `Weather conditions in ${location.name}: ${current.temperature}°C, ${current.description}, visibility ${current.visibility}km, wind ${current.wind.speed} km/h. What travel tips should someone consider for these conditions? Focus on practical advice in 2-3 sentences.`;
    }
    
    buildHealthPrompt(weatherData) {
        const { current, location } = weatherData;
        return `Current conditions in ${location.name}: ${current.temperature}°C, ${current.description}, humidity ${current.humidity}%, UV and air quality considerations. What health-related advice should people consider? Provide practical tips in 2-3 sentences.`;
    }
    
    buildActivityPrompt(weatherData) {
        const { current, location } = weatherData;
        return `Weather in ${location.name}: ${current.temperature}°C, ${current.description}, wind ${current.wind.speed} km/h. What activities would be enjoyable and suitable for these conditions? Suggest 2-3 specific activities with brief explanations.`;
    }
    
    buildChatPrompt(message, weatherData) {
        const { current, location } = weatherData;
        return `User question: "${message}". Current weather context: ${location.name}, ${current.temperature}°C, ${current.description}. Provide a helpful, accurate response.`;
    }
    
    /**
     * Fallback advice when AI is not available
     */
    getFallbackClothingAdvice(weatherData) {
        const temp = weatherData.current.temperature;
        const condition = weatherData.current.condition.toLowerCase();
        
        let advice = '';
        
        if (temp < 0) {
            advice = 'Bundle up! Wear multiple layers, a heavy coat, warm hat, gloves, and insulated boots.';
        } else if (temp < 10) {
            advice = 'Dress warmly with a jacket, long pants, and closed-toe shoes. Consider a light scarf or hat.';
        } else if (temp < 20) {
            advice = 'Layer up! A light jacket or sweater over a t-shirt should be perfect.';
        } else if (temp < 25) {
            advice = 'Comfortable weather! Light pants and a t-shirt or light long sleeves.';
        } else if (temp < 30) {
            advice = 'Warm day! Shorts, t-shirt, and comfortable shoes. Stay hydrated!';
        } else {
            advice = 'Very hot! Lightweight, breathable clothing, sun hat, and plenty of sunscreen.';
        }
        
        if (condition.includes('rain')) {
            advice += ' Bring an umbrella or rain jacket.';
        }
        
        return {
            advice,
            confidence: 'medium',
            source: 'rules'
        };
    }
    
    getFallbackTravelAdvice(weatherData) {
        const condition = weatherData.current.condition.toLowerCase();
        const visibility = weatherData.current.visibility;
        const wind = weatherData.current.wind.speed;
        
        let advice = 'Current conditions are ';
        
        if (condition.includes('clear') && wind < 20) {
            advice += 'excellent for travel. Great visibility and calm conditions.';
        } else if (condition.includes('rain')) {
            advice += 'wet. Drive carefully, use headlights, and allow extra time.';
        } else if (condition.includes('snow')) {
            advice += 'snowy. Consider winter tires, carry emergency supplies, and drive slowly.';
        } else if (wind > 30) {
            advice += 'windy. Be cautious with high-profile vehicles and outdoor activities.';
        } else if (visibility < 5) {
            advice += 'showing reduced visibility. Drive with caution and use fog lights.';
        } else {
            advice += 'generally good for travel with normal precautions.';
        }
        
        return {
            advice,
            confidence: 'medium',
            source: 'rules'
        };
    }
    
    getFallbackHealthAdvice(weatherData) {
        const temp = weatherData.current.temperature;
        const humidity = weatherData.current.humidity;
        const condition = weatherData.current.condition.toLowerCase();
        
        let advice = '';
        
        if (temp > 30) {
            advice = 'High temperatures! Stay hydrated, seek shade, and avoid prolonged sun exposure.';
        } else if (temp < 0) {
            advice = 'Cold weather! Protect exposed skin, stay dry, and warm up gradually when coming indoors.';
        } else if (humidity > 80) {
            advice = 'High humidity! Take it easy during physical activities and stay hydrated.';
        } else {
            advice = 'Pleasant conditions! Perfect weather for outdoor activities and exercise.';
        }
        
        if (condition.includes('allergens') || humidity > 70) {
            advice += ' Allergy sufferers may want to limit outdoor time.';
        }
        
        return {
            advice,
            confidence: 'medium',
            source: 'rules'
        };
    }
    
    getFallbackActivitySuggestions(weatherData) {
        const temp = weatherData.current.temperature;
        const condition = weatherData.current.condition.toLowerCase();
        
        let advice = '';
        
        if (condition.includes('clear') && temp > 15 && temp < 25) {
            advice = 'Perfect weather for hiking, cycling, or picnicking. Great for outdoor sports and sightseeing.';
        } else if (condition.includes('rain')) {
            advice = 'Rainy day activities: visit museums, indoor shopping, cozy cafes, or enjoy a good book at home.';
        } else if (temp > 25) {
            advice = 'Hot weather fun: swimming, water sports, early morning walks, or indoor activities during peak heat.';
        } else if (temp < 10) {
            advice = 'Cool weather activities: indoor sports, museums, warm cafes, or brisk walks with proper clothing.';
        } else {
            advice = 'Mild conditions are great for walking, shopping, casual outdoor dining, or light exercise.';
        }
        
        return {
            advice,
            confidence: 'medium',
            source: 'rules'
        };
    }
    
    /**
     * Simple rate limiting
     */
    checkRateLimit() {
        const now = Date.now();
        const hourAgo = now - 3600000; // 1 hour ago
        
        if (this.lastRequestTime < hourAgo) {
            this.requestCount = 0;
        }
        
        if (this.requestCount >= CONFIG.RATE_LIMITS.AI_REQUESTS_PER_HOUR) {
            return false;
        }
        
        this.requestCount++;
        this.lastRequestTime = now;
        return true;
    }
}

// Create global instance
const AI = new WeatherAI();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeatherAI;
}

function getAIAdvice(type, weather) {
  // Return mock advice for demo
  return `Advice for ${type} in ${weather.condition}`;
}