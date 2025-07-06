// Save this as test-localai-gated.js and run: node test-localai-gated.js

import fetch from 'node-fetch';

const LOCALAI_API_KEY = process.env.LOCALAI_API_KEY; // Set this in your shell: export LOCALAI_API_KEY=localai_xxx...

const testModels = [
    'gpt2', // public model
    'localai-llama/Llama-2-7b-chat' // gated model
];

const testPrompt = "Hello, please respond with 'Access granted' if you can see this.";

async function main() {
    if (!LOCALAI_API_KEY) {
        console.error('LOCALAI_API_KEY not set!');
        process.exit(1);
    }
    if (!LOCALAI_API_KEY.startsWith('localai_') || LOCALAI_API_KEY.length < 50) {
        console.error('Invalid LOCALAI_API_KEY format!');
        process.exit(1);
    }

    for (const model of testModels) {
        try {
            console.log(`\nTesting model: ${model}`);
            const response = await fetch(`https://api.localai.io/models/${model}`, { // Updated endpoint to LocalAI
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${LOCALAI_API_KEY}`,
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

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Success:', JSON.stringify(data));
            } else {
                const errorText = await response.text();
                console.log(`❌ Error ${response.status}:`, errorText);
            }
        } catch (err) {
            console.log('❌ Request failed:', err.message);
        }
        // Wait 1 second between requests to avoid rate limiting
        await new Promise(res => setTimeout(res, 1000));
    }
}

main();
