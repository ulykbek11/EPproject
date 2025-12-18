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
    OCR TASK: Extract data from this school transcript.
    
    1. Identify subject names (e.g. Algebra, Physics, English).
    2. For each subject, extract ALL numerical grades visible in its row.
    3. Do NOT calculate anything. Do NOT find the average. Just list the numbers.
    
    Return JSON:
    [
      { "subject": "Algebra", "raw_numbers": [5, 4, 5, 5] },
      { "subject": "Physics", "raw_numbers": [4, 4, 3] }
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
            maxOutputTokens: 2000,
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
    
    let result = [];
    try {
        const rawResult = JSON.parse(cleanText);
        
        // Post-processing: Calculate grades from raw numbers
        result = rawResult.map((item: any) => {
            let grade = 0;
            if (item.raw_numbers && Array.isArray(item.raw_numbers) && item.raw_numbers.length > 0) {
                // Heuristic: If there is a clear "final" grade (often separated or last), we might want it.
                // But averaging is safer for "current standing" if no final exists.
                // Let's take the AVERAGE of all numbers as the grade.
                const validNumbers = item.raw_numbers.map((n: any) => Number(n)).filter((n: number) => !isNaN(n));
                if (validNumbers.length > 0) {
                    const sum = validNumbers.reduce((a: number, b: number) => a + b, 0);
                    grade = Number((sum / validNumbers.length).toFixed(2));
                }
            }
            return {
                subject: item.subject,
                grade: grade
            };
        });
    } catch (e) {
        console.error('JSON Parse error:', e);
        return new Response(JSON.stringify({ error: 'Failed to parse AI response', details: cleanText }), { status: 500 });
    }

    return new Response(JSON.stringify({ result }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Analyze GPA error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: String(error) }), { status: 500 });
  }
}
