const https = require('https');
const fs = require('fs');

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
    fs.writeFileSync('models_full.json', body);
    console.log("Written models_full.json");
  });
});

req.end();