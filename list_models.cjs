const https = require('https');

const KEY = "AIzaSyBqUqEGARUpAdWIBmwu2conAlVwuvrTMOc";

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models?key=${KEY}`,
  method: 'GET',
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    try {
        const data = JSON.parse(body);
        if (data.models) {
            console.log("Available Gemini Models:");
            data.models.forEach(m => {
                if (m.name.includes('gemini') && m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("No models found or error:", body);
        }
    } catch (e) {
        console.error("Error parsing JSON:", e);
        console.log("Raw body:", body);
    }
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
