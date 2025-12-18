export const config = {
  runtime: 'edge',
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { image } = await req.json();

    if (!image) {
      return new Response(JSON.stringify({ error: 'No image data provided' }), { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
    }

    const apiKey = GEMINI_API_KEY.trim();
    // Use Gemini 2.0 Flash for fast image processing
    const model = 'gemini-2.0-flash'; 

    const prompt = `
    Analyze this image of an academic transcript or report card.
    Extract all subjects and their corresponding grades.
    
    Rules:
    1. Identify the subject name (e.g., Mathematics, Physics, History).
    2. Identify the numerical grade (e.g., 5, 4, 3, 100, 95). If the grade is a letter (A, B, C), convert it to a number if possible or keep it as is. 
       Preferably convert to a 5-point scale if it looks like a Russian/CIS system (5=Excellent, 4=Good, 3=Satisfactory).
       If it's a 100-point scale, keep it as is.
    3. Ignore non-academic entries like "Behavior" or "Attendance" if possible, but if unsure, include them.
    4. Return ONLY a valid JSON array. Do not include markdown formatting (like \`\`\`json).
    
    Format:
    [
      { "subject": "Subject Name", "grade": 5 },
      { "subject": "Another Subject", "grade": 4 }
    ]
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: 'image/jpeg', // Assuming JPEG, but API often handles PNG too if specified correctly or generic base64
                  data: image.split(',')[1] // Remove data:image/jpeg;base64, prefix
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1, // Low temperature for precise extraction
            maxOutputTokens: 4096,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return new Response(JSON.stringify({ error: 'Failed to analyze image', details: errorText }), { status: response.status });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return new Response(JSON.stringify({ error: 'No text extracted from image' }), { status: 500 });
    }

    // Clean up the text to ensure it's valid JSON
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return new Response(JSON.stringify({ result: JSON.parse(cleanText) }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Analyze GPA error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: String(error) }), { status: 500 });
  }
}
