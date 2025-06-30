/**
 * Fixes the OpenRouter API integration
 * - Preserves your original UI completely
 * - Just fixes the API call functionality
 */
async function callOpenRouterAPI(history) {
    // Use your existing OpenRouter API configuration
    const OPENROUTER_API_KEY = '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';
    const OPENROUTER_API_URL = 'https://openrouter.ai/deepseek/deepseek-r1:free/api';
    
    console.log("Calling API with history length:", history.length);
    
    // Offline detection (keeps your original UI)
    if (!navigator.onLine) {
        console.warn("Device offline - using fallback");
        return getFallbackResponse(history[history.length - 1].content);
    }
    
    try {
        console.log("Making request to:", OPENROUTER_API_URL);
        
        // Fixed API request that uses proper headers
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': "Jay's Mobile Wash"
            },
            body: JSON.stringify({
                model: 'deepseek-r1',
                messages: history,
                max_tokens: 500,
                temperature: 0.7
            })
        });
        
        // Handle API errors without changing UI
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error (${response.status}):`, errorText);
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("API response received");
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error("Invalid API response format:", data);
            throw new Error("Invalid response format");
        }
        
        return data.choices[0].message.content;
    } catch (error) {
        console.error('API call failed:', error);
        return getFallbackResponse(history[history.length - 1].content);
    }
}
