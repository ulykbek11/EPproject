export const config = {
  maxDuration: 60, // 60 seconds (Pro) or 10 seconds (Hobby)
  api: {
    bodyParser: {
      sizeLimit: '4.5mb', // Vercel Serverless Function limit
    },
  },
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // In Vercel Node.js functions, req.body is already parsed if Content-Type is application/json
    const { image } = req.body || {};

    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const apiKey = OPENAI_API_KEY.trim();
    const model = 'gpt-4o'; 

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
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: {
                    "url": image, // image is already base64 data URI
                  },
                },
              ],
            },
          ],
          max_tokens: 2000,
          temperature: 0.1,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      return res.status(response.status).json({ error: 'Failed to analyze image', details: errorText });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      return res.status(500).json({ error: 'No text extracted from image' });
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
        return res.status(500).json({ error: 'Failed to parse AI response', details: cleanText });
    }

    return res.status(200).json({ result });

  } catch (error) {
    console.error('Analyze GPA error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: String(error) });
  }
}
