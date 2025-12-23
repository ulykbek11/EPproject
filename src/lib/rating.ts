import { supabase } from "@/integrations/supabase/client";
import { buildProfileContext } from "@/lib/aiContext";
import { toast } from "sonner";

export interface RatingResult {
  score: number;
  analysis: string;
}

export const calculateStudentRating = async (userId: string): Promise<RatingResult | null> => {
  try {
    const profileContext = await buildProfileContext(userId);
    
    // Construct the prompt to get a JSON response
    const prompt = `
      Based on the following student profile, evaluate their competitiveness for top international universities (like Ivy League, Oxbridge, etc.) on a scale of 0 to 100.
      
      0-40: Low chance / Needs significant improvement
      41-60: Average / Good for local or less competitive universities
      61-80: Strong / Good candidate for top 50-100 universities
      81-90: Excellent / Strong candidate for top 20-50 universities
      91-100: Outstanding / Competitive for top 10 universities
      
      Consider:
      - GPA (if available)
      - Exam scores (SAT, IELTS, etc.)
      - Projects and achievements
      
      You MUST return the result in strictly VALID JSON format without any markdown formatting.
      Format:
      {
        "score": number,
        "analysis": "A short summary (max 3 sentences) explaining the rating."
      }
      
      Profile Data:
      ${profileContext.summary}
    `;

    const response = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        messages: [{ role: 'user', content: prompt }],
        profileContext: null // Context is already in the prompt
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to contact AI service');
    }

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
            // ignore parsing errors for partial chunks
          }
        }
      }
    }
    
    // Clean up markdown code blocks if present
    const cleanJson = fullResponse.replace(/```json\s*|\s*```/g, '').trim();
    const result = JSON.parse(cleanJson);
    
    // Update profile
    const { error } = await supabase
      .from('profiles')
      .update({ 
        student_rating: result.score,
        student_rating_analysis: result.analysis
      })
      .eq('id', userId);

    if (error) throw error;

    return result;

  } catch (error) {
    console.error('Error calculating rating:', error);
    toast.error('Не удалось рассчитать рейтинг. Попробуйте позже.');
    return null;
  }
};
