
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

async function testModel(modelName: string) {
  console.log(`\n--- Testing ${modelName} ---`);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello" }] }]
      })
    });

    if (response.ok) {
      console.log("SUCCESS!");
      return true;
    } else {
      console.log("FAILED. Status:", response.status);
      const txt = await response.text();
      console.log(txt.slice(0, 200));
      return false;
    }
  } catch (error) {
    console.log("Network Error:", error);
    return false;
  }
}

async function run() {
  await testModel('gemini-2.0-flash-lite');
  await testModel('gemini-flash-lite-latest');
  await testModel('gemini-2.0-flash-001'); // Specific version might have separate quota?
}

run();
