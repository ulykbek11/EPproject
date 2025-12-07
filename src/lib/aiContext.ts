import { supabase } from '@/integrations/supabase/client';

export interface ProfileContextResult {
  exams: Array<{ exam_name: string; score: number | null; max_score: number | null; exam_date: string | null }>;
  projects: Array<{ title: string; category: string | null; description: string | null; link: string | null; start_date: string | null; end_date: string | null }>;
  gpa: Array<{ subject: string; grade: number; credits: number | null; semester: string | null }>;
  summary: string;
}

function formatExam(e: { exam_name: string; score: number | null; max_score: number | null; exam_date: string | null }) {
  const scorePart = typeof e.score === 'number' ? `${e.score}${e.max_score ? `/${e.max_score}` : ''}` : '—';
  const datePart = e.exam_date ? `, дата: ${e.exam_date}` : '';
  return `${e.exam_name}: ${scorePart}${datePart}`;
}

function formatProject(p: { title: string; category: string | null; description: string | null; link: string | null; start_date: string | null; end_date: string | null }) {
  const cat = p.category ? ` (${p.category})` : '';
  const dates = p.start_date || p.end_date ? `, сроки: ${p.start_date ?? '—'} → ${p.end_date ?? '—'}` : '';
  const link = p.link ? `, ссылка: ${p.link}` : '';
  return `${p.title}${cat}${dates}${link}`;
}

export async function buildProfileContext(userId: string): Promise<ProfileContextResult> {
  const examsResp = await supabase
    .from('exams')
    .select('exam_name, score, max_score, exam_date')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const projectsResp = await supabase
    .from('projects')
    .select('title, category, description, link, start_date, end_date')
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

  const projectsText = projects.length
    ? `Проекты: ${projects.map(formatProject).join('; ')}`
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