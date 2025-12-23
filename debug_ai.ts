
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log("Testing API Key:", apiKey ? "Present" : "Missing");

async function testModel(modelName: string) {
  console.log(`\n--- Testing ${modelName} ---`);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello, are you working?" }] }]
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log("SUCCESS!");
      console.log("Response:", data.candidates?.[0]?.content?.parts?.[0]?.text?.slice(0, 50));
      return true;
    } else {
      console.log("FAILED. Status:", response.status);
      const errorText = await response.text();
      console.log("Error details:", errorText);
      return false;
    }
  } catch (error) {
    console.log("Network Error:", error);
    return false;
  }
}

async function run() {
  // Test the models currently in the config
  await testModel('gemini-2.5-flash');
  await testModel('gemini-flash-latest');
  await testModel('gemini-2.0-flash');
  
  // Test the stable fallback
  await testModel('gemini-1.5-flash');
}

run();
