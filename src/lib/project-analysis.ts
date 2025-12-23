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
      You are an extremely strict and experienced Admissions Officer at a top-tier Ivy League university (e.g., Harvard, MIT, Stanford).
      Your task is to evaluate the following student project with brutal honesty to determine its true potential impact on their university application.
      
      CONTEXT:
      Top universities receive thousands of applications with perfect grades. Projects are the main differentiator. 
      However, most student projects are "standard" (e.g., a To-Do list app, a basic weather site, or a simple volunteer club). 
      True "Ivy League quality" projects are rare and usually involve significant innovation, real-world impact, or advanced research.

      Project Details:
      Title: ${title}
      Category: ${category}
      Description: ${description || 'No description provided'}
      ${fileName ? `File Name: ${fileName}` : ''}
      ${fileContent ? `File Content Preview: ${fileContent.slice(0, 100000)}...` : ''}

      REFERENCE BENCHMARKS (95-100/100) - USE THESE FOR COMPARISON:
      1. "AI-Driven Pancreatic Cancer Detection": Developed a novel neural network with 99% accuracy, published in a peer-reviewed journal, winner of Intel ISEF.
      2. "AquaPure: Low-Cost Water Filtration": Invented a filtration system using locally sourced materials, deployed in 5 villages in Kenya, serving 2000+ people.
      3. "QuantumLight": Discovered a new property of photon entanglement, research paper cited by 50+ academics, presented at an international physics conference.
      
      EVALUATION CRITERIA (Ivy League Standard):
      1. Innovation & Creativity: Is this original work or a standard template/tutorial clone? (Clones = low score).
      2. Depth & Complexity: Does it demonstrate advanced skills (technical, artistic, leadership) well beyond high school level?
      3. Impact & Scale: Did it affect others? Was it published, launched to real users, or awarded?
      4. Initiative: Did the student go above and beyond requirements?

      STRICT SCORING GUIDE (0-100):
      - 95-100 (World Class): Comparable to the Benchmarks above. Global impact, major scientific breakthrough, or profitable startup. Extremely rare.
      - 85-94 (Ivy League Strong): National recognition (top 3 in national olympiad/hackathon), highly complex custom software with users, or significant community leadership (100+ members).
      - 70-84 (Competitive): Regional awards, solid functional app/website with some unique features, school leadership roles. Good for Top 50 universities.
      - 50-69 (Average/Good): Standard school projects, basic clones (e.g., simple calculator, weather app), volunteering without leadership. Common.
      - 0-49 (Weak): Minimal effort, unclear description, incomplete, or trivial "Hello World" type projects.

      INSTRUCTIONS:
      - BE SOBER AND CRITICAL. Do not inflate scores. A "good" project is not enough for Harvard.
      - If the project is a simple tutorial or basic app, score it in the 40-60 range.
      - Only give >90 if it truly rivals the Benchmark Projects.
      - Provide a constructive but realistic analysis. Point out exactly why it falls short of the "World Class" level if it does.

      Return strictly VALID JSON:
      {
        "score": number,
        "analysis": "Professional feedback (2-3 sentences) explaining the rating and 1 specific tip to move to the next level."
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
