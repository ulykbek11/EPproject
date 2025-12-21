
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();

    if (!image) {
      console.error("No image data provided");
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

    // Use gemini-1.5-flash for maximum stability and speed
    const model = "gemini-1.5-flash"; 
    const apiKey = GEMINI_API_KEY.trim();
    
    // STRICT PROMPT according to user requirements
    const prompt = `
    SYSTEM INSTRUCTION:
    You are a strict data extraction engine. You do NOT think, you do NOT calculate, you do NOT invent.
    Your ONLY job is to extract text exactly as it appears in the image.

    TASK:
    1. **ANALYZE GRID STRUCTURE**:
       - Locate the main table.
       - Identify the HEADER row.
       - Find the "Subject" column (usually the first/left-most text column).
       - Find the "Grade" column. 
       - **CRITICAL**: If there are multiple grade columns (Term 1, Term 2, Exam, Final), select the **RIGHT-MOST** column that is filled for most rows. This is the "Target Column".
       - **IGNORE CREDITS**: Do NOT extract credits or units. Only Subjects and Grades.

    2. **EXTRACT ROW-BY-ROW**:
       - Go down the table one row at a time.
       - **Column A (Subject)**: Read the text in the Subject column. 
         - **WARNING**: Do NOT leave the Subject Name empty. 
         - If the text is faint, make your best guess based on the glyphs.
         - If it is absolutely unreadable, use "Unknown Subject". 
         - Do NOT repeat the previous subject.
       - **Column B (Grade)**: Read the text in the Target Column (identified in step 1) for THIS specific row.
         - Ensure you stay on the SAME ROW.

    3. **EXTRACT GRADE STRICTLY**:
       - If the grade is a number (5, 4, 3, 95, etc.), extract it as a number.
       - If the grade is "ЗЧ", "зачет", "pass", "credit", return it as "PASS" (string).
       - If the grade is "НЗ", "незачет", "fail", return it as "FAIL" (string).
       - If the cell contains symbols like "-", "—", "x", or is empty, extract it as 0 (number) or "-" (string), but DO NOT guess a grade like 5. 
       - **CRITICAL**: If there is NO GRADE, return 0. Do NOT return 5.

    4. **VERIFICATION**:
       - Count the grades you found (5s, 4s, 3s).
       - Ensure your extraction list matches these counts.

    5. **ERROR HANDLING**:
       - If the image is unreadable, blurry, or not a transcript, return: { "error": "unreadable" }

    OUTPUT FORMAT (Strict JSON):
    {
      "subjects": [
        { "name": "History", "grade": 5 },
        { "name": "Physical Education", "grade": "PASS" }
      ]
    }

    RULES:
    - Output MUST be valid JSON.
    - Do NOT invent subjects.
    - Do NOT return empty subject names.
    - Do NOT calculate GPA.
    `;

    console.log("Sending request to Gemini API (" + model + ")...");

    // Remove the data:image/jpeg;base64, prefix if present
    const base64Image = image.replace(/^data:image\/\w+;base64,/, "");

    // Using v1beta API
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
                    mimeType: "image/jpeg", 
                    data: base64Image,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.0, // Strict determinism
            responseMimeType: "application/json"
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ 
            error: "Failed to analyze image with Gemini", 
            details: errorText,
            status: response.status 
        }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("Gemini response received");
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error("No text in Gemini response", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "No text extracted from image", raw: data }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean up the text to ensure it's valid JSON
    const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();

    let result;
    try {
      result = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse JSON:", jsonStr);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response", raw_text: text }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for "unreadable" error from AI
    if (result.error === "unreadable") {
        return new Response(
            JSON.stringify({ error: "Image is unreadable or not a transcript" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // Server-side GPA Calculation (Simple Average for now, as strict rules forbid AI doing it)
    // The user wants: "Server independently calculates GPA"
    // We assume 5-point scale for simplicity unless grades are > 5.
    
    const subjects = result.subjects || [];
    
    if (!Array.isArray(subjects)) {
         return new Response(
            JSON.stringify({ error: "Invalid response format from AI", raw: result }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    let totalPoints = 0;
    let count = 0;

    const processedSubjects = subjects.map((s: any) => {
        let grade = Number(s.grade);
        // Basic sanitization
        if (isNaN(grade)) grade = 0;
        
        if (grade > 0) {
            totalPoints += grade;
            count++;
        }
        return {
            name: s.name,
            grade: grade
        };
    });

    const gpa = count > 0 ? Number((totalPoints / count).toFixed(2)) : 0;

    return new Response(
      JSON.stringify({ 
          result: processedSubjects, // For frontend compatibility (was expecting 'result')
          subjects: processedSubjects,
          gpa: gpa 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Edge Function Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
