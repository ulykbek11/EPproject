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
      You are an extremely strict and realistic Admissions Officer at a top-tier university (Harvard, MIT, Oxford).
      Your task is to evaluate this student's profile with brutal honesty to determine their true competitiveness.
      
      CONTEXT:
      Grade inflation is widespread. Perfect grades are not enough. 
      We are looking for "spikes" - exceptional achievements in specific areas (International awards, published research, founded startups).
      
      SCORING STANDARDS (0-100):
      95-100: Exceptional. International Olympiad Medalist (IMO, IPhO), published research in top journals, or founder of a globally active NGO.
      85-94: Very Strong. National awards, top 1% of country, significant leadership (Student Body President of a large school), complex technical projects.
      70-84: Strong. Regional awards, top 10% of class, good extracurriculars but nothing unique.
      50-69: Average. Good grades, standard club memberships, no major awards.
      0-49: Below average for top universities.
      
      Consider:
      - GPA (if available) - Low GPA is a major red flag.
      - Exam scores (SAT, IELTS, etc.)
      - Projects and achievements (Are they truly impressive or just standard?)
      
      You MUST return the result in strictly VALID JSON format without any markdown formatting.
      Format:
      {
        "score": number,
        "analysis": "A short, critical summary (max 3 sentences) explaining the rating and what is missing for a top tier university."
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
