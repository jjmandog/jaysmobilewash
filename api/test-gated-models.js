// HuggingFace Gated Models Access Test
// This endpoint tests the user's access to various gated models

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const HF_API_KEY = process.env.HF_API_KEY;
    
    if (!HF_API_KEY) {
        return res.status(500).json({ 
            error: 'HF_API_KEY not configured',
            details: 'Environment variable is missing'
        });
    }

    // Test models - start with smaller ones to avoid long processing
    const testModels = [
        'meta-llama/Llama-3.2-1B-Instruct',
        'meta-llama/Llama-3.2-3B-Instruct',
        'meta-llama/Llama-3.1-8B-Instruct',
        'meta-llama/Llama-2-7b-chat-hf',
        'meta-llama/Llama-3.3-70B-Instruct',
        'meta-llama/Llama-Guard-3-1B'
    ];

    const testPrompt = "Hello, please respond with 'Access granted' if you can see this.";
    const results = [];

    for (const model of testModels) {
        try {
            console.log(`Testing model: ${model}`);
            
            const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${HF_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: testPrompt,
                    parameters: {
                        max_new_tokens: 50,
                        temperature: 0.1,
                        do_sample: true,
                        return_full_text: false
                    }
                })
            });

            const data = await response.json();
            
            results.push({
                model: model,
                status: response.status,
                success: response.ok,
                response: data,
                error: response.ok ? null : (data.error || 'Unknown error')
            });

            // Add a small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            results.push({
                model: model,
                status: 'ERROR',
                success: false,
                response: null,
                error: error.message
            });
        }
    }

    // Summary
    const summary = {
        total_models: testModels.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        access_denied: results.filter(r => r.status === 403).length,
        not_found: results.filter(r => r.status === 404).length,
        unauthorized: results.filter(r => r.status === 401).length,
        other_errors: results.filter(r => !r.success && ![401, 403, 404].includes(r.status)).length
    };

    return res.status(200).json({
        timestamp: new Date().toISOString(),
        api_key_present: !!HF_API_KEY,
        api_key_length: HF_API_KEY ? HF_API_KEY.length : 0,
        summary: summary,
        results: results,
        recommendations: generateRecommendations(results)
    });
}

function generateRecommendations(results) {
    const recommendations = [];
    
    const accessDenied = results.filter(r => r.status === 403);
    const unauthorized = results.filter(r => r.status === 401);
    const successful = results.filter(r => r.success);
    
    if (unauthorized.length > 0) {
        recommendations.push({
            issue: 'Unauthorized access',
            solution: 'Check if your HuggingFace API key is valid and has proper permissions'
        });
    }
    
    if (accessDenied.length > 0) {
        recommendations.push({
            issue: 'Access denied to gated models',
            solution: 'Request access to these models via HuggingFace website. Visit the model page and click "Request Access"',
            affected_models: accessDenied.map(r => r.model)
        });
    }
    
    if (successful.length > 0) {
        recommendations.push({
            issue: 'Some models are working',
            solution: 'Use these models as your primary options',
            working_models: successful.map(r => r.model)
        });
    }
    
    if (results.every(r => !r.success)) {
        recommendations.push({
            issue: 'No models accessible',
            solution: 'Check API key validity and request access to gated models. You may need to use alternative models or providers.'
        });
    }
    
    return recommendations;
}
