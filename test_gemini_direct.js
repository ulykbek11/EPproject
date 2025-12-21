import fs from 'fs';
import path from 'path';

// Simple .env parser
const envPath = path.resolve('.', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^"|"$/g, '');
        envVars[key] = value;
    }
});

const apiKey = envVars.GEMINI_API_KEY;
const model = "gemini-1.5-flash";

const model = "gemini-2.0-flash-lite";

async function testGemini() {
    console.log(`Testing Gemini API with model: ${model}`);
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    const payload = {
        contents: [{
            parts: [{
                text: "Extract this text: Hello World"
            }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const text = await response.text();
            console.error(`Error ${response.status}: ${text}`);
        } else {
            const data = await response.json();
            console.log("Success!");
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Fetch error:", e);
    }
}

testGemini();