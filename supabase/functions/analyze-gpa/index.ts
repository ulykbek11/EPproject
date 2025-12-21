import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();

    console.log("Received request with image data length:", image ? image.length : "null");

    if (!image) {
      return new Response(
        JSON.stringify({ error: "No image data provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: "Server configuration error: GEMINI_API_KEY not found" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const model = "gemini-2.0-flash"; // Or gemini-1.5-pro if needed
    const apiKey = GEMINI_API_KEY.trim();
    
    const prompt = `
    VISION TASK: Analyze this school transcript image.
    
    1. Identify subject names (e.g. Algebra, Physics, English).
    2. For each subject, extract ALL numerical grades visible in its row.
    3. Do NOT calculate anything. Do NOT find the average. Just list the numbers.
    
    Return JSON:
    [
      { "subject": "Algebra", "raw_numbers": [5, 4, 5, 5] },
      { "subject": "Physics", "raw_numbers": [4, 4, 3] }
    ]
    `;

    console.log("Sending request to Gemini API...");

    // Remove the data:image/jpeg;base64, prefix if present, because Gemini API expects raw base64 or specific format
    // But for inlineData, we just need the base64 part.
    const base64Image = image.replace(/^data:image\/\w+;base64,/, "");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: "image/jpeg", // Assuming JPEG from frontend
                    data: base64Image,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json" // Force JSON output mode
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to analyze image with Gemini", details: errorText }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("Gemini response received");
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return new Response(
        JSON.stringify({ error: "No text extracted from image" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean up the text to ensure it's valid JSON (though responseMimeType should handle it)
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    let result = [];
    try {
      const rawResult = JSON.parse(cleanText);

      // Post-processing: Calculate grades from raw numbers
      result = rawResult.map((item: any) => {
        let grade = 0;
        if (item.raw_numbers && Array.isArray(item.raw_numbers) && item.raw_numbers.length > 0) {
          const validNumbers = item.raw_numbers.map((n: any) => Number(n)).filter((n: number) => !isNaN(n));
          if (validNumbers.length > 0) {
            const sum = validNumbers.reduce((a: number, b: number) => a + b, 0);
            grade = Number((sum / validNumbers.length).toFixed(2));
          }
        }
        return {
          subject: item.subject,
          grade: grade,
        };
      });
    } catch (e) {
      console.error("JSON Parse error:", e);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response", details: cleanText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Analyze GPA error:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
