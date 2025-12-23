import { supabase } from "@/integrations/supabase/client";

export interface ProjectAnalysisResult {
  score: number;
  analysis: string;
}

export const analyzeProject = async (
  title: string, 
  description: string, 
  category: string,
  fileName?: string,
  fileContent?: string
): Promise<ProjectAnalysisResult> => {
  try {
    const prompt = `
      You are an experienced Admissions Officer at a top-tier Ivy League university (e.g., Harvard, MIT, Stanford).
      Your task is to evaluate the following student project to determine its potential impact on their university application.

      Project Details:
      Title: ${title}
      Category: ${category}
      Description: ${description || 'No description provided'}
      ${fileName ? `File Name: ${fileName}` : ''}
      ${fileContent ? `File Content Preview: ${fileContent.slice(0, 15000)}...` : ''}

      EVALUATION CRITERIA (Ivy League Standard):
      1. Innovation & Creativity: Is this original work or a standard template? Does it solve a real problem?
      2. Depth & Complexity: Does it demonstrate advanced skills (technical, artistic, leadership) for a high school student?
      3. Impact & Scale: Did it affect others? Was it published, launched, or awarded?
      4. Initiative: Did the student go above and beyond requirements?

      SCORING GUIDE (0-100):
      - 90-100 (World Class): Published research, international awards, profitable startup, or widespread social impact. Rare.
      - 75-89 (Excellent): National recognition, complex custom software, significant community leadership, or highly creative portfolio. Strong for Ivy League.
      - 60-74 (Good): Regional awards, solid functional app/website, school leadership roles. Good for top 50 universities.
      - 40-59 (Average): Standard school projects, basic clones, volunteering without leadership. Common.
      - 0-39 (Weak/Incomplete): Minimal effort, unclear description, or just a file upload without context.

      INSTRUCTIONS:
      - Be fair but realistic. Do not give 10/100 unless it's completely empty or nonsense. 
      - If the input is sparse (e.g., just a title/file without description), score it based on *potential* but note the lack of detail (e.g., 40-50 range).
      - If it's a "test" or "hello world", score it low (e.g., 20-30) but explain why.
      - Provide a constructive, professional analysis.

      Return strictly VALID JSON:
      {
        "score": number,
        "analysis": "Professional feedback (2-3 sentences) explaining the rating and 1 tip for improvement."
      }
    `;

    const response = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        messages: [{ role: 'user', content: prompt }]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.details || errorData.error || 'AI service error');
    }
    
    // Simple response parsing (assuming non-streaming for simplicity in this helper, 
    // but the API is streaming. I need to handle stream like in rating.ts)
    // Actually, I should reuse the stream handling logic.
    
    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) fullResponse += content;
          } catch (e) {
            // ignore
          }
        }
      }
    }

    const cleanJson = fullResponse.replace(/```json\s*|\s*```/g, '').trim();
    try {
      return JSON.parse(cleanJson);
    } catch (e) {
      console.error('Failed to parse AI response:', fullResponse);
      return { score: 50, analysis: "Could not generate detailed analysis." };
    }

  } catch (error) {
    console.error('Project analysis failed:', error);
    return { score: 0, analysis: "Analysis failed." };
  }
};
