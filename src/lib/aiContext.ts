
import { supabase } from '@/integrations/supabase/client';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Reuse worker setup from file-parser if possible, or re-declare
// Since we are in a different context, let's ensure worker is set if we use PDF
// Note: This function runs on the client side before sending context to the API

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export interface ProfileContextResult {
  exams: Array<{ exam_name: string; score: number | null; max_score: number | null; exam_date: string | null }>;
  projects: Array<{ title: string; category: string | null; description: string | null; link: string | null; start_date: string | null; end_date: string | null; ai_analysis?: string | null; ai_rating?: number | null; file_path?: string | null }>;
  gpa: Array<{ subject: string; grade: number; credits: number | null; semester: string | null }>;
  summary: string;
}

function formatExam(e: { exam_name: string; score: number | null; max_score: number | null; exam_date: string | null }) {
  const scorePart = typeof e.score === 'number' ? `${e.score}${e.max_score ? `/${e.max_score}` : ''}` : '—';
  const datePart = e.exam_date ? `, дата: ${e.exam_date}` : '';
  return `${e.exam_name}: ${scorePart}${datePart}`;
}

// Helper to download and extract text from storage
async function getFileContent(filePath: string): Promise<string> {
  try {
    const { data, error } = await supabase.storage.from('project_files').download(filePath);
    if (error || !data) return '';

    const fileType = filePath.split('.').pop()?.toLowerCase();
    
    if (fileType === 'pdf') {
       const arrayBuffer = await data.arrayBuffer();
       const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
       let fullText = '';
       // Limit to first 50 pages to cover most full documents while avoiding extreme edge cases
       const maxPages = Math.min(pdf.numPages, 50);
       for (let i = 1; i <= maxPages; i++) {
         const page = await pdf.getPage(i);
         const textContent = await page.getTextContent();
         const pageText = textContent.items.map((item: any) => item.str).join(' ');
         fullText += pageText + '\n';
       }
       return fullText.trim();
    } else if (fileType === 'docx') {
       const arrayBuffer = await data.arrayBuffer();
       const result = await mammoth.extractRawText({ arrayBuffer });
       return result.value.trim();
    } else if (['txt', 'md', 'json', 'csv'].includes(fileType || '')) {
       return await data.text();
    }
    
    return '';
  } catch (e) {
    console.error('Error fetching file content for context:', e);
    return '';
  }
}

async function formatProject(p: { title: string; category: string | null; description: string | null; link: string | null; start_date: string | null; end_date: string | null; ai_analysis?: string | null; ai_rating?: number | null; file_path?: string | null }) {
  const cat = p.category ? ` (${p.category})` : '';
  const desc = p.description ? `\n   Описание: ${p.description}` : '';
  const dates = p.start_date || p.end_date ? `, сроки: ${p.start_date ?? '—'} → ${p.end_date ?? '—'}` : '';
  const link = p.link ? `, ссылка: ${p.link}` : '';
  const aiInfo = p.ai_rating ? `\n   [AI Rating: ${p.ai_rating}/100${p.ai_analysis ? ` | Analysis: ${p.ai_analysis}` : ''}]` : '';
  
  let fileContentSnippet = '';
  if (p.file_path) {
    const content = await getFileContent(p.file_path);
    if (content) {
      // Use full content (truncated only at extreme length, e.g. 100k chars)
      const safeContent = content.length > 100000 ? content.slice(0, 100000) + '... (truncated)' : content;
      fileContentSnippet = `\n   [Полное содержимое файла проекта:\n"""\n${safeContent}\n"""]`;
    }
  }

  return `${p.title}${cat}${dates}${link}${desc}${fileContentSnippet}${aiInfo}`;
}

export async function buildProfileContext(userId: string): Promise<ProfileContextResult> {
  const examsResp = await supabase
    .from('exams')
    .select('exam_name, score, max_score, exam_date')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const projectsResp = await supabase
    .from('projects')
    .select('title, category, description, link, start_date, end_date, ai_analysis, ai_rating, file_path')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const gpaResp = await supabase
    .from('gpa_records')
    .select('subject, grade, credits, semester')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const exams = examsResp.data ?? [];
  const projects = projectsResp.data ?? [];
  const gpa = gpaResp.data ?? [];

  const examsText = exams.length
    ? `Экзамены: ${exams.map(formatExam).join('; ')}`
    : 'Экзамены: нет добавленных записей';

  // Process projects in parallel to fetch file contents
  const projectStrings = await Promise.all(projects.map(formatProject));
  
  const projectsText = projects.length
    ? `Проекты: ${projectStrings.join('; ')}`
    : 'Проекты: нет добавленных записей';

  // GPA summary
  let gpaText = 'GPA: нет добавленных записей';
  if (gpa.length) {
    const withCredits = gpa.filter(r => typeof r.credits === 'number' && r.credits! > 0);
    const simpleAvg = gpa.reduce((sum, r) => sum + (r.grade ?? 0), 0) / gpa.length;
    const weightedAvg = withCredits.length
      ? withCredits.reduce((sum, r) => sum + (r.grade * (r.credits ?? 0)), 0) /
        withCredits.reduce((sum, r) => sum + (r.credits ?? 0), 0)
      : null;

    const latestSubjects = gpa.slice(0, 4).map(r => `${r.subject}: ${r.grade}${r.credits ? ` (${r.credits} кр.)` : ''}`).join('; ');

    gpaText = `GPA: средний ${Number.isFinite(simpleAvg) ? simpleAvg.toFixed(2) : '—'}${
      weightedAvg !== null ? `, взвешенный ${weightedAvg.toFixed(2)}` : ''
    }${latestSubjects ? `; предметы: ${latestSubjects}` : ''}`;
  }

  const summary = `${examsText}\n${projectsText}\n${gpaText}`;

  return { exams, projects, gpa, summary };
}
