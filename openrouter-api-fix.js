/**
 * Secure OpenRouter API integration
 * - Uses secure serverless endpoint to protect API key
 * - Preserves your original UI completely
 */

// Helper function to log with centralized error handler if available
function logAPIInfo(message, additionalData = {}) {
    if (typeof window !== 'undefined' && window.errorHandler && window.errorHandler.logInfo) {
        window.errorHandler.logInfo('API', message, null, additionalData);
    } else {
        console.log(`[JAYS_CHAT_ERROR] [API] ${message}`);
    }
}

function logAPIWarning(message, error = null, additionalData = {}) {
    if (typeof window !== 'undefined' && window.errorHandler && window.errorHandler.logWarning) {
        window.errorHandler.logWarning('API', message, error, additionalData);
    } else {
        console.warn(`[JAYS_CHAT_ERROR] [API] ${message}`, error);
    }
}

function logAPIError(message, error = null, additionalData = {}) {
    if (typeof window !== 'undefined' && window.errorHandler && window.errorHandler.logError) {
        window.errorHandler.logError('API', message, error, additionalData);
    } else {
        console.error(`[JAYS_CHAT_ERROR] [API] ${message}`, error);
    }
}

async function callOpenRouterAPI(history) {
    logAPIInfo("Calling secure API with history length: " + history.length);
    
    // Offline detection (keeps your original UI)
    if (!navigator.onLine) {
        logAPIWarning("Device offline - using fallback");
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
            logAPIError(`API Error (${response.status})`, new Error(errorText), { status: response.status });
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        logAPIInfo("API response received");
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            logAPIError("Invalid API response format", new Error("Invalid response format"), { data });
            throw new Error("Invalid response format");
        }
        
        return data.choices[0].message.content;
    } catch (error) {
        logAPIError('API call failed', error, { historyLength: history.length });
        return getFallbackResponse(history[history.length - 1].content);
    }
}
