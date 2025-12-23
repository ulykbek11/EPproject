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
      Evaluate the following student project for university admission competitiveness (Ivy League level).
      
      Project Details:
      Title: ${title}
      Category: ${category}
      Description: ${description || 'No description provided'}
      ${fileName ? `File Name: ${fileName}` : ''}
      ${fileContent ? `File Content Preview: ${fileContent.slice(0, 1000)}...` : ''}

      Rate it on a scale of 0-100 based on:
      - Innovation and creativity
      - Technical/Academic complexity
      - Impact and scale
      - Relevance to chosen category

      0-40: Basic school project
      41-60: Good local level project
      61-80: Strong regional/national level
      81-100: Exceptional international level

      Return strictly VALID JSON:
      {
        "score": number,
        "analysis": "Short feedback (max 3 sentences)."
      }
    `;

    const response = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        messages: [{ role: 'user', content: prompt }]
      }),
    });

    if (!response.ok) throw new Error('AI service error');
    
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
