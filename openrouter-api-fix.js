/**
 * Secure OpenRouter API integration
 * - Uses secure serverless endpoint to protect API key
 * - Preserves your original UI completely
 */
async function callOpenRouterAPI(history) {
    console.log("Calling secure API with history length:", history.length);
    
    // Offline detection (keeps your original UI)
    if (!navigator.onLine) {
        console.warn("Device offline - using fallback");
        return getFallbackResponse(history[history.length - 1].content);
    }
    
    try {
        // Use secure API endpoint instead of direct OpenRouter call
        const response = await fetch('/api/ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
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
