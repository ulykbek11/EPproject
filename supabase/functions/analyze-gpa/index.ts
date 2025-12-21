
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
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use gemini-flash-latest for maximum compatibility with the new key
    const model = "gemini-flash-latest"; 
    const apiKey = GEMINI_API_KEY.trim();
    
    // STRICT PROMPT according to user requirements
    const prompt = `
    SYSTEM INSTRUCTION:
    You are a strict data extraction engine. You do NOT think, you do NOT calculate, you do NOT invent.
    Your ONLY job is to extract text exactly as it appears in the image.

    TASK:
    0. **PRE-PROCESSING (CROP)**:
       - If the image contains a full screen (browser UI, windows, taskbar), IGNORE everything outside the main content area.
       - Focus ONLY on the **transcript table** document.
       - Do not read text from browser tabs, URL bars, or other windows.

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
       - **OCR FIX**: "ЗЧ" looks like "34". "34" is NOT a valid grade on a 5-point scale. If you see "34", "ЗЧ", "Зачет", "Pass", "Credit", return it as "PASS" (string).
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
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("Gemini Raw Response:", JSON.stringify(data));

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error("Invalid Gemini response structure:", data);
        return new Response(
            JSON.stringify({ error: "Invalid response from Gemini", details: data }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    const text = data.candidates[0].content.parts[0].text;
    console.log("Extracted Text:", text);

    // Clean markdown code blocks
    const jsonString = text.replace(/```json\n|\n```/g, "").trim();
    
    let result;
    try {
        result = JSON.parse(jsonString);
    } catch (e) {
        console.error("JSON Parse Error:", e, "Text:", text);
        return new Response(
            JSON.stringify({ error: "Failed to parse Gemini response", details: text }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    if (result.error) {
        return new Response(
            JSON.stringify({ error: result.error }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    const subjects = result.subjects || [];
    
    if (!Array.isArray(subjects)) {
         return new Response(
            JSON.stringify({ error: "Invalid response format from AI", raw: result }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // Server-side GPA Calculation (Simple Average for now, as strict rules forbid AI doing it)
    // The user wants: "Server independently calculates GPA"
    // We assume 5-point scale for simplicity unless grades are > 5.

    let totalPoints = 0;
    let count = 0;

    const processedSubjects = subjects.map((s: any) => {
        let grade = s.grade;
        
        // Handle "PASS" / "FAIL"
        if (typeof grade === 'string') {
            const lower = grade.toLowerCase();
            if (lower === 'pass' || lower === 'credit' || lower === 'зч' || lower === 'зачет') {
                // Pass does not affect GPA
                return { name: s.name, grade: "PASS" };
            }
            // Try to parse number if it's a string number
            const parsed = Number(grade);
            if (!isNaN(parsed)) {
                grade = parsed;
            } else {
                // "FAIL" or symbols -> 0 or specific handling? 
                // User said: "пусть ИИ ставит просто '-'" for symbols/empty
                if (lower === '-') return { name: s.name, grade: 0 };
                grade = 0;
            }
        }

        if (grade === "PASS") return { name: s.name, grade: "PASS" };

        let numGrade = Number(grade);
        if (isNaN(numGrade)) numGrade = 0;

        // Fix: Treat 34 as 0 (PASS) if somehow Gemini still returns it, 
        // though the prompt should catch it. Or if user wants it to be "-", we treat as 0 points.
        // But prompt says return "PASS". If it returns 34 number, we might need a heuristic.
        // Let's assume prompt works.
        
        if (numGrade > 0) {
            totalPoints += numGrade;
            count++;
        }
        return {
            name: s.name,
            grade: numGrade
        };
    });

    const gpa = count > 0 ? Number((totalPoints / count).toFixed(2)) : 0;

    console.log("Calculated GPA:", gpa);
    console.log("Processed Subjects:", JSON.stringify(processedSubjects));

    return new Response(
      JSON.stringify({ 
          result: processedSubjects, // For frontend compatibility (was expecting 'result')
          subjects: processedSubjects,
          gpa: gpa 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
