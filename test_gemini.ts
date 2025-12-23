import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("No API Key found in environment");
  process.exit(1);
}

console.log("Testing API Key:", apiKey.substring(0, 10) + "...");

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function run() {
  try {
    // List models
    // Note: The Node SDK might not expose listModels directly easily on the instance without looking at docs, 
    // but let's try a direct fetch to see what models are available.
    
    console.log("Listing models via fetch...");
    const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await listResp.json();
    const modelNames = (data.models || []).map((m: any) => m.name);
    console.log("Available models:", modelNames);

    const prompt = "Hello, are you working?";
    console.log("Sending prompt:", prompt);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Response:", text);
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
