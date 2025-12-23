import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const version = "v1";

const modelsToTest = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-flash-latest"
];

async function run() {
  console.log(`Testing models with key: ${apiKey?.substring(0, 10)}...`);
  
  for (const model of modelsToTest) {
    console.log(`\n--- Testing ${model} ---`);
    const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`;
    
    const body = {
      contents: [{
        role: 'user',
        parts: [{ text: 'Hi' }]
      }]
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        console.error(`Error ${response.status}: ${response.statusText}`);
        if (response.status === 404) console.error("Model not found.");
        else if (response.status === 429) console.error("Quota exceeded.");
        else {
            const text = await response.text();
            console.error(text.substring(0, 200));
        }
      } else {
        const data = await response.json();
        console.log("SUCCESS!");
        console.log(JSON.stringify(data.candidates?.[0]?.content?.parts?.[0]?.text, null, 2));
        break; // Stop at first working model
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
    // Small delay
    await new Promise(r => setTimeout(r, 1000));
  }
  
  // If loop finishes, try listing models
  console.log("\n--- Diagnostic: Listing Available Models ---");
  try {
      const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (listResp.ok) {
          const data = await listResp.json();
          const names = (data.models || []).map((m: any) => m.name.replace('models/', ''));
          console.log("Your key has access to:", names);
      } else {
          console.log("Could not list models. Status:", listResp.status);
      }
  } catch (e) {
      console.log("Error listing models:", e);
  }
}

run();
