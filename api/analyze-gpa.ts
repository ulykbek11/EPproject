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
    Analyze this image of a school transcript (Kundelik.kz or similar).
    Task: Extract subject names and their FINAL grades.
    
    INSTRUCTIONS:
    1. Search for specific subject names like "Mathematics" (Algebra, Geometry), "Physics", "Chemistry", "History", "Literature", "English", "Russian", "Kazakh", "Biology", "Geography", "Informatics", "PE".
    2. For each subject, find the FINAL GRADE column (often labeled "Itog", "Total", "Year", "Exam", or the last column).
    3. If there is NO final grade column, but a row of daily grades (e.g. "5 4 5"), CALCULATE THE AVERAGE.
    4. RETURN ONLY JSON. No markdown. No explanations.
    
    Output Format:
    [
      { "subject": "Algebra", "grade": 5 },
      { "subject": "Physics", "grade": 4 }
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
                  mime_type: 'image/jpeg',
                  data: image.split(',')[1]
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
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
